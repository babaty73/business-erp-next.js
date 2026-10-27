"use client";
import { createContext, useContext, useEffect, useState } from "react";
const ERPContext = createContext(null);
export function ERPProvider({ children }) {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  useEffect(() => {
    let active = true;
    async function loadUser() {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
        });
        if (!response.ok) {
          if (active) {
            setUser(null);
          }
          return;
        }
        const result = await response.json();
        if (active) {
          setUser(result?.data ?? null);
        }
      } catch {
        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setLoadingUser(false);
        }
      }
    }
    loadUser();
    return () => {
      active = false;
    };
  }, []);
  async function logout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } catch {
      // Ignore logout API failures and clear session locally anyway.
    } finally {
      setUser(null);
    }
  }
  return <ERPContext.Provider value={{ employees, setEmployees, departments, setDepartments, products, setProducts, orders, setOrders, customers, setCustomers, darkMode, setDarkMode, user, setUser, loadingUser, logout }}>{children}</ERPContext.Provider>;
}
export function useERP() { const value = useContext(ERPContext); if (!value) throw new Error("useERP must be used inside ERPProvider"); return value; }
