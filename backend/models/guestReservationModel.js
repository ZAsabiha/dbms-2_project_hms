// const db = require('../config/db');
// const oracledb = require('oracledb');

// const GuestReservationModel = {
//   add: async ({ guest_id, room_id, check_in, check_out }) => {
//     const sql = `
//       INSERT INTO RESERVATION (RES_ID, GUEST_ID, ROOM_ID, CHECK_IN, CHECK_OUT, STATUS)
//       VALUES (RES_SEQ.NEXTVAL, :guest_id, :room_id, :check_in, :check_out, 'Booked')
//       RETURNING RES_ID INTO :res_id
//     `;
//     const binds = {
//       guest_id,
//       room_id,
//       check_in,
//       check_out,
//       res_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
//     };

//     const result = await db.query(sql, binds, { autoCommit: true });
//     return result.outBinds.res_id[0]; // return the generated reservation ID
//   },

//   updateRoomStatus: async (room_id) => {
//     const sql = `UPDATE ROOM SET STATUS = 'Occupied' WHERE ROOM_ID = :room_id`;
//     await db.query(sql, { room_id }, { autoCommit: true });
//   }
// };

// module.exports = GuestReservationModel;

const db = require('../config/db');
const oracledb = require('oracledb');

const GuestReservationModel = {
  add: async ({ guest_id, room_id, check_in, check_out }) => {
    const sql = `
      INSERT INTO RESERVATION (
        GUEST_ID, ROOM_ID, CHECK_IN, CHECK_OUT, STATUS
      )
      VALUES (
        :guest_id, 
        :room_id, 
        TO_DATE(:check_in, 'YYYY-MM-DD'), 
        TO_DATE(:check_out, 'YYYY-MM-DD'), 
        'Booked'
      )
      RETURNING RES_ID INTO :res_id
    `;
    const binds = {
      guest_id,
      room_id,
      check_in,
      check_out,
      res_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
    };

    const result = await db.query(sql, binds, { autoCommit: true });
    return result.outBinds.res_id[0]; // Trigger ensures RES_ID is filled
  },

  updateRoomStatus: async (room_id) => {
    const sql = `UPDATE ROOM SET STATUS = 'Occupied' WHERE ROOM_ID = :room_id`;
    await db.query(sql, { room_id }, { autoCommit: true });
  }
};

module.exports = GuestReservationModel;