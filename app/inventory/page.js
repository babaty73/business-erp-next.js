
"use client";

import { useEffect, useState } from "react";
import InventoryPage from "@/components/pages/InventoryPage";
import { useERP } from "@/components/erp-context";

export default function Page() {
  const { products, setProducts } = useERP();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("/api/inventory");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to load inventory.");
        }

        const formattedProducts = result.data.map((product) => ({
          ...product,
          id: String(product._id),
        }));

        setProducts(formattedProducts);
      } catch (error) {
        setError(error.message || "Failed to load inventory.");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [setProducts]);

  return (
    <InventoryPage
      data={products}
      setData={setProducts}
      loading={loading}
      error={error}
    />
  );
}
