import React from 'react';
import { cn } from '@detaileed/ui';
import { passwordStrength } from '@/features/auth/model/passwordStrength';

// One tone per filled step: the more steps, the stronger the password.
const STEP_TONES = ['bg-danger', 'bg-warning', 'bg-info', 'bg-success'] as const;

/** Four bars that fill up as the password gets longer. */
export const PasswordStrength: React.FC<{ password: string }> = ({ password }) => {
  if (!password) return null;
  const level = passwordStrength(password);
  return (
    <div className="flex gap-1.5" aria-hidden>
      {STEP_TONES.map((tone, i) => (
        <div
          key={tone}
          className={cn('h-1 flex-1 rounded-full transition-colors duration-150', i < level ? tone : 'bg-muted')}
        />
      ))}
    </div>
  );
};
