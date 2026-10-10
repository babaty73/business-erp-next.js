"use client";
import { createContext, useContext, useState } from "react";
import { seedEmployees, seedDepartments, seedProducts, seedOrders, seedCustomers } from "@/lib/mock-data";
const ERPContext = createContext(null);
export function ERPProvider({ children }) {
  const [employees, setEmployees] = useState(seedEmployees);
  const [departments, setDepartments] = useState(seedDepartments);
  const [products, setProducts] = useState(seedProducts);
  const [orders, setOrders] = useState(seedOrders);
  const [customers, setCustomers] = useState(seedCustomers);
  const [darkMode, setDarkMode] = useState(false);
  return <ERPContext.Provider value={{ employees, setEmployees, departments, setDepartments, products, setProducts, orders, setOrders, customers, setCustomers, darkMode, setDarkMode }}>{children}</ERPContext.Provider>;
}
export function useERP() { const value = useContext(ERPContext); if (!value) throw new Error("useERP must be used inside ERPProvider"); return value; }
