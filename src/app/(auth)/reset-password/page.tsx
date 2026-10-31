"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { resetSchema } from "@/lib/validators/password-reset";

const inputClass =
  "w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none";

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setPasswordError(null);
    setConfirmError(null);

    const parsed = resetSchema.safeParse({ token, password });
    if (!parsed.success) {
      const f = parsed.error.flatten().fieldErrors;
      setPasswordError(f.password?.[0] ?? null);
      setFormError(f.token?.[0] ?? null);
      return;
    }

    if (password !== confirm) {
      setConfirmError("Passwords do not match");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const json = await res.json();
      if (!json.ok) {
        setPasswordError(json.error?.fields?.password?.[0] ?? null);
        setFormError(json.error?.message ?? "Could not reset password");
        return;
      }
      setSuccess(json.data.message);
      setTimeout(() => router.push("/login"), 1500);
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div className="text-sm text-red-400">
        This reset link is missing its token.{" "}
        <Link href="/forgot-password" className="text-indigo-400 hover:underline">
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div>
        <label className="mb-1 block text-sm text-slate-300">New password</label>
        <input
          className={inputClass}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="9+ chars, upper, lower, special"
        />
        {passwordError && <p className="mt-1 text-sm text-red-400">{passwordError}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm text-slate-300">Confirm password</label>
        <input
          className={inputClass}
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Repeat the password"
        />
        {confirmError && <p className="mt-1 text-sm text-red-400">{confirmError}</p>}
      </div>

      {formError && (
        <p className="text-sm text-red-400">
          {formError}{" "}
          <Link href="/forgot-password" className="text-indigo-400 hover:underline">
            Request a new link
          </Link>
        </p>
      )}
      {success && <p className="text-sm text-green-400">{success}</p>}

      <button
        type="submit"
        disabled={submitting || !!success}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
      >
        {submitting ? "Saving..." : "Set new password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-slate-100">
        <h1 className="mb-6 text-2xl font-semibold">Reset password</h1>
        <Suspense fallback={<div className="h-32 animate-pulse rounded-lg bg-slate-800" />}>
          <ResetForm />
        </Suspense>
      </div>
    </main>
  );
}