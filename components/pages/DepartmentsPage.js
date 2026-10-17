
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
} from "@/components/ui";
import { money } from "@/lib/erp-utils";

export default function DepartmentsPage({
  data,
  setData,
  employees,
  loading = false,
  error = "",
}) {
  const [q, setQ] = useState("");
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const rows = data.filter((department) =>
    `${department.name} ${department.manager || ""} ${department.id}`
      .toLowerCase()
      .includes(q.toLowerCase())
  );

  const managerOptions = [
    { label: "No manager", value: "" },
    ...employees.map((employee) => ({
      label: employee.name,
      value: String(employee._id || employee.id),
    })),
  ];

  const closeModal = () => {
    setModal(false);
    setEdit(null);
    setSaveError("");
  };

  const save = async (values) => {
    setSaving(true);
    setSaveError("");

    try {
      const payload = {
        name: values.name.trim(),
        manager: values.manager || null,
        budget: Number(values.budget),
        status: values.status,
      };

      const response = await fetch(
        edit ? `/api/departments/${edit.id}` : "/api/departments",
        {
          method: edit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to save department."
        );
      }

      const saved = {
        ...result.data,
        id: String(result.data._id),
        managerId: result.data.managerId || "",
      };

      setData((old) =>
        edit
          ? old.map((department) =>
              department.id === edit.id
                ? { ...department, ...saved }
                : department
            )
          : [saved, ...old]
      );

      closeModal();
    } catch (err) {
      setSaveError(err.message || "Failed to save department.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageTitle
        title="Departments"
        description="Organize teams, department leads, and budgets."
        action={
          <Button
            onClick={() => {
              setEdit(null);
              setSaveError("");
              setModal(true);
            }}
          >
            ＋ Add department
          </Button>
        }
      />

      <div className="stats stats-3">
        <Stat
          label="Departments"
          value={data.length}
          change="Current records"
          icon="▤"
        />
        <Stat
          label="Employees listed"
          value={employees.length}
          change="Across all teams"
          icon="♙"
          tone="violet"
        />
        <Stat
          label="Planned budgets"
          value={money(
            data.reduce((sum, department) => sum + Number(department.budget || 0), 0)
          )}
          change="Current allocation"
          icon="$"
          tone="green"
        />
      </div>

      <section className="panel section-panel">
        <div className="toolbar">
          <Search
            value={q}
            onChange={setQ}
            placeholder="Search departments..."
          />
          <span className="muted">{rows.length} departments</span>
        </div>

        {loading && <p className="muted">Loading departments...</p>}

        {error && <p role="alert">{error}</p>}

        <Table
          columns={[
            {
              key: "name",
              label: "DEPARTMENT",
              render: (value, row) => (
                <div className="department">
                  <span className="product-icon">▤</span>
                  <span>
                    <strong>{value}</strong>
                    <small>{row.id}</small>
                  </span>
                </div>
              ),
            },
            { key: "manager", label: "DEPARTMENT LEAD" },
            { key: "employees", label: "EMPLOYEES" },
            {
              key: "budget",
              label: "BUDGET",
              render: (value) => money(value || 0),
            },
            {
              key: "status",
              label: "STATUS",
              render: (value) => <Badge>{value}</Badge>,
            },
            {
              key: "action",
              label: "",
              render: (_, row) => (
                <button
                  className="link"
                  onClick={() => {
                    setEdit(row);
                    setSaveError("");
                    setModal(true);
                  }}
                >
                  Edit
                </button>
              ),
            },
          ]}
          rows={rows}
        />
      </section>

      {modal && (
        <Modal
          title={edit ? "Edit department" : "Add department"}
          onClose={closeModal}
        >
          <RecordForm
            onCancel={closeModal}
            onSave={save}
            fields={[
              {
                name: "name",
                label: "Department name",
                value: edit?.name || "",
              },
              {
                name: "manager",
                label: "Department lead",
                value: edit?.managerId || "",
                options: managerOptions,
                required: false,
              },
              {
                name: "budget",
                label: "Annual budget ($)",
                type: "number",
                value: edit?.budget ?? 0,
              },
              {
                name: "status",
                label: "Status",
                value: edit?.status || "Active",
                options: ["Active", "Inactive"],
              },
            ]}
          />

          {saveError && (
            <p role="alert" style={{ padding: "0 20px 16px" }}>
              {saveError}
            </p>
          )}

          {saving && (
            <p className="muted" style={{ padding: "0 20px 16px" }}>
              Saving department...
            </p>
          )}
        </Modal>
      )}
    </>
  );
}
