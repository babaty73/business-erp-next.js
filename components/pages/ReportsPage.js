"use client";

import { Button, PageTitle } from "@/components/ui";
import { money } from "@/lib/erp-utils";
import {
  Users,
  Package,
  ShoppingCart,
  ContactRound,
} from "lucide-react";

export default function Reports({ reports }) {
  const lowStockCount = Array.isArray(reports.inventory.lowStockProducts)
    ? reports.inventory.lowStockProducts.length
    : reports.inventory.lowStockProducts;

  const reportCards = [
    {
      Icon: Users,
      title: "Employee directory",
      description: "Employee records and department assignments",
      count: `${reports.employees.total} employees`,
    },
    {
      Icon: Package,
      title: "Inventory status",
      description: "Stock quantities and low-stock products",
      count: `${lowStockCount} low-stock alerts`,
    },
    {
      Icon: ShoppingCart,
      title: "Order summary",
      description: "Order status and payment records",
      count: `${reports.orders.total} orders`,
    },
    {
      Icon: ContactRound,
      title: "Customer overview",
      description: "Customer records stored in the database",
      count: `${reports.customers.total} customers`,
    },
  ];

  return (
    <>
      <PageTitle
        title="Reports"
        description="Review business summaries and print reports."
        action={
          <Button variant="secondary" onClick={() => window.print()}>
            ↓ Print this page
          </Button>
        }
      />

      <div className="report-grid">
        {reportCards.map(({ Icon, title, description, count }) => (
          <article className="panel report-card" key={title}>
            <span className="report-icon">
              <Icon size={20} strokeWidth={1.9} />
            </span>

            <h2>{title}</h2>
            <p>{description}</p>

            <div className="report-footer">
              <span>{count}</span>
              <span>↗</span>
            </div>
          </article>
        ))}
      </div>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Business summary</h2>
            <p>Calculated from current database records</p>
          </div>
        </div>

        <ul className="notes-list">
          <li>
            Total revenue from paid orders:{" "}
            <strong>{money(reports.sales.revenue)}</strong>
          </li>
          <li>
            Paid orders: <strong>{reports.sales.paidOrders}</strong>
          </li>
          <li>
            Total inventory products:{" "}
            <strong>{reports.inventory.totalProducts}</strong>
          </li>
          <li>
            Total departments:{" "}
            <strong>{reports.departments.length}</strong>
          </li>
          <li>
            Low-stock threshold:{" "}
            <strong>{reports.inventory.lowStockThreshold} units</strong>
          </li>
        </ul>
      </section>
    </>
  );
}