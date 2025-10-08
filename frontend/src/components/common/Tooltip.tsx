import { useState } from 'react';
import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left';
  delay?: number;
  className?: string;
}

const Tooltip = ({
  content,
  children,
  position = 'top',
  delay = 200,
  className = '',
}: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  let timeoutId: NodeJS.Timeout;

  const showTooltip = () => {
    timeoutId = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    clearTimeout(timeoutId);
    setIsVisible(false);
  };

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent',
  };

  const animations = {
    top: { initial: { opacity: 0, y: 5 }, animate: { opacity: 1, y: 0 } },
    right: { initial: { opacity: 0, x: -5 }, animate: { opacity: 1, x: 0 } },
    bottom: { initial: { opacity: 0, y: -5 }, animate: { opacity: 1, y: 0 } },
    left: { initial: { opacity: 0, x: 5 }, animate: { opacity: 1, x: 0 } },
  };

  return (
    <div
      className={clsx('relative inline-block', className)}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}

      <AnimatePresence>
        {isVisible && content && (
          <motion.div
            className={clsx(
              'absolute z-50 pointer-events-none',
              positionClasses[position]
            )}
            initial={animations[position].initial}
            animate={animations[position].animate}
            exit={animations[position].initial}
            transition={{ duration: 0.15 }}
          >
            <div className="relative">
              {/* Tooltip content */}
              <div
                className={clsx(
                  'px-3 py-2 text-sm text-white',
                  'bg-gray-900',
                  'rounded-lg shadow-lg',
                  'whitespace-nowrap max-w-xs'
                )}
              >
                {content}
              </div>

              {/* Arrow */}
              <div
                className={clsx(
                  'absolute w-0 h-0',
                  'border-4 border-gray-900',
                  arrowClasses[position]
                )}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tooltip;
