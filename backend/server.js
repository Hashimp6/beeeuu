const http = require('http');
const dotenv = require('dotenv');
const app = require('./app');
const { initializeSocket } = require('./config/socket');

dotenv.config();

const server = http.createServer(app);

// // Initialize Socket.IO
initializeSocket(server);

const PORT = process.env.PORT || 5200;

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});


