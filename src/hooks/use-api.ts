import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient, type ApiResponse, ApiError } from '@/lib/api-client';

// Generic API hook configuration
interface UseApiConfig {
  immediate?: boolean;
  retry?: boolean;
  retryCount?: number;
  retryDelay?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: ApiError) => void;
  transform?: (data: any) => any;
}

// API hook state
interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  success: boolean;
}

// Generic API hook
export function useApi<T = any>(
  apiCall: () => Promise<ApiResponse<T>>,
  config: UseApiConfig = {}
) {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef(0);

  const {
    immediate = false,
    retry = false,
    retryCount = 3,
    retryDelay = 1000,
    onSuccess,
    onError,
    transform,
  } = config;

  const execute = useCallback(async () => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      success: false,
    }));

    try {
      const response = await apiCall();
      
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      const transformedData = transform ? transform(response.data) : response.data;

      setState({
        data: transformedData,
        loading: false,
        error: null,
        success: true,
      });

      onSuccess?.(transformedData);
      retryCountRef.current = 0;
    } catch (error) {
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      const apiError = error instanceof ApiError ? error : new ApiError(
        error.message || 'An unexpected error occurred',
        500,
        'UNKNOWN_ERROR'
      );

      // Retry logic
      if (retry && retryCountRef.current < retryCount && apiError.status >= 500) {
        retryCountRef.current += 1;
        setTimeout(() => {
          execute();
        }, retryDelay * Math.pow(2, retryCountRef.current - 1)); // Exponential backoff
        return;
      }

      setState({
        data: null,
        loading: false,
        error: apiError,
        success: false,
      });

      onError?.(apiError);
      retryCountRef.current = 0;
    }
  }, [apiCall, retry, retryCount, retryDelay, onSuccess, onError, transform]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false,
    });
    retryCountRef.current = 0;
  }, []);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setState(prev => ({
      ...prev,
      loading: false,
    }));
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }

    return () => {
      cancel();
    };
  }, [immediate, execute, cancel]);

  return {
    ...state,
    execute,
    reset,
    cancel,
    isLoading: state.loading,
    hasError: !!state.error,
    hasData: !!state.data,
  };
}

// Mutation hook for create/update/delete operations
interface UseMutationConfig<TData, TVariables> {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: ApiError, variables: TVariables) => void;
  onSettled?: (data: TData | null, error: ApiError | null, variables: TVariables) => void;
}

export function useMutation<TData = any, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>,
  config: UseMutationConfig<TData, TVariables> = {}
) {
  const [state, setState] = useState<ApiState<TData>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  const { onSuccess, onError, onSettled } = config;

  const mutate = useCallback(async (variables: TVariables) => {
    setState({
      data: null,
      loading: true,
      error: null,
      success: false,
    });

    try {
      const response = await mutationFn(variables);

      setState({
        data: response.data,
        loading: false,
        error: null,
        success: true,
      });

      onSuccess?.(response.data, variables);
      onSettled?.(response.data, null, variables);

      return response.data;
    } catch (error) {
      const apiError = error instanceof ApiError ? error : new ApiError(
        error.message || 'An unexpected error occurred',
        500,
        'UNKNOWN_ERROR'
      );

      setState({
        data: null,
        loading: false,
        error: apiError,
        success: false,
      });

      onError?.(apiError, variables);
      onSettled?.(null, apiError, variables);

      throw apiError;
    }
  }, [mutationFn, onSuccess, onError, onSettled]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false,
    });
  }, []);

  return {
    ...state,
    mutate,
    reset,
    isLoading: state.loading,
    hasError: !!state.error,
    hasData: !!state.data,
  };
}

// Pagination hook
interface UsePaginationConfig {
  initialPage?: number;
  initialPageSize?: number;
  maxPageSize?: number;
}

export function usePagination(config: UsePaginationConfig = {}) {
  const {
    initialPage = 1,
    initialPageSize = 10,
    maxPageSize = 100,
  } = config;

  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const setPageSafe = useCallback((newPage: number) => {
    setPage(Math.max(1, newPage));
  }, []);

  const setPageSizeSafe = useCallback((newPageSize: number) => {
    const safePageSize = Math.min(Math.max(1, newPageSize), maxPageSize);
    setPageSize(safePageSize);
    setPage(1); // Reset to first page when changing page size
  }, [maxPageSize]);

  const nextPage = useCallback(() => {
    setPage(prev => prev + 1);
  }, []);

  const previousPage = useCallback(() => {
    setPage(prev => Math.max(1, prev - 1));
  }, []);

  const reset = useCallback(() => {
    setPage(initialPage);
    setPageSize(initialPageSize);
  }, [initialPage, initialPageSize]);

  return {
    page,
    pageSize,
    setPage: setPageSafe,
    setPageSize: setPageSizeSafe,
    nextPage,
    previousPage,
    reset,
    offset: (page - 1) * pageSize,
  };
}

// Local storage hook
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue] as const;
}

// Debounce hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Online status hook
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

// Document title hook
export function useDocumentTitle(title: string) {
  useEffect(() => {
    const originalTitle = document.title;
    document.title = title;

    return () => {
      document.title = originalTitle;
    };
  }, [title]);
}
