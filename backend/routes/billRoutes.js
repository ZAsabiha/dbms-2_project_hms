const express = require('express');
const router = express.Router();
const BillController = require('../controllers/billController');

router.post('/generate', BillController.generateBill);         // POST /api/bills/generate
router.get('/:bill_id', BillController.getBillById);           // GET /api/bills/:bill_id
router.get('/', BillController.getAllBills);                  // GET /api/bills
router.put('/status/:bill_id', BillController.updateBillStatus); // PUT /api/bills/status/:bill_id
router.delete('/:bill_id', BillController.deleteBill);         // DELETE /api/bills/:bill_id

module.exports = router;