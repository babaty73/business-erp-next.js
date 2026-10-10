"use client";
import { useState } from "react";
import { Button, Badge, PageTitle, Stat, Search, Table, Modal, RecordForm, Person } from "@/components/ui";
import { money, dateLabel, statusOf } from "@/lib/erp-utils";
import { Users, Package, ShoppingCart, DollarSign, Building2, Clock3, AlertTriangle, BarChart3, FileText, UserRound, Boxes, TrendingUp, Wallet, CircleDollarSign, ClipboardList, ContactRound, PackageSearch, ArrowDownToLine, Printer, Plus, ArrowUpRight } from "lucide-react";

export default function Finance({ orders }) {
  const revenue=orders.filter(o=>o.payment==="Paid"&&o.status!=="Cancelled").reduce((s,o)=>s+o.amount,0);
  const pending=orders.filter(o=>o.payment==="Pending").reduce((s,o)=>s+o.amount,0);
  const transactions=orders.map((o,i)=>({...o,reference:`TXN-${3041+i}`,type:"Sales revenue"}));
  return <><PageTitle title="Finance" description="Review recorded revenue and transaction status." action={<Button variant="secondary" onClick={()=>window.print()}>↓ Print report</Button>}/><div className="stats"><Stat label="Recorded revenue" value={money(revenue)} change="+9.3%" icon="$" tone="green"/><Stat label="Outstanding payments" value={money(pending)} change="Awaiting payment" icon="◷" tone="amber"/><Stat label="Transactions" value={transactions.length} change="Recorded orders" icon="⇄" tone="violet"/><Stat label="Refunded orders" value={orders.filter(o=>o.payment==="Refunded").length} change="Review if needed" icon="↶" tone="red"/></div><section className="panel section-panel"><div className="panel-heading"><div><h2>Recent transactions</h2><p>Derived from sample order records</p></div></div><Table columns={[
    {key:"reference",label:"REFERENCE",render:v=><strong className="primary-text">{v}</strong>},{key:"customer",label:"DESCRIPTION"},{key:"date",label:"DATE",render:dateLabel},{key:"type",label:"TYPE"},{key:"amount",label:"AMOUNT",render:v=><strong>{money(v)}</strong>},{key:"payment",label:"STATUS",render:v=><Badge>{v}</Badge>}
  ]} rows={transactions}/></section><p className="notice">Prototype only: these sample figures are not an accounting ledger and should not be used for financial decisions.</p></>;
}
