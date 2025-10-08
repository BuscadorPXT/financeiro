import { useState } from 'react';
import { User } from 'lucide-react';
import clsx from 'clsx';

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  shape?: 'circle' | 'square';
  status?: 'online' | 'offline' | 'away' | 'busy';
  className?: string;
}

const Avatar = ({
  src,
  alt,
  name,
  size = 'md',
  shape = 'circle',
  status,
  className = '',
}: AvatarProps) => {
  const [imageError, setImageError] = useState(false);

  // Gerar iniciais do nome
  const getInitials = (name: string) => {
    const names = name.trim().split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
  };

  const shapeClasses = {
    circle: 'rounded-full',
    square: 'rounded-lg',
  };

  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500',
    busy: 'bg-red-500',
  };

  const statusSizeClasses = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
    '2xl': 'w-5 h-5',
  };

  // Gerar cor de fundo baseada no nome
  const getBackgroundColor = (name: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-cyan-500',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const showImage = src && !imageError;
  const showInitials = !showImage && name;
  const showPlaceholder = !showImage && !showInitials;

  return (
    <div className={clsx('relative inline-block', className)}>
      <div
        className={clsx(
          'flex items-center justify-center overflow-hidden',
          'font-semibold text-white',
          sizeClasses[size],
          shapeClasses[shape],
          showInitials && name && getBackgroundColor(name),
          showPlaceholder && 'bg-[var(--bg-tertiary)]'
        )}
      >
        {showImage && (
          <img
            src={src}
            alt={alt || name || 'Avatar'}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        )}
        {showInitials && name && getInitials(name)}
        {showPlaceholder && <User className="w-1/2 h-1/2 text-[var(--text-secondary)]" />}
      </div>

      {/* Indicador de status */}
      {status && (
        <span
          className={clsx(
            'absolute bottom-0 right-0',
            'rounded-full border-2 border-[var(--bg-primary)]',
            statusColors[status],
            statusSizeClasses[size]
          )}
        />
      )}
    </div>
  );
};

export default Avatar;
