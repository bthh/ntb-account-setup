import { useCallback, useMemo, useRef, useEffect } from 'react';
import { FormData, CompletionStatus } from '../types/index';

/**
 * Performance optimization hooks for enterprise-grade React applications
 * Provides memoization, debouncing, and performance monitoring utilities
 */

/**
 * Debounce hook for optimizing frequent function calls
 */
export const useDebounce = <T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
};

/**
 * Throttle hook for limiting function execution frequency
 */
export const useThrottle = <T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T => {
  const lastRun = useRef(Date.now());

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      }
    },
    [callback, delay]
  ) as T;

  return throttledCallback;
};

/**
 * Optimized form data updates with shallow comparison
 */
export const useOptimizedFormData = (formData: FormData) => {
  const memoizedFormData = useMemo(() => formData, [formData]);
  
  const updateFormDataOptimized = useCallback((
    entityId: string,
    field: string,
    value: any,
    setFormData: React.Dispatch<React.SetStateAction<FormData>>
  ) => {
    setFormData((prevData: FormData) => {
      // Only update if value actually changed
      if (prevData[entityId]?.[field] === value) {
        return prevData;
      }
      
      return {
        ...prevData,
        [entityId]: {
          ...prevData[entityId],
          [field]: value
        }
      };
    });
  }, []);

  return {
    formData: memoizedFormData,
    updateFormDataOptimized
  };
};

/**
 * Optimized completion status calculations
 */
export const useOptimizedCompletion = (
  formData: FormData,
  completionStatus: CompletionStatus,
  requiredFields: { [section: string]: string[] }
) => {
  const calculateSectionCompletion = useCallback((
    entityId: string,
    section: string
  ): boolean => {
    const fields = requiredFields[section];
    if (!fields || !formData[entityId]) return false;
    
    return fields.every(fieldName => {
      const value = formData[entityId][fieldName];
      return value && value.toString().trim() !== '';
    });
  }, [formData, requiredFields]);

  const memoizedCompletionStats = useMemo(() => {
    const memberSections = ['owner-details', 'firm-details'];
    const accountSections = ['account-setup', 'funding', 'firm-details'];
    
    let totalSections = 0;
    let completedSections = 0;
    
    // Count member sections
    Object.keys(completionStatus.members).forEach(memberId => {
      memberSections.forEach(section => {
        totalSections++;
        if (completionStatus.members[memberId][section]) {
          completedSections++;
        }
      });
    });
    
    // Count account sections
    Object.keys(completionStatus.accounts).forEach(accountId => {
      accountSections.forEach(section => {
        totalSections++;
        if (completionStatus.accounts[accountId][section]) {
          completedSections++;
        }
      });
    });
    
    return {
      total: totalSections,
      completed: completedSections,
      percentage: totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0
    };
  }, [completionStatus]);

  return {
    calculateSectionCompletion,
    completionStats: memoizedCompletionStats
  };
};

/**
 * Performance monitoring hook
 */
export const usePerformanceMonitor = (componentName: string) => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());
  
  useEffect(() => {
    renderCount.current++;
    const currentTime = Date.now();
    const timeSinceLastRender = currentTime - lastRenderTime.current;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${componentName} - Render #${renderCount.current}, Time since last: ${timeSinceLastRender}ms`);
    }
    
    lastRenderTime.current = currentTime;
  });

  const logPerformance = useCallback((action: string, startTime: number) => {
    const duration = Date.now() - startTime;
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${componentName} - ${action}: ${duration}ms`);
    }
  }, [componentName]);

  return { logPerformance };
};

/**
 * Memoized navigation calculations
 */
export const useOptimizedNavigation = (
  currentSection: string,
  currentMember: string,
  currentAccount: string
) => {
  const navigationData = useMemo(() => {
    const memberOrder = ['john-smith', 'mary-smith', 'smith-trust'];
    const accountOrder = ['joint-account', 'individual-account', 'trust-account'];
    const memberSections = ['owner-details', 'firm-details'];
    const accountSections = ['account-setup', 'funding', 'firm-details'];
    
    return {
      memberOrder,
      accountOrder,
      memberSections,
      accountSections
    };
  }, []);

  const getNextSectionAndEntity = useCallback(() => {
    const { memberOrder, accountOrder, memberSections, accountSections } = navigationData;

    if (currentMember) {
      const currentMemberIndex = memberOrder.indexOf(currentMember);
      const currentSectionIndex = memberSections.indexOf(currentSection);

      if (currentSectionIndex < memberSections.length - 1) {
        return {
          section: memberSections[currentSectionIndex + 1],
          memberId: currentMember,
          accountId: ''
        };
      }

      if (currentMemberIndex < memberOrder.length - 1) {
        return {
          section: 'owner-details',
          memberId: memberOrder[currentMemberIndex + 1],
          accountId: ''
        };
      }

      return {
        section: 'account-setup',
        memberId: '',
        accountId: accountOrder[0]
      };
    }

    if (currentAccount) {
      const currentAccountIndex = accountOrder.indexOf(currentAccount);
      const currentSectionIndex = accountSections.indexOf(currentSection);

      if (currentSectionIndex < accountSections.length - 1) {
        return {
          section: accountSections[currentSectionIndex + 1],
          memberId: '',
          accountId: currentAccount
        };
      }

      if (currentAccountIndex < accountOrder.length - 1) {
        return {
          section: 'account-setup',
          memberId: '',
          accountId: accountOrder[currentAccountIndex + 1]
        };
      }

      return null;
    }

    return {
      section: 'owner-details',
      memberId: memberOrder[0],
      accountId: ''
    };
  }, [currentSection, currentMember, currentAccount, navigationData]);

  const getPreviousSectionAndEntity = useCallback(() => {
    const { memberOrder, accountOrder, memberSections, accountSections } = navigationData;

    if (currentMember) {
      const currentMemberIndex = memberOrder.indexOf(currentMember);
      const currentSectionIndex = memberSections.indexOf(currentSection);

      if (currentSectionIndex > 0) {
        return {
          section: memberSections[currentSectionIndex - 1],
          memberId: currentMember,
          accountId: ''
        };
      }

      if (currentMemberIndex > 0) {
        return {
          section: 'firm-details',
          memberId: memberOrder[currentMemberIndex - 1],
          accountId: ''
        };
      }

      return null;
    }

    if (currentAccount) {
      const currentAccountIndex = accountOrder.indexOf(currentAccount);
      const currentSectionIndex = accountSections.indexOf(currentSection);

      if (currentSectionIndex > 0) {
        return {
          section: accountSections[currentSectionIndex - 1],
          memberId: '',
          accountId: currentAccount
        };
      }

      if (currentAccountIndex > 0) {
        return {
          section: 'firm-details',
          memberId: '',
          accountId: accountOrder[currentAccountIndex - 1]
        };
      }

      return {
        section: 'firm-details',
        memberId: memberOrder[memberOrder.length - 1],
        accountId: ''
      };
    }

    return null;
  }, [currentSection, currentMember, currentAccount, navigationData]);

  return {
    getNextSectionAndEntity,
    getPreviousSectionAndEntity
  };
};

/**
 * Optimized local storage operations
 */
export const useOptimizedStorage = () => {
  const saveToStorage = useDebounce((key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Storage save failed:', error);
    }
  }, 1000);

  const loadFromStorage = useCallback((key: string) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Storage load failed:', error);
      return null;
    }
  }, []);

  return {
    saveToStorage,
    loadFromStorage
  };
};