import { useEffect, useState } from "react"
import { getAllBills, generateBill, updateBillStatus } from "../api"
import "./BillingPage.css"

export default function BillingPage() {
  const [bills, setBills] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedBill, setSelectedBill] = useState(null)
  const [status, setStatus] = useState("Paid")
  const [resId, setResId] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("All")

  const fetchData = async () => {
    setLoading(true)
    try {
      const billData = await getAllBills()
      setBills(billData)
    } catch (err) {
      console.error("Error fetching bills:", err)
      alert("Failed to load bills")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleGenerateBill = async () => {
    if (!resId) return alert("Enter a reservation ID")
    try {
      await generateBill(Number.parseInt(resId), true)
      alert("Bill generated successfully!")
      setResId("")
      fetchData()
    } catch (err) {
      console.error(err)
      alert("Failed to generate bill")
    }
  }

  const handleUpdateStatus = async (bill_id, newStatus) => {
    try {
      await updateBillStatus(bill_id, newStatus)
      alert("Bill status updated successfully!")
      fetchData()
    } catch (err) {
      console.error(err)
      alert("Failed to update bill status")
    }
  }

  const handleEditBill = (bill) => {
    setSelectedBill(bill)
    setStatus(bill.PAYMENT_STATUS) // Fixed: use PAYMENT_STATUS directly
  }

  const filteredBills = bills.filter((bill) => {
    const matchesSearch = bill.BILL_ID.toString().includes(searchTerm) || bill.RES_ID.toString().includes(searchTerm)
    const matchesFilter =
      filterStatus === "All" ||
      (filterStatus === "Paid" && bill.PAYMENT_STATUS === "Paid") ||
      (filterStatus === "Unpaid" && bill.PAYMENT_STATUS === "Unpaid")
    return matchesSearch && matchesFilter
  })

  const totalBills = bills.length
  const paidBills = bills.filter((bill) => bill.PAYMENT_STATUS === "Paid").length
  const unpaidBills = bills.filter((bill) => bill.PAYMENT_STATUS === "Unpaid").length
  const totalRevenue = bills.reduce((sum, bill) => sum + Number.parseFloat(bill.TOTAL || 0), 0)

  return (
    <div className="billing-container">
      <div className="billing-header">
        <h1>💰 Billing Management</h1>
        <p>Manage hotel bills and payment status</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Total Bills</h3>
            <p className="stat-number">{totalBills}</p>
          </div>
        </div>
        <div className="stat-card paid">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Paid Bills</h3>
            <p className="stat-number">{paidBills}</p>
          </div>
        </div>
        <div className="stat-card unpaid">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>Unpaid Bills</h3>
            <p className="stat-number">{unpaidBills}</p>
          </div>
        </div>
        <div className="stat-card revenue">
          <div className="stat-icon">💵</div>
          <div className="stat-content">
            <h3>Total Revenue</h3>
            <p className="stat-number">${totalRevenue.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="generate-bill-section">
        <h2>🧾 Generate New Bill</h2>
        <div className="generate-form">
          <div className="input-group">
            <label htmlFor="resId">Reservation ID</label>
            <input
              id="resId"
              type="number"
              placeholder="Enter reservation ID"
              value={resId}
              onChange={(e) => setResId(e.target.value)}
              className="form-input"
            />
          </div>
          <button onClick={handleGenerateBill} className="btn btn-primary">
            <span>📄</span> Generate Bill
          </button>
        </div>
      </div>

      <div className="controls-section">
        <div className="search-filter-container">
          <div className="search-box">
            <input
              type="text"
              placeholder="🔍 Search by Bill ID or Reservation ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-box">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select">
              <option value="All">All Status</option>
              <option value="Paid">Paid Only</option>
              <option value="Unpaid">Unpaid Only</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bills-section">
        <h2>📋 Bills Overview</h2>
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading bills...</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="bills-table">
              <thead>
                <tr>
                  <th>Bill ID</th>
                  <th>Reservation ID</th>
                  <th>Nights</th>
                  <th>Rate</th>
                  <th>Taxes</th>
                  <th>Total</th>
                  <th>Payment Status</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.map((bill) => (
                  <tr key={bill.BILL_ID}>
                    <td className="bill-id">#{bill.BILL_ID}</td>
                    <td>#{bill.RES_ID}</td>
                    <td>{bill.NIGHTS}</td>
                    <td>${Number.parseFloat(bill.RATE || 0).toFixed(2)}</td>
                    <td>${Number.parseFloat(bill.TAXES || 0).toFixed(2)}</td>
                    <td className="total-amount">${Number.parseFloat(bill.TOTAL || 0).toFixed(2)}</td>
                    <td>
                      <div className="status-container">
                        <span className={`status-badge ${bill.PAYMENT_STATUS === "Paid" ? "paid" : "unpaid"}`}>
                          {bill.PAYMENT_STATUS === "Paid" ? "✅ Paid" : "⏳ Unpaid"}
                        </span>
                        <select
                          value={bill.PAYMENT_STATUS}
                          onChange={(e) => handleUpdateStatus(bill.BILL_ID, e.target.value)}
                          className="status-select"
                        >
                          <option value="Paid">Paid</option>
                          <option value="Unpaid">Unpaid</option>
                        </select>
                      </div>
                    </td>
                    <td>{new Date(bill.CREATED_AT).toLocaleString()}</td>
                    <td>
                      <button onClick={() => handleEditBill(bill)} className="btn btn-secondary btn-small">
                        ✏️ Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredBills.length === 0 && (
              <div className="no-data">
                <p>📄 No bills found matching your criteria</p>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedBill && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>✏️ Edit Bill #{selectedBill.BILL_ID}</h3>
              <button onClick={() => setSelectedBill(null)} className="close-btn">
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="bill-details">
                <p>
                  <strong>Reservation ID:</strong> #{selectedBill.RES_ID}
                </p>
                <p>
                  <strong>Total Amount:</strong> ${Number.parseFloat(selectedBill.TOTAL || 0).toFixed(2)}
                </p>
                <p>
                  <strong>Created:</strong> {new Date(selectedBill.CREATED_AT).toLocaleString()}
                </p>
              </div>
              <div className="form-group">
                <label htmlFor="status">Payment Status</label>
                <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} className="form-select">
                  <option value="Paid">✅ Paid</option>
                  <option value="Unpaid">⏳ Unpaid</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={async (e) => {
                  e.preventDefault()
                  await handleUpdateStatus(selectedBill.BILL_ID, status)
                  setSelectedBill(null)
                }}
                className="btn btn-primary"
              >
                💾 Save Changes
              </button>
              <button onClick={() => setSelectedBill(null)} className="btn btn-secondary">
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}