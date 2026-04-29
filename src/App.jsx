// Tambahkan import ini di baris paling atas App.jsx
import { useState, useEffect } from 'react';
import { getAll, addRow, updateRow, deleteRow } from './api.js';

import { useState, useMemo } from "react";

// ── Palette & constants ──────────────────────────────────────────────────────
const C = {
  bg:      "#0D0F14",
  panel:   "#13161E",
  card:    "#191D27",
  border:  "#252A38",
  accent:  "#3B82F6",
  accent2: "#22D3EE",
  warn:    "#F59E0B",
  ok:      "#10B981",
  red:     "#EF4444",
  muted:   "#6B7280",
  text:    "#E2E8F0",
  sub:     "#94A3B8",
};

const fmt = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
const fmtKm = (n) => `${Number(n).toLocaleString("id-ID")} km`;
const fmtDate = (d) => {
  if (!d) return "-";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
};
const today = () => new Date().toISOString().slice(0, 10);

// ── Seed data ────────────────────────────────────────────────────────────────
const SEED_VEHICLES = [
  { id: 1, name: "Honda Civic RS 2021", plate: "B 1234 XYZ", color: "Lunar Silver", year: 2021 },
];
const SEED_USAGE = [
  { id: 1, vehicleId: 1, month: "2025-01", kmStart: 0,    kmEnd: 1200, notes: "Komuter harian" },
  { id: 2, vehicleId: 1, month: "2025-02", kmStart: 1200, kmEnd: 2450, notes: "" },
  { id: 3, vehicleId: 1, month: "2025-03", kmStart: 2450, kmEnd: 3800, notes: "Mudik lebaran" },
  { id: 4, vehicleId: 1, month: "2025-04", kmStart: 3800, kmEnd: 4900, notes: "" },
];
const SEED_MAINTENANCE = [
  { id: 1, vehicleId: 1, date: "2025-02-10", type: "Ganti Oli", kmAtService: 1500, cost: 350000, workshop: "Bengkel Astra", notes: "Oli Shell Helix 5W-30" },
  { id: 2, vehicleId: 1, date: "2025-04-05", type: "Tune Up", kmAtService: 4000, cost: 750000, workshop: "Honda AHASS", notes: "Busi, filter udara" },
];
const SEED_PARTS = [
  { id: 1, vehicleId: 1, date: "2025-02-10", name: "Oli Mesin", brand: "Shell Helix Ultra", qty: 4, unit: "L", partCost: 120000, laborCost: 50000, supplier: "Bengkel Astra", notes: "5W-30 Full Synthetic", maintenanceId: 1 },
  { id: 2, vehicleId: 1, date: "2025-04-05", name: "Busi", brand: "NGK Iridium", qty: 4, unit: "pcs", partCost: 95000, laborCost: 100000, supplier: "Honda AHASS", notes: "Tipe LKR7AIX", maintenanceId: 2 },
  { id: 3, vehicleId: 1, date: "2025-04-05", name: "Filter Udara", brand: "Honda Genuine", qty: 1, unit: "pcs", partCost: 185000, laborCost: 0, supplier: "Honda AHASS", notes: "", maintenanceId: 2 },
];

// ── Icon components ──────────────────────────────────────────────────────────
const Icon = ({ name, size = 16, color = "currentColor" }) => {
  const icons = {
    car: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="1.8" viewBox="0 0 24 24"><path d="M5 17H3a2 2 0 0 1-2-2v-4l2.5-5h13L19 11v4a2 2 0 0 1-2 2h-2M5 17a2 2 0 0 0 4 0M5 17H9M13 17a2 2 0 0 0 4 0M13 17H17"/></svg>,
    gauge: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10"/><path d="M12 12l3-4M7 12.5a5 5 0 0 1 8.66-2.5"/></svg>,
    wrench: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="1.8" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
    box: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="1.8" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
    plus: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    trash: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="1.8" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
    chart: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="1.8" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    close: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    calendar: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    tag: <svg width={size} height={size} fill="none" stroke={color} strokeWidth="1.8" viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  };
  return icons[name] || null;
};

// ── Reusable UI ──────────────────────────────────────────────────────────────
const Badge = ({ children, color = C.accent }) => (
  <span style={{ background: color + "22", color, border: `1px solid ${color}44`, borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
    {children}
  </span>
);

const Stat = ({ label, value, sub, accent }) => (
  <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 18px" }}>
    <div style={{ color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{label}</div>
    <div style={{ color: accent || C.text, fontSize: 22, fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>{value}</div>
    {sub && <div style={{ color: C.sub, fontSize: 12, marginTop: 2 }}>{sub}</div>}
  </div>
);

const Input = ({ label, ...props }) => (
  <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
    <span style={{ color: C.sub, fontSize: 12, fontWeight: 500 }}>{label}</span>
    <input {...props} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 10px", color: C.text, fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box", ...props.style }} />
  </label>
);

const Textarea = ({ label, ...props }) => (
  <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
    <span style={{ color: C.sub, fontSize: 12, fontWeight: 500 }}>{label}</span>
    <textarea {...props} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 10px", color: C.text, fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box", resize: "vertical", minHeight: 60, ...props.style }} />
  </label>
);

const Btn = ({ children, onClick, variant = "primary", small, style: s }) => {
  const base = { display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 7, border: "none", cursor: "pointer", fontWeight: 600, transition: "opacity .15s", fontSize: small ? 12 : 13, padding: small ? "5px 10px" : "9px 16px" };
  const variants = {
    primary: { background: C.accent, color: "#fff" },
    danger:  { background: C.red,    color: "#fff" },
    ghost:   { background: "transparent", color: C.sub, border: `1px solid ${C.border}` },
    ok:      { background: C.ok,     color: "#fff" },
  };
  return <button style={{ ...base, ...variants[variant], ...s }} onClick={onClick}>{children}</button>;
};

const Modal = ({ title, onClose, children }) => (
  <div style={{ position: "fixed", inset: 0, background: "#000a", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
    <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 14, width: "100%", maxWidth: 540, maxHeight: "90vh", overflow: "auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: `1px solid ${C.border}` }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: C.text }}>{title}</span>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted }}><Icon name="close" /></button>
      </div>
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  </div>
);

const SectionHeader = ({ icon, title, action }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ color: C.accent }}><Icon name={icon} size={18} /></span>
      <span style={{ fontWeight: 700, fontSize: 16, color: C.text }}>{title}</span>
    </div>
    {action}
  </div>
);

// ── Mini bar chart ───────────────────────────────────────────────────────────
const BarChart = ({ data, color = C.accent }) => {
  const max = Math.max(...data.map(d => d.v), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 60 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          <div title={`${d.label}: ${d.v.toLocaleString("id-ID")}`} style={{ width: "100%", background: color + "99", borderRadius: "3px 3px 0 0", height: `${(d.v / max) * 52}px`, minHeight: 2, transition: "height .3s" }} />
          <span style={{ fontSize: 9, color: C.muted, writingMode: "vertical-lr", transform: "rotate(180deg)", maxHeight: 30, overflow: "hidden" }}>{d.label.slice(5)}</span>
        </div>
      ))}
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ════════════════════════════════════════════════════════════════════════════
export default function VehicleTracker() {
const [vehicles, setVehicles] = useState([]);
const [usage, setUsage]       = useState([]);
const [maintenance, setMaint] = useState([]);
const [parts, setParts]       = useState([]);
const [loading, setLoading]   = useState(true);

useEffect(() => {
  async function loadAll() {
    const [v, u, m, p] = await Promise.all([
      getAll('vehicles'),
      getAll('usage'),
      getAll('maintenance'),
      getAll('parts'),
    ]);
    setVehicles(Array.isArray(v) ? v.map(x=>({...x,id:Number(x.id)})) : []);
    setUsage(Array.isArray(u) ? u.map(x=>({...x,id:Number(x.id),vehicleId:Number(x.vehicleId),kmStart:Number(x.kmStart),kmEnd:Number(x.kmEnd)})) : []);
    setMaint(Array.isArray(m) ? m.map(x=>({...x,id:Number(x.id),vehicleId:Number(x.vehicleId),cost:Number(x.cost),kmAtService:Number(x.kmAtService)})) : []);
    setParts(Array.isArray(p) ? p.map(x=>({...x,id:Number(x.id),vehicleId:Number(x.vehicleId),qty:Number(x.qty),partCost:Number(x.partCost),laborCost:Number(x.laborCost)})) : []);
    setLoading(false);
  }
  loadAll();
}, []);

  const [activeVehicle, setActiveVehicle] = useState(1);
  const [tab, setTab]     = useState("dashboard"); // dashboard | usage | maintenance | parts
  const [modal, setModal] = useState(null);        // null | { type, data }
  if (loading) return (
  <div style={{ background: "#0D0F14", minHeight: "100vh", display: "flex",
    alignItems: "center", justifyContent: "center", color: "#22D3EE",
    fontSize: 18, fontFamily: "sans-serif" }}>
    ⏳ Memuat data dari Google Sheets...
  </div>
);
  const veh = vehicles.find(v => v.id === activeVehicle);
  const vUsage = usage.filter(u => u.vehicleId === activeVehicle).sort((a, b) => a.month > b.month ? 1 : -1);
  const vMaint = maintenance.filter(m => m.vehicleId === activeVehicle).sort((a, b) => b.date > a.date ? 1 : -1);
  const vParts = parts.filter(p => p.vehicleId === activeVehicle).sort((a, b) => b.date > a.date ? 1 : -1);

  // ── Stats ──
  const totalKm    = vUsage.length ? vUsage[vUsage.length - 1].kmEnd - vUsage[0].kmStart : 0;
  const avgMonthKm = vUsage.length ? Math.round(totalKm / vUsage.length) : 0;
  const totalMaint = vMaint.reduce((s, m) => s + m.cost, 0);
  const totalParts = vParts.reduce((s, p) => s + (p.partCost * p.qty) + p.laborCost, 0);
  const lastMaint  = vMaint[0];
  const curKm      = vUsage.length ? vUsage[vUsage.length - 1].kmEnd : 0;

  // ── Form state helpers ──
  const [form, setForm] = useState({});
  const fv = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const openModal = (type, data = {}) => { setForm(data); setModal({ type }); };
  const closeModal = () => { setModal(null); setForm({}); };

  const nextId = (arr) => (Math.max(0, ...arr.map(x => x.id)) + 1);

  // ── CRUD ──
const saveUsage = async () => {
  if (!form.month || form.kmStart === "" || form.kmEnd === "") return;
  const payload = {
    ...form,
    vehicleId: activeVehicle,
    kmStart: +form.kmStart,
    kmEnd: +form.kmEnd,
  };
  if (form.id) {
    await updateRow("usage", form.id, payload);
    setUsage(u => u.map(x => x.id === form.id ? payload : x));
  } else {
    const result = await addRow("usage", payload);
    setUsage(u => [...u, { ...payload, id: result.id }]);
  }
  closeModal();
};

const saveMaint = async () => {
  if (!form.date || !form.type) return;
  const payload = {
    ...form,
    vehicleId: activeVehicle,
    cost: +form.cost || 0,
    kmAtService: +form.kmAtService || 0,
  };
  if (form.id) {
    await updateRow("maintenance", form.id, payload);
    setMaint(m => m.map(x => x.id === form.id ? payload : x));
  } else {
    const result = await addRow("maintenance", payload);
    setMaint(m => [...m, { ...payload, id: result.id }]);
  }
  closeModal();
};

const savePart = async () => {
  if (!form.name || !form.date) return;
  const payload = {
    ...form,
    vehicleId: activeVehicle,
    qty: +form.qty || 1,
    partCost: +form.partCost || 0,
    laborCost: +form.laborCost || 0,
  };
  if (form.id) {
    await updateRow("parts", form.id, payload);
    setParts(p => p.map(x => x.id === form.id ? payload : x));
  } else {
    const result = await addRow("parts", payload);
    setParts(p => [...p, { ...payload, id: result.id }]);
  }
  closeModal();
};

const addVehicle = async () => {
  if (!form.name || !form.plate) return;
  const payload = {
    ...form,
    year: +form.year || new Date().getFullYear(),
  };
  const result = await addRow("vehicles", payload);
  const nv = { ...payload, id: result.id };
  setVehicles(v => [...v, nv]);
  setActiveVehicle(nv.id);
  closeModal();
};

const delUsage = async (id) => {
  await deleteRow("usage", id);
  setUsage(u => u.filter(x => x.id !== id));
};

const delMaint = async (id) => {
  await deleteRow("maintenance", id);
  // Hapus juga spare parts yang terkait dengan maintenance ini
  const relatedParts = parts.filter(p => p.maintenanceId === id);
  for (const p of relatedParts) {
    await deleteRow("parts", p.id);
  }
  setMaint(m => m.filter(x => x.id !== id));
  setParts(p => p.filter(x => x.maintenanceId !== id));
};

const delPart = async (id) => {
  await deleteRow("parts", id);
  setParts(p => p.filter(x => x.id !== id));
};

  // ── TABS ──────────────────────────────────────────────────────────────────
  const TAB_STYLE = (t) => ({
    padding: "8px 16px", borderRadius: 7, cursor: "pointer", fontWeight: 600, fontSize: 13,
    border: "none", transition: "all .15s",
    background: tab === t ? C.accent : "transparent",
    color: tab === t ? "#fff" : C.muted,
  });

  return (
    <div style={{ fontFamily: "'IBM Plex Sans', 'Segoe UI', sans-serif", background: C.bg, minHeight: "100vh", color: C.text }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />

      {/* ── Header ── */}
      <div style={{ background: C.panel, borderBottom: `1px solid ${C.border}`, padding: "0 20px", display: "flex", alignItems: "center", gap: 16, height: 56 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 8 }}>
          <span style={{ color: C.accent2 }}><Icon name="car" size={22} color={C.accent2} /></span>
          <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.02em" }}>GarageLog</span>
        </div>
        {/* vehicle tabs */}
        <div style={{ display: "flex", gap: 6, flex: 1, overflowX: "auto" }}>
          {vehicles.map(v => (
            <button key={v.id} onClick={() => setActiveVehicle(v.id)}
              style={{ background: activeVehicle === v.id ? C.accent + "22" : "transparent", border: `1px solid ${activeVehicle === v.id ? C.accent : C.border}`, borderRadius: 6, padding: "4px 12px", color: activeVehicle === v.id ? C.accent : C.muted, cursor: "pointer", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>
              {v.name}
            </button>
          ))}
        </div>
        <Btn small onClick={() => openModal("vehicle")}><Icon name="plus" size={13} />Kendaraan</Btn>
      </div>

      {/* ── Vehicle info bar ── */}
      {veh && (
        <div style={{ background: C.panel, borderBottom: `1px solid ${C.border}`, padding: "10px 20px", display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
          <Badge color={C.accent2}>{veh.plate}</Badge>
          <span style={{ color: C.sub, fontSize: 13 }}>{veh.color} · {veh.year}</span>
          <div style={{ flex: 1 }} />
          <span style={{ color: C.sub, fontSize: 12 }}>Odometer saat ini:</span>
          <span style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, color: C.accent2, fontSize: 15 }}>{fmtKm(curKm)}</span>
        </div>
      )}

      {/* ── Nav tabs ── */}
      <div style={{ padding: "12px 20px 0", display: "flex", gap: 4 }}>
        {[["dashboard","chart","Dashboard"],["usage","gauge","Penggunaan"],["maintenance","wrench","Maintenance"],["parts","box","Spare Parts"]].map(([t, icon, label]) => (
          <button key={t} style={TAB_STYLE(t)} onClick={() => setTab(t)}>
            <Icon name={icon} size={13} /> {label}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <div style={{ padding: 20 }}>

        {/* ══ DASHBOARD ══ */}
        {tab === "dashboard" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 24 }}>
              <Stat label="Total KM (tracked)" value={fmtKm(totalKm)} sub={`${vUsage.length} bulan tercatat`} accent={C.accent2} />
              <Stat label="Rata-rata / bulan"  value={fmtKm(avgMonthKm)} sub="rata-rata bulanan" />
              <Stat label="Biaya Maintenance"  value={fmt(totalMaint)} sub={`${vMaint.length} sesi`} accent={C.warn} />
              <Stat label="Biaya Spare Part"   value={fmt(totalParts)} sub={`${vParts.length} item`} accent={C.ok} />
            </div>

            {/* km chart */}
            {vUsage.length > 0 && (
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18, marginBottom: 16 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: C.sub, marginBottom: 12 }}>KM per Bulan</div>
                <BarChart data={vUsage.map(u => ({ label: u.month, v: u.kmEnd - u.kmStart }))} color={C.accent2} />
              </div>
            )}

            {/* maintenance cost chart */}
            {vMaint.length > 0 && (
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18, marginBottom: 16 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: C.sub, marginBottom: 12 }}>Biaya Maintenance per Sesi</div>
                <BarChart data={[...vMaint].reverse().map(m => ({ label: m.date, v: m.cost }))} color={C.warn} />
              </div>
            )}

            {/* last maintenance alert */}
            {lastMaint && (
              <div style={{ background: C.warn + "18", border: `1px solid ${C.warn}44`, borderRadius: 10, padding: "12px 16px", display: "flex", gap: 12, alignItems: "center" }}>
                <Icon name="wrench" size={18} color={C.warn} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: C.warn }}>Maintenance Terakhir</div>
                  <div style={{ color: C.sub, fontSize: 12 }}>{lastMaint.type} · {fmtDate(lastMaint.date)} · {lastMaint.workshop} · {fmt(lastMaint.cost)}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ USAGE ══ */}
        {tab === "usage" && (
          <div>
            <SectionHeader icon="gauge" title="Penggunaan Bulanan"
              action={<Btn small onClick={() => openModal("usage", { month: today().slice(0,7) })}><Icon name="plus" size={13} />Tambah</Btn>} />
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {vUsage.length === 0 && <div style={{ color: C.muted, fontSize: 13, padding: "20px 0", textAlign: "center" }}>Belum ada data penggunaan</div>}
              {[...vUsage].reverse().map(u => (
                <div key={u.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, color: C.accent2, fontSize: 14, minWidth: 70 }}>{u.month.slice(0,7)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{fmtKm(u.kmEnd - u.kmStart)} <span style={{ color: C.muted, fontWeight: 400, fontSize: 12 }}>({fmtKm(u.kmStart)} → {fmtKm(u.kmEnd)})</span></div>
                    {u.notes && <div style={{ color: C.sub, fontSize: 12, marginTop: 2 }}>{u.notes}</div>}
                  </div>
                  <Btn small variant="ghost" onClick={() => openModal("usage", { ...u })}><Icon name="tag" size={12} />Edit</Btn>
                  <Btn small variant="danger" onClick={() => delUsage(u.id)}><Icon name="trash" size={12} /></Btn>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ MAINTENANCE ══ */}
        {tab === "maintenance" && (
          <div>
            <SectionHeader icon="wrench" title="Riwayat Maintenance"
              action={<Btn small onClick={() => openModal("maint", { date: today() })}><Icon name="plus" size={13} />Tambah</Btn>} />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {vMaint.length === 0 && <div style={{ color: C.muted, fontSize: 13, padding: "20px 0", textAlign: "center" }}>Belum ada data maintenance</div>}
              {vMaint.map(m => {
                const relParts = vParts.filter(p => p.maintenanceId === m.id);
                return (
                  <div key={m.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <Badge color={C.warn}>{m.type}</Badge>
                      <span style={{ color: C.sub, fontSize: 12 }}><Icon name="calendar" size={12} /> {fmtDate(m.date)}</span>
                      <span style={{ color: C.sub, fontSize: 12 }}>@ {fmtKm(m.kmAtService)}</span>
                      <div style={{ flex: 1 }} />
                      <span style={{ fontWeight: 700, color: C.warn, fontFamily: "'Space Mono', monospace", fontSize: 13 }}>{fmt(m.cost)}</span>
                      <Btn small variant="ghost" onClick={() => openModal("maint", { ...m })}><Icon name="tag" size={12} />Edit</Btn>
                      <Btn small variant="danger" onClick={() => delMaint(m.id)}><Icon name="trash" size={12} /></Btn>
                    </div>
                    {m.workshop && <div style={{ color: C.sub, fontSize: 12, marginBottom: 4 }}>🏪 {m.workshop}</div>}
                    {m.notes && <div style={{ color: C.sub, fontSize: 12, marginBottom: 6 }}>{m.notes}</div>}
                    {relParts.length > 0 && (
                      <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 8, paddingTop: 8 }}>
                        <div style={{ color: C.muted, fontSize: 11, marginBottom: 4 }}>SPARE PARTS ({relParts.length})</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {relParts.map(p => (
                            <span key={p.id} style={{ background: C.ok + "18", border: `1px solid ${C.ok}33`, borderRadius: 5, padding: "2px 8px", fontSize: 11, color: C.ok }}>
                              {p.name} – {p.brand} ×{p.qty}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══ SPARE PARTS ══ */}
        {tab === "parts" && (
          <div>
            <SectionHeader icon="box" title="Riwayat Spare Part"
              action={<Btn small onClick={() => openModal("part", { date: today(), qty: 1 })}><Icon name="plus" size={13} />Tambah</Btn>} />
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                    {["Tanggal","Nama Part","Merek","Qty","Harga Part","Ongkos Pasang","Total","Supplier","",""].map((h, i) => (
                      <th key={i} style={{ padding: "8px 10px", color: C.muted, fontWeight: 600, fontSize: 11, textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {vParts.length === 0 && (
                    <tr><td colSpan={10} style={{ color: C.muted, padding: "24px 10px", textAlign: "center" }}>Belum ada data spare part</td></tr>
                  )}
                  {vParts.map(p => (
                    <tr key={p.id} style={{ borderBottom: `1px solid ${C.border}40` }}>
                      <td style={{ padding: "10px", color: C.sub, whiteSpace: "nowrap" }}>{fmtDate(p.date)}</td>
                      <td style={{ padding: "10px", fontWeight: 600 }}>{p.name}</td>
                      <td style={{ padding: "10px" }}><Badge color={C.ok}>{p.brand}</Badge></td>
                      <td style={{ padding: "10px", color: C.sub }}>{p.qty} {p.unit}</td>
                      <td style={{ padding: "10px", fontFamily: "'Space Mono', monospace", fontSize: 12 }}>{fmt(p.partCost)}/unit</td>
                      <td style={{ padding: "10px", fontFamily: "'Space Mono', monospace", fontSize: 12 }}>{p.laborCost ? fmt(p.laborCost) : "-"}</td>
                      <td style={{ padding: "10px", fontFamily: "'Space Mono', monospace", fontWeight: 700, color: C.ok, fontSize: 12 }}>{fmt(p.partCost * p.qty + p.laborCost)}</td>
                      <td style={{ padding: "10px", color: C.sub, fontSize: 12 }}>{p.supplier}</td>
                      <td style={{ padding: "6px 4px" }}><Btn small variant="ghost" onClick={() => openModal("part", { ...p })}><Icon name="tag" size={11} /></Btn></td>
                      <td style={{ padding: "6px 4px" }}><Btn small variant="danger" onClick={() => delPart(p.id)}><Icon name="trash" size={11} /></Btn></td>
                    </tr>
                  ))}
                </tbody>
                {vParts.length > 0 && (
                  <tfoot>
                    <tr style={{ borderTop: `2px solid ${C.border}` }}>
                      <td colSpan={6} style={{ padding: "10px", color: C.muted, fontSize: 12, textAlign: "right", fontWeight: 600 }}>TOTAL</td>
                      <td style={{ padding: "10px", fontFamily: "'Space Mono', monospace", fontWeight: 700, color: C.ok }}>{fmt(totalParts)}</td>
                      <td colSpan={3} />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ══ MODALS ══ */}

      {modal?.type === "vehicle" && (
        <Modal title="Tambah Kendaraan" onClose={closeModal}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Input label="Nama / Model" value={form.name || ""} onChange={fv("name")} placeholder="Honda Civic RS 2021" />
            <Input label="Plat Nomor"   value={form.plate || ""} onChange={fv("plate")} placeholder="B 1234 XYZ" />
            <Input label="Warna"        value={form.color || ""} onChange={fv("color")} placeholder="Lunar Silver" />
            <Input label="Tahun"        value={form.year || ""} onChange={fv("year")} type="number" placeholder="2021" />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
              <Btn variant="ghost" onClick={closeModal}>Batal</Btn>
              <Btn onClick={addVehicle}>Simpan</Btn>
            </div>
          </div>
        </Modal>
      )}

      {modal?.type === "usage" && (
        <Modal title={form.id ? "Edit Penggunaan" : "Tambah Penggunaan"} onClose={closeModal}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Input label="Bulan (YYYY-MM)" value={form.month || ""} onChange={fv("month")} type="month" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Input label="KM Awal" value={form.kmStart ?? ""} onChange={fv("kmStart")} type="number" placeholder="0" />
              <Input label="KM Akhir" value={form.kmEnd ?? ""} onChange={fv("kmEnd")} type="number" placeholder="1200" />
            </div>
            <Textarea label="Catatan" value={form.notes || ""} onChange={fv("notes")} placeholder="Komuter harian, mudik, dll." />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
              <Btn variant="ghost" onClick={closeModal}>Batal</Btn>
              <Btn onClick={saveUsage}>Simpan</Btn>
            </div>
          </div>
        </Modal>
      )}

      {modal?.type === "maint" && (
        <Modal title={form.id ? "Edit Maintenance" : "Tambah Maintenance"} onClose={closeModal}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Input label="Tanggal" value={form.date || ""} onChange={fv("date")} type="date" />
              <Input label="KM saat servis" value={form.kmAtService ?? ""} onChange={fv("kmAtService")} type="number" />
            </div>
            <Input label="Jenis Maintenance" value={form.type || ""} onChange={fv("type")} placeholder="Ganti Oli, Tune Up, dll." />
            <Input label="Bengkel" value={form.workshop || ""} onChange={fv("workshop")} placeholder="Bengkel Astra / AHASS" />
            <Input label="Total Biaya Jasa (Rp)" value={form.cost ?? ""} onChange={fv("cost")} type="number" placeholder="350000" />
            <Textarea label="Catatan" value={form.notes || ""} onChange={fv("notes")} />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
              <Btn variant="ghost" onClick={closeModal}>Batal</Btn>
              <Btn onClick={saveMaint}>Simpan</Btn>
            </div>
          </div>
        </Modal>
      )}

      {modal?.type === "part" && (
        <Modal title={form.id ? "Edit Spare Part" : "Tambah Spare Part"} onClose={closeModal}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Input label="Tanggal" value={form.date || ""} onChange={fv("date")} type="date" />
              <Input label="Link ke Maintenance (ID)" value={form.maintenanceId ?? ""} onChange={fv("maintenanceId")} type="number" placeholder="opsional" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Input label="Nama Part" value={form.name || ""} onChange={fv("name")} placeholder="Oli Mesin" />
              <Input label="Merek" value={form.brand || ""} onChange={fv("brand")} placeholder="Shell Helix" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <Input label="Qty" value={form.qty ?? 1} onChange={fv("qty")} type="number" />
              <Input label="Satuan" value={form.unit || ""} onChange={fv("unit")} placeholder="pcs / L / set" />
              <Input label="Harga/Unit (Rp)" value={form.partCost ?? ""} onChange={fv("partCost")} type="number" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Input label="Ongkos Pasang (Rp)" value={form.laborCost ?? ""} onChange={fv("laborCost")} type="number" placeholder="0" />
              <Input label="Supplier / Toko" value={form.supplier || ""} onChange={fv("supplier")} placeholder="Toko Otomotif XYZ" />
            </div>
            <Textarea label="Catatan" value={form.notes || ""} onChange={fv("notes")} placeholder="Spesifikasi, tipe, dll." />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
              <Btn variant="ghost" onClick={closeModal}>Batal</Btn>
              <Btn onClick={savePart}>Simpan</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
