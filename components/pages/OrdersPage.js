"use client";
import { useState } from "react";
import { Button, Badge, PageTitle, Stat, Search, Table, Modal, RecordForm, Person } from "@/components/ui";
import { money, dateLabel, statusOf } from "@/lib/erp-utils";
import { Users, Package, ShoppingCart, DollarSign, Building2, Clock3, AlertTriangle, BarChart3, FileText, UserRound, Boxes, TrendingUp, Wallet, CircleDollarSign, ClipboardList, ContactRound, PackageSearch, ArrowDownToLine, Printer, Plus, ArrowUpRight } from "lucide-react";

export default function Orders({ data, setData, setPage }) {
  const [q,setQ]=useState("");const [status,setStatus]=useState("All statuses");
  const rows=data.filter(x=>`${x.id} ${x.customer}`.toLowerCase().includes(q.toLowerCase())&&(status==="All statuses"||x.status===status));
  return <><PageTitle title="Orders" description="Review orders, fulfillment progress, and payments." action={<Button variant="secondary" onClick={()=>setPage("Customers")}>View customers</Button>}/><div className="stats stats-3"><Stat label="All orders" value={data.length} change="+12.5%" icon="⇄"/><Stat label="Processing" value={data.filter(x=>x.status==="Processing").length} change="In progress" icon="◷" tone="amber"/><Stat label="Delivered" value={data.filter(x=>x.status==="Delivered").length} change="Completed orders" icon="✓" tone="green"/></div><section className="panel section-panel"><div className="toolbar"><Search value={q} onChange={setQ} placeholder="Search order or customer..."/><select value={status} onChange={e=>setStatus(e.target.value)}><option>All statuses</option>{["Pending","Processing","Shipped","Delivered","Cancelled"].map(s=><option key={s}>{s}</option>)}</select></div><Table columns={[
    {key:"id",label:"ORDER ID",render:v=><strong className="primary-text">{v}</strong>},{key:"customer",label:"CUSTOMER"},{key:"date",label:"ORDER DATE",render:dateLabel},{key:"amount",label:"TOTAL",render:v=><strong>{money(v)}</strong>},{key:"payment",label:"PAYMENT",render:v=><Badge>{v}</Badge>},{key:"status",label:"STATUS",render:(v,r)=><select className="inline-select" value={v} onChange={e=>setData(old=>old.map(x=>x.id===r.id?{...x,status:e.target.value}:x))}>{["Pending","Processing","Shipped","Delivered","Cancelled"].map(s=><option key={s}>{s}</option>)}</select>}
  ]} rows={rows}/><div className="table-footer">Showing {rows.length} orders <span>Status changes only affect local sample data.</span></div></section></>;
}
