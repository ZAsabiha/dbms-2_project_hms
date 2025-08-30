const express = require('express');
const router = express.Router();

// Import the correct middleware function
const { authenticate } = require('../middleware/auth');

// Import dashboard controllers
const { 
  guestReservations, 
  checkReservationStatus, 
  hotelUpdates, 
  adminSummary, 
  roomStats, 
  recentReservations, 
  guestStats 
} = require('../controllers/dashboardController');

// ========================
// Guest routes
// ========================
router.get('/guest/reservations', authenticate, guestReservations);
router.get('/guest/reservation-status', authenticate, checkReservationStatus);
router.get('/guest/hotel-updates', authenticate, hotelUpdates);

// ========================
// Admin routes
// ========================
router.get('/admin-summary', authenticate, adminSummary);
router.get('/room-stats', authenticate, roomStats);
router.get('/recent-reservations', authenticate, recentReservations);
router.get('/guest-stats', authenticate, guestStats);

module.exports = router;