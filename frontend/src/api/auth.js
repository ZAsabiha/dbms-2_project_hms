const API = import.meta.env.VITE_API_URL || '';

function buildUrl(path) {
  return API ? `${API}${path}` : path;
}

export async function apiFetch(path, { method = 'GET', headers = {}, body, auth = true } = {}) {
  const h = { 'Content-Type': 'application/json', ...headers };

  if (auth) {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');
    h.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(buildUrl(path), {
    method,
    headers: h,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    throw new Error((data && data.message) || `HTTP ${res.status}`);
  }

  return data;
}

// ========================
// Admin login
// ========================
export const login = ({ email, password }) =>
  apiFetch('/auth/login', { 
    method: 'POST', 
    body: { email, password, role: 'admin' }, 
    auth: false 
  });

// ========================
// Guest APIs
// ========================

// Get guest reservations (active or past)
export const fetchGuestReservations = (scope = 'active') =>
  apiFetch(`/dashboard/guest/reservations?scope=${scope}`);

// Check the status of a specific reservation by ID
export const fetchReservationStatus = (resId) =>
  apiFetch(`/dashboard/guest/reservation-status?resId=${resId}`);

// Get hotel updates and reminders
export const fetchHotelUpdates = () =>
  apiFetch(`/dashboard/guest/hotel-updates`);
