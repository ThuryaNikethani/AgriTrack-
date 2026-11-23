import { z } from "zod";
import type { ActionState } from "@/components/form-helpers";

/** Converts FormData into a plain object, treating empty strings as undefined. */
export function formDataToObject(formData: FormData): Record<string, string | undefined> {
  const obj: Record<string, string | undefined> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value !== "string") continue;
    const trimmed = value.trim();
    obj[key] = trimmed === "" ? undefined : trimmed;
  }
  return obj;
}

type ParseResult<T> = { success: true; data: T } | { success: false; state: ActionState };

export function parseForm<S extends z.ZodTypeAny>(schema: S, formData: FormData): ParseResult<z.infer<S>> {
  const result = schema.safeParse(formDataToObject(formData));
  if (result.success) return { success: true, data: result.data };
  return {
    success: false,
    state: {
      ok: false,
      message: "Please correct the highlighted fields.",
      errors: result.error.flatten().fieldErrors as Record<string, string[]>,
    },
  };
}

// Reusable field schemas -----------------------------------------------------

export const zDate = z.coerce.date({ errorMap: () => ({ message: "Enter a valid date" }) });
export const zOptionalDate = z.coerce.date().optional();
export const zPositive = z.coerce.number({ invalid_type_error: "Enter a number" }).positive("Must be greater than 0");
export const zNonNegative = z.coerce.number({ invalid_type_error: "Enter a number" }).min(0, "Cannot be negative");
export const zOptionalText = z.string().max(500).optional();
