import "./globals.css";
import { ERPProvider } from "@/components/erp-context";
import AppShell from "@/components/layout/AppShell";
export const metadata = { title: "BizManager | Business ERP", description: "Business management dashboard" };
export default function RootLayout({ children }) { return <html lang="en"><body><ERPProvider><AppShell>{children}</AppShell></ERPProvider></body></html>; }
