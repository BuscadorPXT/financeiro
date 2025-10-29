import toast from 'react-hot-toast';

/**
 * Helpers para toast notifications consistentes
 */

export const showSuccess = (message: string) => {
  toast.success(message);
};

export const showError = (message: string) => {
  toast.error(message);
};

export const showLoading = (message: string) => {
  return toast.loading(message);
};

export const dismissToast = (toastId: string) => {
  toast.dismiss(toastId);
};

export const showPromise = <T,>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string;
    error: string;
  }
) => {
  return toast.promise(promise, messages);
};

/**
 * Toast para operações CRUD
 */
export const toastCRUD = {
  create: (resource: string) => showSuccess(`${resource} criado com sucesso!`),
  update: (resource: string) => showSuccess(`${resource} atualizado com sucesso!`),
  delete: (resource: string) => showSuccess(`${resource} deletado com sucesso!`),
  error: (message?: string) => showError(message || 'Ocorreu um erro. Tente novamente.'),
};

/**
 * Parse erro da API e exibe toast apropriado
 */
export const showAPIError = (error: any) => {
  const message =
    error?.response?.data?.message ||
    error?.message ||
    'Ocorreu um erro. Tente novamente.';

  showError(message);
};

export default {
  success: showSuccess,
  error: showError,
  loading: showLoading,
  dismiss: dismissToast,
  promise: showPromise,
  crud: toastCRUD,
  apiError: showAPIError,
};
