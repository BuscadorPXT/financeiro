import { useState, useCallback } from 'react';

export interface FilterState {
  [key: string]: any;
}

export const useFilters = <T extends FilterState>(initialFilters: T) => {
  const [filters, setFilters] = useState<T>(initialFilters);

  const updateFilter = useCallback((key: keyof T, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const setMultipleFilters = useCallback((newFilters: Partial<T>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  }, []);

  return {
    filters,
    updateFilter,
    clearFilters,
    setMultipleFilters
  };
};
