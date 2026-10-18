"use client";

import { useState } from "react";
import {
  Button,
  Badge,
  PageTitle,
  Stat,
  Search,
  Table,
} from "@/components/ui";
import { money, dateLabel } from "@/lib/erp-utils";

const allowedTransitions = {
  Pending: ["Processing", "Cancelled"],
  Processing: ["Shipped", "Cancelled"],
  Shipped: ["Delivered"],
  Delivered: [],
  Cancelled: [],
};

const paymentOptions = {
  Pending: ["Paid"],
  Paid: ["Refunded"],
  Refunded: [],
};

export default function Orders({ data, setData, setPage }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [error, setError] = useState("");
  const [reviewReasons, setReviewReasons] = useState({});
  const [updating, setUpdating] = useState("");

  const rows = data.filter(
    (order) =>
      `${order.id} ${order.customer}`
        .toLowerCase()
        .includes(q.toLowerCase()) &&
      (status === "All statuses" || order.status === status)
  );

  async function refreshOrders() {
    const response = await fetch("/api/orders");
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to reload orders.");
    }

    if (!Array.isArray(result.data)) {
      throw new Error("The orders API returned invalid data.");
    }

    setData(result.data);
  }

  async function updateOrder(order, endpoint, body, label) {
    const key = `${order.id}-${label}`;

    try {
      setUpdating(key);
      setError("");

      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update order.");
      }

      await refreshOrders();
    } catch (err) {
      setError(err.message || "Failed to update order.");
    } finally {
      setUpdating("");
    }
  }

async function reviewPayment(order, action) {
  const reason =
    action === "Rejected"
      ? (reviewReasons[order.id] || "").trim()
      : "";

  if (action === "Rejected" && !reason) {
    setError("Enter a rejection reason before rejecting the proof.");
    return;
  }

  try {
    setUpdating(`${order.id}-review`);
    setError("");

    const response = await fetch(
      `/api/orders/${order.id}/payment-proof/review`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          rejectionReason: reason,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Payment review failed.");
    }

    await refreshOrders();
  } catch (err) {
    setError(err.message || "Payment review failed.");
  } finally {
    setUpdating("");
  }
}
  return (
    <>
      <PageTitle
        title="Orders"
        description="Review orders, fulfillment progress, and payments."
        action={
          <Button
            variant="secondary"
            onClick={() => setPage("Customers")}
          >
            View customers
          </Button>
        }
      />

      <div className="stats stats-3">
        <Stat
          label="All orders"
          value={data.length}
          change="Total records"
          icon="⇄"
        />
        <Stat
          label="Processing"
          value={data.filter((order) => order.status === "Processing").length}
          change="In progress"
          icon="◷"
          tone="amber"
        />
        <Stat
          label="Delivered"
          value={data.filter((order) => order.status === "Delivered").length}
          change="Completed orders"
          icon="✓"
          tone="green"
        />
      </div>

      <section className="panel section-panel">
        <div className="toolbar">
          <Search
            value={q}
            onChange={setQ}
            placeholder="Search order or customer..."
          />

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option>All statuses</option>
            {["Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map(
              (item) => (
                <option key={item}>{item}</option>
              )
            )}
          </select>
        </div>

        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}

        <Table
          columns={[
            {
              key: "id",
              label: "ORDER ID",
              render: (value) => (
                <strong className="primary-text">
                  {value}
                </strong>
              ),
            },
            { key: "customer", label: "CUSTOMER" },
            {
              key: "date",
              label: "ORDER DATE",
              render: dateLabel,
            },
            {
              key: "amount",
              label: "TOTAL",
              render: (value) => <strong>{money(value)}</strong>,
            },
            {
              key: "payment",
              label: "PAYMENT",
              render: (value, order) => {
                const busy = updating === `${order.id}-payment`;
                const options = paymentOptions[value] || [];

                return (
                  <select
                    className="inline-select"
                    value={value}
                    disabled={Boolean(updating)}
                    onChange={(event) =>
                      updateOrder(
                        order,
                        `/api/orders/${order.id}/payment`,
                        { payment: event.target.value },
                        "payment"
                      )
                    }
                    aria-label={`Payment status for order ${order.id}`}
                  >
                    <option value={value}>{value}</option>
                    {options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                );
              },
            },
            {
              key: "status",
              label: "STATUS",
              render: (value, order) => {
                const options = allowedTransitions[value] || [];

                return (
                  <select
                    className="inline-select"
                    value={value}
                    disabled={Boolean(updating) || options.length === 0}
                    onChange={(event) =>
                      updateOrder(
                        order,
                        `/api/orders/${order.id}`,
                        { status: event.target.value },
                        "status"
                      )
                    }
                    aria-label={`Order status for order ${order.id}`}
                  >
                    <option value={value}>{value}</option>
                    {options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                );
              },
            },
          ]}
          rows={rows}
        />

        <div className="table-footer">
          Showing {rows.length} orders
          <span>
            {updating ? "Saving changes..." : "Changes are saved to MongoDB."}
          </span>
        </div>
      </section>
      <section className="panel section-panel">
  <PageTitle
    title="Payment Proof Review"
    description="Verify bank transfer screenshots submitted by customers."
  />

  {data.filter(
    (order) =>
      order.paymentProof?.url &&
      order.paymentProof?.reviewStatus === "Pending"
  ).length === 0 ? (
    <p>No payment proofs are waiting for review.</p>
  ) : (
    <div className="form-grid">
      {data
        .filter(
          (order) =>
            order.paymentProof?.url &&
            order.paymentProof?.reviewStatus === "Pending"
        )
        .map((order) => (
          <article
            key={order.id}
            className="panel section-panel"
          >
            <h3>Order #{order.id}</h3>

            <p>Customer: {order.customer}</p>
            <p>Amount: {money(order.amount)}</p>
            <p>Payment: {order.payment}</p>

            <a
              href={order.paymentProof.url}
              target="_blank"
              rel="noreferrer"
            >
              <img
                src={order.paymentProof.url}
                alt={`Payment proof for order ${order.id}`}
                style={{
                  width: "100%",
                  maxWidth: "400px",
                  maxHeight: "350px",
                  objectFit: "contain",
                  display: "block",
                  margin: "12px 0",
                }}
              />
              Open full screenshot
            </a>

            <label htmlFor={`reason-${order.id}`}>
              Rejection reason (required only when rejecting)
            </label>

            <textarea
              id={`reason-${order.id}`}
              value={reviewReasons[order.id] || ""}
              onChange={(event) =>
                setReviewReasons((previous) => ({
                  ...previous,
                  [order.id]: event.target.value,
                }))
              }
              maxLength={500}
              placeholder="Explain why the proof is invalid..."
              rows={3}
            />

            <div className="toolbar">
              <Button
                disabled={Boolean(updating)}
                onClick={() => reviewPayment(order, "Approved")}
              >
                Approve Payment
              </Button>

              <Button
                variant="secondary"
                disabled={Boolean(updating)}
                onClick={() => reviewPayment(order, "Rejected")}
              >
                Reject Proof
              </Button>
            </div>
          </article>
        ))}
    </div>
  )}
</section>
    </>
  );
}
