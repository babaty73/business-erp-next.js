"use client";
import { createContext, useContext, useState } from "react";
const ERPContext = createContext(null);
export function ERPProvider({ children }) {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  return <ERPContext.Provider value={{ employees, setEmployees, departments, setDepartments, products, setProducts, orders, setOrders, customers, setCustomers, darkMode, setDarkMode }}>{children}</ERPContext.Provider>;
}
export function useERP() { const value = useContext(ERPContext); if (!value) throw new Error("useERP must be used inside ERPProvider"); return value; }
