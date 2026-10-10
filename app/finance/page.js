"use client";
import FinancePage from "@/components/pages/FinancePage";
import { useERP } from "@/components/erp-context";

export default function Page() {
 const { orders } = useERP();
 return <FinancePage orders={orders} />;
}
