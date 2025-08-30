import { useEffect, useState } from "react"
import { apiFetch } from "../api/auth"
import "./AdminDashboard.css"

export default function AdminDashboard() {
  const [summary, setSummary] = useState({})
  const [roomStats, setRoomStats] = useState({})
  const [recentReservations, setRecentReservations] = useState([])
  const [guestStats, setGuestStats] = useState({})
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [summaryData, roomData, reservationsData, guestData] = await Promise.all([
          apiFetch("/dashboard/admin-summary"),
          apiFetch("/dashboard/room-stats"),
          apiFetch("/dashboard/recent-reservations"),
          apiFetch("/dashboard/guest-stats"),
        ])

        setSummary(summaryData?.summary || {})
        setRoomStats(roomData?.roomStats || {})
        setRecentReservations(reservationsData?.reservations || [])
        setGuestStats(guestData?.guestStats || {})
      } catch (err) {
        try {
          const data = await apiFetch("/dashboard/admin-summary")
          setSummary(data?.summary || {})
        } catch (basicErr) {
          setError(basicErr.message || "Failed to load dashboard data")
        }
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  if (loading)
    return (
      <div className="admin-dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    )

  if (error)
    return (
      <div className="admin-dashboard-error">
        <div className="error-icon">⚠️</div>
        <p>{error}</p>
      </div>
    )

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p className="dashboard-subtitle">Hotel Management Overview</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Total Reservations</h3>
            <p className="stat-number">{summary.totalReservations || 0}</p>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Total Revenue</h3>
            <p className="stat-number">${summary.totalRevenue?.toFixed(2) || "0.00"}</p>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">🏨</div>
          <div className="stat-content">
            <h3>Available Rooms</h3>
            <p className="stat-number">{roomStats.available || 0}</p>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">🔧</div>
          <div className="stat-content">
            <h3>Maintenance</h3>
            <p className="stat-number">{roomStats.maintenance || 0}</p>
          </div>
        </div>

        <div className="stat-card occupied">
          <div className="stat-icon">🛏️</div>
          <div className="stat-content">
            <h3>Occupied Rooms</h3>
            <p className="stat-number">{roomStats.occupied || 0}</p>
          </div>
        </div>

        <div className="stat-card guests">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Total Guests</h3>
            <p className="stat-number">{guestStats.totalGuests || 0}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Room Status Overview</h2>
        <div className="room-status-grid">
          <div className="room-type-card">
            <h4>Single Rooms</h4>
            <div className="room-breakdown">
              <span className="available">Available: {roomStats.singleAvailable || 0}</span>
              <span className="occupied">Occupied: {roomStats.singleOccupied || 0}</span>
            </div>
          </div>
          <div className="room-type-card">
            <h4>Double Rooms</h4>
            <div className="room-breakdown">
              <span className="available">Available: {roomStats.doubleAvailable || 0}</span>
              <span className="occupied">Occupied: {roomStats.doubleOccupied || 0}</span>
            </div>
          </div>
          <div className="room-type-card">
            <h4>Deluxe Rooms</h4>
            <div className="room-breakdown">
              <span className="available">Available: {roomStats.deluxeAvailable || 0}</span>
              <span className="occupied">Occupied: {roomStats.deluxeOccupied || 0}</span>
            </div>
          </div>
          <div className="room-type-card">
            <h4>Suites</h4>
            <div className="room-breakdown">
              <span className="available">Available: {roomStats.suiteAvailable || 0}</span>
              <span className="occupied">Occupied: {roomStats.suiteOccupied || 0}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Recent Reservations</h2>
        <div className="reservations-table">
          <div className="table-header">
            <span>Guest</span>
            <span>Room</span>
            <span>Check-in</span>
            <span>Check-out</span>
            <span>Status</span>
            <span>Total</span>
          </div>
          {recentReservations.length > 0 ? (
            recentReservations.slice(0, 5).map((reservation, index) => (
              <div key={index} className="table-row">
                <span className="guest-name">{reservation.guestName || "N/A"}</span>
                <span className="room-number">{reservation.roomNumber || "N/A"}</span>
                <span className="check-in">
                  {reservation.checkIn ? new Date(reservation.checkIn).toLocaleDateString() : "N/A"}
                </span>
                <span className="check-out">
                  {reservation.checkOut ? new Date(reservation.checkOut).toLocaleDateString() : "N/A"}
                </span>
                <span className={`status ${reservation.status?.toLowerCase() || "unknown"}`}>
                  {reservation.status || "Unknown"}
                </span>
                <span className="total">${reservation.total?.toFixed(2) || "0.00"}</span>
              </div>
            ))
          ) : (
            <div className="no-data">No recent reservations available</div>
          )}
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Financial Overview</h2>
        <div className="financial-grid">
          <div className="financial-card">
            <h4>Paid Bills</h4>
            <p className="financial-amount">${summary.paidAmount?.toFixed(2) || "0.00"}</p>
            <span className="financial-count">({summary.paidCount || 0} bills)</span>
          </div>
          <div className="financial-card pending">
            <h4>Pending Payments</h4>
            <p className="financial-amount">${summary.pendingAmount?.toFixed(2) || "0.00"}</p>
            <span className="financial-count">({summary.pendingCount || 0} bills)</span>
          </div>
          <div className="financial-card">
            <h4>Average Bill</h4>
            <p className="financial-amount">${summary.averageBill?.toFixed(2) || "0.00"}</p>
          </div>
        </div>
      </div>
    </div>
  )
}