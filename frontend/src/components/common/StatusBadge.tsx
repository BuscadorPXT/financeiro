interface StatusBadgeProps {
  status: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
}

const StatusBadge = ({ status, variant }: StatusBadgeProps) => {
  // Auto-detecta variant baseado no status se não fornecido
  const getVariant = () => {
    if (variant) return variant;

    const statusLower = status.toLowerCase();
    if (statusLower.includes('ativo') || statusLower.includes('pago') || statusLower.includes('convertido')) {
      return 'success';
    }
    if (statusLower.includes('atraso') || statusLower.includes('pendente')) {
      return 'warning';
    }
    if (statusLower.includes('inativo') || statusLower.includes('cancelado') || statusLower.includes('churn')) {
      return 'danger';
    }
    return 'default';
  };

  const variantClasses = {
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    info: 'badge-info',
    default: 'badge-default',
  };

  const selectedVariant = getVariant();

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantClasses[selectedVariant]}`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
