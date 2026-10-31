import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(9, "Password must be at least 9 characters")
  .regex(/[A-Z]/, "Include at least one uppercase letter")
  .regex(/[a-z]/, "Include at least one lowercase letter")
  .regex(/[^A-Za-z0-9]/, "Include at least one special character");

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email address");

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Enter your name"),
  email: emailSchema,
  password: passwordSchema,
  company: z.string().trim().optional(),
  phone: z.string().trim().optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export const passwordChecks = (pw: string) => [
  { label: "At least 9 characters", ok: pw.length >= 9 },
  { label: "One uppercase letter", ok: /[A-Z]/.test(pw) },
  { label: "One lowercase letter", ok: /[a-z]/.test(pw) },
  { label: "One special character", ok: /[^A-Za-z0-9]/.test(pw) },
];