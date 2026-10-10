"use client";
import { useState } from "react";
import { Button, Badge, PageTitle, Stat, Search, Table, Modal, RecordForm, Person } from "@/components/ui";
import { money, dateLabel, statusOf } from "@/lib/erp-utils";
import { Users, Package, ShoppingCart, DollarSign, Building2, Clock3, AlertTriangle, BarChart3, FileText, UserRound, Boxes, TrendingUp, Wallet, CircleDollarSign, ClipboardList, ContactRound, PackageSearch, ArrowDownToLine, Printer, Plus, ArrowUpRight } from "lucide-react";

export default function Customers({ data, setData }) {
  const [q,setQ]=useState("");const [modal,setModal]=useState(false);
  const rows=data.filter(x=>`${x.name} ${x.email} ${x.id}`.toLowerCase().includes(q.toLowerCase()));
  const save=v=>{setData(old=>[{...v,id:`CUS-${String(old.length+1).padStart(3,"0")}`,orders:0,spent:0},...old]);setModal(false)};
  return <><PageTitle title="Customers" description="Maintain customer contacts and relationship history." action={<Button onClick={()=>setModal(true)}>＋ Add customer</Button>}/><div className="stats stats-3"><Stat label="Total customers" value={data.length} change="+6 this month" icon="♧"/><Stat label="Active customers" value={data.filter(x=>x.status==="Active").length} change="+4.8%" icon="✓" tone="green"/><Stat label="Customer lifetime spend" value={money(data.reduce((s,x)=>s+x.spent,0))} change="+11.2%" icon="$" tone="violet"/></div><section className="panel section-panel"><div className="toolbar"><Search value={q} onChange={setQ} placeholder="Search customers..."/><span className="muted">{rows.length} customers</span></div><Table columns={[
    {key:"name",label:"CUSTOMER",render:(v,r)=><Person name={v} detail={r.email} purple/>},{key:"id",label:"CUSTOMER ID"},{key:"orders",label:"ORDERS"},{key:"spent",label:"TOTAL SPENT",render:v=><strong>{money(v)}</strong>},{key:"status",label:"STATUS",render:v=><Badge>{v}</Badge>}
  ]} rows={rows}/></section>{modal&&<Modal title="Add customer" onClose={()=>setModal(false)}><RecordForm onCancel={()=>setModal(false)} onSave={save} fields={[
    {name:"name",label:"Customer name",value:""},{name:"email",label:"Email address",type:"email",value:""},{name:"status",label:"Status",value:"Active",options:["Active","Inactive"]}
  ]}/></Modal>}</>;
}
