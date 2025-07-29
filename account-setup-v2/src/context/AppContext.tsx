import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { AppState, AppAction, AppContextType, FormData, CompletionStatus, Section } from '../types/index';

/**
 * Enterprise-grade state management using React Context + useReducer
 * Provides centralized state management with proper TypeScript support
 */

// Initial state
const initialState: AppState = {
  currentSection: 'owner-details',
  currentMember: 'john-smith',
  currentAccount: '',
  isReviewMode: false,
  formData: {},
  completionStatus: {
    members: {
      'john-smith': {
        'owner-details': false,
        'firm-details': false
      },
      'mary-smith': {
        'owner-details': false,
        'firm-details': false
      },
      'smith-trust': {
        'owner-details': false,
        'firm-details': false
      }
    },
    accounts: {
      'joint-account': {
        'account-setup': false,
        'funding': false,
        'firm-details': false
      },
      'individual-account': {
        'account-setup': false,
        'funding': false,
        'firm-details': false
      },
      'trust-account': {
        'account-setup': false,
        'funding': false,
        'firm-details': false
      }
    }
  },
  loading: false,
  error: null
};

// Reducer function
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_CURRENT_SECTION':
      return {
        ...state,
        currentSection: action.payload
      };
      
    case 'SET_CURRENT_MEMBER':
      return {
        ...state,
        currentMember: action.payload,
        currentAccount: '' // Clear account when setting member
      };
      
    case 'SET_CURRENT_ACCOUNT':
      return {
        ...state,
        currentAccount: action.payload,
        currentMember: '' // Clear member when setting account
      };
      
    case 'SET_REVIEW_MODE':
      return {
        ...state,
        isReviewMode: action.payload
      };
      
    case 'UPDATE_FORM_DATA':
      return {
        ...state,
        formData: action.payload
      };
      
    case 'UPDATE_COMPLETION_STATUS':
      return {
        ...state,
        completionStatus: action.payload
      };
      
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
      
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false // Clear loading when error occurs
      };
      
    default:
      return state;
  }
};

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Context provider component
interface AppProviderProps {
  children: ReactNode;
  initialData?: Partial<AppState>;
}

export const AppProvider: React.FC<AppProviderProps> = ({ 
  children, 
  initialData 
}) => {
  const [state, dispatch] = useReducer(appReducer, {
    ...initialState,
    ...initialData
  });

  const contextValue: AppContextType = {
    state,
    dispatch
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

// Action creators for type safety and convenience
export const useAppActions = () => {
  const { dispatch } = useAppContext();

  return {
    setCurrentSection: useCallback((section: Section) => {
      dispatch({ type: 'SET_CURRENT_SECTION', payload: section });
    }, [dispatch]),

    setCurrentMember: useCallback((memberId: string) => {
      dispatch({ type: 'SET_CURRENT_MEMBER', payload: memberId });
    }, [dispatch]),

    setCurrentAccount: useCallback((accountId: string) => {
      dispatch({ type: 'SET_CURRENT_ACCOUNT', payload: accountId });
    }, [dispatch]),

    setReviewMode: useCallback((isReviewMode: boolean) => {
      dispatch({ type: 'SET_REVIEW_MODE', payload: isReviewMode });
    }, [dispatch]),

    updateFormData: useCallback((formData: FormData) => {
      dispatch({ type: 'UPDATE_FORM_DATA', payload: formData });
    }, [dispatch]),

    updateCompletionStatus: useCallback((completionStatus: CompletionStatus) => {
      dispatch({ type: 'UPDATE_COMPLETION_STATUS', payload: completionStatus });
    }, [dispatch]),

    setLoading: useCallback((loading: boolean) => {
      dispatch({ type: 'SET_LOADING', payload: loading });
    }, [dispatch]),

    setError: useCallback((error: string | null) => {
      dispatch({ type: 'SET_ERROR', payload: error });
    }, [dispatch])
  };
};

// Selector hooks for specific state slices
export const useCurrentEntity = () => {
  const { state } = useAppContext();
  return {
    currentSection: state.currentSection,
    currentMember: state.currentMember,
    currentAccount: state.currentAccount,
    isReviewMode: state.isReviewMode
  };
};

export const useFormData = () => {
  const { state } = useAppContext();
  const { updateFormData } = useAppActions();
  
  return {
    formData: state.formData,
    updateFormData
  };
};

export const useCompletionStatus = () => {
  const { state } = useAppContext();
  const { updateCompletionStatus } = useAppActions();
  
  return {
    completionStatus: state.completionStatus,
    updateCompletionStatus
  };
};

export const useAppLoading = () => {
  const { state } = useAppContext();
  const { setLoading } = useAppActions();
  
  return {
    loading: state.loading,
    setLoading
  };
};

export const useAppError = () => {
  const { state } = useAppContext();
  const { setError } = useAppActions();
  
  return {
    error: state.error,
    setError
  };
};

// Navigation helpers
export const useNavigation = () => {
  const { setCurrentSection, setCurrentMember, setCurrentAccount } = useAppActions();
  
  const navigateToSection = useCallback((
    section: Section, 
    memberId?: string, 
    accountId?: string
  ) => {
    setCurrentSection(section);
    if (memberId) {
      setCurrentMember(memberId);
    }
    if (accountId) {
      setCurrentAccount(accountId);
    }
  }, [setCurrentSection, setCurrentMember, setCurrentAccount]);
  
  return { navigateToSection };
};

// Data persistence helpers
export const useDataPersistence = () => {
  const { formData } = useFormData();
  
  const saveToLocalStorage = useCallback(() => {
    try {
      localStorage.setItem('accountSetupData', JSON.stringify(formData));
      return true;
    } catch (error) {
      console.error('Failed to save data to localStorage:', error);
      return false;
    }
  }, [formData]);
  
  const loadFromLocalStorage = useCallback((): FormData | null => {
    try {
      const saved = localStorage.getItem('accountSetupData');
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Failed to load data from localStorage:', error);
      return null;
    }
  }, []);
  
  return {
    saveToLocalStorage,
    loadFromLocalStorage
  };
};