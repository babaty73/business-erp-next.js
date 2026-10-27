"use client";

import { useEffect, useState } from "react";
import DashboardPage from "@/components/pages/DashboardPage";
import { useRouter } from "next/navigation";
import { navigateToPage } from "@/lib/navigation";
import AuthGate from "@/components/auth/AuthGate";

export default function Page() {
  const router = useRouter();

  const [reports, setReports] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [reportsResponse, ordersResponse] = await Promise.all([
          fetch("/api/reports"),
          fetch("/api/orders"),
        ]);

        const [reportsResult, ordersResult] = await Promise.all([
          reportsResponse.json(),
          ordersResponse.json(),
        ]);

        if (!reportsResponse.ok) {
          throw new Error(
            reportsResult.message || "Failed to load dashboard reports."
          );
        }

        if (!ordersResponse.ok) {
          throw new Error(
            ordersResult.message || "Failed to load recent orders."
          );
        }

        setReports(reportsResult.data);
        setOrders(ordersResult.data);
      } catch (err) {
        setError(err.message || "Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  return (
    <AuthGate allowedRoles={["admin"]} redirectTo="/admin/login">
      <DashboardPage
        reports={reports}
        orders={orders}
        loading={loading}
        error={error}
        setPage={(label) => navigateToPage(router, label)}
      />
    </AuthGate>
  );
}
