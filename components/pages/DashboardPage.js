"use client";
import { useState } from "react";
import { Button, Badge, PageTitle, Stat, Search, Table, Modal, RecordForm, Person } from "@/components/ui";
import { money, dateLabel, statusOf } from "@/lib/erp-utils";
import { Users, Package, ShoppingCart, DollarSign, Building2, Clock3, AlertTriangle, BarChart3, FileText, UserRound, Boxes, TrendingUp, Wallet, CircleDollarSign, ClipboardList, ContactRound, PackageSearch, ArrowDownToLine, Printer, Plus, ArrowUpRight } from "lucide-react";

export default function Dashboard({ employees, products, orders, setPage }) {
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
