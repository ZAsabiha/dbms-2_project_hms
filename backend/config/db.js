//db.js
// backend/db.js
const oracledb = require('oracledb');
require('dotenv').config();

// Return rows as objects: {COLUMN: value}
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

const dbConfig = {
  user: process.env.DB_USER || 'use your own connection name',
  password: process.env.DB_PASSWORD || 'use your own password',
  connectString: process.env.DB_CONNECT_STRING || 'localhost:1521/ORCLPDB',
  poolMin: 1,
  poolMax: 5,
  poolIncrement: 1,
};

async function initialize() {
  try {
    await oracledb.createPool(dbConfig);
    console.log('✅ Oracle connection pool created');
  } catch (err) {
    console.error('❌ Error creating connection pool:', err);
    throw err;
  }
}

async function closePool() {
  try {
    const pool = oracledb.getPool();
    await pool.close(10); // wait up to 10s for busy connections
    console.log('🧹 Oracle pool closed');
  } catch (err) {
    console.error('Error closing pool:', err);
  }
}

async function getConnection() {
  return await oracledb.getConnection();
}

// Generic query helper
async function query(sql, binds = [], options = {}) {
  let connection;
  try {
    connection = await oracledb.getConnection();
    const result = await connection.execute(sql, binds, options);
    return result;
  } finally {
    if (connection) await connection.close();
  }
}



module.exports = {
  initialize,
  closePool,
  query,
 
  getConnection,
};

