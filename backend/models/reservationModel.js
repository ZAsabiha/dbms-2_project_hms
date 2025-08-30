const db = require('../config/db');

const Reservation = {
  // 1️⃣ Check room availability
  checkAvailability: async (room_id, check_in, check_out) => {
    const sql = `
      SELECT CHECK_AVAILABILITY(:room_id, TO_DATE(:check_in,'YYYY-MM-DD'), TO_DATE(:check_out,'YYYY-MM-DD')) AS IS_AVAILABLE
      FROM DUAL
    `;
    const binds = { room_id, check_in, check_out };

    try {
      console.log('🔍 Checking availability with:', binds);
      const result = await db.query(sql, binds);

      if (!result.rows || result.rows.length === 0) {
        console.warn('⚠️ No rows returned from CHECK_AVAILABILITY');
        return false;
      }

      return result.rows[0].IS_AVAILABLE === 1;
    } catch (err) {
      console.error('❌ DB error in checkAvailability:', err);
      throw new Error('Database error while checking availability');
    }
  },

  // 2️⃣ Create / Book reservation
  // 2️⃣ Create / Book reservation
create: async ({ guest_id, room_id, check_in, check_out }) => {
  const sql = `
    BEGIN
      CREATE_RESERVATION(:room_id, :guest_id, TO_DATE(:check_in,'YYYY-MM-DD'), TO_DATE(:check_out,'YYYY-MM-DD'));
    END;
  `;
  const binds = { room_id, guest_id, check_in, check_out };

  try {
    await db.query(sql, binds, { autoCommit: true });
    return { success: true, message: 'Reservation created successfully' };
  } catch (err) {
    console.error('❌ DB error in create reservation:', err);
    return { success: false, message: err.message };
  }
},


  // 3️⃣ Update reservation
  update: async (resId, { check_in, check_out, status }) => {
    const sql = `
      UPDATE RESERVATION
      SET CHECK_IN = TO_DATE(:check_in,'YYYY-MM-DD'),
          CHECK_OUT = TO_DATE(:check_out,'YYYY-MM-DD'),
          STATUS = :status
      WHERE RES_ID = :resId
    `;
    const binds = { resId, check_in, check_out, status };

    try {
      console.log('🔧 Updating reservation with:', binds);
      const result = await db.query(sql, binds, { autoCommit: true });

      if (!result.rowsAffected || result.rowsAffected === 0) {
        console.warn('⚠️ No rows updated for reservation:', resId);
        return { success: false, message: 'Reservation not found or no changes made' };
      }

      return { success: true, message: 'Reservation updated successfully' };
    } catch (err) {
      console.error('❌ DB error in update reservation:', err);
      return { success: false, message: `Database error: ${err.message}` };
    }
  },

  // 4️⃣ Cancel reservation
  cancel: async (resId) => {
    const sql = `
      DELETE FROM RESERVATION
      WHERE RES_ID = :resId
    `;
    const binds = { resId };

    try {
      console.log('🗑 Cancelling reservation with ID:', resId);
      const result = await db.query(sql, binds, { autoCommit: true });

      if (!result.rowsAffected || result.rowsAffected === 0) {
        console.warn('⚠️ No reservation found to cancel for ID:', resId);
        return { success: false, message: 'Reservation not found' };
      }

      return { success: true, message: 'Reservation cancelled successfully' };
    } catch (err) {
      console.error('❌ DB error in cancel reservation:', err);
      return { success: false, message: `Database error: ${err.message}` };
    }
  },

  // 5️⃣ Estimate cost
  estimateCost: async (room_id, check_in, check_out) => {
    const sql = `
      SELECT ESTIMATE_COST(:room_id, TO_DATE(:check_in,'YYYY-MM-DD'), TO_DATE(:check_out,'YYYY-MM-DD')) AS TOTAL_COST
      FROM DUAL
    `;
    const binds = { room_id, check_in, check_out };

    try {
      console.log('💰 Estimating cost with:', binds);
      const result = await db.query(sql, binds);

      if (!result.rows || result.rows.length === 0) {
        console.warn('⚠️ No result from ESTIMATE_COST for:', binds);
        return 0;
      }

      return result.rows[0]?.TOTAL_COST || 0;
    } catch (err) {
      console.error('❌ DB error in estimateCost:', err);
      throw new Error('Database error while estimating cost');
    }
  },

  // 6️⃣ Get all reservations
  getAll: async () => {
    const sql = `
      SELECT * FROM V_RESERVATION_SUMMARY1 ORDER BY CHECK_IN DESC
    `;

    try {
      console.log('📋 Fetching all reservations...');
      const result = await db.query(sql);

      if (!result.rows) {
        console.warn('⚠️ No reservations found');
        return [];
      }

      return result.rows;
    } catch (err) {
      console.error('❌ DB error in getAll reservations:', err);
      throw new Error('Database error while fetching reservations');
    }
  }
};

module.exports = Reservation;
