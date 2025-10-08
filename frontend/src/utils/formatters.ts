/**
 * Formata valor monetário para R$ X.XXX,XX
 */
export const formatCurrency = (value: number | string): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numValue);
};

/**
 * Formata data para dd/mm/aaaa
 */
export const formatDate = (date: Date | string): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    // Fallback se Intl não estiver disponível
    if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
      return new Intl.DateTimeFormat('pt-BR').format(dateObj);
    }

    // Fallback manual
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return String(date);
  }
};

/**
 * Formata data e hora para dd/mm/aaaa hh:mm
 */
export const formatDateTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return new Intl.DateFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(dateObj);
};

/**
 * Formata telefone para (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
 */
export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }

  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }

  return phone;
};

/**
 * Formata CPF para XXX.XXX.XXX-XX
 */
export const formatCPF = (cpf: string): string => {
  const cleaned = cpf.replace(/\D/g, '');

  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
  }

  return cpf;
};

/**
 * Formata CNPJ para XX.XXX.XXX/XXXX-XX
 */
export const formatCNPJ = (cnpj: string): string => {
  const cleaned = cnpj.replace(/\D/g, '');

  if (cleaned.length === 14) {
    return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12)}`;
  }

  return cnpj;
};

/**
 * Formata número inteiro com separador de milhares
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('pt-BR').format(value);
};

/**
 * Formata percentual
 */
export const formatPercent = (value: number, decimals: number = 2): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Formata mês/ano para MM/AAAA
 */
export const formatMonthYear = (monthYear: string): string => {
  // Input esperado: "MM/YYYY" ou "M/YYYY"
  const parts = monthYear.split('/');
  if (parts.length === 2) {
    const month = parts[0].padStart(2, '0');
    return `${month}/${parts[1]}`;
  }
  return monthYear;
};

/**
 * Formata texto em capitalize (primeira letra maiúscula)
 */
export const capitalize = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Formata nome próprio (todas as primeiras letras maiúsculas)
 */
export const formatProperName = (name: string): string => {
  return name
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Trunca texto com reticências
 */
export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Formata dias para texto amigável
 */
export const formatDaysToText = (days: number): string => {
  if (days === 0) return 'Hoje';
  if (days === 1) return 'Amanhã';
  if (days === -1) return 'Ontem';
  if (days > 0) return `Em ${days} dias`;
  return `${Math.abs(days)} dias atrás`;
};

/**
 * Formata status enum para texto legível
 */
export const formatStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    ATIVO: 'Ativo',
    INATIVO: 'Inativo',
    EM_ATRASO: 'Em Atraso',
    HISTORICO: 'Histórico',
    PAGO: 'Pago',
    PENDENTE: 'Pendente',
    PRIMEIRO: 'Primeira Adesão',
    RECORRENTE: 'Recorrente',
    PIX: 'PIX',
    CREDITO: 'Crédito',
    DINHEIRO: 'Dinheiro',
    PXT: 'PXT',
    EAGLE: 'EAGLE',
  };

  return statusMap[status] || status;
};
