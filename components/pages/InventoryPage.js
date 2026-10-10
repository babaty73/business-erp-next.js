"use client";
import { useState } from "react";
import { Button, Badge, PageTitle, Stat, Search, Table, Modal, RecordForm, Person } from "@/components/ui";
import { money, dateLabel, statusOf } from "@/lib/erp-utils";
import { Users, Package, ShoppingCart, DollarSign, Building2, Clock3, AlertTriangle, BarChart3, FileText, UserRound, Boxes, TrendingUp, Wallet, CircleDollarSign, ClipboardList, ContactRound, PackageSearch, ArrowDownToLine, Printer, Plus, ArrowUpRight } from "lucide-react";

export default function Inventory({ data, setData }) {
  const [q,setQ]=useState("");const [category,setCategory]=useState("All categories");const [modal,setModal]=useState(false);const [edit,setEdit]=useState(null);
  const rows=data.filter(x=>`${x.name} ${x.sku} ${x.category}`.toLowerCase().includes(q.toLowerCase())&&(category==="All categories"||x.category===category));
  const save=v=>{const product={...v,stock:Number(v.stock),price:Number(v.price)};setData(old=>edit?old.map(x=>x.id===edit.id?{...x,...product}:x):[{...product,id:`PRD-${String(old.length+1).padStart(3,"0")}`},...old]);setModal(false);setEdit(null)};
  return <><PageTitle title="Inventory" description="Track products, stock availability, and pricing." action={<Button onClick={()=>{setEdit(null);setModal(true)}}>＋ Add product</Button>}/><div className="stats stats-3"><Stat label="Total products" value={data.length} change="+4 this month" icon="▣"/><Stat label="Low stock" value={data.filter(p=>p.stock>0&&p.stock<=10).length} change="Needs review" icon="⚠" tone="amber"/><Stat label="Out of stock" value={data.filter(p=>p.stock===0).length} change="Restock needed" icon="!" tone="red"/></div><section className="panel section-panel"><div className="toolbar"><Search value={q} onChange={setQ} placeholder="Search products or SKU..."/><select value={category} onChange={e=>setCategory(e.target.value)}><option>All categories</option>{[...new Set(data.map(p=>p.category))].map(c=><option key={c}>{c}</option>)}</select></div><Table columns={[
    {key:"name",label:"PRODUCT",render:(v,r)=><div className="department"><span className="product-icon">▣</span><span><strong>{v}</strong><small>{r.sku}</small></span></div>},{key:"category",label:"CATEGORY"},{key:"stock",label:"STOCK",render:v=><strong>{v} units</strong>},{key:"price",label:"UNIT PRICE",render:money},{key:"status",label:"STATUS",render:(_,r)=><Badge>{statusOf(r)}</Badge>},{key:"action",label:"",render:(_,r)=><button className="link" onClick={()=>{setEdit(r);setModal(true)}}>Edit</button>}
  ]} rows={rows}/></section>{modal&&<Modal title={edit?"Edit product":"Add product"} onClose={()=>{setModal(false);setEdit(null)}}><RecordForm onCancel={()=>{setModal(false);setEdit(null)}} onSave={save} fields={[
    {name:"name",label:"Product name",value:edit?.name||""},{name:"sku",label:"SKU",value:edit?.sku||""},{name:"category",label:"Category",value:edit?.category||"Electronics",options:["Electronics","Accessories","Furniture","Stationery"]},{name:"stock",label:"Stock quantity",type:"number",value:edit?.stock??0},{name:"price",label:"Unit price ($)",type:"number",value:edit?.price??0}
  ]}/></Modal>}</>;
}
