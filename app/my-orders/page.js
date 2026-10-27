"use client";

import { useEffect, useState } from "react";
import AuthGate from "@/components/auth/AuthGate";

function money(value) {
  return `${Number(value || 0).toLocaleString()} ETB`;
}

export default function MyOrdersPage() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function readJSON(response) {
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Request failed.");
    }
    return result;
  }

  async function loadData() {
    const [inventoryResponse, ordersResponse] = await Promise.all([
      fetch("/api/inventory"),
      fetch("/api/orders"),
    ]);

    const [inventoryResult, ordersResult] = await Promise.all([
      readJSON(inventoryResponse),
      readJSON(ordersResponse),
    ]);

    setProducts(inventoryResult.data || []);
    setOrders(ordersResult.data || []);
  }

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [inventoryResponse, ordersResponse] = await Promise.all([
          fetch("/api/inventory"),
          fetch("/api/orders"),
        ]);

        const [inventoryResult, ordersResult] = await Promise.all([
          readJSON(inventoryResponse),
          readJSON(ordersResponse),
        ]);

        if (active) {
          setProducts(inventoryResult.data || []);
          setOrders(ordersResult.data || []);
        }
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  async function placeOrder(product) {
    const quantity = Number(quantities[product._id] || 1);

    if (!Number.isInteger(quantity) || quantity < 1) {
      setError("Enter a valid whole-number quantity.");
      return;
    }

    if (quantity > product.stock) {
      setError("Requested quantity exceeds available stock.");
      return;
    }

    try {
      setBusy(product._id);
      setError("");
      setMessage("");

      await readJSON(
        await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: [{ productId: product._id, quantity }],
          }),
        })
      );

      await loadData();
      setMessage("Order placed. You can now submit your bank transfer proof.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  async function uploadProof(orderId, file) {
    if (!file) return;

    try {
      setBusy(orderId);
      setError("");
      setMessage("");

      const formData = new FormData();
      formData.append("file", file);

      await readJSON(
        await fetch(`/api/orders/${orderId}/payment-proof`, {
          method: "POST",
          body: formData,
        })
      );

      await loadData();
      setMessage("Payment proof submitted for admin review.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  }

  if (loading) return <main className="p-6">Loading your orders...</main>;

  return (
    <AuthGate allowedRoles={["customer"]} redirectTo="/login">
      <main className="mx-auto max-w-6xl space-y-8 p-6">
        <header>
          <h1 className="text-3xl font-bold">My Orders</h1>
          <p className="mt-2 text-gray-600">
            Browse products, place orders, and submit bank transfer proof.
          </p>
        </header>

        {error && (
          <p role="alert" className="rounded border border-red-300 p-3 text-red-700">
            {error}
          </p>
        )}

        {message && (
          <p className="rounded border border-green-300 p-3 text-green-700">
            {message}
          </p>
        )}

        <section>
          <h2 className="mb-4 text-xl font-semibold">Available Products</h2>

          {products.length === 0 ? (
            <p>No products are currently available.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <article key={product._id} className="rounded-lg border p-4">
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-sm text-gray-500">
                    SKU: {product.sku} · {product.category}
                  </p>
                  <p className="my-3 text-lg font-bold">
                    {money(product.price)}
                  </p>
                  <p className="mb-3 text-sm">
                    Available stock: {product.stock}
                  </p>

                  <label className="mb-2 block text-sm" htmlFor={`qty-${product._id}`}>
                    Quantity
                  </label>
                  <input
                    id={`qty-${product._id}`}
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantities[product._id] || 1}
                    disabled={product.stock < 1 || Boolean(busy)}
                    onChange={(event) =>
                      setQuantities((previous) => ({
                        ...previous,
                        [product._id]: event.target.value,
                      }))
                    }
                    className="mb-3 w-full rounded border p-2"
                  />

                  <button
                    disabled={product.stock < 1 || Boolean(busy)}
                    onClick={() => placeOrder(product)}
                    className="w-full rounded bg-blue-600 p-2 text-white disabled:opacity-50"
                  >
                    {busy === product._id ? "Placing order..." : "Place order"}
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold">Order History</h2>

          {orders.length === 0 ? (
            <p>You have not placed any orders yet.</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const proof = order.paymentProof;
                const canUpload =
                  order.status !== "Cancelled" &&
                  order.payment === "Pending" &&
                  !["Pending", "Approved"].includes(proof?.reviewStatus);

                return (
                  <article key={order.id} className="rounded-lg border p-4">
                    <div className="flex flex-wrap justify-between gap-2">
                      <div>
                        <h3 className="font-semibold">Order #{order.id}</h3>
                        <p className="text-sm text-gray-500">{order.date}</p>
                      </div>
                      <div>
                        <p>Order: {order.status}</p>
                        <p>Payment: {order.payment}</p>
                      </div>
                    </div>

                    <div className="my-3 space-y-1">
                      {order.items.map((item, index) => (
                        <p key={`${order.id}-${index}`} className="text-sm">
                          {item.product} × {item.quantity} — {money(item.unitPrice * item.quantity)}
                        </p>
                      ))}
                    </div>

                    <p className="font-semibold">Total: {money(order.amount)}</p>

                    <p className="mt-2 text-sm">
                      Payment proof: {proof?.reviewStatus || "Not submitted"}
                    </p>

                    {proof?.reviewStatus === "Rejected" && (
                      <p className="mt-1 text-sm text-red-700">
                        Reason: {proof.rejectionReason || "Please contact the administrator."}
                      </p>
                    )}

                    {proof?.url && (
                      <a
                        href={proof.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-block text-blue-600 underline"
                      >
                        View submitted screenshot
                      </a>
                    )}

                    {canUpload && (
                      <div className="mt-4">
                        <label
                          htmlFor={`proof-${order.id}`}
                          className="mb-2 block text-sm font-medium"
                        >
                          {proof?.reviewStatus === "Rejected"
                            ? "Upload corrected payment screenshot"
                            : "Upload bank transfer screenshot"}
                        </label>
                        <input
                          id={`proof-${order.id}`}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          disabled={Boolean(busy)}
                          className="block w-full text-sm"
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file) uploadProof(order.id, file);
                            event.target.value = "";
                          }}
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          JPG, PNG, or WebP. Maximum size: 5 MB.
                        </p>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </AuthGate>
  );
}
