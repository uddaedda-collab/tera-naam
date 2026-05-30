'use strict';

const { createServer } = require('../src/app');
const { io: Client } = require('socket.io-client');

/**
 * Integration tests for the realtime sync layer. We boot a real server on an
 * ephemeral port and connect two clients (simulating the two partners).
 */
describe('Socket.IO sync', () => {
  let httpServer, port, roomId, roomManager;

  beforeAll((done) => {
    const created = createServer();
    httpServer = created.server;
    roomManager = created.roomManager;
    httpServer.listen(0, () => {
      port = httpServer.address().port;
      done();
    });
  });

  // Fresh room per test. (Rooms auto-delete when the last member leaves, so
  // sharing one across tests would break after the first teardown.)
  beforeEach(() => {
    roomId = roomManager.createRoom({ name: 'Test' }).id;
  });

  afterAll((done) => {
    httpServer.close(done);
  });

  function connect() {
    return Client(`http://localhost:${port}`, { transports: ['websocket'], forceNew: true });
  }

  test('two clients join and see each other', (done) => {
    const a = connect();
    a.on('connect', () => {
      a.emit('room:join', { roomId, name: 'Aisha' });
    });
    a.on('room:joined', () => {
      const b = connect();
      b.on('connect', () => b.emit('room:join', { roomId, name: 'Rohan' }));
      b.on('room:members', ({ members }) => {
        if (members.length === 2) {
          const names = members.map((m) => m.name).sort();
          expect(names).toEqual(['Aisha', 'Rohan']);
          a.close(); b.close();
          done();
        }
      });
    });
  });

  test('playback control propagates to the other client', (done) => {
    const a = connect();
    const b = connect();
    let aReady = false, bReady = false;

    const maybeStart = () => {
      if (aReady && bReady) {
        // B listens for playback state, A sends a play control.
        b.on('playback:state', (snap) => {
          expect(snap.isPlaying).toBe(true);
          expect(snap.currentTime).toBeGreaterThanOrEqual(42);
          a.close(); b.close();
          done();
        });
        a.emit('playback:control', { type: 'play', isPlaying: true, currentTime: 42 });
      }
    };

    a.on('connect', () => a.emit('room:join', { roomId, name: 'A' }));
    b.on('connect', () => b.emit('room:join', { roomId, name: 'B' }));
    a.on('room:joined', () => { aReady = true; maybeStart(); });
    b.on('room:joined', () => { bReady = true; maybeStart(); });
  });

  test('source:set broadcasts source:changed', (done) => {
    const a = connect();
    const b = connect();
    let aReady = false, bReady = false;

    const maybeStart = () => {
      if (aReady && bReady) {
        b.on('source:changed', ({ source }) => {
          expect(source.type).toBe('youtube');
          expect(source.id).toBe('dQw4w9WgXcQ');
          a.close(); b.close();
          done();
        });
        a.emit('source:set', { url: 'https://youtu.be/dQw4w9WgXcQ' });
      }
    };

    a.on('connect', () => a.emit('room:join', { roomId, name: 'A' }));
    b.on('connect', () => b.emit('room:join', { roomId, name: 'B' }));
    a.on('room:joined', () => { aReady = true; maybeStart(); });
    b.on('room:joined', () => { bReady = true; maybeStart(); });
  });

  test('chat messages and reactions relay', (done) => {
    const a = connect();
    const b = connect();
    let aReady = false, bReady = false;

    const maybeStart = () => {
      if (aReady && bReady) {
        b.on('chat:message', (m) => {
          expect(m.text).toBe('miss you');
          expect(m.name).toBe('A');
          // Now test reaction relay.
          b.on('chat:reaction', (r) => {
            expect(r.emoji).toBe('❤️');
            a.close(); b.close();
            done();
          });
          a.emit('chat:reaction', { emoji: '❤️' });
        });
        a.emit('chat:message', { text: 'miss you' });
      }
    };

    a.on('connect', () => a.emit('room:join', { roomId, name: 'A' }));
    b.on('connect', () => b.emit('room:join', { roomId, name: 'B' }));
    a.on('room:joined', () => { aReady = true; maybeStart(); });
    b.on('room:joined', () => { bReady = true; maybeStart(); });
  });

  test('joining a non-existent room returns error', (done) => {
    const a = connect();
    a.on('connect', () => a.emit('room:join', { roomId: 'NOEXIST', name: 'X' }));
    a.on('room:error', (e) => {
      expect(e.ok).toBe(false);
      a.close();
      done();
    });
  });

  test('late joiner receives current playback via sync:request', (done) => {
    // Fresh room with playback already advanced.
    const freshRoom = roomManager.createRoom({ name: 'Late' }).id;
    const a = connect();
    a.on('connect', () => a.emit('room:join', { roomId: freshRoom, name: 'Host' }));
    a.on('room:joined', () => {
      a.emit('source:set', { url: 'https://example.com/movie.mp4' });
      a.emit('playback:control', { type: 'play', isPlaying: true, currentTime: 100 });

      // Late joiner.
      const b = connect();
      b.on('connect', () => b.emit('room:join', { roomId: freshRoom, name: 'Late' }));
      b.on('room:joined', () => {
        b.emit('sync:request', {}, (snap) => {
          expect(snap.isPlaying).toBe(true);
          expect(snap.currentTime).toBeGreaterThanOrEqual(100);
          expect(snap.source.type).toBe('direct');
          a.close(); b.close();
          done();
        });
      });
    });
  });
});
