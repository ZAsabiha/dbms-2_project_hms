// import React, { useEffect, useState } from "react";

// export default function RoomManagement() {
//   const [rooms, setRooms] = useState([]);
//   const [form, setForm] = useState({
//     room_number: "",
//     room_type: "",
//     base_price: "",
//     floor_no: "",
//     status: "Active",
//     notes: "",
//   });
//   const [editingRoomId, setEditingRoomId] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const API_URL = "http://localhost:5000/api/rooms";

//   // Fetch all rooms from backend
//   const fetchRooms = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch(API_URL);
//       const data = await res.json();
//       setRooms(data);
//     } catch (err) {
//       console.error("Error fetching rooms:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchRooms();
//   }, []);

//   // Handle form input change
//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   // Add new room
//   const handleAddRoom = async (e) => {
//     e.preventDefault();
//     try {
//       await fetch(API_URL, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(form),
//       });
//       alert("Room added successfully!");
//       setForm({
//         room_number: "",
//         room_type: "",
//         base_price: "",
//         floor_no: "",
//         status: "Active",
//         notes: "",
//       });
//       fetchRooms();
//     } catch (err) {
//       console.error(err);
//       alert("Failed to add room");
//     }
//   };

//   // Edit room
//   const handleEditRoom = (room) => {
//     setEditingRoomId(room.ROOM_ID);
//     setForm({
//       room_number: room.ROOM_NUMBER,
//       room_type: room.ROOM_TYPE,
//       base_price: room.BASE_PRICE,
//       floor_no: room.FLOOR_NO,
//       status: room.STATUS,
//       notes: room.NOTES || "",
//     });
//   };

//   // Update room
//   const handleUpdateRoom = async (e) => {
//     e.preventDefault();
//     try {
//       await fetch(API_URL, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ ...form, room_id: editingRoomId }),
//       });
//       alert("Room updated successfully!");
//       setEditingRoomId(null);
//       setForm({
//         room_number: "",
//         room_type: "",
//         base_price: "",
//         floor_no: "",
//         status: "Active",
//         notes: "",
//       });
//       fetchRooms();
//     } catch (err) {
//       console.error(err);
//       alert("Failed to update room");
//     }
//   };

//   // Deactivate room
//   const handleDeactivate = async (room_id) => {
//     if (!window.confirm("Are you sure you want to deactivate this room?")) return;
//     try {
//       await fetch(`${API_URL}/deactivate/${room_id}`, { method: "PATCH" });
//       alert("Room deactivated!");
//       fetchRooms();
//     } catch (err) {
//       console.error(err);
//       alert("Failed to deactivate room");
//     }
//   };

//   return (
//     <div style={{ padding: "20px" }}>
//       <h2>Room Management</h2>

//       {/* Form */}
//       <form
//         onSubmit={editingRoomId ? handleUpdateRoom : handleAddRoom}
//         style={{ marginBottom: "20px", padding: "10px", border: "1px solid #ccc" }}
//       >
//         <h3>{editingRoomId ? "Edit Room" : "Add Room"}</h3>
//         <input
//           type="text"
//           name="room_number"
//           placeholder="Room Number"
//           value={form.room_number}
//           onChange={handleChange}
//           required
//         />
//         <input
//           type="text"
//           name="room_type"
//           placeholder="Room Type"
//           value={form.room_type}
//           onChange={handleChange}
//           required
//         />
//         <input
//           type="number"
//           name="base_price"
//           placeholder="Base Price"
//           value={form.base_price}
//           onChange={handleChange}
//           required
//         />
//         <input
//           type="number"
//           name="floor_no"
//           placeholder="Floor Number"
//           value={form.floor_no}
//           onChange={handleChange}
//           required
//         />
//         <select name="status" value={form.status} onChange={handleChange}>
//           <option value="Active">Active</option>
//           <option value="Inactive">Inactive</option>
//         </select>
//         <input
//           type="text"
//           name="notes"
//           placeholder="Notes"
//           value={form.notes}
//           onChange={handleChange}
//         />
//         <button type="submit">{editingRoomId ? "Update Room" : "Add Room"}</button>
//         {editingRoomId && <button onClick={() => setEditingRoomId(null)}>Cancel</button>}
//       </form>

//       {/* Room Table */}
//       {loading ? (
//         <p>Loading rooms...</p>
//       ) : (
//         <table border="1" cellPadding="5">
//           <thead>
//             <tr>
//               <th>ID</th>
//               <th>Number</th>
//               <th>Type</th>
//               <th>Price</th>
//               <th>Floor</th>
//               <th>Status</th>
//               <th>Notes</th>
//               <th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {rooms.map((room) => (
//               <tr key={room.ROOM_ID}>
//                 <td>{room.ROOM_ID}</td>
//                 <td>{room.ROOM_NUMBER}</td>
//                 <td>{room.ROOM_TYPE}</td>
//                 <td>{room.BASE_PRICE}</td>
//                 <td>{room.FLOOR_NO}</td>
//                 <td>{room.STATUS}</td>
//                 <td>{room.NOTES}</td>
//                 <td>
//                   <button onClick={() => handleEditRoom(room)}>Edit</button>
//                   <button onClick={() => handleDeactivate(room.ROOM_ID)}>Deactivate</button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// }




import { useEffect, useState } from "react"
import { useAuth } from "../context/AuthContext"
import "./RoomManagement.css"

export default function RoomManagement() {
  const { user } = useAuth()
  const [rooms, setRooms] = useState([])
  const [filteredRooms, setFilteredRooms] = useState([])
  const [form, setForm] = useState({
    room_number: "",
    room_type: "",
    base_price: "",
    floor_no: "",
    status: "Available",
    notes: "",
  })
  const [editingRoomId, setEditingRoomId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [filterStatus, setFilterStatus] = useState("All")
  const [filterType, setFilterType] = useState("All")
  const [searchTerm, setSearchTerm] = useState("")

  const API_URL = "http://localhost:5000/api/rooms"
  const isAdmin = user?.role === "admin"

  const fetchRooms = async () => {
    setLoading(true)
    setError("")
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!res.ok) throw new Error("Failed to fetch rooms")

      const data = await res.json()
      setRooms(data)
      setFilteredRooms(data)
    } catch (err) {
      console.error("Error fetching rooms:", err)
      setError("Failed to load rooms. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRooms()
  }, [])

  useEffect(() => {
    let filtered = rooms

    if (filterStatus !== "All") {
      filtered = filtered.filter((room) => room.STATUS === filterStatus)
    }

    if (filterType !== "All") {
      filtered = filtered.filter((room) => room.ROOM_TYPE === filterType)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (room) =>
          room.ROOM_NUMBER.toString().includes(searchTerm) ||
          room.ROOM_TYPE.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredRooms(filtered)
  }, [rooms, filterStatus, filterType, searchTerm])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleAddRoom = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const token = localStorage.getItem("token")
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      })

      if (!res.ok) throw new Error("Failed to add room")

      setSuccess("Room added successfully!")
      setForm({
        room_number: "",
        room_type: "",
        base_price: "",
        floor_no: "",
        status: "Available",
        notes: "",
      })
      fetchRooms()
    } catch (err) {
      console.error(err)
      setError("Failed to add room. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleEditRoom = (room) => {
    setEditingRoomId(room.ROOM_ID)
    setForm({
      room_number: room.ROOM_NUMBER,
      room_type: room.ROOM_TYPE,
      base_price: room.BASE_PRICE,
      floor_no: room.FLOOR_NO,
      status: room.STATUS,
      notes: room.NOTES || "",
    })
    setError("")
    setSuccess("")
  }

  const handleUpdateRoom = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const token = localStorage.getItem("token")
      const res = await fetch(API_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...form, room_id: editingRoomId }),
      })

      if (!res.ok) throw new Error("Failed to update room")

      setSuccess("Room updated successfully!")
      handleCancelEdit()
      fetchRooms()
    } catch (err) {
      console.error(err)
      setError("Failed to update room. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingRoomId(null)
    setForm({
      room_number: "",
      room_type: "",
      base_price: "",
      floor_no: "",
      status: "Available",
      notes: "",
    })
    setError("")
    setSuccess("")
  }

  const handleDeactivate = async (room_id) => {
    if (!window.confirm("Are you sure you want to deactivate this room?")) return

    setLoading(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`${API_URL}/deactivate/${room_id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!res.ok) throw new Error("Failed to deactivate room")

      setSuccess("Room deactivated successfully!")
      fetchRooms()
    } catch (err) {
      console.error(err)
      setError("Failed to deactivate room. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusClass = {
      Available: "status-available",
      Occupied: "status-occupied",
      Maintenance: "status-maintenance",
      Inactive: "status-inactive",
    }
    return <span className={`status-badge ${statusClass[status] || ""}`}>{status}</span>
  }

  const uniqueTypes = [...new Set(rooms.map((room) => room.ROOM_TYPE))]

  return (
    <div className="room-management">
      <div className="room-header">
        <h1>🏨 Room Management</h1>
        <p>Manage hotel rooms and their availability</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="controls-section">
        <div className="search-filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="🔍 Search by room number or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filters">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select">
              <option value="All">All Status</option>
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Inactive">Inactive</option>
            </select>

            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="filter-select">
              <option value="All">All Types</option>
              {uniqueTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="room-stats">
          <div className="stat-card">
            <span className="stat-number">{rooms.length}</span>
            <span className="stat-label">Total Rooms</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{rooms.filter((r) => r.STATUS === "Available").length}</span>
            <span className="stat-label">Available</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{rooms.filter((r) => r.STATUS === "Occupied").length}</span>
            <span className="stat-label">Occupied</span>
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="form-section">
          <form onSubmit={editingRoomId ? handleUpdateRoom : handleAddRoom} className="room-form">
            <h3>{editingRoomId ? "✏️ Edit Room" : "➕ Add New Room"}</h3>

            <div className="form-grid">
              <div className="form-group">
                <label>Room Number</label>
                <input
                  type="text"
                  name="room_number"
                  placeholder="e.g., 101"
                  value={form.room_number}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Room Type</label>
                <select name="room_type" value={form.room_type} onChange={handleChange} required>
                  <option value="">Select Type</option>
                  <option value="Single">Single</option>
                  <option value="Double">Double</option>
                  <option value="Suite">Suite</option>
                  <option value="Deluxe">Deluxe</option>
                  <option value="Presidential">Presidential</option>
                </select>
              </div>

              <div className="form-group">
                <label>Base Price ($)</label>
                <input
                  type="number"
                  name="base_price"
                  placeholder="0.00"
                  value={form.base_price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label>Floor Number</label>
                <input
                  type="number"
                  name="floor_no"
                  placeholder="1"
                  value={form.floor_no}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select name="status" value={form.status} onChange={handleChange}>
                  <option value="Available">Available</option>
                  <option value="Occupied">Occupied</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="form-group full-width">
                <label>Notes</label>
                <textarea
                  name="notes"
                  placeholder="Additional notes about the room..."
                  value={form.notes}
                  onChange={handleChange}
                  rows="3"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Processing..." : editingRoomId ? "Update Room" : "Add Room"}
              </button>
              {editingRoomId && (
                <button type="button" onClick={handleCancelEdit} className="btn btn-secondary">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <div className="table-section">
        <div className="table-header">
          <h3>📋 Room List ({filteredRooms.length} rooms)</h3>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading rooms...</p>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="empty-state">
            <p>No rooms found matching your criteria.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="rooms-table">
              <thead>
                <tr>
                  <th>Room #</th>
                  <th>Type</th>
                  <th>Price</th>
                  <th>Floor</th>
                  <th>Status</th>
                  <th>Notes</th>
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredRooms.map((room) => (
                  <tr key={room.ROOM_ID} className={editingRoomId === room.ROOM_ID ? "editing" : ""}>
                    <td className="room-number">{room.ROOM_NUMBER}</td>
                    <td className="room-type">{room.ROOM_TYPE}</td>
                    <td className="room-price">${room.BASE_PRICE}</td>
                    <td className="room-floor">{room.FLOOR_NO}</td>
                    <td className="room-status">{getStatusBadge(room.STATUS)}</td>
                    <td className="room-notes">{room.NOTES || "—"}</td>
                    {isAdmin && (
                      <td className="room-actions">
                        <button onClick={() => handleEditRoom(room)} className="btn btn-edit" disabled={loading}>
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDeactivate(room.ROOM_ID)}
                          className="btn btn-deactivate"
                          disabled={loading || room.STATUS === "Inactive"}
                        >
                          🚫 Deactivate
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
