"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, Building2, Package, ShoppingCart, ContactRound, Wallet, FileText, Settings as SettingsIcon, Menu, X, Sun, Moon, Bell, ChevronDown, LogOut } from "lucide-react";
import { useERP } from "@/components/erp-context";
import { navigateToPage } from "@/lib/navigation";
const navigation = [
 { group: "OVERVIEW", items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }] },
 { group: "MANAGEMENT", items: [{ label: "Employees", href: "/employees", icon: Users }, { label: "Departments", href: "/departments", icon: Building2 }, { label: "Inventory", href: "/inventory", icon: Package }, { label: "Orders", href: "/orders", icon: ShoppingCart }, { label: "Customers", href: "/customers", icon: ContactRound }] },
 { group: "INSIGHTS", items: [{ label: "Finance", href: "/finance", icon: Wallet }, { label: "Reports", href: "/reports", icon: FileText }] },
 { group: "PREFERENCES", items: [{ label: "Settings", href: "/settings", icon: SettingsIcon }] },
];
const pageNames = Object.fromEntries(navigation.flatMap(group => group.items.map(item => [item.href, item.label])));
export default function AppShell({ children }) {
 const pathname = usePathname(); const router = useRouter(); const [mobileNav, setMobileNav] = useState(false);
 const { darkMode, setDarkMode, products, user, loadingUser, logout } = useERP(); const page = pageNames[pathname] || "Dashboard";
 const lowStockWarning = products.some(product => Number(product.stock) <= 10);
 const userInitials = user?.name ? user.name.split(" ").slice(0, 2).map(part => part[0]).join("").toUpperCase() : "U";
 const userRoleLabel = user?.role === "admin" ? "Admin" : user?.role === "customer" ? "Customer" : "Guest";
 async function handleLogout() { await logout(); router.push("/login"); }
 return <div className={`app-shell ${darkMode ? "dark-theme" : ""}`}>
  <aside className={`sidebar ${mobileNav ? "open" : ""}`}>
   <div className="brand"><span className="brand-mark">B</span><strong>bizmanager<span>.</span></strong><button className="mobile-close icon-btn" onClick={() => setMobileNav(false)} aria-label="Close navigation"><X size={17}/></button></div>
   {//<div className="workspace"><span className="workspace-mark">B</span><span><strong>BizManager Inc.</strong><small>Business workspace</small></span><ChevronDown size={15}/></div>
}   <nav className="navigation">{navigation.map(group => <div className="nav-group" key={group.group}><p>{group.group}</p>{group.items.map(({label, href, icon: Icon}) => <Link key={href} href={href} onClick={() => setMobileNav(false)} className={`nav-item ${pathname === href ? "active" : ""}`}><Icon className="nav-icon" size={17} strokeWidth={1.9}/><span>{label}</span>{label === "Inventory" && lowStockWarning && <i/>}</Link>)}</div>)}</nav>
  </aside>
  {mobileNav && <button className="scrim" aria-label="Close menu" onClick={() => setMobileNav(false)}/>}
  <div className="main-shell"><header className="topbar"><div className="crumbs"><button className="mobile-menu icon-btn" aria-label="Open menu" onClick={() => setMobileNav(true)}><Menu size={18}/></button><span>Workspace</span><span>/</span><strong>{page}</strong></div><div className="top-actions"><span className="today">{new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span><button className="icon-btn" onClick={() => setDarkMode(!darkMode)} aria-label="Toggle dark mode">{darkMode ? <Sun size={17}/> : <Moon size={17}/>}</button><button className="notification icon-btn" aria-label="Notifications"><Bell size={17}/><i/></button>
   {!loadingUser && <div className="top-profile" style={{ display: "flex", alignItems: "center", gap: 8 }}><span className="avatar">{userInitials}</span><span><strong>{user?.name || "Guest User"}</strong><small>{userRoleLabel}</small></span><ChevronDown size={14}/><button type="button" className="icon-btn" aria-label="Logout" onClick={handleLogout} title="Logout"><LogOut size={16}/></button></div>}
  </div></header><main className="main-content">{children}<footer className="footer"><span>© 2026 BizManager ERP</span><span>Connected to backend APIs</span></footer></main></div>
 </div>;
}
