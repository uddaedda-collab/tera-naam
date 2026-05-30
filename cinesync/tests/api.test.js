'use strict';

const request = require('supertest');
const { createServer } = require('../src/app');

describe('REST API', () => {
  let app;
  beforeAll(() => { app = createServer().app; });

  test('GET /api/health', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  test('POST /api/rooms creates a room', async () => {
    const res = await request(app).post('/api/rooms').send({ name: 'Date' });
    expect(res.status).toBe(200);
    expect(res.body.roomId).toMatch(/^[A-Z0-9]{6}$/);
  });

  test('GET /api/rooms/:id - existing and missing', async () => {
    const created = await request(app).post('/api/rooms').send({});
    const id = created.body.roomId;

    const ok = await request(app).get('/api/rooms/' + id);
    expect(ok.status).toBe(200);
    expect(ok.body.roomId).toBe(id);

    const missing = await request(app).get('/api/rooms/ZZZZZZ');
    expect(missing.status).toBe(404);
  });

  test('POST /api/resolve - youtube + invalid', async () => {
    const yt = await request(app).post('/api/resolve').send({ url: 'https://youtu.be/dQw4w9WgXcQ' });
    expect(yt.status).toBe(200);
    expect(yt.body.source.type).toBe('youtube');

    const bad = await request(app).post('/api/resolve').send({ url: 'hello world' });
    expect(bad.status).toBe(400);
  });
});
