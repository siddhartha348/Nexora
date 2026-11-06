// Top 150 most common passwords to disallow enterprise users from setting
export const COMMON_PASSWORDS: ReadonlySet<string> = new Set([
  'password', 'password123', 'password1234', '123456789012', 'qwertyuiop12',
  'admin1234567', 'administrator', 'welcome12345', 'changeme1234', 'nexora123456',
  'auratech1234', 'letmein12345', 'iloveyou1234', 'monkey123456', 'dragon123456',
  'master123456', 'superman1234', 'football1234', 'baseball1234', 'starwars1234',
  'trustno11234', 'shadow123456', 'ashley123456', 'bailey123456', 'charlie12345',
  'jessica12345', 'michael12345', 'supersecret1', 'defaultpass1', 'company123456',
  'secret123456', 'governance12', 'compliance12', 'marketing123', 'advertising1'
]);

export interface PasswordScore {
  score: number; // 0 to 4
  label: 'Weak' | 'Fair' | 'Good' | 'Strong';
  color: string;
  hasMinLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasDigit: boolean;
  hasSpecial: boolean;
  isCommon: boolean;
  isValid: boolean;
}

export function evaluatePassword(password: string): PasswordScore {
  const hasMinLength = password.length >= 12;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/;]/.test(password);
  const isCommon = COMMON_PASSWORDS.has(password.toLowerCase().trim());

  let criteriaCount = 0;
  if (hasMinLength) criteriaCount++;
  if (hasUpper) criteriaCount++;
  if (hasLower) criteriaCount++;
  if (hasDigit) criteriaCount++;
  if (hasSpecial) criteriaCount++;

  let score = 0;
  if (password.length > 0) {
    if (criteriaCount <= 2 || isCommon) score = 1;
    else if (criteriaCount === 3) score = 2;
    else if (criteriaCount === 4) score = 3;
    else if (criteriaCount === 5) score = 4;
  }

  const labels: Array<'Weak' | 'Fair' | 'Good' | 'Strong'> = ['Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = [
    'var(--color-severity-red)',
    'var(--color-severity-red)',
    'var(--color-severity-yellow)',
    '#3B82F6', // Blue
    'var(--color-severity-green)'
  ];

  const isValid = hasMinLength && hasUpper && hasLower && hasDigit && hasSpecial && !isCommon;

  return {
    score,
    label: labels[score],
    color: colors[score],
    hasMinLength,
    hasUpper,
    hasLower,
    hasDigit,
    hasSpecial,
    isCommon,
    isValid
  };
}

