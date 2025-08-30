const express = require('express');
const router = express.Router();
const GuestController = require('../controllers/guestController');

// Public guest routes
router.get('/rooms', GuestController.getAvailableRooms);   // See available rooms
router.get('/offers', GuestController.getOffers);          // See hotel offers
router.post('/book', GuestController.bookRoom);            // Book a room

module.exports = router;