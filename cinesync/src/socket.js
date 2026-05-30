'use strict';

const { parseSource } = require('./sources');

/**
 * Wire realtime collaboration onto an existing Socket.IO server.
 *
 * Event contract (client -> server):
 *   room:join      { roomId, name, avatar }
 *   playback:control { type:'play'|'pause'|'seek'|'rate', currentTime, isPlaying, rate }
 *   source:set     { url } | { source }
 *   sync:request   {}                      (late joiner asks for current state)
 *   chat:message   { text }
 *   chat:reaction  { emoji }
 *   chat:typing    { typing:boolean }
 *
 * Event contract (server -> client):
 *   room:joined, room:members, room:error,
 *   playback:state, source:changed, sync:state,
 *   chat:message, chat:reaction, chat:typing, system:notice
 */
function registerSocketHandlers(io, roomManager) {
  io.on('connection', (socket) => {
    // Per-connection identity, set on join.
    socket.data.roomId = null;
    socket.data.name = 'Guest';

    function currentRoomId() {
      return socket.data.roomId;
    }

    function broadcastMembers(roomId) {
      const members = roomManager.listMembers(roomId);
      io.to(roomId).emit('room:members', { members, hostId: roomFor(roomId)?.hostId || null });
    }

    function roomFor(roomId) {
      return roomManager.getRoom(roomId);
    }

    // --- Join ---
    socket.on('room:join', (payload = {}, ack) => {
      const roomId = String(payload.roomId || '').toUpperCase();
      const room = roomManager.getRoom(roomId);
      if (!room) {
        const err = { ok: false, error: 'Room not found' };
        socket.emit('room:error', err);
        if (typeof ack === 'function') ack(err);
        return;
      }

      socket.join(roomId);
      socket.data.roomId = roomId;
      socket.data.name = (payload.name || 'Guest').slice(0, 40);

      const member = roomManager.addMember(roomId, {
        id: socket.id,
        name: socket.data.name,
        avatar: payload.avatar || null,
      });

      const snapshot = roomManager.getPlaybackSnapshot(roomId);
      const joinedPayload = {
        ok: true,
        roomId,
        you: member,
        playback: snapshot,
        messages: roomManager.getMessages(roomId),
      };
      socket.emit('room:joined', joinedPayload);
      if (typeof ack === 'function') ack(joinedPayload);

      // Notify others.
      const sys = roomManager.addMessage(roomId, {
        kind: 'system',
        text: `${member.name} joined the room`,
      });
      socket.to(roomId).emit('system:notice', sys);
      broadcastMembers(roomId);
    });

    // --- Late joiner / resync request ---
    socket.on('sync:request', (_payload, ack) => {
      const roomId = currentRoomId();
      if (!roomId) return;
      const snapshot = roomManager.getPlaybackSnapshot(roomId);
      socket.emit('sync:state', snapshot);
      if (typeof ack === 'function') ack(snapshot);
    });

    // --- Set / change the media source ---
    socket.on('source:set', (payload = {}) => {
      const roomId = currentRoomId();
      if (!roomId) return;

      let source = payload.source || null;
      if (!source && payload.url) {
        source = parseSource(payload.url, { title: payload.title });
      }
      if (!source) {
        socket.emit('room:error', { ok: false, error: 'Invalid media source' });
        return;
      }

      roomManager.setSource(roomId, source);
      const snapshot = roomManager.getPlaybackSnapshot(roomId);
      io.to(roomId).emit('source:changed', { source, playback: snapshot });

      const sys = roomManager.addMessage(roomId, {
        kind: 'system',
        text: `${socket.data.name} started "${source.title || source.type}"`,
      });
      io.to(roomId).emit('system:notice', sys);
    });

    // --- Playback control (play/pause/seek/rate) ---
    socket.on('playback:control', (payload = {}) => {
      const roomId = currentRoomId();
      if (!roomId) return;

      const update = {};
      if (payload.type === 'play') update.isPlaying = true;
      if (payload.type === 'pause') update.isPlaying = false;
      if (typeof payload.isPlaying === 'boolean') update.isPlaying = payload.isPlaying;
      if (typeof payload.currentTime === 'number') update.currentTime = payload.currentTime;
      if (typeof payload.rate === 'number') update.rate = payload.rate;

      const pb = roomManager.updatePlayback(roomId, update);
      if (!pb) return;

      // Broadcast authoritative state to everyone (including sender for confirmation).
      io.to(roomId).emit('playback:state', {
        ...roomManager.getPlaybackSnapshot(roomId),
        by: socket.id,
        action: payload.type || 'update',
      });
    });

    // --- Chat ---
    socket.on('chat:message', (payload = {}) => {
      const roomId = currentRoomId();
      if (!roomId) return;
      const text = String(payload.text || '').slice(0, 1000).trim();
      if (!text) return;
      const msg = roomManager.addMessage(roomId, {
        userId: socket.id,
        name: socket.data.name,
        text,
        kind: 'text',
      });
      io.to(roomId).emit('chat:message', msg);
    });

    socket.on('chat:reaction', (payload = {}) => {
      const roomId = currentRoomId();
      if (!roomId) return;
      const emoji = String(payload.emoji || '').slice(0, 8);
      if (!emoji) return;
      const reaction = {
        userId: socket.id,
        name: socket.data.name,
        emoji,
        at: Date.now(),
      };
      // Reactions are ephemeral floating animations - broadcast, don't persist.
      io.to(roomId).emit('chat:reaction', reaction);
    });

    socket.on('chat:typing', (payload = {}) => {
      const roomId = currentRoomId();
      if (!roomId) return;
      socket.to(roomId).emit('chat:typing', {
        userId: socket.id,
        name: socket.data.name,
        typing: !!payload.typing,
      });
    });

    // --- Disconnect / leave ---
    function handleLeave() {
      const roomId = currentRoomId();
      if (!roomId) return;
      const result = roomManager.removeMember(roomId, socket.id);
      socket.leave(roomId);
      socket.data.roomId = null;
      if (!result || result.deleted) return;

      const sys = roomManager.addMessage(roomId, {
        kind: 'system',
        text: `${socket.data.name} left the room`,
      });
      io.to(roomId).emit('system:notice', sys);
      if (result.newHostId) {
        io.to(roomId).emit('system:notice', {
          kind: 'system',
          text: 'Host changed',
          at: Date.now(),
        });
      }
      broadcastMembers(roomId);
    }

    socket.on('room:leave', handleLeave);
    socket.on('disconnect', handleLeave);
  });

  return io;
}

module.exports = { registerSocketHandlers };
