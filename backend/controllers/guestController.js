const db = require('../config/db');
const Guest = require('../models/guestModel');
const HotelUpdates = require('../models/hotelUpdatesModel');
const Reservation = require('../models/guestReservationModel');

const GuestController = {
  // 1. Get available rooms
  getAvailableRooms: async (req, res) => {
    try {
      const sql = `SELECT * FROM ROOM WHERE STATUS = 'Available' ORDER BY ROOM_NUMBER`;
      const result = await db.query(sql);
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch available rooms' });
    }
  },

  // 2. Get hotel offers/updates
  getOffers: async (req, res) => {
    try {
      const updates = await HotelUpdates.getAllActive();
      res.json(updates);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch offers' });
    }
  },

  // 3. Book a room
  bookRoom: async (req, res) => {
    try {
      const { full_name, phone, email, address, room_id, check_in, check_out } = req.body;

      // Check if guest exists, otherwise create new
      let guest = await Guest.findByEmail(email);
      let guest_id = guest ? guest.GUEST_ID : await Guest.add({ full_name, phone, email, address });

      // Create reservation
      const res_id = await Reservation.add({ guest_id, room_id, check_in, check_out });

      // Update room status
      await Reservation.updateRoomStatus(room_id);

      res.json({ message: 'Room booked successfully', reservation_id: res_id });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to book room' });
    }
  }
};

module.exports = GuestController;