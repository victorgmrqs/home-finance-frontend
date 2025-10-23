/**
 * CNPJ Validation Utility
 * Validates Brazilian CNPJ format and check digits
 */

export function formatCNPJ(value: string | null | undefined): string {
  if (!value) return '';
  
  // Remove non-digits
  const cleaned = value.replace(/\D/g, '');

  // Limit to 14 digits
  const limited = cleaned.substring(0, 14);

  // Format as XX.XXX.XXX/XXXX-XX
  if (limited.length <= 2) return limited;
  if (limited.length <= 5) return `${limited.slice(0, 2)}.${limited.slice(2)}`;
  if (limited.length <= 8) return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5)}`;
  if (limited.length <= 12) return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5, 8)}/${limited.slice(8)}`;
  return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5, 8)}/${limited.slice(8, 12)}-${limited.slice(12)}`;
}

export function validateCNPJ(cnpj: string | null | undefined): boolean {
  if (!cnpj) return false;
  
  // Remove formatting
  const cleaned = cnpj.replace(/\D/g, '');

  // Check length
  if (cleaned.length !== 14) return false;

  // Check if all digits are the same
  if (/^(\d)\1+$/.test(cleaned)) return false;

  // Validate check digits
  let sum = 0;
  let pos = 5;

  // First check digit
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleaned.charAt(i)) * pos;
    pos = pos === 2 ? 9 : pos - 1;
  }

  let digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (digit !== parseInt(cleaned.charAt(12))) return false;

  // Second check digit
  sum = 0;
  pos = 6;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleaned.charAt(i)) * pos;
    pos = pos === 2 ? 9 : pos - 1;
  }

  digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (digit !== parseInt(cleaned.charAt(13))) return false;

  return true;
}

// Alias for validateCNPJ
export const isValidCNPJ = validateCNPJ;
