"use client";
import DepartmentsPage from "@/components/pages/DepartmentsPage";
import { useERP } from "@/components/erp-context";

export default function Page() {
 const { departments, setDepartments, employees } = useERP();
 return <DepartmentsPage data={departments} setData={setDepartments} employees={employees} />;
}
