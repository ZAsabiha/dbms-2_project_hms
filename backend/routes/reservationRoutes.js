// const express = require('express');
// const router = express.Router();
// const ReservationController = require('../controllers/reservationController');

// // View all reservations
// router.get('/', ReservationController.getReservations);

// // Create a new reservation
// router.post('/', ReservationController.createReservation);

// // Update a reservation (dates or status)
// router.put('/:resId', ReservationController.updateReservation);  // param name matches frontend

// // Cancel a reservation
// router.patch('/:resId/cancel', ReservationController.cancelReservation);  // matches frontend

// // Estimate reservation cost
// router.post('/estimate', ReservationController.estimateCost);

// module.exports = router;

const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const ReservationController = require('../controllers/reservationController');

// Public route: View all reservations
router.get('/', ReservationController.getReservations);

// Protected routes: require login
router.post('/', authenticate, ReservationController.createReservation);
router.put('/:resId', authenticate, ReservationController.updateReservation);
router.patch('/:resId/cancel', authenticate, ReservationController.cancelReservation);

// Cost estimation can be public or protected depending on your rules
router.post('/estimate', authenticate, ReservationController.estimateCost);

module.exports = router;
