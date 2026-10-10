"use client";
import ReportsPage from "@/components/pages/ReportsPage";
import { useERP } from "@/components/erp-context";

export default function Page() {
 const { employees, products, orders, customers } = useERP();
 return <ReportsPage employees={employees} products={products} orders={orders} customers={customers} />;
}
