"use client";

import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface FormFieldWrapperProps {
  label: string;
  htmlFor?: string;
  icon?: LucideIcon;
  error?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export default function FormFieldWrapper({
  label,
  htmlFor,
  icon: Icon,
  error,
  helperText,
  required = false,
  className,
  children,
}: FormFieldWrapperProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium flex items-center gap-2"
      >
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        {label}
        {required && <span className="text-destructive">*</span>}
      </label>

      {children}

      {error && (
        <p className="text-destructive text-xs flex items-center gap-1 animate-fade-in">
          {error}
        </p>
      )}

      {!error && helperText && (
        <p className="text-muted-foreground text-xs">{helperText}</p>
      )}
    </div>
  );
}
