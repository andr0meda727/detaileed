import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { FormInput, type FormInputProps, cn } from '@detaileed/ui';

/** A password input with a button that shows or hides what was typed. */
export const PasswordField = forwardRef<HTMLInputElement, Omit<FormInputProps, 'type' | 'rightIcon'>>((props, ref) => {
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOff : Eye;
  return (
    <FormInput
      ref={ref}
      type={visible ? 'text' : 'password'}
      rightIcon={
        <button
          type="button"
          aria-label={visible ? 'Ukryj hasło' : 'Pokaż hasło'}
          aria-pressed={visible}
          onClick={() => setVisible((v) => !v)}
          className={cn(
            '-mr-1 flex rounded-sm p-1 text-faint transition-colors duration-150 hover:text-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          )}
        >
          <Icon className="size-4" strokeWidth={1.75} aria-hidden />
        </button>
      }
      {...props}
    />
  );
});

PasswordField.displayName = 'PasswordField';
