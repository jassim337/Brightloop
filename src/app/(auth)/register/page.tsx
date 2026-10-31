"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { passwordChecks } from "@/lib/validators/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const set =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm({ ...form, [k]: e.target.value });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setMessage("");
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await res.json();

    if (!json.ok) {
      setErrors(json.error?.fields ?? {});
      setMessage(json.error?.message ?? "Something went wrong");
      setLoading(false);
      return;
    }

    const login = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });
    setLoading(false);
    if (login?.error) {
      router.push("/login");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  const input =
    "w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-indigo-500";
  const label = "mb-1 block text-sm text-slate-300";
  const err = "mt-1 text-xs text-red-400";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-4 rounded-xl border border-slate-800 bg-slate-900 p-6"
      >
        <h1 className="text-2xl font-semibold">Create account</h1>

        <div>
          <label htmlFor="name" className={label}>
            Name
          </label>
          <input id="name" required value={form.name} onChange={set("name")} className={input} />
          {errors.name && <p className={err}>{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="email" className={label}>
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={set("email")}
            className={input}
          />
          {errors.email && <p className={err}>{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="password" className={label}>
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={form.password}
            onChange={set("password")}
            className={input}
          />
          <ul className="mt-2 space-y-1 text-xs">
            {passwordChecks(form.password).map((c) => (
              <li key={c.label} className={c.ok ? "text-green-400" : "text-slate-500"}>
                {c.ok ? "\u2713" : "\u2022"} {c.label}
              </li>
            ))}
          </ul>
          {errors.password && <p className={err}>{errors.password}</p>}
        </div>

        {message && !Object.keys(errors).length && <p className="text-sm text-red-400">{message}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-indigo-600 py-2 text-sm font-medium hover:bg-indigo-500 disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Sign up"}
        </button>
        <p className="text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="text-indigo-400 hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </main>
  );
}