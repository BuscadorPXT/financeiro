/**
 * Skeleton para cards
 * Usado em listas de usuários, pagamentos, etc.
 */

interface CardSkeletonProps {
  count?: number;
  className?: string;
}

export function CardSkeleton({ count = 1, className = '' }: CardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`animate-pulse bg-white rounded-lg shadow p-6 ${className}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 bg-gray-200 rounded w-2/3"></div>
            <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
          </div>

          {/* Content */}
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex gap-2">
            <div className="h-9 bg-gray-200 rounded w-24"></div>
            <div className="h-9 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      ))}
    </>
  );
}
