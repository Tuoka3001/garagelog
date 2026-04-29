// src/api.js
// Ganti URL ini dengan Web App URL dari Apps Script Anda
const API_URL = 'https://script.google.com/macros/s/AKfycbyuxYB_C6anCm6WErgJusIR1SSW929lsCTB_7EVGVqOKVSVEDd5pHtWIltLRUvUCTEx/exec';

// Ambil semua data dari satu sheet
export async function getAll(sheet) {
  const res = await fetch(`${API_URL}?sheet=${sheet}&action=getAll`);
  return res.json();
}

// Tambah baris baru
export async function addRow(sheet, data) {
  const res = await fetch(API_URL, {
    method: 'POST',
    body: JSON.stringify({ sheet, action: 'add', data }),
  });
  return res.json();
}

// Update baris berdasarkan ID
export async function updateRow(sheet, id, data) {
  const res = await fetch(API_URL, {
    method: 'POST',
    body: JSON.stringify({ sheet, action: 'update', id, data }),
  });
  return res.json();
}

// Hapus baris berdasarkan ID
export async function deleteRow(sheet, id) {
  const res = await fetch(API_URL, {
    method: 'POST',
    body: JSON.stringify({ sheet, action: 'delete', id }),
  });
  return res.json();
}
