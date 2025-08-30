
// controllers/dashboardController.js
const { query } = require('../config/db.js'); // adjust path to your DB helper

// ========================
// Guest Reservations (Active / Past)
// ========================
const guestReservations = async (req, res) => {
  try {
    const scope = (req.query.scope || 'active').toLowerCase();
    const guestName = req.user?.name; // guest name from JWT

    if (!guestName) {
      return res.status(400).json({ success: false, message: 'Guest not identified' });
    }

    let where = `WHERE GUEST_NAME = :guestName`;
    if (scope === 'active') {
      where += ` AND CHECK_OUT >= SYSDATE AND STATUS NOT IN ('Cancelled')`;
    } else if (scope === 'past') {
      where += ` AND CHECK_OUT < SYSDATE`;
    }

    const r = await query(
      `
      SELECT 
        RES_ID       AS "resId", 
        GUEST_NAME   AS "guestName",
        ROOM_NUMBER  AS "roomNumber", 
        CHECK_IN     AS "checkIn", 
        CHECK_OUT    AS "checkOut",
        STATUS       AS "status", 
        TOTAL        AS "total"
      FROM RESERVATION_SUMMARIES 
      ${where}
      ORDER BY CHECK_IN DESC
      `,
      { guestName }
    );

    res.json({ success: true, rows: r.rows });
  } catch (e) {
    console.error('Guest reservations error:', e);
    res.status(500).json({ success: false, message: 'Guest reservations failed' });
  }
};

// ========================
// Check Reservation Status
// ========================
const checkReservationStatus = async (req, res) => {
  try {
    const { resId } = req.query;

    if (!resId) {
      return res.status(400).json({ success: false, message: 'Reservation ID is required' });
    }

    const r = await query(
      `SELECT GET_RESERVATION_STATUS(:resId) AS status FROM DUAL`,
      { resId }
    );

    res.json({ success: true, status: r.rows[0].STATUS });
  } catch (e) {
    console.error('Check reservation status error:', e);
    res.status(500).json({ success: false, message: 'Could not check reservation status' });
  }
};

// ========================
// View Hotel Updates & Reminders
// ========================
const hotelUpdates = async (req, res) => {
  try {
    const r = await query(
      `
      SELECT 
        TITLE AS "title",
        MESSAGE AS "message",
        TO_CHAR(VALID_UNTIL, 'DD-MON-YYYY') AS "validUntil"
      FROM HOTEL_UPDATES
      WHERE VALID_UNTIL >= SYSDATE
      ORDER BY VALID_UNTIL ASC
      `
    );

    res.json({ success: true, updates: r.rows });
  } catch (e) {
    console.error('Hotel updates error:', e);
    res.status(500).json({ success: false, message: 'Failed to fetch hotel updates' });
  }
};

// ========================
// Admin Summary (already done)
// ========================
const adminSummary = async (req, res) => {
  try {
    const r = await query(
      `SELECT 
        COUNT(*) AS "totalReservations",
        NVL(SUM(TOTAL),0) AS "totalRevenue",
        NVL(SUM(CASE WHEN PAID='Y' THEN TOTAL END),0) AS "paidAmount",
        NVL(SUM(CASE WHEN PAID='N' THEN TOTAL END),0) AS "pendingAmount",
        COUNT(CASE WHEN PAID='Y' THEN 1 END) AS "paidCount",
        COUNT(CASE WHEN PAID='N' THEN 1 END) AS "pendingCount",
        NVL(AVG(TOTAL),0) AS "averageBill"
      FROM RESERVATION_SUMMARIES`
    );

    res.json({ success: true, summary: r.rows[0] });
  } catch (e) {
    console.error('Admin summary error:', e);
    res.status(500).json({ success: false, message: 'Admin summary failed' });
  }
};

// ========================
// Room Stats
// ========================
const roomStats = async (req, res) => {
  try {
    const r = await query(
      `SELECT 
        COUNT(*) AS "totalRooms",
        SUM(CASE WHEN STATUS='Available' THEN 1 ELSE 0 END) AS "available",
        SUM(CASE WHEN STATUS='Occupied' THEN 1 ELSE 0 END) AS "occupied",
        SUM(CASE WHEN STATUS='Maintenance' THEN 1 ELSE 0 END) AS "maintenance",
        SUM(CASE WHEN ROOM_TYPE='Single' AND STATUS='Available' THEN 1 ELSE 0 END) AS "singleAvailable",
        SUM(CASE WHEN ROOM_TYPE='Single' AND STATUS='Occupied' THEN 1 ELSE 0 END) AS "singleOccupied",
        SUM(CASE WHEN ROOM_TYPE='Double' AND STATUS='Available' THEN 1 ELSE 0 END) AS "doubleAvailable",
        SUM(CASE WHEN ROOM_TYPE='Double' AND STATUS='Occupied' THEN 1 ELSE 0 END) AS "doubleOccupied",
        SUM(CASE WHEN ROOM_TYPE='Deluxe' AND STATUS='Available' THEN 1 ELSE 0 END) AS "deluxeAvailable",
        SUM(CASE WHEN ROOM_TYPE='Deluxe' AND STATUS='Occupied' THEN 1 ELSE 0 END) AS "deluxeOccupied",
        SUM(CASE WHEN ROOM_TYPE='Suite' AND STATUS='Available' THEN 1 ELSE 0 END) AS "suiteAvailable",
        SUM(CASE WHEN ROOM_TYPE='Suite' AND STATUS='Occupied' THEN 1 ELSE 0 END) AS "suiteOccupied"
      FROM ROOM`
    );

    res.json({ success: true, roomStats: r.rows[0] });
  } catch (e) {
    console.error('Room stats error:', e);
    res.status(500).json({ success: false, message: 'Room stats failed' });
  }
};

// ========================
// Recent Reservations
// ========================
const recentReservations = async (req, res) => {
  try {
    const r = await query(
      `SELECT 
        G.FULL_NAME AS "guestName",
        RO.ROOM_NUMBER AS "roomNumber",
        RE.CHECK_IN AS "checkIn",
        RE.CHECK_OUT AS "checkOut",
        RE.STATUS AS "status",
        B.TOTAL AS "total"
      FROM RESERVATION RE
      JOIN GUEST G ON RE.GUEST_ID = G.GUEST_ID
      JOIN ROOM RO ON RE.ROOM_ID = RO.ROOM_ID
      LEFT JOIN BILL B ON RE.RES_ID = B.RES_ID
      ORDER BY RE.CREATED_AT DESC
      FETCH FIRST 5 ROWS ONLY`
    );

    res.json({ success: true, reservations: r.rows });
  } catch (e) {
    console.error('Recent reservations error:', e);
    res.status(500).json({ success: false, message: 'Recent reservations failed' });
  }
};

// ========================
// Guest Stats
// ========================
const guestStats = async (req, res) => {
  try {
    const r = await query(
      `SELECT 
        COUNT(*) AS "totalGuests",
        SUM(CASE WHEN CREATED_AT >= TRUNC(SYSDATE,'MM') THEN 1 ELSE 0 END) AS "newGuestsThisMonth"
      FROM GUEST`
    );

    res.json({ success: true, guestStats: r.rows[0] });
  } catch (e) {
    console.error('Guest stats error:', e);
    res.status(500).json({ success: false, message: 'Guest stats failed' });
  }
};

// ========================
// Export all dashboard controllers
// ========================
module.exports = { adminSummary,
   roomStats, recentReservations, 
   guestStats, guestReservations,checkReservationStatus, 
  hotelUpdates  };