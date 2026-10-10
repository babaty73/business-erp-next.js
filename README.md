# BizManager ERP frontend

A modular Next.js App Router frontend with a responsive ERP dashboard and realistic mock data.

## Included pages
- Dashboard
- Employees
- Departments
- Inventory
- Orders
- Customers
- Finance
- Reports
- Settings (including dark mode)

## Install into your existing project
1. Extract this ZIP.
2. Back up your current `app` folder.
3. Copy the `app`, `components`, and `lib` folders into the root of your existing Next.js project. Keep your existing `package.json`.
4. Install the icon package: `npm install lucide-react`
5. Start the app: `npm run dev`
6. Open `http://localhost:3000` (the home route redirects to `/dashboard`).

## Structure
```text
app/
  dashboard/page.js
  employees/page.js
  departments/page.js
  inventory/page.js
  orders/page.js
  customers/page.js
  finance/page.js
  reports/page.js
  settings/page.js
  layout.js
  globals.css
components/
  layout/AppShell.js
  erp-context.js
  pages/*Page.js
  ui/index.js
lib/
  mock-data.js
  erp-utils.js
  navigation.js
```

## Notes
- Each page has its own route file and its own page component. Shared layout, UI controls, mock records, and formatting helpers are separated.
- Lucide icons are used for navigation, actions, and dashboard metrics.
- Data remains in React state and resets on a full refresh. There is no API, authentication, or database connection yet.
- Finance/report figures are illustrative and should not be used for real accounting.
- The dashboard export action currently navigates to Reports; printing uses the browser print dialog.
