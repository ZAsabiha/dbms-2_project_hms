// controllers/billController.js
const Bill = require('../models/billModel');

// ==============================
// Generate Bill for a Reservation
// ==============================
const generateBill = async (req, res) => {
  const { res_id } = req.body; // reservation ID
  if (!res_id) return res.status(400).json({ success: false, message: 'Reservation ID required' });

  try {
    const result = await Bill.create(res_id, true);
    if (result.success) {
      return res.status(200).json(result);
    }
    return res.status(500).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ==============================
// Get Bill by ID
// ==============================
const getBillById = async (req, res) => {
  const { bill_id } = req.params;
  if (!bill_id) return res.status(400).json({ success: false, message: 'Bill ID required' });

  try {
    const bill = await Bill.getById(bill_id);
    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });
    return res.status(200).json(bill);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ==============================
// Get All Bills (Summary)
// ==============================
const getAllBills = async (req, res) => {
  try {
    const bills = await Bill.getAll();
    return res.status(200).json(bills);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ==============================
// Update Bill Payment Status
// ==============================
const updateBillStatus = async (req, res) => {
  const { bill_id } = req.params;
  const { status } = req.body;

  if (!bill_id || !status) return res.status(400).json({ success: false, message: 'Bill ID and status required' });

  try {
    const result = await Bill.updateStatus(bill_id, status);
    if (result.success) return res.status(200).json(result);
    return res.status(500).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ==============================
// Delete Bill
// ==============================
const deleteBill = async (req, res) => {
  const { bill_id } = req.params;
  if (!bill_id) return res.status(400).json({ success: false, message: 'Bill ID required' });

  try {
    const result = await Bill.delete(bill_id);
    if (result.success) return res.status(200).json(result);
    return res.status(500).json(result);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Export Controller Functions
module.exports = {
  generateBill,
  getBillById,
  getAllBills,
  updateBillStatus,
  deleteBill
};