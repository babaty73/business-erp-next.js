"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, Building2, Package, ShoppingCart, ContactRound, Wallet, FileText, Settings as SettingsIcon, Menu, X, Sun, Moon, Bell, ChevronDown, CircleHelp, ArrowUpRight } from "lucide-react";
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
 const { darkMode, setDarkMode, products } = useERP(); const page = pageNames[pathname] || "Dashboard";
 return <div className={`app-shell ${darkMode ? "dark-theme" : ""}`}>
  <aside className={`sidebar ${mobileNav ? "open" : ""}`}>
   <div className="brand"><span className="brand-mark">B</span><strong>bizmanager<span>.</span></strong><button className="mobile-close icon-btn" onClick={() => setMobileNav(false)} aria-label="Close navigation"><X size={17}/></button></div>
   <div className="workspace"><span className="workspace-mark">B</span><span><strong>BizManager Inc.</strong><small>Business workspace</small></span><ChevronDown size={15}/></div>
   <nav className="navigation">{navigation.map(group => <div className="nav-group" key={group.group}><p>{group.group}</p>{group.items.map(({label, href, icon: Icon}) => <Link key={href} href={href} onClick={() => setMobileNav(false)} className={`nav-item ${pathname === href ? "active" : ""}`}><Icon className="nav-icon" size={17} strokeWidth={1.9}/><span>{label}</span>{label === "Inventory" && products.some(p => p.stock <= 10) && <i/>}</Link>)}</div>)}</nav>
   <div className="sidebar-bottom"><div className="help-card"><span className="help-mark"><CircleHelp size={16}/></span><strong>Need a hand?</strong><p>Check workspace reports to review the sample data.</p><button onClick={() => navigateToPage(router, "Reports")}>View reports <ArrowUpRight size={13}/></button></div><button className="sidebar-profile" onClick={() => navigateToPage(router, "Settings")}><span className="avatar">IE</span><span><strong>Imran Endris</strong><small>Administrator</small></span><span className="profile-more">•••</span></button></div>
  </aside>
  {mobileNav && <button className="scrim" aria-label="Close menu" onClick={() => setMobileNav(false)}/>}
  <div className="main-shell"><header className="topbar"><div className="crumbs"><button className="mobile-menu icon-btn" aria-label="Open menu" onClick={() => setMobileNav(true)}><Menu size={18}/></button><span>Workspace</span><span>/</span><strong>{page}</strong></div><div className="top-actions"><span className="today">{new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span><button className="icon-btn" onClick={() => setDarkMode(!darkMode)} aria-label="Toggle dark mode">{darkMode ? <Sun size={17}/> : <Moon size={17}/>}</button><button className="notification icon-btn" aria-label="Notifications"><Bell size={17}/><i/></button><button className="top-profile" onClick={() => navigateToPage(router, "Settings")}><span className="avatar">IE</span><span><strong>Imran Endris</strong><small>Admin</small></span><ChevronDown size={14}/></button></div></header><main className="main-content">{children}<footer className="footer"><span>© 2026 BizManager ERP</span><span>Frontend prototype · Sample data</span></footer></main></div>
 </div>;
}
