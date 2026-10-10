"use client";
import { useState } from "react";
import { Users, Package, ShoppingCart, DollarSign, Building2, Clock3, Search as SearchIcon, X, CheckCircle2, AlertTriangle, ArrowUpRight, UserRound, Boxes, CircleDollarSign, RotateCcw, Truck, Ban, PackageCheck, Activity } from "lucide-react";
import { money, initials } from "@/lib/erp-utils";

export function Button({ children, onClick, variant = "primary", type = "button" }) {
  return <button type={type} onClick={onClick} className={`btn btn-${variant}`}>{children}</button>;
}

export function Badge({ children }) {
  const key = String(children).toLowerCase().replaceAll(" ", "-");
  return <span className={`badge badge-${key}`}>{children}</span>;
}

export function PageTitle({ title, description, action }) {
  return <div className="page-title"><div><h1>{title}</h1><p>{description}</p></div>{action}</div>;
}

export function Stat({ label, value, change, icon, tone = "blue" }) {
  const iconMap = { "♙": Users, "▣": Package, "⇄": ShoppingCart, "$": DollarSign, "▤": Building2, "✓": CheckCircle2, "◷": Clock3, "⚠": AlertTriangle, "!": AlertTriangle, "♧": Users, "↶": RotateCcw };
  const Icon = iconMap[icon] || Activity;
  return <article className="stat-card"><div className="stat-head"><span>{label}</span><span className={`stat-icon ${tone}`}><Icon size={17} strokeWidth={2.1} /></span></div><strong className="stat-value">{value}</strong><p><b>↗ {change}</b> <span>vs last month</span></p></article>;
}

export function Search({ value, onChange, placeholder = "Search..." }) {
  return <label className="search"><SearchIcon size={17} /><input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} /></label>;
}

export function Table({ columns, rows }) {
  if (!rows.length) return <div className="empty"><strong>No records found</strong><p>Try adjusting your search or filters.</p></div>;
  return <div className="table-wrap"><table><thead><tr>{columns.map(c => <th key={c.key}>{c.label}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row.id}>{columns.map(c => <td key={c.key}>{c.render ? c.render(row[c.key], row) : row[c.key]}</td>)}</tr>)}</tbody></table></div>;
}

export function Modal({ title, onClose, children }) {
  return <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}><section className="modal" role="dialog" aria-modal="true"><header className="modal-title"><h2>{title}</h2><button className="icon-btn" onClick={onClose} aria-label="Close"><X size={17} /></button></header>{children}</section></div>;
}

export function RecordForm({ fields, onSave, onCancel }) {
  const [values, setValues] = useState(Object.fromEntries(fields.map(f => [f.name, f.value ?? ""])));
  const change = (name, value) => setValues(old => ({ ...old, [name]: value }));
  return <form className="record-form" onSubmit={(e) => { e.preventDefault(); onSave(values); }}><div className="form-grid">{fields.map(f => <label className="field" key={f.name}><span>{f.label}</span>{f.options ? <select required value={values[f.name]} onChange={e => change(f.name, e.target.value)}>{f.options.map(o => <option key={o}>{o}</option>)}</select> : <input required type={f.type || "text"} min={f.type === "number" ? "0" : undefined} step={f.type === "number" ? "any" : undefined} value={values[f.name]} onChange={e => change(f.name, e.target.value)} placeholder={f.placeholder || ""} />}</label>)}</div><div className="modal-actions"><Button variant="secondary" onClick={onCancel}>Cancel</Button><Button type="submit">Save record</Button></div></form>;
}

export function Person({ name, detail, purple = false }) {
  return <div className="person"><span className={`avatar ${purple ? "purple" : ""}`}>{initials(name)}</span><span><strong>{name}</strong><small>{detail}</small></span></div>;
}

