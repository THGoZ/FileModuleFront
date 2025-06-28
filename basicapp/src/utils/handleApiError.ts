import type { FieldError } from "@/interfaces/interfaces";
import { UseFormSetError } from "react-hook-form";

export function handleFieldErrors<T>(
  fieldErrors: FieldError[] | undefined,
  setError: UseFormSetError<T>
) {
  if (!fieldErrors) return;

  fieldErrors.forEach((error) => {
    setError(error.field as keyof T, {
      type: "manual",
      message: error.message,
    });
  });
}