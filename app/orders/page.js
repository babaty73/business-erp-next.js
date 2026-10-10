"use client";
import OrdersPage from "@/components/pages/OrdersPage";
import { useERP } from "@/components/erp-context";
import { useRouter } from "next/navigation";
import { navigateToPage } from "@/lib/navigation";

export default function Page() {
 const router = useRouter();
 const { orders, setOrders } = useERP();
 return <OrdersPage data={orders} setData={setOrders} setPage={(label) => navigateToPage(router, label)} />;
}
