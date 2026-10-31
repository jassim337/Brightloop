import type { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  children: ReactNode;
  error?: string;
  hint?: string;
  htmlFor?: string;
  required?: boolean;
}

export function FormField({
  label,
  children,
  error,
  hint,
  htmlFor,
  required = false,
}: FormFieldProps) {
  const labelContent = (
    <>
      {label}
      {required ? (
        <span aria-hidden="true" className="ml-1 text-rose-600">
          *
        </span>
      ) : null}
    </>
  );

  return (
    <div className="space-y-2">
      {htmlFor ? (
        <label
          htmlFor={htmlFor}
          className="block text-sm font-medium text-slate-700 dark:text-slate-200"
        >
          {labelContent}
        </label>
      ) : null}
      {htmlFor ? (
        children
      ) : (
        <label className="block space-y-2 text-sm font-medium text-slate-700 dark:text-slate-200">
          <span className="block">{labelContent}</span>
          {children}
        </label>
      )}
      {error ? (
        <p role="alert" className="text-sm text-rose-600 dark:text-rose-400">
          {error}
        </p>
      ) : hint ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
}
