"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import OrdersPage from "@/components/pages/OrdersPage";
import { useERP } from "@/components/erp-context";
import { navigateToPage } from "@/lib/navigation";
import AuthGate from "@/components/auth/AuthGate";

export default function Page() {
  const router = useRouter();
  const { orders, setOrders } = useERP();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchOrders() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/orders");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to fetch orders.");
        }

        if (!Array.isArray(result.data)) {
          throw new Error("The orders API returned invalid data.");
        }

        if (!cancelled) {
          setOrders(result.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to fetch orders.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchOrders();

    return () => {
      cancelled = true;
    };
  }, [setOrders]);

  if (loading) {
    return <p>Loading orders...</p>;
  }

  if (error) {
    return (
      <section className="panel section-panel">
        <p role="alert" className="form-error">{error}</p>
        <button onClick={() => window.location.reload()}>
          Retry
        </button>
      </section>
    );
  }

  return (
    <AuthGate allowedRoles={["admin"]} redirectTo="/admin/login">
      <OrdersPage
        data={orders}
        setData={setOrders}
        setPage={(label) => navigateToPage(router, label)}
      />
    </AuthGate>
  );
}
