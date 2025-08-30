const db = require('../config/db');

const HotelUpdates = {
  getAllActive: async () => {
    const sql = `
      SELECT * FROM HOTEL_UPDATES
      WHERE VALID_UNTIL >= SYSDATE
      ORDER BY VALID_UNTIL DESC
    `;
    const result = await db.query(sql);
    return result.rows;
  }
};

module.exports = HotelUpdates;