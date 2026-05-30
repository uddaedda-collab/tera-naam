'use strict';

const { createServer } = require('./app');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

const { server } = createServer();

server.listen(PORT, HOST, () => {
  /* eslint-disable no-console */
  console.log('');
  console.log('  🎬  CineSync is live!');
  console.log(`  ➜  Local:    http://localhost:${PORT}`);
  console.log(`  ➜  Network:  http://${HOST}:${PORT}`);
  console.log('');
  console.log('  Create a room, share the link with your partner, and');
  console.log('  watch together in perfect sync. ❤️');
  console.log('');
});

module.exports = server;
