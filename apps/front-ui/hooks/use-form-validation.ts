"use client";

import { useState, useCallback } from "react";
import type { ZodObject, ZodRawShape } from "zod";

type FieldErrors = Record<string, string>;

interface UseFormValidationOptions<T extends Record<string, any>> {
  schema: ZodObject<ZodRawShape>;
  initialValues: T;
  onSubmit: (values: T) => void | Promise<void>;
}

export function useFormValidation<T extends Record<string, any>>({
  schema,
  initialValues,
  onSubmit,
}: UseFormValidationOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback(
    (name: string, value: any) => {
      const fieldSchema = schema.shape[name];
      if (!fieldSchema) return "";

      const result = fieldSchema.safeParse(value);
      if (!result.success) {
        return result.error.issues[0]?.message || "Invalid value";
      }
      return "";
    },
    [schema]
  );

  const setValue = useCallback(
    (name: keyof T, value: any) => {
      setValues((prev) => ({ ...prev, [name]: value }));

      // Clear error on change if field was touched
      if (touched[name as string]) {
        const error = validateField(name as string, value);
        setErrors((prev) => ({ ...prev, [name]: error }));
      }
    },
    [touched, validateField]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setValue(name as keyof T, value);
    },
    [setValue]
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    },
    [validateField]
  );

  const validateAll = useCallback((): boolean => {
    const result = schema.safeParse(values);

    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      const allTouched: Record<string, boolean> = {};

      for (const issue of result.error.issues) {
        const fieldName = issue.path[0] as string;
        if (!fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
        allTouched[fieldName] = true;
      }

      setErrors(fieldErrors);
      setTouched((prev) => ({ ...prev, ...allTouched }));
      return false;
    }

    setErrors({});
    return true;
  }, [schema, values]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validateAll()) return;

      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    },
    [validateAll, onSubmit, values]
  );

  const resetForm = useCallback(
    (newValues?: T) => {
      setValues(newValues ?? initialValues);
      setErrors({});
      setTouched({});
      setIsSubmitting(false);
    },
    [initialValues]
  );

  const getFieldProps = useCallback(
    (name: keyof T) => ({
      name: name as string,
      value: values[name] ?? "",
      onChange: handleChange,
      onBlur: handleBlur,
      "aria-invalid": !!(touched[name as string] && errors[name as string]),
    }),
    [values, handleChange, handleBlur, touched, errors]
  );

  const getFieldError = useCallback(
    (name: keyof T): string | undefined => {
      if (touched[name as string] && errors[name as string]) {
        return errors[name as string];
      }
      return undefined;
    },
    [touched, errors]
  );

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setValue,
    handleChange,
    handleBlur,
    handleSubmit,
    validateAll,
    resetForm,
    getFieldProps,
    getFieldError,
    setValues,
  };
}
