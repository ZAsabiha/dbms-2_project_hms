
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./ReservationsPage.css";
import {
  fetchReservations,
  createReservation,
  updateReservation,
  cancelReservation,
  estimateReservationCost,
} from "../api/index"; // adjust path as needed

export default function ReservationsPage() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState({
    room_id: "",
    check_in: "",
    check_out: "",
    status: "Booked",
  });
  const [editingResId, setEditingResId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [estimatedCost, setEstimatedCost] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);

  // Fetch available rooms
  const fetchRoomsData = async () => {
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    const token = localStorage.getItem("token");
    const response = await fetch(`${baseUrl}/rooms`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error("Failed to fetch rooms");
    return response.json();
  };

  // Fetch reservations and rooms
  const fetchData = async () => {
    setLoading(true);
    try {
      const [resData, roomData] = await Promise.all([
        fetchReservations(),
        fetchRoomsData(),
      ]);
      setReservations(resData);
      setRooms(roomData);
    } catch (err) {
      console.error("Error fetching data:", err);
      alert("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle form field changes
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Estimate reservation cost
  const handleEstimate = async () => {
    if (!form.room_id || !form.check_in || !form.check_out) {
      alert("Select room and dates first");
      return;
    }
    try {
      const cost = await estimateReservationCost({
        room_id: form.room_id,
        check_in: form.check_in,
        check_out: form.check_out,
      });
      setEstimatedCost(cost.total ?? cost);
    } catch (err) {
      console.error("Cost estimation error:", err);
      alert("Failed to estimate cost");
    }
  };

  // Add new reservation
  const handleAddReservation = async (e) => {
    e.preventDefault();
    try {
      await createReservation(form);
      alert("Reservation created successfully!");
      resetForm();
      fetchData();
    } catch (err) {
      console.error("Create reservation error:", err);
      alert(err.message || "Failed to create reservation");
    }
  };

  // ---- EDIT reservation (fixed to use UPPERCASE keys) ----
  const handleEditReservation = (res) => {
    setEditingResId(res.RES_ID);

    const toInputDate = (value) => {
      if (!value) return "";
      if (typeof value === "string") {
        return value.includes("T") ? value.split("T")[0] : value.slice(0, 10);
      }
      try {
        return new Date(value).toISOString().split("T")[0];
      } catch {
        return "";
      }
    };

    setForm({
      room_id: res.ROOM_ID ?? "",
      check_in: toInputDate(res.CHECK_IN),
      check_out: toInputDate(res.CHECK_OUT),
      status: res.STATUS ?? "Booked",
    });

    setEstimatedCost(null);
    setShowForm(true);
  };

  // Update reservation
  const handleUpdateReservation = async (e) => {
    e.preventDefault();
    try {
      await updateReservation(editingResId, {
        check_in: form.check_in,
        check_out: form.check_out,
        status: form.status,
      });
      alert("Reservation updated successfully!");
      resetForm();
      fetchData();
    } catch (err) {
      console.error("Update reservation error:", err);
      alert(err.message || "Failed to update reservation");
    }
  };

  // Cancel reservation
  const handleCancelReservation = async (resId) => {
    if (!window.confirm("Are you sure you want to cancel this reservation?"))
      return;
    try {
      await cancelReservation(resId);
      alert("Reservation canceled!");
      fetchData();
    } catch (err) {
      console.error("Cancel reservation error:", err);
      alert(err.message || "Failed to cancel reservation");
    }
  };

  const resetForm = () => {
    setEditingResId(null);
    setForm({
      room_id: "",
      check_in: "",
      check_out: "",
      status: "Booked",
    });
    setEstimatedCost(null);
    setShowForm(false);
  };

  const filteredReservations = reservations.filter((res) => {
    const matchesSearch =
      res.ROOM_NUMBER?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.RES_ID?.toString().includes(searchTerm);
    const matchesStatus = statusFilter === "All" || res.STATUS === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const statusClasses = {
      Booked: "status-booked",
      CheckedIn: "status-checked-in",
      CheckedOut: "status-checked-out",
      Cancelled: "status-cancelled",
    };
    return `status-badge ${statusClasses[status] || ""}`;
  };

  const stats = {
    total: reservations.length,
    booked: reservations.filter((r) => r.STATUS === "Booked").length,
    checkedIn: reservations.filter((r) => r.STATUS === "CheckedIn").length,
    checkedOut: reservations.filter((r) => r.STATUS === "CheckedOut").length,
    cancelled: reservations.filter((r) => r.STATUS === "Cancelled").length,
  };

  return (
    <div className="reservation-management">
      <div className="reservation-header">
        <div className="header-content">
          <h1>🏨 Reservation Management</h1>
          <p>Manage hotel bookings and guest reservations</p>
        </div>
        {user?.role === "admin" && (
          <button
            className="add-btn"
            onClick={() => {
              // opening "New" should clear edit mode
              if (!showForm) setEditingResId(null);
              setShowForm(!showForm);
            }}
          >
            {showForm ? "✕ Cancel" : "+ New Reservation"}
          </button>
        )}
      </div>

      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>{stats.total}</h3>
            <p>Total Reservations</p>
          </div>
        </div>
        <div className="stat-card booked">
          <div className="stat-icon">📅</div>
          <div className="stat-info">
            <h3>{stats.booked}</h3>
            <p>Booked</p>
          </div>
        </div>
        <div className="stat-card checked-in">
          <div className="stat-icon">🏠</div>
          <div className="stat-info">
            <h3>{stats.checkedIn}</h3>
            <p>Checked In</p>
          </div>
        </div>
        <div className="stat-card checked-out">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>{stats.checkedOut}</h3>
            <p>Checked Out</p>
          </div>
        </div>
      </div>

      {(showForm || editingResId !== null) && user?.role === "admin" && (
        <div className="form-container">
          <form
            onSubmit={editingResId !== null ? handleUpdateReservation : handleAddReservation}
          >
            <h3>{editingResId !== null ? "Edit Reservation" : "Create New Reservation"}</h3>

            <div className="form-grid">
              <div className="form-group">
                <label>Room</label>
                <select name="room_id" value={form.room_id} onChange={handleChange} required>
                  <option value="">Select Room</option>
                  {rooms
                    // show available rooms + the selected room (so edit mode doesn't drop it)
                    .filter(
                      (room) =>
                        room.STATUS === "Available" ||
                        Number(room.ROOM_ID) === Number(form.room_id)
                    )
                    .map((room) => (
                      <option key={room.ROOM_ID} value={room.ROOM_ID}>
                        {room.ROOM_NUMBER} - {room.ROOM_TYPE} (${room.PRICE}/night)
                      </option>
                    ))}
                </select>
              </div>

              <div className="form-group">
                <label>Check-in Date</label>
                <input
                  type="date"
                  name="check_in"
                  value={form.check_in}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>

              <div className="form-group">
                <label>Check-out Date</label>
                <input
                  type="date"
                  name="check_out"
                  value={form.check_out}
                  onChange={handleChange}
                  min={form.check_in || new Date().toISOString().split("T")[0]}
                  required
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select name="status" value={form.status} onChange={handleChange} required>
                  <option value="Booked">Booked</option>
                  <option value="CheckedIn">Checked In</option>
                  <option value="CheckedOut">Checked Out</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="form-group cost-estimate">
                <button type="button" onClick={handleEstimate} className="estimate-btn">
                  💰 Estimate Cost
                </button>
                {estimatedCost !== null && (
                  <div className="estimated-cost">
                    <strong>Estimated Total: ${estimatedCost}</strong>
                  </div>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn">
                {editingResId !== null ? "Update Reservation" : "Create Reservation"}
              </button>
              <button type="button" onClick={resetForm} className="cancel-btn">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="controls">
        <div className="search-group">
          <input
            type="text"
            placeholder="🔍 Search reservations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
            <option value="All">All Status</option>
            <option value="Booked">Booked</option>
            <option value="CheckedIn">Checked In</option>
            <option value="CheckedOut">Checked Out</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading reservations...</p>
          </div>
        ) : (
          <table className="reservations-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Room</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Status</th>
                <th>Duration</th>
                {user?.role === "admin" && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredReservations.map((res) => {
                const checkIn = new Date(res.CHECK_IN);
                const checkOut = new Date(res.CHECK_OUT);
                const duration = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

                return (
                  <tr key={res.RES_ID}>
                    <td>#{res.RES_ID}</td>
                    <td>
                      <div className="room-info">
                        <strong>{res.ROOM_NUMBER}</strong>
                        <span>{res.ROOM_TYPE}</span>
                      </div>
                    </td>
                    <td>{checkIn.toLocaleDateString()}</td>
                    <td>{checkOut.toLocaleDateString()}</td>
                    <td>
                      <span className={getStatusBadge(res.STATUS)}>{res.STATUS}</span>
                    </td>
                    <td>
                      {duration} night{duration !== 1 ? "s" : ""}
                    </td>
                    {user?.role === "admin" && (
                      <td>
                        <div className="action-buttons">
                          <button
                            type="button"
                            onClick={() => handleEditReservation(res)}
                            className="edit-btn"
                            title="Edit Reservation"
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCancelReservation(res.RES_ID)}
                            className="delete-btn"
                            title="Cancel Reservation"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {!loading && filteredReservations.length === 0 && (
          <div className="no-data">
            <p>No reservations found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
