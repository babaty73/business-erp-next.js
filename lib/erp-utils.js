export const money = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(Number(n) || 0);
export const initials = (name = "") => name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();
export const dateLabel = (s) => s ? new Date(`${s}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";
export const statusOf = (p) => p.stock === 0 ? "Out of stock" : p.stock <= 10 ? "Low stock" : "In stock";
