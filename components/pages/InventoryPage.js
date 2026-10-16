
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
import { money, statusOf } from "@/lib/erp-utils";

export default function Inventory({
  data,
  setData,
  loading,
  error: fetchError,
}) {
  const [q, setQ] = useState("");
  const [productToDelete, setProductToDelete] = useState(null);
  const [category, setCategory] = useState("All categories");
  const [modal, setModal] = useState(false);
  const [edit, setEdit] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const rows = data.filter(
    (x) =>
      `${x.name} ${x.sku} ${x.category}`
        .toLowerCase()
        .includes(q.toLowerCase()) &&
      (category === "All categories" || x.category === category)
  );

  async function save(values) {
    setSaving(true);
    setSaveError("");

    try {
      const productData = {
        name: values.name.trim(),
        sku: values.sku.trim(),
        category: values.category,
        stock: Number(values.stock),
        price: Number(values.price),
      };

      const response = await fetch(
        edit ? `/api/inventory/${edit.id}` : "/api/inventory",
        {
          method: edit ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(productData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to save product.");
      }

      const product = {
        ...result.data,
        id: String(result.data._id),
      };

      setData((old) =>
        edit
          ? old.map((item) => (item.id === edit.id ? product : item))
          : [product, ...old]
      );

      setModal(false);
      setEdit(null);
    } catch (error) {
      setSaveError(error.message || "Failed to save product.");
    } finally {
      setSaving(false);
    }
  }

  
async function deleteProduct(product) {
  setDeletingId(product.id);
  setDeleteError("");

  try {
    const response = await fetch(`/api/inventory/${product.id}`, {
      method: "DELETE",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to delete product.");
    }

    setData((old) =>
      old.filter((item) => item.id !== product.id)
    );

    setProductToDelete(null);
  } catch (error) {
    setDeleteError(error.message || "Failed to delete product.");
  } finally {
    setDeletingId(null);
  }
}


  function openAddModal() {
    setEdit(null);
    setSaveError("");
    setModal(true);
  }

  function openEditModal(product) {
    setEdit(product);
    setSaveError("");
    setModal(true);
  }

  return (
    <>
      <PageTitle
        title="Inventory"
        description="Track products, stock availability, and pricing."
        action={<Button onClick={openAddModal}>＋ Add product</Button>}
      />

      {fetchError && <p role="alert">{fetchError}</p>}
      {deleteError && <p role="alert">{deleteError}</p>}

      <div className="stats stats-3">
        <Stat
          label="Total products"
          value={data.length}
          change="+4 this month"
          icon="▣"
        />
        <Stat
          label="Low stock"
          value={data.filter((p) => p.stock > 0 && p.stock <= 10).length}
          change="Needs review"
          icon="⚠"
          tone="amber"
        />
        <Stat
          label="Out of stock"
          value={data.filter((p) => p.stock === 0).length}
          change="Restock needed"
          icon="!"
          tone="red"
        />
      </div>

      <section className="panel section-panel">
        <div className="toolbar">
          <Search
            value={q}
            onChange={setQ}
            placeholder="Search products or SKU..."
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>All categories</option>
            {[...new Set(data.map((p) => p.category))].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>

          <span className="muted">
            {loading ? "Loading inventory..." : `${rows.length} products`}
          </span>
        </div>

        <Table
          columns={[
            {
              key: "name",
              label: "PRODUCT",
              render: (v, r) => (
                <div className="department">
                  <span className="product-icon">▣</span>
                  <span>
                    <strong>{v}</strong>
                    <small>{r.sku}</small>
                  </span>
                </div>
              ),
            },
            { key: "category", label: "CATEGORY" },
            {
              key: "stock",
              label: "STOCK",
              render: (v) => <strong>{v} units</strong>,
            },
            { key: "price", label: "UNIT PRICE", render: money },
            {
              key: "status",
              label: "STATUS",
              render: (_, r) => <Badge>{statusOf(r)}</Badge>,
            },
            {
              key: "action",
              label: "",
              render: (_, product) => (
                <div className="flex items-center gap-3">
                  <button
                    className="link"
                    onClick={() => openEditModal(product)}
                  >
                    Edit
                  </button>

                  <button
                    className="link"
                    onClick={() => {
                      setDeleteError("");
                      setProductToDelete(product);
                    }}
                  >
                    Delete
                  </button>
                </div>
              ),
            },
          ]}
          rows={rows}
        />
      </section>

      
      {modal && (
        <Modal
          title={edit ? "Edit product" : "Add product"}
          onClose={() => {
            if (!saving) {
              setModal(false);
              setEdit(null);
            }
          }}
        >
          {saveError && <p role="alert">{saveError}</p>}

          <RecordForm
            onCancel={() => {
              if (!saving) {
                setModal(false);
                setEdit(null);
              }
            }}
            onSave={save}
            fields={[
              { name: "name", label: "Product name", value: edit?.name || "" },
              { name: "sku", label: "SKU", value: edit?.sku || "" },
              {
                name: "category",
                label: "Category",
                value: edit?.category || "Electronics",
                options: ["Electronics", "Accessories", "Furniture", "Stationery"],
              },
              { name: "stock", label: "Stock quantity", type: "number", value: edit?.stock ?? 0 },
              { name: "price", label: "Unit price ($)", type: "number", value: edit?.price ?? 0 },
            ]}
          />

          {saving && <p>Saving product...</p>}
        </Modal>
      )}

      {productToDelete && (
        <Modal
          title="Delete product?"
          onClose={() => {
            if (deletingId === null) {
              setProductToDelete(null);
            }
          }}
        >
          <p>
            Are you sure you want to delete{" "}
            <strong>{productToDelete.name}</strong>?
          </p>

          <p className="muted">This action cannot be undone.</p>

          {deleteError && <p role="alert">{deleteError}</p>}

          <div className="flex justify-end gap-3 mt-4">
            <Button
              onClick={() => setProductToDelete(null)}
              disabled={deletingId !== null}
            >
              Cancel
            </Button>

            <Button
              onClick={() => deleteProduct(productToDelete)}
              disabled={deletingId !== null}
            >
              {deletingId !== null ? "Deleting..." : "Delete product"}
            </Button>
          </div>
        </Modal>
      )}

    </>
  );
}
