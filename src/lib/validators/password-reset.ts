import { z } from "zod";
import { passwordSchema } from "@/lib/validators/auth";

export const forgotSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
});

export const resetSchema = z.object({
  token: z.string().min(1, "Reset token is missing"),
  password: passwordSchema,
});

export type ForgotInput = z.infer<typeof forgotSchema>;
export type ResetInput = z.infer<typeof resetSchema>;