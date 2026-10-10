"use client";
import EmployeesPage from "@/components/pages/EmployeesPage";
import { useERP } from "@/components/erp-context";

export default function Page() {
 const { employees, setEmployees } = useERP();
 return <EmployeesPage data={employees} setData={setEmployees} />;
}
