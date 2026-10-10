"use client";

import { useState } from "react";

const seedEmployees = [
  { id: "EMP-1001", name: "Maya Johnson", email: "maya@bizmanager.example", department: "Human Resources", role: "HR Manager", status: "Active" },
  { id: "EMP-1002", name: "Daniel Kim", email: "daniel@bizmanager.example", department: "Engineering", role: "Software Engineer", status: "Active" },
  { id: "EMP-1003", name: "Sara Ahmed", email: "sara@bizmanager.example", department: "Finance", role: "Accountant", status: "On leave" },
  { id: "EMP-1004", name: "Noah Williams", email: "noah@bizmanager.example", department: "Sales", role: "Sales Executive", status: "Active" },
  { id: "EMP-1005", name: "Lily Chen", email: "lily@bizmanager.example", department: "Operations", role: "Operations Lead", status: "Inactive" },
];
const seedDepartments = [
  { id: "DEP-01", name: "Engineering", manager: "Daniel Kim", employees: 28, budget: 240000, status: "Active" },
  { id: "DEP-02", name: "Human Resources", manager: "Maya Johnson", employees: 12, budget: 95000, status: "Active" },
  { id: "DEP-03", name: "Finance", manager: "Sara Ahmed", employees: 9, budget: 110000, status: "Active" },
  { id: "DEP-04", name: "Sales", manager: "Noah Williams", employees: 21, budget: 180000, status: "Active" },
  { id: "DEP-05", name: "Operations", manager: "Lily Chen", employees: 17, budget: 145000, status: "Active" },
];
const seedProducts = [
  { id: "PRD-001", name: "Wireless Keyboard", category: "Electronics", sku: "EL-KB-001", stock: 124, price: 49.99 },
  { id: "PRD-002", name: "USB-C Hub", category: "Accessories", sku: "AC-HB-014", stock: 8, price: 34.5 },
  { id: "PRD-003", name: "Office Chair", category: "Furniture", sku: "FN-CH-028", stock: 42, price: 189 },
  { id: "PRD-004", name: "27-inch Monitor", category: "Electronics", sku: "EL-MN-027", stock: 5, price: 279.99 },
  { id: "PRD-005", name: "Notebook Set", category: "Stationery", sku: "ST-NB-009", stock: 230, price: 12.75 },
  { id: "PRD-006", name: "Desk Lamp", category: "Furniture", sku: "FN-LP-011", stock: 0, price: 39.99 },
];
const seedOrders = [
  { id: "ORD-2048", customer: "Northstar Studio", date: "2026-10-08", amount: 2490, status: "Processing", payment: "Paid" },
  { id: "ORD-2047", customer: "Blue Peak Ltd.", date: "2026-10-08", amount: 875.5, status: "Shipped", payment: "Paid" },
  { id: "ORD-2046", customer: "Evergreen Co.", date: "2026-10-07", amount: 1240, status: "Pending", payment: "Pending" },
  { id: "ORD-2045", customer: "Summit Works", date: "2026-10-06", amount: 3680, status: "Delivered", payment: "Paid" },
  { id: "ORD-2044", customer: "Brightline Agency", date: "2026-10-05", amount: 415, status: "Cancelled", payment: "Refunded" },
];
const seedCustomers = [
  { id: "CUS-001", name: "Northstar Studio", email: "hello@northstar.example", orders: 14, spent: 18450, status: "Active" },
  { id: "CUS-002", name: "Blue Peak Ltd.", email: "accounts@bluepeak.example", orders: 9, spent: 9720, status: "Active" },
  { id: "CUS-003", name: "Evergreen Co.", email: "team@evergreen.example", orders: 6, spent: 6850, status: "Active" },
  { id: "CUS-004", name: "Summit Works", email: "finance@summit.example", orders: 18, spent: 26300, status: "Active" },
  { id: "CUS-005", name: "Brightline Agency", email: "admin@brightline.example", orders: 3, spent: 1520, status: "Inactive" },
];
const nav = [
  { group: "OVERVIEW", items: [["Dashboard", "▦"]] },
  { group: "MANAGEMENT", items: [["Employees", "♙"], ["Departments", "▤"], ["Inventory", "▣"], ["Orders", "⇄"], ["Customers", "♧"]] },
  { group: "INSIGHTS", items: [["Finance", "◈"], ["Reports", "▥"]] },
  { group: "PREFERENCES", items: [["Settings", "⚙"]] },
];
const money = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(Number(n) || 0);
const initials = (name = "") => name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();
const dateLabel = (s) => s ? new Date(`${s}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";
const statusOf = (p) => p.stock === 0 ? "Out of stock" : p.stock <= 10 ? "Low stock" : "In stock";

function Button({ children, onClick, variant = "primary", type = "button" }) {
  return <button type={type} onClick={onClick} className={`btn btn-${variant}`}>{children}</button>;
}
function Badge({ children }) {
  const key = String(children).toLowerCase().replaceAll(" ", "-");
  return <span className={`badge badge-${key}`}>{children}</span>;
}
function PageTitle({ title, description, action }) {
  return <div className="page-title"><div><h1>{title}</h1><p>{description}</p></div>{action}</div>;
}
function Stat({ label, value, change, icon, tone = "blue" }) {
  return <article className="stat-card"><div className="stat-head"><span>{label}</span><span className={`stat-icon ${tone}`}>{icon}</span></div><strong className="stat-value">{value}</strong><p><b>↗ {change}</b> <span>vs last month</span></p></article>;
}
function Search({ value, onChange, placeholder = "Search..." }) {
  return <label className="search"><span>⌕</span><input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} /></label>;
}
function Table({ columns, rows }) {
  if (!rows.length) return <div className="empty"><strong>No records found</strong><p>Try adjusting your search or filters.</p></div>;
  return <div className="table-wrap"><table><thead><tr>{columns.map(c => <th key={c.key}>{c.label}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row.id}>{columns.map(c => <td key={c.key}>{c.render ? c.render(row[c.key], row) : row[c.key]}</td>)}</tr>)}</tbody></table></div>;
}
function Modal({ title, onClose, children }) {
  return <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}><section className="modal" role="dialog" aria-modal="true"><header className="modal-title"><h2>{title}</h2><button className="icon-btn" onClick={onClose} aria-label="Close">×</button></header>{children}</section></div>;
}
function RecordForm({ fields, onSave, onCancel }) {
  const [values, setValues] = useState(Object.fromEntries(fields.map(f => [f.name, f.value ?? ""])));
  const change = (name, value) => setValues(old => ({ ...old, [name]: value }));
  return <form className="record-form" onSubmit={(e) => { e.preventDefault(); onSave(values); }}><div className="form-grid">{fields.map(f => <label className="field" key={f.name}><span>{f.label}</span>{f.options ? <select required value={values[f.name]} onChange={e => change(f.name, e.target.value)}>{f.options.map(o => <option key={o}>{o}</option>)}</select> : <input required type={f.type || "text"} min={f.type === "number" ? "0" : undefined} step={f.type === "number" ? "any" : undefined} value={values[f.name]} onChange={e => change(f.name, e.target.value)} placeholder={f.placeholder || ""} />}</label>)}</div><div className="modal-actions"><Button variant="secondary" onClick={onCancel}>Cancel</Button><Button type="submit">Save record</Button></div></form>;
}
function Person({ name, detail, purple = false }) {
  return <div className="person"><span className={`avatar ${purple ? "purple" : ""}`}>{initials(name)}</span><span><strong>{name}</strong><small>{detail}</small></span></div>;
}

function Dashboard({ employees, products, orders, setPage }) {
  const revenue = orders.filter(o => o.payment === "Paid" && o.status !== "Cancelled").reduce((s, o) => s + o.amount, 0);
  const pending = orders.filter(o => ["Pending", "Processing"].includes(o.status)).length;
  const bars = [36,52,44,69,54,78,64,91,61,75,86,70];
  return <>
    <PageTitle title="Dashboard" description="Here’s what’s happening with your business today." action={<Button variant="secondary" onClick={() => setPage("Reports")}>↓ Export overview</Button>} />
    <div className="stats">
      <Stat label="Total employees" value={employees.length} change="+8.2%" icon="♙" />
      <Stat label="Inventory items" value={products.length} change="+4.6%" icon="▣" tone="violet" />
      <Stat label="Orders to process" value={pending} change="+12.5%" icon="⇄" tone="amber" />
      <Stat label="Recorded revenue" value={money(revenue)} change="+9.3%" icon="$" tone="green" />
    </div>
    <div className="dashboard-grid">
      <section className="panel chart-panel"><div className="panel-heading"><div><h2>Revenue overview</h2><p>Recorded paid orders · sample data</p></div><select defaultValue="Last 12 months" aria-label="Revenue period"><option>Last 12 months</option><option>Last 30 days</option><option>Last 7 days</option></select></div><div className="chart-total"><strong>{money(revenue)}</strong><Badge>+9.3%</Badge></div><div className="bar-chart">{bars.map((v,i) => <div className="bar-column" key={i}><div className="bar" style={{height:`${v}%`}} /><small>{["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i]}</small></div>)}</div></section>
      <section className="panel"><div className="panel-heading"><div><h2>Inventory alerts</h2><p>Items that need attention</p></div><button className="link" onClick={() => setPage("Inventory")}>View all</button></div><div className="alerts">{products.filter(p => p.stock <= 10).slice(0,4).map(p => <div className="alert-row" key={p.id}><span className="product-icon">▣</span><span className="alert-name"><strong>{p.name}</strong><small>{p.sku}</small></span><Badge>{statusOf(p)}</Badge></div>)}</div></section>
    </div>
    <section className="panel section-panel"><div className="panel-heading"><div><h2>Recent orders</h2><p>Latest customer transactions</p></div><button className="link" onClick={() => setPage("Orders")}>View all orders →</button></div><Table columns={[
      {key:"id",label:"ORDER ID",render:v=><strong className="primary-text">{v}</strong>},{key:"customer",label:"CUSTOMER"},{key:"date",label:"DATE",render:dateLabel},{key:"amount",label:"AMOUNT",render:v=><strong>{money(v)}</strong>},{key:"status",label:"STATUS",render:v=><Badge>{v}</Badge>}
    ]} rows={orders.slice(0,4)} /></section>
  </>;
}

function Employees({ data, setData }) {
  const [q,setQ] = useState(""); const [filter,setFilter] = useState("All statuses"); const [modal,setModal] = useState(false); const [edit,setEdit] = useState(null);
  const rows = data.filter(x => `${x.name} ${x.email} ${x.department} ${x.id}`.toLowerCase().includes(q.toLowerCase()) && (filter === "All statuses" || x.status === filter));
  const save = v => { setData(old => edit ? old.map(x => x.id === edit.id ? {...x,...v} : x) : [{...v,id:`EMP-${1000+old.length+1}`},...old]); setModal(false); setEdit(null); };
  return <><PageTitle title="Employees" description="Manage employee records, roles, and employment status." action={<Button onClick={() => {setEdit(null);setModal(true)}}>＋ Add employee</Button>} /><div className="stats stats-3"><Stat label="Total employees" value={data.length} change="+8.2%" icon="♙"/><Stat label="Active employees" value={data.filter(x=>x.status==="Active").length} change="+3 this month" icon="✓" tone="green"/><Stat label="On leave" value={data.filter(x=>x.status==="On leave").length} change="No change" icon="◷" tone="amber"/></div><section className="panel section-panel"><div className="toolbar"><Search value={q} onChange={setQ} placeholder="Search employees..."/><select value={filter} onChange={e=>setFilter(e.target.value)}><option>All statuses</option><option>Active</option><option>On leave</option><option>Inactive</option></select></div><Table columns={[
    {key:"name",label:"EMPLOYEE",render:(v,r)=><Person name={v} detail={r.email}/>},{key:"id",label:"EMPLOYEE ID"},{key:"department",label:"DEPARTMENT"},{key:"role",label:"ROLE"},{key:"status",label:"STATUS",render:v=><Badge>{v}</Badge>},{key:"action",label:"",render:(_,r)=><button className="link" onClick={()=>{setEdit(r);setModal(true)}}>Edit</button>}
  ]} rows={rows}/><div className="table-footer">Showing {rows.length} of {data.length} employees <span>Sample data · local state only</span></div></section>{modal&&<Modal title={edit?"Edit employee":"Add employee"} onClose={()=>{setModal(false);setEdit(null)}}><RecordForm onCancel={()=>{setModal(false);setEdit(null)}} onSave={save} fields={[
    {name:"name",label:"Full name",value:edit?.name||""},{name:"email",label:"Email",type:"email",value:edit?.email||""},{name:"department",label:"Department",value:edit?.department||"Engineering",options:["Engineering","Human Resources","Finance","Sales","Operations"]},{name:"role",label:"Job title",value:edit?.role||""},{name:"status",label:"Status",value:edit?.status||"Active",options:["Active","On leave","Inactive"]}
  ]}/></Modal>}</>;
}

function Departments({ data, setData, employees }) {
  const [q,setQ]=useState(""); const [modal,setModal]=useState(false); const [edit,setEdit]=useState(null);
  const rows=data.filter(x=>`${x.name} ${x.manager} ${x.id}`.toLowerCase().includes(q.toLowerCase()));
  const save=v=>{setData(old=>edit?old.map(x=>x.id===edit.id?{...x,...v,employees:Number(v.employees),budget:Number(v.budget)}:x):[{...v,id:`DEP-${String(old.length+1).padStart(2,"0")}`,employees:Number(v.employees),budget:Number(v.budget)},...old]);setModal(false);setEdit(null)};
  return <><PageTitle title="Departments" description="Organize teams, department leads, and budgets." action={<Button onClick={()=>{setEdit(null);setModal(true)}}>＋ Add department</Button>}/><div className="stats stats-3"><Stat label="Departments" value={data.length} change="+1 this quarter" icon="▤"/><Stat label="Employees listed" value={employees.length} change="Across all teams" icon="♙" tone="violet"/><Stat label="Planned budgets" value={money(data.reduce((s,x)=>s+x.budget,0))} change="Current allocation" icon="$" tone="green"/></div><section className="panel section-panel"><div className="toolbar"><Search value={q} onChange={setQ} placeholder="Search departments..."/><span className="muted">{rows.length} departments</span></div><Table columns={[
    {key:"name",label:"DEPARTMENT",render:(v,r)=><div className="department"><span className="product-icon">▤</span><span><strong>{v}</strong><small>{r.id}</small></span></div>},{key:"manager",label:"DEPARTMENT LEAD"},{key:"employees",label:"EMPLOYEES"},{key:"budget",label:"BUDGET",render:v=>money(v)},{key:"status",label:"STATUS",render:v=><Badge>{v}</Badge>},{key:"action",label:"",render:(_,r)=><button className="link" onClick={()=>{setEdit(r);setModal(true)}}>Edit</button>}
  ]} rows={rows}/></section>{modal&&<Modal title={edit?"Edit department":"Add department"} onClose={()=>{setModal(false);setEdit(null)}}><RecordForm onCancel={()=>{setModal(false);setEdit(null)}} onSave={save} fields={[
    {name:"name",label:"Department name",value:edit?.name||""},{name:"manager",label:"Department lead",value:edit?.manager||""},{name:"employees",label:"Employee count",type:"number",value:edit?.employees??0},{name:"budget",label:"Annual budget ($)",type:"number",value:edit?.budget??0},{name:"status",label:"Status",value:edit?.status||"Active",options:["Active","Inactive"]}
  ]}/></Modal>}</>;
}

function Inventory({ data, setData }) {
  const [q,setQ]=useState("");const [category,setCategory]=useState("All categories");const [modal,setModal]=useState(false);const [edit,setEdit]=useState(null);
  const rows=data.filter(x=>`${x.name} ${x.sku} ${x.category}`.toLowerCase().includes(q.toLowerCase())&&(category==="All categories"||x.category===category));
  const save=v=>{const product={...v,stock:Number(v.stock),price:Number(v.price)};setData(old=>edit?old.map(x=>x.id===edit.id?{...x,...product}:x):[{...product,id:`PRD-${String(old.length+1).padStart(3,"0")}`},...old]);setModal(false);setEdit(null)};
  return <><PageTitle title="Inventory" description="Track products, stock availability, and pricing." action={<Button onClick={()=>{setEdit(null);setModal(true)}}>＋ Add product</Button>}/><div className="stats stats-3"><Stat label="Total products" value={data.length} change="+4 this month" icon="▣"/><Stat label="Low stock" value={data.filter(p=>p.stock>0&&p.stock<=10).length} change="Needs review" icon="⚠" tone="amber"/><Stat label="Out of stock" value={data.filter(p=>p.stock===0).length} change="Restock needed" icon="!" tone="red"/></div><section className="panel section-panel"><div className="toolbar"><Search value={q} onChange={setQ} placeholder="Search products or SKU..."/><select value={category} onChange={e=>setCategory(e.target.value)}><option>All categories</option>{[...new Set(data.map(p=>p.category))].map(c=><option key={c}>{c}</option>)}</select></div><Table columns={[
    {key:"name",label:"PRODUCT",render:(v,r)=><div className="department"><span className="product-icon">▣</span><span><strong>{v}</strong><small>{r.sku}</small></span></div>},{key:"category",label:"CATEGORY"},{key:"stock",label:"STOCK",render:v=><strong>{v} units</strong>},{key:"price",label:"UNIT PRICE",render:money},{key:"status",label:"STATUS",render:(_,r)=><Badge>{statusOf(r)}</Badge>},{key:"action",label:"",render:(_,r)=><button className="link" onClick={()=>{setEdit(r);setModal(true)}}>Edit</button>}
  ]} rows={rows}/></section>{modal&&<Modal title={edit?"Edit product":"Add product"} onClose={()=>{setModal(false);setEdit(null)}}><RecordForm onCancel={()=>{setModal(false);setEdit(null)}} onSave={save} fields={[
    {name:"name",label:"Product name",value:edit?.name||""},{name:"sku",label:"SKU",value:edit?.sku||""},{name:"category",label:"Category",value:edit?.category||"Electronics",options:["Electronics","Accessories","Furniture","Stationery"]},{name:"stock",label:"Stock quantity",type:"number",value:edit?.stock??0},{name:"price",label:"Unit price ($)",type:"number",value:edit?.price??0}
  ]}/></Modal>}</>;
}

function Orders({ data, setData, setPage }) {
  const [q,setQ]=useState("");const [status,setStatus]=useState("All statuses");
  const rows=data.filter(x=>`${x.id} ${x.customer}`.toLowerCase().includes(q.toLowerCase())&&(status==="All statuses"||x.status===status));
  return <><PageTitle title="Orders" description="Review orders, fulfillment progress, and payments." action={<Button variant="secondary" onClick={()=>setPage("Customers")}>View customers</Button>}/><div className="stats stats-3"><Stat label="All orders" value={data.length} change="+12.5%" icon="⇄"/><Stat label="Processing" value={data.filter(x=>x.status==="Processing").length} change="In progress" icon="◷" tone="amber"/><Stat label="Delivered" value={data.filter(x=>x.status==="Delivered").length} change="Completed orders" icon="✓" tone="green"/></div><section className="panel section-panel"><div className="toolbar"><Search value={q} onChange={setQ} placeholder="Search order or customer..."/><select value={status} onChange={e=>setStatus(e.target.value)}><option>All statuses</option>{["Pending","Processing","Shipped","Delivered","Cancelled"].map(s=><option key={s}>{s}</option>)}</select></div><Table columns={[
    {key:"id",label:"ORDER ID",render:v=><strong className="primary-text">{v}</strong>},{key:"customer",label:"CUSTOMER"},{key:"date",label:"ORDER DATE",render:dateLabel},{key:"amount",label:"TOTAL",render:v=><strong>{money(v)}</strong>},{key:"payment",label:"PAYMENT",render:v=><Badge>{v}</Badge>},{key:"status",label:"STATUS",render:(v,r)=><select className="inline-select" value={v} onChange={e=>setData(old=>old.map(x=>x.id===r.id?{...x,status:e.target.value}:x))}>{["Pending","Processing","Shipped","Delivered","Cancelled"].map(s=><option key={s}>{s}</option>)}</select>}
  ]} rows={rows}/><div className="table-footer">Showing {rows.length} orders <span>Status changes only affect local sample data.</span></div></section></>;
}

function Customers({ data, setData }) {
  const [q,setQ]=useState("");const [modal,setModal]=useState(false);
  const rows=data.filter(x=>`${x.name} ${x.email} ${x.id}`.toLowerCase().includes(q.toLowerCase()));
  const save=v=>{setData(old=>[{...v,id:`CUS-${String(old.length+1).padStart(3,"0")}`,orders:0,spent:0},...old]);setModal(false)};
  return <><PageTitle title="Customers" description="Maintain customer contacts and relationship history." action={<Button onClick={()=>setModal(true)}>＋ Add customer</Button>}/><div className="stats stats-3"><Stat label="Total customers" value={data.length} change="+6 this month" icon="♧"/><Stat label="Active customers" value={data.filter(x=>x.status==="Active").length} change="+4.8%" icon="✓" tone="green"/><Stat label="Customer lifetime spend" value={money(data.reduce((s,x)=>s+x.spent,0))} change="+11.2%" icon="$" tone="violet"/></div><section className="panel section-panel"><div className="toolbar"><Search value={q} onChange={setQ} placeholder="Search customers..."/><span className="muted">{rows.length} customers</span></div><Table columns={[
    {key:"name",label:"CUSTOMER",render:(v,r)=><Person name={v} detail={r.email} purple/>},{key:"id",label:"CUSTOMER ID"},{key:"orders",label:"ORDERS"},{key:"spent",label:"TOTAL SPENT",render:v=><strong>{money(v)}</strong>},{key:"status",label:"STATUS",render:v=><Badge>{v}</Badge>}
  ]} rows={rows}/></section>{modal&&<Modal title="Add customer" onClose={()=>setModal(false)}><RecordForm onCancel={()=>setModal(false)} onSave={save} fields={[
    {name:"name",label:"Customer name",value:""},{name:"email",label:"Email address",type:"email",value:""},{name:"status",label:"Status",value:"Active",options:["Active","Inactive"]}
  ]}/></Modal>}</>;
}

function Finance({ orders }) {
  const revenue=orders.filter(o=>o.payment==="Paid"&&o.status!=="Cancelled").reduce((s,o)=>s+o.amount,0);
  const pending=orders.filter(o=>o.payment==="Pending").reduce((s,o)=>s+o.amount,0);
  const transactions=orders.map((o,i)=>({...o,reference:`TXN-${3041+i}`,type:"Sales revenue"}));
  return <><PageTitle title="Finance" description="Review recorded revenue and transaction status." action={<Button variant="secondary" onClick={()=>window.print()}>↓ Print report</Button>}/><div className="stats"><Stat label="Recorded revenue" value={money(revenue)} change="+9.3%" icon="$" tone="green"/><Stat label="Outstanding payments" value={money(pending)} change="Awaiting payment" icon="◷" tone="amber"/><Stat label="Transactions" value={transactions.length} change="Recorded orders" icon="⇄" tone="violet"/><Stat label="Refunded orders" value={orders.filter(o=>o.payment==="Refunded").length} change="Review if needed" icon="↶" tone="red"/></div><section className="panel section-panel"><div className="panel-heading"><div><h2>Recent transactions</h2><p>Derived from sample order records</p></div></div><Table columns={[
    {key:"reference",label:"REFERENCE",render:v=><strong className="primary-text">{v}</strong>},{key:"customer",label:"DESCRIPTION"},{key:"date",label:"DATE",render:dateLabel},{key:"type",label:"TYPE"},{key:"amount",label:"AMOUNT",render:v=><strong>{money(v)}</strong>},{key:"payment",label:"STATUS",render:v=><Badge>{v}</Badge>}
  ]} rows={transactions}/></section><p className="notice">Prototype only: these sample figures are not an accounting ledger and should not be used for financial decisions.</p></>;
}

function Reports({ employees, products, orders, customers }) {
  const reports=[
    ["♙","Employee directory","Employee records and department assignments",`${employees.length} records`],
    ["▣","Inventory status","Stock quantities and low-stock products",`${products.filter(p=>p.stock<=10).length} alerts`],
    ["⇄","Order summary","Order status and payment records",`${orders.length} orders`],
    ["♧","Customer overview","Customer list and sample purchase totals",`${customers.length} customers`],
  ];
  return <><PageTitle title="Reports" description="Review business summaries and print reports." action={<Button variant="secondary" onClick={()=>window.print()}>↓ Print this page</Button>}/><div className="report-grid">{reports.map(([icon,title,description,count])=><article className="panel report-card" key={title}><span className="report-icon">{icon}</span><h2>{title}</h2><p>{description}</p><div className="report-footer"><span>{count}</span><span>↗</span></div></article>)}</div><section className="panel"><div className="panel-heading"><div><h2>Report notes</h2><p>Current sample-data coverage</p></div></div><ul className="notes-list"><li>Dashboard totals are calculated from current browser state.</li><li>Connect your backend to provide authoritative data and permissions.</li><li>Printing uses the browser print dialog; file export is not implemented.</li></ul></section></>;
}

function Settings({ darkMode, setDarkMode }) {
  const [company,setCompany]=useState("BizManager Inc.");const [email,setEmail]=useState("admin@bizmanager.example");const [currency,setCurrency]=useState("USD ($)");const [saved,setSaved]=useState(false);
  return <><PageTitle title="Settings" description="Configure workspace preferences."/><div className="settings-layout"><nav className="panel settings-nav"><button className="selected">General</button><button>Appearance</button><button>Notifications</button><button>Account</button></nav><section className="panel settings-panel"><div className="panel-heading"><div><h2>General settings</h2><p>Workspace details and regional preferences.</p></div></div><form className="settings-form" onSubmit={e=>{e.preventDefault();setSaved(true)}}><label className="field"><span>Company name</span><input required value={company} onChange={e=>setCompany(e.target.value)}/></label><label className="field"><span>Administrator email</span><input required type="email" value={email} onChange={e=>setEmail(e.target.value)}/></label><label className="field"><span>Display currency</span><select value={currency} onChange={e=>setCurrency(e.target.value)}><option>USD ($)</option><option>ETB (Br)</option><option>EUR (€)</option><option>GBP (£)</option></select></label><div className="setting-toggle"><div><strong>Dark mode</strong><p>Use a darker appearance for this browser session.</p></div><button type="button" className={`switch ${darkMode?"on":""}`} aria-pressed={darkMode} onClick={()=>setDarkMode(!darkMode)}><span/></button></div><div className="modal-actions"><Button type="submit">Save preferences</Button></div>{saved&&<p className="success">Preferences saved for this page session only.</p>}</form></section></div></>;
}

export default function Home() {
  const [page,setPage]=useState("Dashboard");const [darkMode,setDarkMode]=useState(false);const [mobileNav,setMobileNav]=useState(false);
  const [employees,setEmployees]=useState(seedEmployees);const [departments,setDepartments]=useState(seedDepartments);const [products,setProducts]=useState(seedProducts);const [orders,setOrders]=useState(seedOrders);const [customers,setCustomers]=useState(seedCustomers);
  let content;
  switch(page) {
    case "Employees": content=<Employees data={employees} setData={setEmployees}/>;break;
    case "Departments": content=<Departments data={departments} setData={setDepartments} employees={employees}/>;break;
    case "Inventory": content=<Inventory data={products} setData={setProducts}/>;break;
    case "Orders": content=<Orders data={orders} setData={setOrders} setPage={setPage}/>;break;
    case "Customers": content=<Customers data={customers} setData={setCustomers}/>;break;
    case "Finance": content=<Finance orders={orders}/>;break;
    case "Reports": content=<Reports employees={employees} products={products} orders={orders} customers={customers}/>;break;
    case "Settings": content=<Settings darkMode={darkMode} setDarkMode={setDarkMode}/>;break;
    default: content=<Dashboard employees={employees} products={products} orders={orders} setPage={setPage}/>;
  }
  return <div className={`app-shell ${darkMode?"dark-theme":""}`}><aside className={`sidebar ${mobileNav?"open":""}`}><div className="brand"><span className="brand-mark">B</span><strong>bizmanager<span>.</span></strong><button className="mobile-close icon-btn" onClick={()=>setMobileNav(false)}>×</button></div><div className="workspace"><span className="workspace-mark">B</span><span><strong>BizManager Inc.</strong><small>Business workspace</small></span><b>⌄</b></div><nav className="navigation">{nav.map(group=><div className="nav-group" key={group.group}><p>{group.group}</p>{group.items.map(([label,icon])=><button key={label} className={`nav-item ${page===label?"active":""}`} onClick={()=>{setPage(label);setMobileNav(false)}}><span className="nav-icon">{icon}</span><span>{label}</span>{label==="Inventory"&&products.some(p=>p.stock<=10)&&<i/>}</button>)}</div>)}</nav><div className="sidebar-bottom"><div className="help-card"><span className="help-mark">?</span><strong>Need a hand?</strong><p>Check workspace reports to review the sample data.</p><button onClick={()=>setPage("Reports")}>View reports ↗</button></div><button className="sidebar-profile" onClick={()=>setPage("Settings")}><span className="avatar">IE</span><span><strong>Imran Endris</strong><small>Administrator</small></span><b>•••</b></button></div></aside>{mobileNav&&<button className="scrim" aria-label="Close menu" onClick={()=>setMobileNav(false)}/>}<div className="main-shell"><header className="topbar"><div className="crumbs"><button className="mobile-menu icon-btn" aria-label="Open menu" onClick={()=>setMobileNav(true)}>☰</button><span>Workspace</span><span>/</span><strong>{page}</strong></div><div className="top-actions"><span className="today">{new Date().toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"})}</span><button className="icon-btn" onClick={()=>setDarkMode(!darkMode)} aria-label="Toggle dark mode">{darkMode?"☀":"☾"}</button><button className="notification icon-btn" aria-label="Notifications">♧<i/></button><button className="top-profile" onClick={()=>setPage("Settings")}><span className="avatar">IE</span><span><strong>Imran Endris</strong><small>Admin</small></span><b>⌄</b></button></div></header><main className="main-content">{content}<footer className="footer"><span>© 2026 BizManager ERP</span><span>Frontend prototype · Sample data</span></footer></main></div></div>;
}
