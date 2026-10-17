"use client";

import { useEffect, useState } from "react";
import ReportsPage from "@/components/pages/ReportsPage";

export default function Page() {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchReports() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/reports");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to load reports.");
        }

        if (!result.data) {
          throw new Error("The reports API returned invalid data.");
        }

        if (!cancelled) setReports(result.data);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load reports.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchReports();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <p>Loading reports...</p>;

  if (error) {
    return (
      <section className="panel section-panel">
        <p role="alert" className="form-error">{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </section>
    );
  }

  return <ReportsPage reports={reports} />;
}