"use client";
import CustomersPage from "@/components/pages/CustomersPage";
import { useERP } from "@/components/erp-context";

export default function Page() {
 const { customers, setCustomers } = useERP();
 return <CustomersPage data={customers} setData={setCustomers} />;
}
