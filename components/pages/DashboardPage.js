"use client";

import {
  Button,
  Badge,
  PageTitle,
  Stat,
  Table,
} from "@/components/ui";
import { money, dateLabel } from "@/lib/erp-utils";

export default function Dashboard({
  reports,
  orders = [],
  loading = false,
  error = "",
  setPage,
}) {
  const revenue = reports?.sales?.revenue ?? 0;

  const orderStatuses = reports?.orders?.byStatus ?? {};
  const pending =
    (orderStatuses.Pending ?? 0) +
    (orderStatuses.Processing ?? 0);

  const employees = reports?.employees?.total ?? 0;
  const inventoryCount = reports?.inventory?.totalProducts ?? 0;

  const lowStockProducts =
    reports?.inventory?.lowStockProducts ?? [];

  const monthlyRevenue = reports?.monthlyRevenue ?? [];

  const maxRevenue = Math.max(
    1,
    ...monthlyRevenue.map((item) => Number(item.revenue) || 0)
  );

  return (
    <>
      <PageTitle
        title="Dashboard"
        description="Here’s what’s happening with your business today."
        action={
          <Button
            variant="secondary"
            onClick={() => setPage("Reports")}
          >
            ↓ Export overview
          </Button>
        }
      />

      {error && <p role="alert">{error}</p>}

      {loading ? (
        <p>Loading dashboard data...</p>
      ) : (
        <>
          <div className="stats">
            <Stat
              label="Total employees"
              value={employees}
              icon="♙"
            />

            <Stat
              label="Inventory items"
              value={inventoryCount}
              icon="▣"
              tone="violet"
            />

            <Stat
              label="Orders to process"
              value={pending}
              icon="⇄"
              tone="amber"
            />

            <Stat
              label="Recorded revenue"
              value={money(revenue)}
              icon="$"
              tone="green"
            />
          </div>

          <div className="dashboard-grid">
            <section className="panel chart-panel">
              <div className="panel-heading">
                <div>
                  <h2>Revenue overview</h2>
                  <p>Paid orders · last 12 months</p>
                </div>

                <span>Monthly</span>
              </div>

              <div className="chart-total">
                <strong>{money(revenue)}</strong>
              </div>

              <div className="bar-chart">
                {monthlyRevenue.map((item, index) => {
                  const amount = Number(item.revenue) || 0;
                  const height =
                    amount > 0
                      ? Math.max(
                          4,
                          Math.round((amount / maxRevenue) * 100)
                        )
                      : 0;

                  return (
                    <div className="bar-column" key={item.month + index}>
                      <div
                        className="bar"
                        style={{ height: `${height}%` }}
                        title={`${item.month}: ${money(amount)}`}
                      />

                      <small>{item.month}</small>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="panel">
              <div className="panel-heading">
                <div>
                  <h2>Inventory alerts</h2>
                  <p>Items with stock at or below 5</p>
                </div>

                <button
                  className="link"
                  onClick={() => setPage("Inventory")}
                >
                  View all
                </button>
              </div>

              <div className="alerts">
                {lowStockProducts.length > 0 ? (
                  lowStockProducts.slice(0, 4).map((product) => (
                    <div
                      className="alert-row"
                      key={String(product._id)}
                    >
                      <span className="product-icon">▣</span>

                      <span className="alert-name">
                        <strong>{product.name}</strong>
                        <small>{product.sku}</small>
                      </span>

                      <Badge>
                        {product.stock <= 0
                          ? "Out of stock"
                          : "Low stock"}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p>No low-stock items.</p>
                )}
              </div>
            </section>
          </div>

          <section className="panel section-panel">
            <div className="panel-heading">
              <div>
                <h2>Recent orders</h2>
                <p>Latest customer transactions</p>
              </div>

              <button
                className="link"
                onClick={() => setPage("Orders")}
              >
                View all orders →
              </button>
            </div>

            <Table
              columns={[
                {
                  key: "id",
                  label: "ORDER ID",
                  render: (value) => (
                    <strong className="primary-text">{value}</strong>
                  ),
                },
                {
                  key: "customer",
                  label: "CUSTOMER",
                },
                {
                  key: "date",
                  label: "DATE",
                  render: dateLabel,
                },
                {
                  key: "amount",
                  label: "AMOUNT",
                  render: (value) => <strong>{money(value)}</strong>,
                },
                {
                  key: "status",
                  label: "STATUS",
                  render: (value) => <Badge>{value}</Badge>,
                },
              ]}
              rows={orders.slice(0, 4)}
            />
          </section>
        </>
      )}
    </>
  );
}