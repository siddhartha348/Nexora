import React from 'react';
import { Check, X, ShieldAlert } from 'lucide-react';
import { evaluatePassword } from '../../utils/passwordStrength';

interface PasswordStrengthMeterProps {
  password: string;
  showRules?: boolean;
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({
  password,
  showRules = true,
}) => {
  const result = evaluatePassword(password);
  if (!password) return null;

  return (
    <div className="space-y-2 mt-2">
      {/* Visual meter bar with 4 segments */}
      <div className="space-y-1">
        <div className="flex justify-between items-center text-xs font-mono">
          <span className="text-slate-muted">Strength:</span>
          <span
            className="font-bold uppercase tracking-wider text-[11px]"
            style={{ color: result.color }}
          >
            {result.label}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1.5 h-2">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className="h-full rounded border-2 border-ink transition-all duration-200"
              style={{
                backgroundColor:
                  result.score >= step ? result.color : 'transparent',
              }}
            />
          ))}
        </div>
      </div>

      {result.isCommon && (
        <div className="flex items-center gap-1.5 text-xs text-severity-red font-medium">
          <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
          <span>This password is too common and easily guessed.</span>
        </div>
      )}

      {showRules && (
        <div className="p-2.5 rounded-md bg-paper border-2 border-ink space-y-1 text-[11px] font-mono">
          <span className="text-[10px] uppercase font-bold text-slate-muted block font-sans">
            Enterprise Security Policy:
          </span>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1">
            <span
              className={`flex items-center gap-1.5 ${
                result.hasMinLength ? 'text-severity-green font-bold' : 'text-slate-muted'
              }`}
            >
              {result.hasMinLength ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
              12+ Characters
            </span>
            <span
              className={`flex items-center gap-1.5 ${
                result.hasUpper ? 'text-severity-green font-bold' : 'text-slate-muted'
              }`}
            >
              {result.hasUpper ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
              Uppercase (A-Z)
            </span>
            <span
              className={`flex items-center gap-1.5 ${
                result.hasLower ? 'text-severity-green font-bold' : 'text-slate-muted'
              }`}
            >
              {result.hasLower ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
              Lowercase (a-z)
            </span>
            <span
              className={`flex items-center gap-1.5 ${
                result.hasDigit ? 'text-severity-green font-bold' : 'text-slate-muted'
              }`}
            >
              {result.hasDigit ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
              Number (0-9)
            </span>
            <span
              className={`flex items-center gap-1.5 ${
                result.hasSpecial ? 'text-severity-green font-bold' : 'text-slate-muted'
              } col-span-2`}
            >
              {result.hasSpecial ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
              Special Symbol (!@#$...)
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

