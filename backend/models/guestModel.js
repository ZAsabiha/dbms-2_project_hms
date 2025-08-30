const db = require('../config/db');
const oracledb = require('oracledb');

const Guest = {
  // Add a new guest (for booking purposes, if not already registered)
  add: async ({ full_name, phone, email, address }) => {
    const sql = `
      INSERT INTO GUEST (FULL_NAME, PHONE, EMAIL, ADDRESS)
      VALUES (:full_name, :phone, :email, :address)
      RETURNING GUEST_ID INTO :guest_id
    `;

    const binds = {
      full_name: { val: full_name },
      phone: { val: phone },
      email: { val: email },
      address: { val: address },
      guest_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
    };

    const result = await db.query(sql, binds, { autoCommit: true });
    return result.outBinds.guest_id[0];
  },

  // Find guest by email/phone (to avoid duplicates)
  findByEmail: async (email) => {
    const sql = `SELECT * FROM GUEST WHERE EMAIL = :email`;
    const binds = { email: { val: email } };
    const result = await db.query(sql, binds);
    return result.rows[0];
  }
};

module.exports = Guest;