
"use client";

import { useEffect, useState } from "react";
import CustomersPage from "@/components/pages/CustomersPage";
import { useERP } from "@/components/erp-context";

export default function Page() {
  const { customers, setCustomers } = useERP();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchCustomers() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/customers");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || "Failed to fetch customers."
          );
        }

        if (!Array.isArray(result.data)) {
          throw new Error("The customers API returned invalid data.");
        }

        const formattedCustomers = result.data.map((customer) => ({
  ...customer,
  id: String(customer._id),
  orders: customer.orders ?? 0,
  spent: customer.spent ?? 0,
}));

        if (!cancelled) {
          setCustomers(formattedCustomers);
        }
      } catch (error) {
        if (!cancelled) {
          setError(error.message || "Failed to fetch customers.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchCustomers();

    return () => {
      cancelled = true;
    };
  }, [setCustomers]);

  return (
    <CustomersPage
      data={customers}
      setData={setCustomers}
      loading={loading}
      error={error}
    />
  );
}
