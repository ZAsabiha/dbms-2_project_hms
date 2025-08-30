// // models/billModel.js
// const db = require('../config/db');

// const Bill = {
//   create: async (res_id, force = true) => {
//     const sql = `
//       BEGIN
//         PROC_GENERATE_BILL(:p_res_id, :p_force_num);
//       END;
//     `;
//     const binds = {
//       p_res_id: res_id,
//       p_force_num: force ? 1 : 0   // 1 = TRUE, 0 = FALSE
//     };

//     try {
//       await db.query(sql, binds, { autoCommit: true });
//       return { success: true, message: 'Bill generated successfully' };
//     } catch (err) {
//       console.error('PL/SQL execution error:', err);  // log full error
//       return { success: false, message: err.message };
//     }
//   },

//     // 2️⃣ Get Bill by ID
//     getById: async (bill_id) => {
//         const sql = `
//             SELECT B.BILL_ID, B.RES_ID, B.AMOUNT, B.PAYMENT_STATUS, B.CREATED_AT,
//                          R.GUEST_ID, R.ROOM_ID, R.CHECK_IN, R.CHECK_OUT
//             FROM BILL B
//             JOIN RESERVATION R ON B.RES_ID = R.RES_ID
//             WHERE B.BILL_ID = :bill_id
//         `;
//         try {
//             const result = await db.query(sql, { bill_id });
//             return result.rows[0] || null;
//         } catch (err) {
//             // console.error(err);
//             return { success: false, message: err.message };
//         }
//     },

//     // 3️⃣ Get all Bills
//     getAll: async () => {
//         const sql = `
//             SELECT * FROM BILL ORDER BY CREATED_AT DESC
//         `;
//         try {
//             const result = await db.query(sql);
//             return result.rows;
//         } catch (err) {
//             // console.error(err);
//             return { success: false, message: err.message };
//         }
//     },

//     // 4️⃣ Update Payment Status
//     updateStatus: async (bill_id, status) => {
//         const sql = `
//             UPDATE BILL
//             SET PAYMENT_STATUS = :status
//             WHERE BILL_ID = :bill_id
//         `;
//         try {
//             await db.query(sql, { bill_id, status }, { autoCommit: true });
//             return { success: true, message: 'Bill status updated successfully' };
//         } catch (err) {
//             // console.error(err);
//             return { success: false, message: err.message };
//         }
//     },

//     // 5️⃣ Delete Bill
//     delete: async (bill_id) => {
//         const sql = `
//             DELETE FROM BILL WHERE BILL_ID = :bill_id
//         `;
//         try {
//             await db.query(sql, { bill_id }, { autoCommit: true });
//             return { success: true, message: 'Bill deleted successfully' };
//         } catch (err) {
//             // console.error(err);
//             return { success: false, message: err.message };
//         }
//     }
// };

// module.exports = Bill;


// models/billModel.js

// models/billModel.js
const db = require('../config/db');

const Bill = {
  create: async (res_id, force = true) => {
    console.log('🔄 Creating bill for reservation ID:', res_id, 'Force:', force);
    
    const sql = `
      BEGIN
        PROC_GENERATE_BILL1(:p_res_id, :p_force);
      END;
    `;
    const binds = {
      p_res_id: res_id,
      p_force: force ? 1 : 0   // Convert boolean to number: 1 = TRUE, 0 = FALSE
    };

    console.log('🔍 SQL:', sql);
    console.log('🔍 Binds:', binds);

    try {
      await db.query(sql, binds, { autoCommit: true });
      console.log('✅ Bill created successfully for reservation:', res_id);
      return { success: true, message: 'Bill generated successfully' };
    } catch (err) {
      console.error('❌ PL/SQL execution error:', err);
      console.log('💡 SUGGESTION: The procedure expects BOOLEAN but Node.js might need NUMBER');
      console.log('💡 Consider modifying procedure to accept NUMBER instead of BOOLEAN');
      return { success: false, message: err.message };
    }
  },

  // 2️⃣ Get Bill by ID
  getById: async (bill_id) => {
    console.log('🔍 Fetching bill by ID:', bill_id);
    
    const sql = `
        SELECT 
            B.BILL_ID, 
            B.RES_ID, 
            B.NIGHTS,
            B.RATE,
            B.TAXES,
            B.TOTAL,
            CASE 
                WHEN B.PAID = 'Y' THEN 'Paid'
                WHEN B.PAID = 'N' THEN 'Unpaid'
                ELSE 'Unknown'
            END as PAYMENT_STATUS,
            B.CREATED_AT,
            R.GUEST_ID, 
            R.ROOM_ID, 
            R.CHECK_IN, 
            R.CHECK_OUT
        FROM BILL B
        JOIN RESERVATION R ON B.RES_ID = R.RES_ID
        WHERE B.BILL_ID = :bill_id
    `;
    try {
        const result = await db.query(sql, { bill_id });
        console.log('📄 Bill found:', result.rows[0]);
        return result.rows[0] || null;
    } catch (err) {
        console.error('❌ Error fetching bill by ID:', err);
        return { success: false, message: err.message };
    }
  },

  // 3️⃣ Get all Bills - FIXED VERSION
  getAll: async () => {
    console.log('📋 Fetching all bills...');
    
    const sql = `
        SELECT 
            B.BILL_ID, 
            B.RES_ID, 
            B.NIGHTS,
            B.RATE,
            B.TAXES,
            B.TOTAL,
            CASE 
                WHEN B.PAID = 'Y' THEN 'Paid'
                WHEN B.PAID = 'N' THEN 'Unpaid'
                ELSE 'Unknown'
            END as PAYMENT_STATUS,
            B.CREATED_AT
        FROM BILL B
        ORDER BY B.CREATED_AT DESC
    `;
    
    try {
        const result = await db.query(sql);
        console.log('📊 Total bills found:', result.rows.length);
        console.log('🔍 Sample bill data:', result.rows[0]);
        console.log('📝 All bill columns:', result.rows[0] ? Object.keys(result.rows[0]) : 'No bills found');
        return result.rows;
    } catch (err) {
        console.error('❌ Error fetching all bills:', err);
        console.error('🔍 SQL Query was:', sql);
        return { success: false, message: err.message };
    }
  },

  // 4️⃣ Update Payment Status
  updateStatus: async (bill_id, status) => {
    console.log('💳 Updating bill status - Bill ID:', bill_id, 'New Status:', status);
    
    // Convert frontend status to database format
    const paidValue = status === 'Paid' ? 'Y' : 'N';
    console.log('🔄 Converting status:', status, '-> PAID:', paidValue);
    
    const sql = `
        UPDATE BILL
        SET PAID = :paid_value
        WHERE BILL_ID = :bill_id
    `;
    try {
        const result = await db.query(sql, { bill_id, paid_value: paidValue }, { autoCommit: true });
        console.log('✅ Bill status updated successfully, rows affected:', result.rowsAffected);
        return { success: true, message: 'Bill status updated successfully' };
    } catch (err) {
        console.error('❌ Error updating bill status:', err);
        return { success: false, message: err.message };
    }
  },

  // 5️⃣ Delete Bill
  delete: async (bill_id) => {
    console.log('🗑️ Deleting bill ID:', bill_id);
    
    const sql = `
        DELETE FROM BILL WHERE BILL_ID = :bill_id
    `;
    try {
        const result = await db.query(sql, { bill_id }, { autoCommit: true });
        console.log('✅ Bill deleted successfully, rows affected:', result.rowsAffected);
        return { success: true, message: 'Bill deleted successfully' };
    } catch (err) {
        console.error('❌ Error deleting bill:', err);
        return { success: false, message: err.message };
    }
  }
};

module.exports = Bill;