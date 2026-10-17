
"use client";

import { useEffect, useState } from "react";
import DepartmentsPage from "@/components/pages/DepartmentsPage";
import { useERP } from "@/components/erp-context";

export default function Page() {
  const { departments, setDepartments } = useERP();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [departmentResponse, employeeResponse] =
          await Promise.all([
            fetch("/api/departments"),
            fetch("/api/employees"),
          ]);

        const [departmentResult, employeeResult] =
          await Promise.all([
            departmentResponse.json(),
            employeeResponse.json(),
          ]);

        if (!departmentResponse.ok) {
          throw new Error(
            departmentResult.message || "Failed to load departments."
          );
        }

        if (!employeeResponse.ok) {
          throw new Error(
            employeeResult.message || "Failed to load employees."
          );
        }

        setDepartments(
          departmentResult.data.map((department) => ({
            ...department,
            id: String(department._id),
            managerId: department.managerId || "",
          }))
        );

        setEmployees(employeeResult.data);
      } catch (err) {
        setError(err.message || "Failed to load department data.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [setDepartments]);

  return (
    <DepartmentsPage
      data={departments}
      setData={setDepartments}
      employees={employees}
      loading={loading}
      error={error}
    />
  );
}
