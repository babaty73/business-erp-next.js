"use client";
import DashboardPage from "@/components/pages/DashboardPage";
import { useERP } from "@/components/erp-context";
import { useRouter } from "next/navigation";
import { navigateToPage } from "@/lib/navigation";

export default function Page() {
 const router = useRouter();
 const { employees, products, orders } = useERP();
 return <DashboardPage employees={employees} products={products} orders={orders} setPage={(label) => navigateToPage(router, label)} />;
}
