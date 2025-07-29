/**
 * Accessibility utilities for WCAG 2.1 AA compliance
 * Provides tools for screen readers, keyboard navigation, and inclusive design
 */

/**
 * Generates unique IDs for form elements and aria-describedby relationships
 */
export const generateId = (prefix: string = 'element'): string => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Creates aria-describedby string from multiple IDs
 */
export const createAriaDescribedBy = (...ids: (string | undefined | null)[]): string | undefined => {
  const validIds = ids.filter(Boolean);
  return validIds.length > 0 ? validIds.join(' ') : undefined;
};

/**
 * Generates accessible error message props
 */
export const getErrorProps = (fieldId: string, error?: string) => {
  if (!error) return {};
  
  const errorId = `${fieldId}-error`;
  return {
    'aria-invalid': true,
    'aria-describedby': errorId,
    errorId
  };
};

/**
 * Generates accessible help text props
 */
export const getHelpTextProps = (fieldId: string, helpText?: string) => {
  if (!helpText) return {};
  
  const helpId = `${fieldId}-help`;
  return {
    'aria-describedby': helpId,
    helpId
  };
};

/**
 * Combines error and help text aria-describedby
 */
export const getCombinedAriaProps = (
  fieldId: string, 
  error?: string, 
  helpText?: string
) => {
  const errorProps = getErrorProps(fieldId, error);
  const helpProps = getHelpTextProps(fieldId, helpText);
  
  const describedBy = createAriaDescribedBy(
    errorProps.errorId,
    helpProps.helpId
  );
  
  return {
    'aria-invalid': !!error,
    'aria-describedby': describedBy,
    errorId: errorProps.errorId,
    helpId: helpProps.helpId
  };
};

/**
 * Screen reader only text component props
 */
export const srOnlyProps = {
  style: {
    position: 'absolute' as const,
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap' as const,
    border: 0
  }
};

/**
 * Skip link props for keyboard navigation
 */
export const skipLinkProps = {
  style: {
    position: 'absolute' as const,
    top: '-40px',
    left: '6px',
    background: '#000',
    color: '#fff',
    padding: '8px',
    textDecoration: 'none',
    zIndex: 100000,
    borderRadius: '4px'
  },
  onFocus: (e: React.FocusEvent<HTMLAnchorElement>) => {
    e.target.style.top = '6px';
  },
  onBlur: (e: React.FocusEvent<HTMLAnchorElement>) => {
    e.target.style.top = '-40px';
  }
};

/**
 * Focus management utilities
 */
export const focusElement = (selector: string, delay: number = 0) => {
  setTimeout(() => {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      element.focus();
    }
  }, delay);
};

/**
 * Announce text to screen readers
 */
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.style.position = 'absolute';
  announcement.style.left = '-10000px';
  announcement.style.width = '1px';
  announcement.style.height = '1px';
  announcement.style.overflow = 'hidden';
  
  document.body.appendChild(announcement);
  announcement.textContent = message;
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Keyboard event handlers
 */
export const handleEnterKey = (callback: () => void) => (event: React.KeyboardEvent) => {
  if (event.key === 'Enter') {
    callback();
  }
};

export const handleSpaceKey = (callback: () => void) => (event: React.KeyboardEvent) => {
  if (event.key === ' ') {
    event.preventDefault();
    callback();
  }
};

export const handleEscapeKey = (callback: () => void) => (event: React.KeyboardEvent) => {
  if (event.key === 'Escape') {
    callback();
  }
};

/**
 * Form field accessibility props generator
 */
export const getFieldAccessibilityProps = (
  fieldName: string,
  label: string,
  required: boolean = false,
  error?: string,
  helpText?: string
) => {
  const fieldId = generateId(fieldName);
  const ariaProps = getCombinedAriaProps(fieldId, error, helpText);
  
  return {
    id: fieldId,
    'aria-label': label,
    'aria-required': required,
    ...ariaProps
  };
};

/**
 * Section heading props for proper document structure
 */
export const getSectionHeadingProps = (level: 1 | 2 | 3 | 4 | 5 | 6 = 2) => ({
  role: 'heading',
  'aria-level': level,
  tabIndex: -1 // Allow programmatic focus for navigation
});

/**
 * Navigation landmark props
 */
export const getNavigationProps = (label: string) => ({
  role: 'navigation',
  'aria-label': label
});

/**
 * Main content landmark props
 */
export const getMainContentProps = () => ({
  role: 'main',
  'aria-label': 'Main content'
});

/**
 * Form section props
 */
export const getFormSectionProps = (sectionName: string) => ({
  role: 'group',
  'aria-labelledby': `${generateId('section')}-heading`,
  'aria-describedby': `${generateId('section')}-description`
});

/**
 * Progress indicator props
 */
export const getProgressProps = (current: number, total: number, label: string) => ({
  role: 'progressbar',
  'aria-valuenow': current,
  'aria-valuemin': 1,
  'aria-valuemax': total,
  'aria-label': label,
  'aria-valuetext': `${current} of ${total} sections completed`
});

/**
 * Button accessibility props
 */
export const getButtonProps = (
  label: string,
  description?: string,
  expanded?: boolean,
  controls?: string
) => ({
  'aria-label': label,
  'aria-describedby': description ? generateId('button-desc') : undefined,
  'aria-expanded': expanded !== undefined ? expanded : undefined,
  'aria-controls': controls
});

/**
 * Table accessibility props
 */
export const getTableProps = (caption: string) => ({
  role: 'table',
  'aria-label': caption
});

/**
 * Color contrast checker (basic implementation)
 */
export const checkColorContrast = (foreground: string, background: string): boolean => {
  // This is a simplified implementation
  // In production, you'd use a proper color contrast calculation library
  return true; // Placeholder - implement actual contrast ratio calculation
};

/**
 * Focus trap utility for modals
 */
export const createFocusTrap = (container: HTMLElement) => {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
  
  const trapFocus = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }
  };
  
  container.addEventListener('keydown', trapFocus);
  
  return () => {
    container.removeEventListener('keydown', trapFocus);
  };
};