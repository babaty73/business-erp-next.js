"use client";

import { useEffect, useState } from "react";
import EmployeesPage from "@/components/pages/EmployeesPage";
import { useERP } from "@/components/erp-context";
import AuthGate from "@/components/auth/AuthGate";

export default function Page() {
  const { employees, setEmployees } = useERP();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [employeeResponse, departmentResponse] = await Promise.all([
          fetch("/api/employees"),
          fetch("/api/departments"),
        ]);

        const [employeeResult, departmentResult] = await Promise.all([
          employeeResponse.json(),
          departmentResponse.json(),
        ]);

        if (!employeeResponse.ok) {
          throw new Error(
            employeeResult.message || "Failed to load employees."
          );
        }

        if (!departmentResponse.ok) {
          throw new Error(
            departmentResult.message || "Failed to load departments."
          );
        }

        if (
          !Array.isArray(employeeResult.data) ||
          !Array.isArray(departmentResult.data)
        ) {
          throw new Error("The API returned invalid data.");
        }

        const departmentList = departmentResult.data;

        const formattedEmployees = employeeResult.data.map((employee) => {
          const department = departmentList.find(
            (item) => item.name === employee.department
          );

          return {
            ...employee,
            id: String(employee._id),
            department: employee.department || "",
            departmentId: department ? String(department._id) : "",
          };
        });

        if (!cancelled) {
          setDepartments(departmentList);
          setEmployees(formattedEmployees);
        }
      } catch (error) {
        if (!cancelled) {
          setError(error.message || "Failed to load employee data.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [setEmployees]);

  return (
    <AuthGate allowedRoles={["admin"]} redirectTo="/admin/login">
      <EmployeesPage
        data={employees}
        setData={setEmployees}
        departments={departments}
        loading={loading}
        error={error}
      />
    </AuthGate>
  );
}
