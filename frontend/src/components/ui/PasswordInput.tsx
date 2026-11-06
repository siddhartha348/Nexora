import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input, type InputProps } from './Input';

export interface PasswordInputProps extends Omit<InputProps, 'type' | 'rightIcon'> {
  label?: string;
  showToggleLabel?: boolean;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  label = 'Password',
  id,
  showToggleLabel = false,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || 'password-field';

  return (
    <div className="relative">
      <Input
        {...props}
        id={inputId}
        label={label}
        type={showPassword ? 'text' : 'password'}
        rightIcon={
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-pressed={showPassword}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="text-slate-muted hover:text-ink focus:outline-none transition-colors p-1"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Eye className="w-4 h-4" aria-hidden="true" />
            )}
            {showToggleLabel && (
              <span className="sr-only">
                {showPassword ? 'Hide password' : 'Show password'}
              </span>
            )}
          </button>
        }
      />
    </div>
  );
};
