'use strict';

const path = require('path');
const http = require('http');
const fs = require('fs');
const express = require('express');
const multer = require('multer');
const { Server } = require('socket.io');

const { RoomManager } = require('./roomManager');
const { parseSource, uploadSource } = require('./sources');
const { registerSocketHandlers } = require('./socket');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

const ALLOWED_VIDEO = new Set([
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
  'video/x-matroska',
  'video/x-m4v',
]);

/**
 * Build the CineSync application. Returns the http server plus its
 * collaborators so tests can drive it without binding to a fixed port.
 */
function createServer(options = {}) {
  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: { origin: options.corsOrigin || '*' },
    maxHttpBufferSize: 1e6,
  });

  const roomManager = options.roomManager || new RoomManager();

  app.use(express.json());

  // --- File uploads (local "gallery" videos) ---
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
      const safeExt = path.extname(file.originalname).slice(0, 10).replace(/[^.\w]/g, '');
      const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${safeExt}`;
      cb(null, unique);
    },
  });

  const upload = multer({
    storage,
    limits: { fileSize: (options.maxUploadMB || 2048) * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (ALLOWED_VIDEO.has(file.mimetype) || file.mimetype.startsWith('video/')) {
        return cb(null, true);
      }
      cb(new Error('Only video files are allowed'));
    },
  });

  // --- API ---

  // Health check.
  app.get('/api/health', (req, res) => {
    res.json({ ok: true, rooms: roomManager.size, ts: Date.now() });
  });

  // Create a room.
  app.post('/api/rooms', (req, res) => {
    const room = roomManager.createRoom({ name: req.body && req.body.name });
    res.json({ ok: true, roomId: room.id, name: room.name });
  });

  // Room existence / lightweight info (for the join screen).
  app.get('/api/rooms/:id', (req, res) => {
    const room = roomManager.getRoom(req.params.id);
    if (!room) return res.status(404).json({ ok: false, error: 'Room not found' });
    res.json({
      ok: true,
      roomId: room.id,
      name: room.name,
      members: room.members.size,
      hasSource: !!room.playback.source,
    });
  });

  // Validate / normalize a pasted media link.
  app.post('/api/resolve', (req, res) => {
    const url = req.body && req.body.url;
    const source = parseSource(url, { title: req.body && req.body.title });
    if (!source) {
      return res.status(400).json({ ok: false, error: 'Unsupported or invalid link' });
    }
    res.json({ ok: true, source });
  });

  // Upload a local video file -> returns a media descriptor.
  app.post('/api/upload', (req, res) => {
    upload.single('video')(req, res, (err) => {
      if (err) {
        const code = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
        return res.status(code).json({ ok: false, error: err.message });
      }
      if (!req.file) {
        return res.status(400).json({ ok: false, error: 'No file uploaded' });
      }
      const source = uploadSource(req.file.filename, req.file.originalname);
      res.json({ ok: true, source });
    });
  });

  // --- Static assets ---
  app.use('/uploads', express.static(UPLOAD_DIR, {
    setHeaders: (res) => res.setHeader('Accept-Ranges', 'bytes'),
  }));

  // PWA: service worker must be served from root scope with no long-term cache,
  // and the manifest with the correct content type.
  app.get('/sw.js', (req, res) => {
    res.set('Service-Worker-Allowed', '/');
    res.set('Cache-Control', 'no-cache');
    res.type('application/javascript');
    res.sendFile(path.join(PUBLIC_DIR, 'sw.js'));
  });
  app.get('/manifest.webmanifest', (req, res) => {
    res.type('application/manifest+json');
    res.sendFile(path.join(PUBLIC_DIR, 'manifest.webmanifest'));
  });

  app.use(express.static(PUBLIC_DIR));

  // Room deep-link -> serve the SPA shell.
  app.get('/room/:id', (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
  });

  // --- Realtime ---
  registerSocketHandlers(io, roomManager);

  return { app, server, io, roomManager };
}

module.exports = { createServer, PUBLIC_DIR, UPLOAD_DIR };
