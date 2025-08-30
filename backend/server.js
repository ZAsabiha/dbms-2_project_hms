require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { initialize, closePool } = require('./config/db.js');

const roomRoutes = require('./routes/roomRoutes');
const authRoutes = require('./routes/authRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const billRoutes = require('./routes/billRoutes'); // path correct?
const guestRoutes = require('./routes/guestRoutes');

const app = express();

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'] }));
app.use(express.json());

// Health check
app.get('/health', (_req, res) => res.send('ok'));

// ✅ Mount routes
app.use('/api/rooms', roomRoutes);              // for room-related endpoints
app.use('/api/reservations', reservationRoutes); 
 app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/bills', require('./routes/billRoutes'));
app.use('/api/guest', guestRoutes);  // <-- MOUNT THE GUEST ROUTES HERE

          // for bill-related endpoints

initialize()
  .then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () =>
      console.log(`🚀 Server running at http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error('❌ DB initialize failed:', err);
    process.exit(1);
  });

// ✅ graceful shutdown
process.on('SIGINT', async () => {
  try {
    await closePool();
  } finally {
    process.exit(0);
  }
});

process.on('SIGTERM', async () => {
  try {
    await closePool();
  } finally {
    process.exit(0);
  }
});

module.exports = app;
