
"use client";

import { useState } from "react";
import {
  Button,
  Badge,
  PageTitle,
  Stat,
  Search,
  Table,
  Modal,
  RecordForm,
  Person,
} from "@/components/ui";
import { money } from "@/lib/erp-utils";

export default function Customers({
  data,
  setData,
  loading,
  error: fetchError,
}) {
  const [q, setQ] = useState("");
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const rows = data.filter((x) =>
    `${x.name} ${x.email} ${x.id}`.toLowerCase().includes(q.toLowerCase())
  );

  async function save(values) {
    setSaving(true);
    setSaveError("");

    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to create customer.");
      }

      const customer = {
        ...result.data,
        id: String(result.data._id),
        orders: 0,
        spent: 0,
      };

      setData((old) => [customer, ...old]);
      setModal(false);
    } catch (error) {
      setSaveError(error.message || "Failed to create customer.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageTitle
        title="Customers"
        description="Maintain customer contacts and relationship history."
        action={
          <Button
            onClick={() => {
              setSaveError("");
              setModal(true);
            }}
          >
            ＋ Add customer
          </Button>
        }
      />

      {fetchError && <p role="alert">{fetchError}</p>}
      {saveError && !modal && <p role="alert">{saveError}</p>}

      <div className="stats stats-3">
        <Stat
          label="Total customers"
          value={data.length}
          change="+6 this month"
          icon="♧"
        />
        <Stat
          label="Active customers"
          value={data.filter((x) => x.status === "Active").length}
          change="+4.8%"
          icon="✓"
          tone="green"
        />
        <Stat
          label="Customer lifetime spend"
          value={money(data.reduce((s, x) => s + x.spent, 0))}
          change="+11.2%"
          icon="$"
          tone="violet"
        />
      </div>

      <section className="panel section-panel">
        <div className="toolbar">
          <Search
            value={q}
            onChange={setQ}
            placeholder="Search customers..."
          />
          <span className="muted">
            {loading ? "Loading customers..." : `${rows.length} customers`}
          </span>
        </div>

        <Table
          columns={[
            {
              key: "name",
              label: "CUSTOMER",
              render: (v, r) => <Person name={v} detail={r.email} purple />,
            },
            { key: "id", label: "CUSTOMER ID" },
            { key: "orders", label: "ORDERS" },
            {
              key: "spent",
              label: "TOTAL SPENT",
              render: (v) => <strong>{money(v)}</strong>,
            },
            {
              key: "status",
              label: "STATUS",
              render: (v) => <Badge>{v}</Badge>,
            },
          ]}
          rows={rows}
        />
      </section>

      {modal && (
        <Modal
          title="Add customer"
          onClose={() => {
            if (!saving) setModal(false);
          }}
        >
          {saveError && <p role="alert">{saveError}</p>}

          <RecordForm
            onCancel={() => {
              if (!saving) setModal(false);
            }}
            onSave={save}
            fields={[
              { name: "name", label: "Customer name", value: "" },
              {
                name: "email",
                label: "Email address",
                type: "email",
                value: "",
              },
              {
                name: "status",
                label: "Status",
                value: "Active",
                options: ["Active", "Inactive"],
              },
            ]}
          />

          {saving && <p>Saving customer...</p>}
        </Modal>
      )}
    </>
  );
}
