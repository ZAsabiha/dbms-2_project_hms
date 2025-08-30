
import { useEffect, useState } from "react";
import "./GuestDashboard.css";

export default function GuestDashboard() {
  const [rooms, setRooms] = useState([]);
  const [offers, setOffers] = useState([]);
  const [bookingData, setBookingData] = useState({
    full_name: "",
    phone: "",
    email: "",
    address: "",
    room_id: "",
    check_in: "",
    check_out: "",
  });
  const [message, setMessage] = useState("");

  // Fetch available rooms
  useEffect(() => {
    fetch("/api/guest/rooms")
      .then((res) => res.json())
      .then(setRooms)
      .catch((err) => console.error("Failed to fetch rooms", err));

    fetch("/api/guest/offers")
      .then((res) => res.json())
      .then(setOffers)
      .catch((err) => console.error("Failed to fetch offers", err));
  }, []);

  // Handle booking form input
  const handleChange = (e) => {
    setBookingData({ ...bookingData, [e.target.name]: e.target.value });
  };

  // Submit booking
  const handleBooking = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/guest/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`✅ ${data.message} | Reservation ID: ${data.reservation_id}`);
        setBookingData({
          full_name: "",
          phone: "",
          email: "",
          address: "",
          room_id: "",
          check_in: "",
          check_out: "",
        });
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      setMessage("❌ Booking failed. Try again.");
    }
  };

  return (
    <div className="guest-dashboard">
      <h1>Welcome to Our Hotel</h1>

      {/* Available Rooms */}
      <section className="section">
        <h2>Available Rooms</h2>
        <div className="rooms-list">
          {rooms.length === 0 ? (
            <p>No rooms available at the moment.</p>
          ) : (
            rooms.map((room) => (
              <div key={room.ROOM_ID} className="room-card">
                <h3>{room.ROOM_TYPE}</h3>
                <p><strong>Room No:</strong> {room.ROOM_NUMBER}</p>
                <p><strong>Floor:</strong> {room.FLOOR_NO}</p>
                <p><strong>Price:</strong> ${room.BASE_PRICE}</p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Offers */}
      <section className="section">
        <h2>Special Offers</h2>
        <div className="offers-list">
          {offers.length === 0 ? (
            <p>No offers available right now.</p>
          ) : (
            offers.map((offer) => (
              <div key={offer.UPDATE_ID} className="offer-card">
                <h3>{offer.TITLE}</h3>
                <p>{offer.MESSAGE}</p>
                <small>Valid until: {new Date(offer.VALID_UNTIL).toLocaleDateString()}</small>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Booking Form */}
      <section className="section">
        <h2>Book a Room</h2>
        <form className="booking-form" onSubmit={handleBooking}>
          <input
            type="text"
            name="full_name"
            placeholder="Full Name"
            value={bookingData.full_name}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone"
            value={bookingData.phone}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={bookingData.email}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="address"
            placeholder="Address"
            value={bookingData.address}
            onChange={handleChange}
          />
          <select
            name="room_id"
            value={bookingData.room_id}
            onChange={handleChange}
            required
          >
            <option value="">Select Room</option>
            {rooms.map((room) => (
              <option key={room.ROOM_ID} value={room.ROOM_ID}>
                {room.ROOM_TYPE} - {room.ROOM_NUMBER} (${room.BASE_PRICE})
              </option>
            ))}
          </select>
          <label>Check-in Date:</label>
          <input
            type="date"
            name="check_in"
            value={bookingData.check_in}
            onChange={handleChange}
            required
          />
          <label>Check-out Date:</label>
          <input
            type="date"
            name="check_out"
            value={bookingData.check_out}
            onChange={handleChange}
            required
          />
          <button type="submit">Book Now</button>
        </form>
        {message && <p className="booking-message">{message}</p>}
      </section>
    </div>
  );
}