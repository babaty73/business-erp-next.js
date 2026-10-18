
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthForm({ mode }) {
  const router = useRouter();
  const isRegister = mode === "register";
  const isAdmin = mode === "admin";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = isRegister
        ? "/api/auth/register"
        : isAdmin
          ? "/api/auth/admin/login"
          : "/api/auth/login";

      const body = isRegister
        ? { name, email, password }
        : { email, password };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Authentication failed.");
      }

      router.replace(isAdmin ? "/dashboard" : "/my-orders");
      router.refresh();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const title = isRegister
    ? "Create your account"
    : isAdmin
      ? "Administrator login"
      : "Welcome back";

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-600">
            Business ERP
          </p>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="mt-2 text-sm text-gray-600">
            {isRegister
              ? "Register to browse products and manage your orders."
              : isAdmin
                ? "Sign in to manage the business."
                : "Sign in to view your orders and payments."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {isRegister && (
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium">
                Full name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                required
                minLength={2}
                maxLength={80}
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-blue-500"
                placeholder="Your full name"
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-blue-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete={isRegister ? "new-password" : "current-password"}
              required
              minLength={isRegister ? 8 : undefined}
              maxLength={72}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border px-3 py-2.5 outline-none focus:border-blue-500"
              placeholder={isRegister ? "At least 8 characters" : "Your password"}
            />
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Please wait..."
              : isRegister
                ? "Create account"
                : "Sign in"}
          </button>
        </form>

        {!isAdmin && (
          <p className="mt-6 text-center text-sm text-gray-600">
            {isRegister ? "Already have an account? " : "New customer? "}
            <a
              href={isRegister ? "/login" : "/register"}
              className="font-semibold text-blue-600 hover:underline"
            >
              {isRegister ? "Sign in" : "Create an account"}
            </a>
          </p>
        )}

        {isAdmin && (
          <p className="mt-6 text-center text-sm text-gray-500">
            Administrator access only.
          </p>
        )}
      </section>
    </main>
  );
}
