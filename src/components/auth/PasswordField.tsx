"use client";

import { useId, useState, type ComponentProps } from "react";
import { Eye, EyeOff } from "lucide-react";

import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";

type PasswordFieldProps = Omit<ComponentProps<"input">, "id"> & {
  id?: string;
  label: string;
  error?: { message?: string };
  description?: string;
};

function PasswordField({ label, error, description, id, ...props }: PasswordFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [visible, setVisible] = useState(false);

  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={inputId} required>{label}</FieldLabel>
      <FieldContent>
        <InputGroup>
          <InputGroupInput
            id={inputId}
            type={visible ? "text" : "password"}
            autoComplete="current-password"
            aria-invalid={!!error}
            {...props}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              aria-label={visible ? "Hide password" : "Show password"}
              size="icon-xs"
              onClick={() => setVisible((value) => !value)}
            >
              {visible ? <EyeOff /> : <Eye />}
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        {description && !error && <FieldDescription>{description}</FieldDescription>}
        <FieldError errors={[error]} />
      </FieldContent>
    </Field>
  );
}

export { PasswordField };
