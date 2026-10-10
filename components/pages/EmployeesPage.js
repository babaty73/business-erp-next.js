"use client";
import { useState } from "react";
import { Button, Badge, PageTitle, Stat, Search, Table, Modal, RecordForm, Person } from "@/components/ui";
import { money, dateLabel, statusOf } from "@/lib/erp-utils";
import { Users, Package, ShoppingCart, DollarSign, Building2, Clock3, AlertTriangle, BarChart3, FileText, UserRound, Boxes, TrendingUp, Wallet, CircleDollarSign, ClipboardList, ContactRound, PackageSearch, ArrowDownToLine, Printer, Plus, ArrowUpRight } from "lucide-react";

export default function Employees({ data, setData }) {
  const [q,setQ] = useState(""); const [filter,setFilter] = useState("All statuses"); const [modal,setModal] = useState(false); const [edit,setEdit] = useState(null);
  const rows = data.filter(x => `${x.name} ${x.email} ${x.department} ${x.id}`.toLowerCase().includes(q.toLowerCase()) && (filter === "All statuses" || x.status === filter));
  const save = v => { setData(old => edit ? old.map(x => x.id === edit.id ? {...x,...v} : x) : [{...v,id:`EMP-${1000+old.length+1}`},...old]); setModal(false); setEdit(null); };
  return <><PageTitle title="Employees" description="Manage employee records, roles, and employment status." action={<Button onClick={() => {setEdit(null);setModal(true)}}>＋ Add employee</Button>} /><div className="stats stats-3"><Stat label="Total employees" value={data.length} change="+8.2%" icon="♙"/><Stat label="Active employees" value={data.filter(x=>x.status==="Active").length} change="+3 this month" icon="✓" tone="green"/><Stat label="On leave" value={data.filter(x=>x.status==="On leave").length} change="No change" icon="◷" tone="amber"/></div><section className="panel section-panel"><div className="toolbar"><Search value={q} onChange={setQ} placeholder="Search employees..."/><select value={filter} onChange={e=>setFilter(e.target.value)}><option>All statuses</option><option>Active</option><option>On leave</option><option>Inactive</option></select></div><Table columns={[
    {key:"name",label:"EMPLOYEE",render:(v,r)=><Person name={v} detail={r.email}/>},{key:"id",label:"EMPLOYEE ID"},{key:"department",label:"DEPARTMENT"},{key:"role",label:"ROLE"},{key:"status",label:"STATUS",render:v=><Badge>{v}</Badge>},{key:"action",label:"",render:(_,r)=><button className="link" onClick={()=>{setEdit(r);setModal(true)}}>Edit</button>}
  ]} rows={rows}/><div className="table-footer">Showing {rows.length} of {data.length} employees <span>Sample data · local state only</span></div></section>{modal&&<Modal title={edit?"Edit employee":"Add employee"} onClose={()=>{setModal(false);setEdit(null)}}><RecordForm onCancel={()=>{setModal(false);setEdit(null)}} onSave={save} fields={[
    {name:"name",label:"Full name",value:edit?.name||""},{name:"email",label:"Email",type:"email",value:edit?.email||""},{name:"department",label:"Department",value:edit?.department||"Engineering",options:["Engineering","Human Resources","Finance","Sales","Operations"]},{name:"role",label:"Job title",value:edit?.role||""},{name:"status",label:"Status",value:edit?.status||"Active",options:["Active","On leave","Inactive"]}
  ]}/></Modal>}</>;
}
