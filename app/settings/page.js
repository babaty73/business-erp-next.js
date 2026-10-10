"use client";
import SettingsPage from "@/components/pages/SettingsPage";
import { useERP } from "@/components/erp-context";

export default function Page() {
 const { darkMode, setDarkMode } = useERP();
 return <SettingsPage darkMode={darkMode} setDarkMode={setDarkMode} />;
}
