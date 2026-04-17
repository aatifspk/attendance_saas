// require('dotenv').config();
// const express = require('express');
// const helmet = require('helmet');
// const cors = require('cors');
// const rateLimit = require('express-rate-limit');
// const http = require('http');
// const { Server } = require('socket.io');
// const logger = require('./utils/logger');
// const sequelize = require('./config/database');
// const db = require('./models');
// const errorHandler = require('./middleware/errorHandler');
// const admsRouter = require('./routes/adms');

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server, { 
//   cors: { origin: '*' } 
// });

// // ====================== MIDDLEWARE ======================
// app.use(helmet());
// app.use(cors());
// app.use(express.json());
// app.use(rateLimit({ 
//   windowMs: 15 * 60 * 1000, 
//   max: 1000 
// }));

// // ====================== ROUTES ======================
// app.use('/', admsRouter);                    // ADMS Direct Push for SilkBio-101TC
// app.get('/welcome', (req, res) => {
//   res.status(200).send({
//     succcess: true,
//     message : "ok"
//   })
// });                 
// // Health check
// app.get('/health', (req, res) => {
//   res.json({ 
//     status: 'ok', 
//     message: 'Server running (Redis disabled)',
//     time: new Date() 
//   });
// });

// // Real-time Socket.io (for React dashboard)
// io.on('connection', (socket) => {
//   logger.info('📡 Client connected via Socket.io');
//   socket.on('disconnect', () => logger.info('Client disconnected'));
// });

// // Error handler (must be last)
// app.use(errorHandler);

// // ====================== START SERVER ======================
// const PORT = process.env.PORT || 4000;



// sequelize.sync({ alter: true, force: false })   // Use { force: false } in production
//   .then(() => {
//     server.listen(PORT, () => {
//       logger.info(`🚀 Server running on port ${PORT}`);
//       logger.info(`📡 ADMS Push endpoint ready at ${process.env.PUBLIC_URL}/iclock/cdata.aspx`);
//       logger.info(`⚠️  Note: Redis/BullMQ is disabled (payroll processing will be added later)`);
//     });
//   })
//   .catch(err => {
//     logger.error('DB Sync Error', err);
//     process.exit(1);
//   });

// module.exports = { app, io };



// server.js
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const http = require('http');
const { Server } = require('socket.io');
const logger = require('./utils/logger');
const sequelize = require('./config/database');
const db = require('./models');
const errorHandler = require('./middleware/errorHandler');
const admsRouter = require('./routes/adms');   // ← Your ADMS router

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// ====================== MIDDLEWARE ORDER IS CRITICAL ======================

// Security & CORS first
app.use(helmet());
app.use(cors());
app.use(express.json());                     // only for your React API routes

// 🔥 ADMS ROUTER MUST COME BEFORE ANY BODY PARSER (express.json / express.text)
app.use('/', admsRouter);                    // ← This is the fix

// Now safe to add general body parsers

// Rate limiting
app.use(rateLimit({ 
  windowMs: 15 * 60 * 1000, 
  max: 1000 
}));

// ====================== OTHER ROUTES ======================
app.get('/welcome', (req, res) => {
  res.status(200).json({
    success: true,
    message: "ok"
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server running',
    time: new Date() 
  });
});






// Real-time Socket.io
io.on('connection', (socket) => {
  logger.info('📡 Client connected via Socket.io');
  socket.on('disconnect', () => logger.info('Client disconnected'));
});

// Error handler (must be last)
app.use(errorHandler);

// ====================== START SERVER ======================
const PORT = process.env.PORT || 4000;

sequelize.sync({ alter: false, force: false })
  .then(() => {
    server.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📡 ADMS Push endpoint ready at ${process.env.PUBLIC_URL}/iclock/cdata.aspx`);
      logger.info(`✅ SilkBio-101TC Direct Push is now properly configured`);
    });
  })
  .catch(err => {
    logger.error('DB Sync Error', err);
    process.exit(1);
  });

module.exports = { app, io };