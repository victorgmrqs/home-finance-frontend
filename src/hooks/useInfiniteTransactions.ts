import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Track accumulated pages with filters key to reset when filters change
  const filtersKey = JSON.stringify(filters);
  const prevFiltersKey = useRef(filtersKey);
  const [accumulatedPages, setAccumulatedPages] = useState<Map<number, any[]>>(new Map());

  // Enable if we have painel_id OR showAllPaineis flag
  const hasValidFilters = !!filters?.painel_id;

  // Fetch current page
  const { data: transactions = [], isLoading, error } = useTransactions({
    limit: itemsPerPage,
    offset: (currentPage - 1) * itemsPerPage,
    ...filters,
  });

  // Reset accumulated pages when filters change
  useEffect(() => {
    if (prevFiltersKey.current !== filtersKey) {
      prevFiltersKey.current = filtersKey;
      setCurrentPage(1);
      setAccumulatedPages(new Map());
      setIsLoadingMore(false);
    }
  }, [filtersKey]);

  // Update accumulated pages when new data arrives
  useEffect(() => {
    if (!isLoading && hasValidFilters && transactions.length > 0) {
      setAccumulatedPages(prev => {
        const next = new Map(prev);
        next.set(currentPage, transactions);
        return next;
      });
      setIsLoadingMore(false);
    } else if (!isLoading && hasValidFilters && transactions.length === 0 && currentPage > 1) {
      // No more data
      setIsLoadingMore(false);
    }
  }, [transactions, currentPage, isLoading, hasValidFilters]);

  // Compute all transactions from accumulated pages (memoized)
  const allTransactions = useMemo(() => {
    const pages = Array.from(accumulatedPages.entries())
      .sort(([a], [b]) => a - b)
      .map(([_, txs]) => txs);
    return pages.flat();
  }, [accumulatedPages]);

  // Compute hasMore based on last page data
  const hasMore = useMemo(() => {
    if (!hasValidFilters) return false;
    if (isLoading) return true; // Still loading first page

    const lastPage = accumulatedPages.get(currentPage);
    if (!lastPage) return true; // Haven't loaded this page yet

    return lastPage.length >= itemsPerPage;
  }, [accumulatedPages, currentPage, itemsPerPage, hasValidFilters, isLoading]);

  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore || isLoading) return;

    setIsLoadingMore(true);
    setCurrentPage(prev => prev + 1);
  }, [isLoadingMore, hasMore, isLoading]);

  const reset = useCallback(() => {
    setCurrentPage(1);
    setAccumulatedPages(new Map());
    setIsLoadingMore(false);
  }, []);

  return {
    transactions: allTransactions,
    isLoading: (isLoading && currentPage === 1) || !hasValidFilters,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    reset,
    currentPage,
    totalLoaded: allTransactions.length,
  };
}
