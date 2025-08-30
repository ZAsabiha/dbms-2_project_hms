// Admin.js
const oracledb = require('oracledb');
const db = require('../config/db'); // your Oracle DB connection pool

const Admin = {
  /**
   * Find a single admin by criteria
   * @param {Object} param0 - e.g., { where: { email } }
   * @returns {Object|null} - admin row
   */
  findOne: async ({ where }) => {
    if (!where || !where.email) {
      throw new Error("Missing email in query");
    }

    let connection;

    try {
      connection = await db.getConnection();

      const result = await connection.execute(
        `SELECT id, name, email, password, role FROM Admin WHERE email = :email`,
        [where.email],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      // Return first row or null
      return result.rows.length > 0 ? result.rows[0] : null;

    } catch (error) {
      console.error("Admin findOne error:", error);
      throw error;
    } finally {
      if (connection) {
        try { await connection.close(); } catch (err) { console.error(err); }
      }
    }
  }
};

module.exports = { Admin };