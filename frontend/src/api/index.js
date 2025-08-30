// const API = import.meta.env.VITE_API_URL || ''; // empty if using Vite proxy

// export async function fetchRoomCount() {
//   const url = API ? `${API}/rooms/count` : '/rooms/count';
//   const res = await fetch(url);
//   if (!res.ok) throw new Error(`Failed to fetch room count: ${res.status}`);
//   const json = await res.json();
//   return json.count ?? 0;
// }
// frontend/src/api/index.js




// --2
// const API = import.meta.env.VITE_API_URL || '';

// function buildUrl(path) {
//   return API ? `${API}${path}` : path;
// }

// async function apiFetch(path, { method = 'GET', headers = {}, body, auth = true } = {}) {
//   const h = { 'Content-Type': 'application/json', ...headers };

//   if (auth) {
//     const token = localStorage.getItem('token');
//     if (token) h.Authorization = `Bearer ${token}`;
//   }

//   const options = { method, headers: h };

//   if (body && method !== 'GET') {
//     options.body = JSON.stringify(body);
//   }

//   const res = await fetch(buildUrl(path), options);

//   let data;
//   try {
//     data = await res.json();
//   } catch {
//     data = null;
//   }

//   if (!res.ok) {
//     throw new Error((data && data.message) || `HTTP ${res.status}`);
//   }

//   return data;
// }

// // API functions
// export const login = (payload) => apiFetch('/auth/login', { method: 'POST', body: payload, auth: false });
// export const fetchAdminSummary = () => apiFetch('/dashboard/admin/summary');
// export const fetchGuestReservations = (scope = 'active') =>
//   apiFetch(`/dashboard/guest/reservations?scope=${scope}`);



const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function getAuthHeader() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found. Please log in again.");
  return { Authorization: `Bearer ${token}` };
}

async function handleResponse(res) {
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error?.message || `Request failed: ${res.status}`);
  }
  return res.json();
}

export async function fetchReservations() {
  const res = await fetch(`${API}/reservations`, { headers: getAuthHeader() });
  return handleResponse(res);
}

export async function createReservation(data) {
  const res = await fetch(`${API}/reservations`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateReservation(resId, data) {
  const res = await fetch(`${API}/reservations/${resId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function cancelReservation(resId) {
  const res = await fetch(`${API}/reservations/${resId}/cancel`, {
    method: "PATCH",
    headers: getAuthHeader(),
  });
  return handleResponse(res);
}

export async function estimateReservationCost(data) {
  const res = await fetch(`${API}/reservations/estimate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}


// ------------------ BILLING ------------------

// ------------------ BILLING ------------------

// Generate a bill for a reservation
export async function generateBill(resId, force = true) {
  const url = `${API}/bills/generate`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ res_id: resId, force }),
  });
  if (!res.ok) throw new Error(`Failed to generate bill: ${res.status}`);
  return res.json();
}

// Get a single bill by ID
export async function getBillById(billId) {
  const url = `${API}/bills/${billId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch bill: ${res.status}`);
  return res.json();
}

// Get all bills
export async function getAllBills() {
  const url = `${API}/bills`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch bills: ${res.status}`);
  return res.json();
}

// Update payment status of a bill
export async function updateBillStatus(billId, status) {
  const url = `${API}/bills/status/${billId}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error(`Failed to update bill status: ${res.status}`);
  return res.json();
}

// Delete a bill
export async function deleteBill(billId) {
  const url = `${API}/bills/${billId}`;
  const res = await fetch(url, { method: 'DELETE' });
  if (!res.ok) throw new Error(`Failed to delete bill: ${res.status}`);
  return res.json();
}
