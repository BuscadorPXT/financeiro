/**
 * Valida se é um email válido
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida formato de telefone brasileiro
 * Aceita: (11) 98765-4321, (11) 8765-4321, 11987654321, etc
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\(?([0-9]{2})\)?[-. ]?([0-9]{4,5})[-. ]?([0-9]{4})$/;
  return phoneRegex.test(phone);
}

/**
 * Formata telefone para padrão (XX) XXXXX-XXXX
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 11) {
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
  } else if (cleaned.length === 10) {
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6)}`;
  }

  return phone;
}

/**
 * Valida se é um número positivo
 */
export function isPositiveNumber(value: any): boolean {
  const num = Number(value);
  return !isNaN(num) && num > 0;
}

/**
 * Valida se é uma data válida
 */
export function isValidDate(date: any): boolean {
  const d = new Date(date);
  return d instanceof Date && !isNaN(d.getTime());
}

/**
 * Sanitiza string para evitar XSS
 */
export function sanitizeString(str: string): string {
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}
