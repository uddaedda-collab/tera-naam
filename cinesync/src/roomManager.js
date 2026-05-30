'use strict';

const { customAlphabet } = require('nanoid');

// Human-friendly room codes: no ambiguous chars (0/O, 1/I/L).
const ROOM_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
const makeRoomId = customAlphabet(ROOM_ALPHABET, 6);

/**
 * CineSync - Room Manager
 * --------------------------------------------------
 * Pure, in-memory state container. No socket/Express dependency so it can be
 * unit-tested in isolation. The server layer wires events to these methods.
 *
 * Room shape:
 * {
 *   id, createdAt, hostId,
 *   members: Map<socketId, {id, name, avatar, isHost, joinedAt}>,
 *   playback: { source, currentTime, isPlaying, rate, updatedAt },
 *   messages: [ {id, userId, name, text, kind, at} ]
 * }
 */
class RoomManager {
  constructor(opts = {}) {
    this.rooms = new Map();
    this.maxMessages = opts.maxMessages || 200;
    this.idGenerator = opts.idGenerator || makeRoomId;
  }

  createRoom({ name } = {}) {
    let id = this.idGenerator();
    // Avoid (extremely unlikely) collisions.
    while (this.rooms.has(id)) id = this.idGenerator();

    const room = {
      id,
      name: name || 'Movie Night',
      createdAt: Date.now(),
      hostId: null,
      members: new Map(),
      playback: {
        source: null,
        currentTime: 0,
        isPlaying: false,
        rate: 1,
        updatedAt: Date.now(),
      },
      messages: [],
    };
    this.rooms.set(id, room);
    return room;
  }

  getRoom(id) {
    return this.rooms.get(id) || null;
  }

  hasRoom(id) {
    return this.rooms.has(id);
  }

  /** Add a member. First member to join becomes the host. */
  addMember(roomId, member) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const isHost = room.members.size === 0;
    const record = {
      id: member.id,
      name: member.name || 'Guest',
      avatar: member.avatar || null,
      isHost,
      joinedAt: Date.now(),
    };
    room.members.set(member.id, record);
    if (isHost) room.hostId = member.id;
    return record;
  }

  /**
   * Remove a member. If the host leaves, promote the longest-present member.
   * Returns { room, removed, newHostId } or null if room/member missing.
   * Empty rooms are deleted automatically.
   */
  removeMember(roomId, memberId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    const removed = room.members.get(memberId) || null;
    room.members.delete(memberId);

    let newHostId = room.hostId;
    if (room.hostId === memberId) {
      newHostId = null;
      // Promote earliest joiner.
      let earliest = null;
      for (const m of room.members.values()) {
        if (!earliest || m.joinedAt < earliest.joinedAt) earliest = m;
      }
      if (earliest) {
        earliest.isHost = true;
        newHostId = earliest.id;
      }
      room.hostId = newHostId;
    }

    if (room.members.size === 0) {
      this.rooms.delete(roomId);
      return { room: null, removed, newHostId: null, deleted: true };
    }
    return { room, removed, newHostId, deleted: false };
  }

  listMembers(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return [];
    return Array.from(room.members.values());
  }

  /** Replace the active media source and reset playback to the start. */
  setSource(roomId, source) {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    room.playback.source = source;
    room.playback.currentTime = 0;
    room.playback.isPlaying = false;
    room.playback.rate = 1;
    room.playback.updatedAt = Date.now();
    return room.playback;
  }

  /**
   * Update playback state from a control action (play/pause/seek/rate).
   * `now` is injectable for deterministic tests.
   */
  updatePlayback(roomId, { isPlaying, currentTime, rate } = {}, now = Date.now()) {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    const pb = room.playback;
    if (typeof currentTime === 'number' && !Number.isNaN(currentTime)) {
      pb.currentTime = Math.max(0, currentTime);
    }
    if (typeof isPlaying === 'boolean') pb.isPlaying = isPlaying;
    if (typeof rate === 'number' && rate > 0) pb.rate = rate;
    pb.updatedAt = now;
    return pb;
  }

  /**
   * Compute the "true" playback position right now, accounting for time
   * elapsed since the last update while playing. Used to sync late joiners.
   */
  projectedTime(roomId, now = Date.now()) {
    const room = this.rooms.get(roomId);
    if (!room) return 0;
    const pb = room.playback;
    if (!pb.isPlaying) return pb.currentTime;
    const elapsed = (now - pb.updatedAt) / 1000;
    return pb.currentTime + elapsed * (pb.rate || 1);
  }

  /** Snapshot of current playback with the time projected to `now`. */
  getPlaybackSnapshot(roomId, now = Date.now()) {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    return {
      source: room.playback.source,
      currentTime: this.projectedTime(roomId, now),
      isPlaying: room.playback.isPlaying,
      rate: room.playback.rate,
      serverTime: now,
    };
  }

  addMessage(roomId, message) {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    const record = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      userId: message.userId || null,
      name: message.name || 'Guest',
      text: message.text || '',
      kind: message.kind || 'text', // 'text' | 'reaction' | 'system'
      emoji: message.emoji || null,
      at: Date.now(),
    };
    room.messages.push(record);
    if (room.messages.length > this.maxMessages) {
      room.messages.splice(0, room.messages.length - this.maxMessages);
    }
    return record;
  }

  getMessages(roomId) {
    const room = this.rooms.get(roomId);
    return room ? room.messages.slice() : [];
  }

  get size() {
    return this.rooms.size;
  }
}

module.exports = { RoomManager, makeRoomId, ROOM_ALPHABET };
