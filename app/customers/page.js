
"use client";

import { useEffect, useState } from "react";
import CustomersPage from "@/components/pages/CustomersPage";
import { useERP } from "@/components/erp-context";

export default function Page() {
  const { customers, setCustomers } = useERP();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCustomers() {
      try {
        const response = await fetch("/api/customers");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to fetch customers.");
        }

        const formattedCustomers = result.data.map((customer) => ({
          ...customer,
          id: String(customer._id),
          orders: 0,
          spent: 0,
        }));

        setCustomers(formattedCustomers);
      } catch (error) {
        setError(error.message || "Failed to fetch customers.");
      } finally {
        setLoading(false);
      }
    }

    fetchCustomers();
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
