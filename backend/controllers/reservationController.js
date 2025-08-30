const Reservation = require('../models/reservationModel');

const ReservationController = {
  // 1️⃣ Get all reservations
  getReservations: async (req, res) => {
    try {
      const reservations = await Reservation.getAll();
      res.json(reservations);
    } catch (err) {
      console.error('❌ Fetch reservations error:', err);
      res.status(500).json({ error: 'Failed to fetch reservations' });
    }
  },

  // 2️⃣ Create reservation
 createReservation: async (req, res) => {
  try {
    // Ensure req.user is defined
    if (!req.user || !req.user.sub) {
      return res.status(401).json({ error: 'Unauthorized: User not found in request' });
    }

    const guest_id = req.user.sub; // ✅ use sub from JWT payload
    const { room_id, check_in, check_out, status } = req.body;

    // Validate required fields
    if (!room_id || !check_in || !check_out) {
      return res.status(400).json({
        error: 'Missing required fields: room_id, check_in, check_out'
      });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(check_in) || !dateRegex.test(check_out)) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    console.log('🔍 Checking room availability:', { room_id, check_in, check_out });
    const available = await Reservation.checkAvailability(room_id, check_in, check_out);
    if (!available) {
      return res.status(400).json({ error: 'Room not available' });
    }

    console.log('📌 Creating reservation:', { guest_id, room_id, check_in, check_out, status });
    const result = await Reservation.create({ guest_id, room_id, check_in, check_out, status });
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }

    res.json({ message: result.message });
  } catch (err) {
    console.error('❌ Create reservation error:', err);
    res.status(500).json({ error: err.message || 'Failed to create reservation' });
  }
},


  // 3️⃣ Update reservation
updateReservation: async (req, res) => {
  try {
    // accept either :res_id or :resId
    const resIdRaw = req.params.resId ?? req.params.res_id;
    const resId = Number(resIdRaw);
    if (!Number.isInteger(resId) || resId <= 0) {
      return res.status(400).json({ error: 'Reservation ID is required and must be a positive integer' });
    }

    let { check_in, check_out, status } = req.body;

    if (!check_in && !check_out && !status) {
      return res.status(400).json({
        error: 'At least one field (check_in, check_out, status) must be provided'
      });
    }

    // normalize empty strings to null
    check_in = (check_in === '' ? null : check_in);
    check_out = (check_out === '' ? null : check_out);
    status = (status === '' ? null : status);

    // Validate date formats if provided as strings
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if ((check_in && typeof check_in === 'string' && !dateRegex.test(check_in)) ||
        (check_out && typeof check_out === 'string' && !dateRegex.test(check_out))) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    console.log('🔧 Updating reservation:', { resId, check_in, check_out, status });
    const result = await Reservation.update(resId, { check_in, check_out, status });
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }

    res.json({ message: result.message });
  } catch (err) {
    console.error('❌ Update reservation error:', err);
    res.status(500).json({ error: err.message || 'Failed to update reservation' });
  }
},


  // 4️⃣ Cancel reservation
  cancelReservation: async (req, res) => {
    try {
      const { resId } = req.params;

      if (!resId) {
        return res.status(400).json({ error: 'Reservation ID is required' });
      }

      console.log('🗑 Cancelling reservation:', { resId });
      const result = await Reservation.cancel(resId);
      if (!result.success) {
        return res.status(400).json({ error: result.message });
      }

      res.json({ message: result.message });
    } catch (err) {
      console.error('❌ Cancel reservation error:', err);
      res.status(500).json({ error: err.message || 'Failed to cancel reservation' });
    }
  },

  // 5️⃣ Estimate cost
  estimateCost: async (req, res) => {
    try {
      const { room_id, check_in, check_out } = req.body;

      if (!room_id || !check_in || !check_out) {
        return res.status(400).json({
          error: 'Missing required fields: room_id, check_in, check_out'
        });
      }

      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(check_in) || !dateRegex.test(check_out)) {
        return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
      }

      console.log('💰 Estimating cost:', { room_id, check_in, check_out });
      const total = await Reservation.estimateCost(room_id, check_in, check_out);
      res.json({ total });
    } catch (err) {
      console.error('❌ Estimate cost error:', err);
      res.status(500).json({ error: err.message || 'Failed to estimate cost' });
    }
  }
};

module.exports = ReservationController;
