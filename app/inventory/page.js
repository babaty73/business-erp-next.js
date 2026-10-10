"use client";
import InventoryPage from "@/components/pages/InventoryPage";
import { useERP } from "@/components/erp-context";

export default function Page() {
 const { products, setProducts } = useERP();
 return <InventoryPage data={products} setData={setProducts} />;
}
