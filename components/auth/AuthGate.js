"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useERP } from "@/components/erp-context";

export default function AuthGate({
  allowedRoles,
  redirectTo = "/login",
  children,
}) {
  const router = useRouter();
  const { user, loadingUser } = useERP();

  useEffect(() => {
    if (loadingUser) return;

    if (!user) {
      router.replace(redirectTo);
      return;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.replace(user.role === "admin" ? "/dashboard" : "/my-orders");
    }
  }, [allowedRoles, loadingUser, redirectTo, router, user]);

  if (loadingUser) {
    return <main className="p-6">Loading your workspace...</main>;
  }

  if (!user) {
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return null;
  }

  return children;
}
