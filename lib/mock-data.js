export const seedEmployees = [
  { id: "EMP-1001", name: "Maya Johnson", email: "maya@bizmanager.example", department: "Human Resources", role: "HR Manager", status: "Active" },
  { id: "EMP-1002", name: "Daniel Kim", email: "daniel@bizmanager.example", department: "Engineering", role: "Software Engineer", status: "Active" },
  { id: "EMP-1003", name: "Sara Ahmed", email: "sara@bizmanager.example", department: "Finance", role: "Accountant", status: "On leave" },
  { id: "EMP-1004", name: "Noah Williams", email: "noah@bizmanager.example", department: "Sales", role: "Sales Executive", status: "Active" },
  { id: "EMP-1005", name: "Lily Chen", email: "lily@bizmanager.example", department: "Operations", role: "Operations Lead", status: "Inactive" },
];
export const seedDepartments = [
  { id: "DEP-01", name: "Engineering", manager: "Daniel Kim", employees: 28, budget: 240000, status: "Active" },
  { id: "DEP-02", name: "Human Resources", manager: "Maya Johnson", employees: 12, budget: 95000, status: "Active" },
  { id: "DEP-03", name: "Finance", manager: "Sara Ahmed", employees: 9, budget: 110000, status: "Active" },
  { id: "DEP-04", name: "Sales", manager: "Noah Williams", employees: 21, budget: 180000, status: "Active" },
  { id: "DEP-05", name: "Operations", manager: "Lily Chen", employees: 17, budget: 145000, status: "Active" },
];
export const seedProducts = [
  { id: "PRD-001", name: "Wireless Keyboard", category: "Electronics", sku: "EL-KB-001", stock: 124, price: 49.99 },
  { id: "PRD-002", name: "USB-C Hub", category: "Accessories", sku: "AC-HB-014", stock: 8, price: 34.5 },
  { id: "PRD-003", name: "Office Chair", category: "Furniture", sku: "FN-CH-028", stock: 42, price: 189 },
  { id: "PRD-004", name: "27-inch Monitor", category: "Electronics", sku: "EL-MN-027", stock: 5, price: 279.99 },
  { id: "PRD-005", name: "Notebook Set", category: "Stationery", sku: "ST-NB-009", stock: 230, price: 12.75 },
  { id: "PRD-006", name: "Desk Lamp", category: "Furniture", sku: "FN-LP-011", stock: 0, price: 39.99 },
];
export const seedOrders = [
  { id: "ORD-2048", customer: "Northstar Studio", date: "2026-10-08", amount: 2490, status: "Processing", payment: "Paid" },
  { id: "ORD-2047", customer: "Blue Peak Ltd.", date: "2026-10-08", amount: 875.5, status: "Shipped", payment: "Paid" },
  { id: "ORD-2046", customer: "Evergreen Co.", date: "2026-10-07", amount: 1240, status: "Pending", payment: "Pending" },
  { id: "ORD-2045", customer: "Summit Works", date: "2026-10-06", amount: 3680, status: "Delivered", payment: "Paid" },
  { id: "ORD-2044", customer: "Brightline Agency", date: "2026-10-05", amount: 415, status: "Cancelled", payment: "Refunded" },
];
export const seedCustomers = [
  { id: "CUS-001", name: "Northstar Studio", email: "hello@northstar.example", orders: 14, spent: 18450, status: "Active" },
  { id: "CUS-002", name: "Blue Peak Ltd.", email: "accounts@bluepeak.example", orders: 9, spent: 9720, status: "Active" },
  { id: "CUS-003", name: "Evergreen Co.", email: "team@evergreen.example", orders: 6, spent: 6850, status: "Active" },
  { id: "CUS-004", name: "Summit Works", email: "finance@summit.example", orders: 18, spent: 26300, status: "Active" },
  { id: "CUS-005", name: "Brightline Agency", email: "admin@brightline.example", orders: 3, spent: 1520, status: "Inactive" },
];
