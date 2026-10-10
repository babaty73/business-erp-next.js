"use client";
import { useState } from "react";
import { Button, Badge, PageTitle, Stat, Search, Table, Modal, RecordForm, Person } from "@/components/ui";
import { money, dateLabel, statusOf } from "@/lib/erp-utils";
import { Users, Package, ShoppingCart, DollarSign, Building2, Clock3, AlertTriangle, BarChart3, FileText, UserRound, Boxes, TrendingUp, Wallet, CircleDollarSign, ClipboardList, ContactRound, PackageSearch, ArrowDownToLine, Printer, Plus, ArrowUpRight } from "lucide-react";

export default function Reports({ employees, products, orders, customers }) {
  const reports=[
    [Users,"Employee directory","Employee records and department assignments",`${employees.length} records`],
    [Package,"Inventory status","Stock quantities and low-stock products",`${products.filter(p=>p.stock<=10).length} alerts`],
    [ShoppingCart,"Order summary","Order status and payment records",`${orders.length} orders`],
    [ContactRound,"Customer overview","Customer list and sample purchase totals",`${customers.length} customers`],
  ];
  return <><PageTitle title="Reports" description="Review business summaries and print reports." action={<Button variant="secondary" onClick={()=>window.print()}>↓ Print this page</Button>}/><div className="report-grid">{reports.map(([Icon,title,description,count])=><article className="panel report-card" key={title}><span className="report-icon"><Icon size={20} strokeWidth={1.9}/></span><h2>{title}</h2><p>{description}</p><div className="report-footer"><span>{count}</span><span>↗</span></div></article>)}</div><section className="panel"><div className="panel-heading"><div><h2>Report notes</h2><p>Current sample-data coverage</p></div></div><ul className="notes-list"><li>Dashboard totals are calculated from current browser state.</li><li>Connect your backend to provide authoritative data and permissions.</li><li>Printing uses the browser print dialog; file export is not implemented.</li></ul></section></>;
}
