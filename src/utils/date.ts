/**
 * Date utility functions
 */

/**
 * Retorna o mês atual no formato AAAA-MM
 */
export function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Valida se uma string está no formato de filtro de mês (AAAA-MM)
 */
export function isValidMonthFilter(month: string): boolean {
  const regex = /^\d{4}-\d{2}$/;
  if (!regex.test(month)) {
    return false;
  }
  
  const [year, monthNum] = month.split('-').map(Number);
  
  // Validar ano (ex: entre 2000 e 2100)
  if (year < 2000 || year > 2100) {
    return false;
  }
  
  // Validar mês (1-12)
  if (monthNum < 1 || monthNum > 12) {
    return false;
  }
  
  return true;
}

/**
 * Retorna a data atual no formato ISO (YYYY-MM-DD)
 */
export function getCurrentDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

