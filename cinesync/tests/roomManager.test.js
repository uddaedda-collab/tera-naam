'use strict';

const { RoomManager } = require('../src/roomManager');

describe('RoomManager - rooms', () => {
  let rm;
  beforeEach(() => { rm = new RoomManager(); });

  test('creates a room with a unique id', () => {
    const r = rm.createRoom({ name: 'Movie Night' });
    expect(r.id).toMatch(/^[A-Z0-9]{6}$/);
    expect(r.name).toBe('Movie Night');
    expect(rm.hasRoom(r.id)).toBe(true);
    expect(rm.size).toBe(1);
  });

  test('getRoom returns null for missing room', () => {
    expect(rm.getRoom('NOPE12')).toBeNull();
  });

  test('uses injected id generator and avoids collisions', () => {
    const ids = ['AAAAAA', 'AAAAAA', 'BBBBBB'];
    let i = 0;
    const rm2 = new RoomManager({ idGenerator: () => ids[i++] });
    const a = rm2.createRoom();
    const b = rm2.createRoom();
    expect(a.id).toBe('AAAAAA');
    expect(b.id).toBe('BBBBBB'); // skipped the duplicate
  });
});

describe('RoomManager - membership', () => {
  let rm, room;
  beforeEach(() => {
    rm = new RoomManager();
    room = rm.createRoom();
  });

  test('first member becomes host', () => {
    const m = rm.addMember(room.id, { id: 's1', name: 'Aisha' });
    expect(m.isHost).toBe(true);
    expect(room.hostId).toBe('s1');
  });

  test('second member is not host', () => {
    rm.addMember(room.id, { id: 's1', name: 'Aisha' });
    const m2 = rm.addMember(room.id, { id: 's2', name: 'Rohan' });
    expect(m2.isHost).toBe(false);
    expect(rm.listMembers(room.id)).toHaveLength(2);
  });

  test('removing host promotes earliest remaining member', () => {
    rm.addMember(room.id, { id: 's1', name: 'Aisha' });
    rm.addMember(room.id, { id: 's2', name: 'Rohan' });
    const res = rm.removeMember(room.id, 's1');
    expect(res.deleted).toBe(false);
    expect(res.newHostId).toBe('s2');
    expect(rm.getRoom(room.id).members.get('s2').isHost).toBe(true);
  });

  test('empty room is auto-deleted', () => {
    rm.addMember(room.id, { id: 's1', name: 'Solo' });
    const res = rm.removeMember(room.id, 's1');
    expect(res.deleted).toBe(true);
    expect(rm.hasRoom(room.id)).toBe(false);
  });
});

describe('RoomManager - playback + drift', () => {
  let rm, room;
  beforeEach(() => {
    rm = new RoomManager();
    room = rm.createRoom();
  });

  test('setSource resets playback', () => {
    rm.updatePlayback(room.id, { currentTime: 50, isPlaying: true });
    const pb = rm.setSource(room.id, { type: 'youtube', id: 'x', raw: 'x' });
    expect(pb.currentTime).toBe(0);
    expect(pb.isPlaying).toBe(false);
  });

  test('updatePlayback clamps negative time and sets fields', () => {
    const pb = rm.updatePlayback(room.id, { currentTime: -5, isPlaying: true, rate: 1.5 });
    expect(pb.currentTime).toBe(0);
    expect(pb.isPlaying).toBe(true);
    expect(pb.rate).toBe(1.5);
  });

  test('projectedTime advances while playing', () => {
    const t0 = 1_000_000;
    rm.updatePlayback(room.id, { currentTime: 10, isPlaying: true }, t0);
    // 4 seconds later
    expect(rm.projectedTime(room.id, t0 + 4000)).toBeCloseTo(14, 5);
  });

  test('projectedTime respects playback rate', () => {
    const t0 = 1_000_000;
    rm.updatePlayback(room.id, { currentTime: 0, isPlaying: true, rate: 2 }, t0);
    expect(rm.projectedTime(room.id, t0 + 5000)).toBeCloseTo(10, 5);
  });

  test('projectedTime frozen while paused', () => {
    const t0 = 1_000_000;
    rm.updatePlayback(room.id, { currentTime: 30, isPlaying: false }, t0);
    expect(rm.projectedTime(room.id, t0 + 9999)).toBe(30);
  });

  test('getPlaybackSnapshot includes serverTime', () => {
    const t0 = 2_000_000;
    rm.updatePlayback(room.id, { currentTime: 5, isPlaying: true }, t0);
    const snap = rm.getPlaybackSnapshot(room.id, t0 + 1000);
    expect(snap.currentTime).toBeCloseTo(6, 5);
    expect(snap.serverTime).toBe(t0 + 1000);
    expect(snap.isPlaying).toBe(true);
  });
});

describe('RoomManager - messages', () => {
  let rm, room;
  beforeEach(() => {
    rm = new RoomManager({ maxMessages: 5 });
    room = rm.createRoom();
  });

  test('adds messages with metadata', () => {
    const m = rm.addMessage(room.id, { userId: 's1', name: 'Aisha', text: 'hi' });
    expect(m.id).toBeDefined();
    expect(m.kind).toBe('text');
    expect(rm.getMessages(room.id)).toHaveLength(1);
  });

  test('caps message history', () => {
    for (let i = 0; i < 10; i++) rm.addMessage(room.id, { text: 'm' + i });
    const msgs = rm.getMessages(room.id);
    expect(msgs).toHaveLength(5);
    expect(msgs[msgs.length - 1].text).toBe('m9');
  });
});
