import { useState, useEffect, useCallback, useRef } from 'react';
import { useTransactions } from './useTransactions';

interface UseInfiniteTransactionsOptions {
  itemsPerPage?: number;
  filters?: any;
}

interface UseInfiniteTransactionsReturn {
  transactions: any[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: Error | null;
  loadMore: () => void;
  reset: () => void;
  currentPage: number;
  totalLoaded: number;
}

export function useInfiniteTransactions({
  itemsPerPage = 20,
  filters = {}
}: UseInfiniteTransactionsOptions = {}): UseInfiniteTransactionsReturn {
  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const isFirstRender = useRef(true);

  // Use the existing useTransactions hook
  const { data: transactions = [], isLoading, error } = useTransactions({
    limit: itemsPerPage,
    offset: (currentPage - 1) * itemsPerPage,
    ...filters,
  });

  // Update all transactions when new data arrives
  useEffect(() => {
    if (transactions.length > 0) {
      if (currentPage === 1) {
        // Reset for new search/filter
        setAllTransactions(transactions);
      } else {
        // Append for pagination - avoid duplicates
        setAllTransactions(prev => {
          const existingIds = new Set(prev.map((t: any) => t.id));
          const newTransactions = transactions.filter((t: any) => !existingIds.has(t.id));
          return [...prev, ...newTransactions];
        });
      }

      // Check if we have more data - if we got fewer items than requested, we're at the end
      setHasMore(transactions.length >= itemsPerPage);
      setIsLoadingMore(false);
    } else if (currentPage === 1) {
      setAllTransactions([]);
      setHasMore(false);
      setIsLoadingMore(false);
    } else {
      // No more data to load
      setHasMore(false);
      setIsLoadingMore(false);
    }
  }, [transactions, currentPage, itemsPerPage]);

  // Reset when filters change (but not on first render)
  const filtersKey = JSON.stringify(filters);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setCurrentPage(1);
    setAllTransactions([]);
    setHasMore(true);
  }, [filtersKey]);

  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore || isLoading) return;

    setIsLoadingMore(true);
    setCurrentPage(prev => prev + 1);
  }, [isLoadingMore, hasMore, isLoading]);

  const reset = useCallback(() => {
    setCurrentPage(1);
    setAllTransactions([]);
    setHasMore(true);
    setIsLoadingMore(false);
  }, []);

  return {
    transactions: allTransactions,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    reset,
    currentPage,
    totalLoaded: allTransactions.length,
  };
}
