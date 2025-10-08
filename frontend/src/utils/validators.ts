// Validadores de formulários

export const validators = {
  email: (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },

  telefone: (value: string): boolean => {
    // Remove caracteres não numéricos
    const cleaned = value.replace(/\D/g, '');
    // Valida se tem 10 ou 11 dígitos (com ou sem DDD)
    return cleaned.length >= 10 && cleaned.length <= 11;
  },

  required: (value: any): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (typeof value === 'number') return !isNaN(value);
    if (Array.isArray(value)) return value.length > 0;
    return true;
  },

  numeric: (value: string | number): boolean => {
    return !isNaN(Number(value));
  },

  positiveNumber: (value: string | number): boolean => {
    const num = Number(value);
    return !isNaN(num) && num > 0;
  },

  dateValid: (value: string): boolean => {
    const date = new Date(value);
    return date instanceof Date && !isNaN(date.getTime());
  },

  minLength: (value: string, min: number): boolean => {
    return value.length >= min;
  },

  maxLength: (value: string, max: number): boolean => {
    return value.length <= max;
  },

  cpf: (value: string): boolean => {
    const cleaned = value.replace(/\D/g, '');

    if (cleaned.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cleaned)) return false; // Todos dígitos iguais

    let sum = 0;
    let remainder;

    // Valida primeiro dígito verificador
    for (let i = 1; i <= 9; i++) {
      sum += parseInt(cleaned.substring(i - 1, i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleaned.substring(9, 10))) return false;

    // Valida segundo dígito verificador
    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(cleaned.substring(i - 1, i)) * (12 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleaned.substring(10, 11))) return false;

    return true;
  }
};

export const errorMessages = {
  email: 'Email inválido',
  telefone: 'Telefone inválido',
  required: 'Campo obrigatório',
  numeric: 'Valor deve ser numérico',
  positiveNumber: 'Valor deve ser maior que zero',
  dateValid: 'Data inválida',
  minLength: (min: number) => `Mínimo de ${min} caracteres`,
  maxLength: (max: number) => `Máximo de ${max} caracteres`,
  cpf: 'CPF inválido'
};

export const validate = (
  value: any,
  rules: Array<keyof typeof validators | { rule: keyof typeof validators; params?: any[] }>
): string | null => {
  for (const ruleOrConfig of rules) {
    if (typeof ruleOrConfig === 'string') {
      const validator = validators[ruleOrConfig];
      if (validator && !(validator as any)(value)) {
        return (errorMessages[ruleOrConfig] as string) || 'Valor inválido';
      }
    } else {
      const { rule, params = [] } = ruleOrConfig;
      const validator = validators[rule];
      if (validator && !(validator as any)(value, ...(params as any[]))) {
        const errorMessage = errorMessages[rule];
        return typeof errorMessage === 'function'
          ? (errorMessage as any)(...(params as any[]))
          : (errorMessage as string) || 'Valor inválido';
      }
    }
  }
  return null;
};

// Named exports for convenience
export const validateEmail = validators.email;
export const validatePhone = validators.telefone;
