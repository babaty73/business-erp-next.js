"use client";

import { useEffect, useState } from "react";
import FinancePage from "@/components/pages/FinancePage";

export default function Page() {
  const [orders, setOrders] = useState([]);
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
  }, []);

  if (loading) {
    return <p>Loading finance data...</p>;
  }

  if (error) {
    return (
      <section className="panel section-panel">
        <p role="alert" className="form-error">
          {error}
        </p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </section>
    );
  }

  return <FinancePage orders={orders} />;
}
