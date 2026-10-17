
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

export default function Employees({
  data = [],
  setData,
  departments = [],
  loading = false,
  error: fetchError = "",
}) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("All statuses");
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const rows = data.filter(
    (employee) =>
      `${employee.name} ${employee.email} ${employee.department} ${employee.id}`
        .toLowerCase()
        .includes(q.toLowerCase()) &&
      (filter === "All statuses" || employee.status === filter)
  );

  function openAdd() {
    setEdit(null);
    setSaveError("");
    setModal(true);
  }

  function openEdit(employee) {
    setEdit(employee);
    setSaveError("");
    setModal(true);
  }

  function closeModal() {
    if (saving) return;
    setModal(false);
    setEdit(null);
    setSaveError("");
  }

  async function save(values) {
    setSaving(true);
    setSaveError("");

    try {
      const url = edit
        ? `/api/employees/${edit.id}`
        : "/api/employees";

      const response = await fetch(url, {
        method: edit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to save employee.");
      }

      const employee = {
        ...result.data,
        id: String(result.data._id),
        department: result.data.department || "",
        departmentId: values.department,
      };

      setData((old) =>
        edit
          ? old.map((item) =>
              item.id === edit.id ? employee : item
            )
          : [employee, ...old]
      );

      setModal(false);
      setEdit(null);
    } catch (error) {
      setSaveError(error.message || "Failed to save employee.");
    } finally {
      setSaving(false);
    }
  }

  async function removeEmployee(employee) {
    const confirmed = window.confirm(
      `Delete ${employee.name}? This action cannot be undone.`
    );

    if (!confirmed) return;

    setSaveError("");

    try {
      const response = await fetch(
        `/api/employees/${employee.id}`,
        { method: "DELETE" }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete employee.");
      }

      setData((old) =>
        old.filter((item) => item.id !== employee.id)
      );
    } catch (error) {
      setSaveError(error.message || "Failed to delete employee.");
    }
  }

  return (
    <>
      <PageTitle
        title="Employees"
        description="Manage employee records, roles, and employment status."
        action={<Button onClick={openAdd}>＋ Add employee</Button>}
      />

      {fetchError && <p role="alert">{fetchError}</p>}
      {saveError && !modal && <p role="alert">{saveError}</p>}

      <div className="stats stats-3">
        <Stat label="Total employees" value={data.length} icon="♙" />
        <Stat
          label="Active employees"
          value={data.filter((x) => x.status === "Active").length}
          icon="✓"
          tone="green"
        />
        <Stat
          label="On leave"
          value={data.filter((x) => x.status === "On leave").length}
          icon="◷"
          tone="amber"
        />
      </div>

      <section className="panel section-panel">
        <div className="toolbar">
          <Search
            value={q}
            onChange={setQ}
            placeholder="Search employees..."
          />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option>All statuses</option>
            <option>Active</option>
            <option>On leave</option>
            <option>Inactive</option>
          </select>
        </div>

        <Table
          columns={[
            {
              key: "name",
              label: "EMPLOYEE",
              render: (value, employee) => (
                <Person name={value} detail={employee.email} />
              ),
            },
            { key: "id", label: "EMPLOYEE ID" },
            { key: "department", label: "DEPARTMENT" },
            { key: "role", label: "ROLE" },
            {
              key: "status",
              label: "STATUS",
              render: (value) => <Badge>{value}</Badge>,
            },
            {
              key: "action",
              label: "ACTIONS",
              render: (_, employee) => (
                <>
                  <button
                    className="link"
                    onClick={() => openEdit(employee)}
                  >
                    Edit
                  </button>
                  {" · "}
                  <button
                    className="link"
                    onClick={() => removeEmployee(employee)}
                  >
                    Delete
                  </button>
                </>
              ),
            },
          ]}
          rows={rows}
        />

        <div className="table-footer">
          {loading
            ? "Loading employees..."
            : `Showing ${rows.length} of ${data.length} employees`}
        </div>
      </section>

      {modal && (
        <Modal
          title={edit ? "Edit employee" : "Add employee"}
          onClose={closeModal}
        >
          {saveError && <p role="alert">{saveError}</p>}

          <RecordForm
            onCancel={closeModal}
            onSave={save}
            fields={[
              {
                name: "name",
                label: "Full name",
                value: edit?.name || "",
              },
              {
                name: "email",
                label: "Email",
                type: "email",
                value: edit?.email || "",
              },
              {
                name: "department",
                label: "Department",
                value:
                  edit?.departmentId ||
                  departments.find(
                    (department) =>
                      department.name === edit?.department
                  )?._id ||
                  "",
                options: departments.map((department) => ({
                  label: department.name,
                  value: String(department._id),
                })),
              },
              {
                name: "role",
                label: "Job title",
                value: edit?.role || "",
              },
              {
                name: "status",
                label: "Status",
                value: edit?.status || "Active",
                options: ["Active", "On leave", "Inactive"],
              },
            ]}
          />

          {saving && <p>Saving employee...</p>}
        </Modal>
      )}
    </>
  );
}
