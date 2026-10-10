export const pageRoutes = { Dashboard: "/dashboard", Employees: "/employees", Departments: "/departments", Inventory: "/inventory", Orders: "/orders", Customers: "/customers", Finance: "/finance", Reports: "/reports", Settings: "/settings" };
export function navigateToPage(router, label) { const route = pageRoutes[label]; if (route) router.push(route); }
