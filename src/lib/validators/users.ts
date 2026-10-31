import { z } from "zod";
import { passwordSchema } from "@/lib/validators/auth";

export const createStaffSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80, "Name is too long"),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: passwordSchema,
});

export type CreateStaffInput = z.infer<typeof createStaffSchema>;