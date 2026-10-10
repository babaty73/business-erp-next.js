"use client";
import { useState } from "react";
import { Button, Badge, PageTitle, Stat, Search, Table, Modal, RecordForm, Person } from "@/components/ui";
import { money, dateLabel, statusOf } from "@/lib/erp-utils";
import { Users, Package, ShoppingCart, DollarSign, Building2, Clock3, AlertTriangle, BarChart3, FileText, UserRound, Boxes, TrendingUp, Wallet, CircleDollarSign, ClipboardList, ContactRound, PackageSearch, ArrowDownToLine, Printer, Plus, ArrowUpRight } from "lucide-react";

export default function Departments({ data, setData, employees }) {
  const [q,setQ]=useState(""); const [modal,setModal]=useState(false); const [edit,setEdit]=useState(null);
  const rows=data.filter(x=>`${x.name} ${x.manager} ${x.id}`.toLowerCase().includes(q.toLowerCase()));
  const save=v=>{setData(old=>edit?old.map(x=>x.id===edit.id?{...x,...v,employees:Number(v.employees),budget:Number(v.budget)}:x):[{...v,id:`DEP-${String(old.length+1).padStart(2,"0")}`,employees:Number(v.employees),budget:Number(v.budget)},...old]);setModal(false);setEdit(null)};
  return <><PageTitle title="Departments" description="Organize teams, department leads, and budgets." action={<Button onClick={()=>{setEdit(null);setModal(true)}}>＋ Add department</Button>}/><div className="stats stats-3"><Stat label="Departments" value={data.length} change="+1 this quarter" icon="▤"/><Stat label="Employees listed" value={employees.length} change="Across all teams" icon="♙" tone="violet"/><Stat label="Planned budgets" value={money(data.reduce((s,x)=>s+x.budget,0))} change="Current allocation" icon="$" tone="green"/></div><section className="panel section-panel"><div className="toolbar"><Search value={q} onChange={setQ} placeholder="Search departments..."/><span className="muted">{rows.length} departments</span></div><Table columns={[
    {key:"name",label:"DEPARTMENT",render:(v,r)=><div className="department"><span className="product-icon">▤</span><span><strong>{v}</strong><small>{r.id}</small></span></div>},{key:"manager",label:"DEPARTMENT LEAD"},{key:"employees",label:"EMPLOYEES"},{key:"budget",label:"BUDGET",render:v=>money(v)},{key:"status",label:"STATUS",render:v=><Badge>{v}</Badge>},{key:"action",label:"",render:(_,r)=><button className="link" onClick={()=>{setEdit(r);setModal(true)}}>Edit</button>}
  ]} rows={rows}/></section>{modal&&<Modal title={edit?"Edit department":"Add department"} onClose={()=>{setModal(false);setEdit(null)}}><RecordForm onCancel={()=>{setModal(false);setEdit(null)}} onSave={save} fields={[
    {name:"name",label:"Department name",value:edit?.name||""},{name:"manager",label:"Department lead",value:edit?.manager||""},{name:"employees",label:"Employee count",type:"number",value:edit?.employees??0},{name:"budget",label:"Annual budget ($)",type:"number",value:edit?.budget??0},{name:"status",label:"Status",value:edit?.status||"Active",options:["Active","Inactive"]}
  ]}/></Modal>}</>;
}
