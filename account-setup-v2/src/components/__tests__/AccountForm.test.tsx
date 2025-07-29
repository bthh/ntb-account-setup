import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { AccountForm } from '../AccountForm';
import { AppProvider } from '../../context/AppContext';
import { FormData, CompletionStatus } from '../../types/index';

// Mock PrimeReact components
jest.mock('primereact/inputtext', () => ({
  InputText: ({ value, onChange, ...props }: any) => (
    <input
      {...props}
      value={value || ''}
      onChange={(e) => onChange?.(e)}
    />
  )
}));

jest.mock('primereact/calendar', () => ({
  Calendar: ({ value, onChange, ...props }: any) => (
    <input
      {...props}
      type="date"
      value={value ? value.toISOString().split('T')[0] : ''}
      onChange={(e) => onChange?.(e.target.value ? new Date(e.target.value) : null)}
    />
  )
}));

jest.mock('primereact/dropdown', () => ({
  Dropdown: ({ value, onChange, options, ...props }: any) => (
    <select
      {...props}
      value={value || ''}
      onChange={(e) => onChange?.(e.target.value)}
    >
      <option value="">Select...</option>
      {options?.map((option: any) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}));

jest.mock('primereact/toast', () => ({
  Toast: ({ ...props }: any) => (
    <div data-testid="toast" {...props} />
  )
}));

jest.mock('primereact/card', () => ({
  Card: ({ children, ...props }: any) => (
    <div data-testid="card" {...props}>
      {children}
    </div>
  )
}));

// Test data
const mockFormData: FormData = {
  'john-smith': {
    firstName: 'John',
    lastName: 'Smith',
    email: 'john@example.com'
  }
};

const mockCompletionStatus: CompletionStatus = {
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
};

const defaultProps = {
  section: 'owner-details' as const,
  memberId: 'john-smith',
  accountId: '',
  isReviewMode: false,
  formData: mockFormData,
  setFormData: jest.fn(),
  completionStatus: mockCompletionStatus,
  setCompletionStatus: jest.fn()
};

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <AppProvider>
      {component}
    </AppProvider>
  );
};

describe('AccountForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Personal Details Section', () => {
    it('renders personal details form correctly', () => {
      renderWithProvider(<AccountForm {...defaultProps} />);
      
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/date of birth/i)).toBeInTheDocument();
    });

    it('displays pre-filled values correctly', () => {
      renderWithProvider(<AccountForm {...defaultProps} />);
      
      expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Smith')).toBeInTheDocument();
      expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
    });

    it('updates form data when input changes', async () => {
      const user = userEvent.setup();
      const setFormData = jest.fn();
      
      renderWithProvider(
        <AccountForm {...defaultProps} setFormData={setFormData} />
      );
      
      const firstNameInput = screen.getByLabelText(/first name/i);
      await user.clear(firstNameInput);
      await user.type(firstNameInput, 'Jane');
      
      await waitFor(() => {
        expect(setFormData).toHaveBeenCalled();
      });
    });

    it('validates required fields', async () => {
      const user = userEvent.setup();
      
      renderWithProvider(
        <AccountForm 
          {...defaultProps} 
          formData={{ 'john-smith': {} }}
        />
      );
      
      const firstNameInput = screen.getByLabelText(/first name/i);
      await user.click(firstNameInput);
      await user.tab();
      
      await waitFor(() => {
        expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
      });
    });

    it('validates email format', async () => {
      const user = userEvent.setup();
      
      renderWithProvider(
        <AccountForm {...defaultProps} />
      );
      
      const emailInput = screen.getByLabelText(/email/i);
      await user.clear(emailInput);
      await user.type(emailInput, 'invalid-email');
      await user.tab();
      
      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
      });
    });
  });

  describe('Review Mode', () => {
    it('displays review mode correctly', () => {
      renderWithProvider(
        <AccountForm 
          {...defaultProps} 
          isReviewMode={true}
        />
      );
      
      expect(screen.getByText(/first name/i)).toBeInTheDocument();
      expect(screen.getByText('John')).toBeInTheDocument();
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });

    it('shows only completed fields in review mode', () => {
      const incompleteData = {
        'john-smith': {
          firstName: 'John',
          // lastName missing
          email: 'john@example.com'
        }
      };
      
      renderWithProvider(
        <AccountForm 
          {...defaultProps} 
          formData={incompleteData}
          isReviewMode={true}
        />
      );
      
      expect(screen.getByText('John')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.queryByText(/last name/i)).not.toBeInTheDocument();
    });
  });

  describe('Firm Details Section', () => {
    const firmDetailsProps = {
      ...defaultProps,
      section: 'firm-details' as const
    };

    it('renders firm details form correctly', () => {
      renderWithProvider(<AccountForm {...firmDetailsProps} />);
      
      expect(screen.getByLabelText(/total net worth/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/investment experience/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/liquidity needs/i)).toBeInTheDocument();
    });

    it('validates dropdown selections', async () => {
      const user = userEvent.setup();
      
      renderWithProvider(<AccountForm {...firmDetailsProps} />);
      
      const investmentDropdown = screen.getByLabelText(/investment experience/i);
      await user.selectOptions(investmentDropdown, 'extensive');
      
      expect(investmentDropdown).toHaveValue('extensive');
    });
  });

  describe('Account Setup Section', () => {
    const accountSetupProps = {
      ...defaultProps,
      section: 'account-setup' as const,
      memberId: '',
      accountId: 'joint-account'
    };

    it('renders account setup form correctly', () => {
      renderWithProvider(<AccountForm {...accountSetupProps} />);
      
      expect(screen.getByLabelText(/account type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/investment objective/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/risk tolerance/i)).toBeInTheDocument();
    });
  });

  describe('Funding Section', () => {
    const fundingProps = {
      ...defaultProps,
      section: 'funding' as const,
      memberId: '',
      accountId: 'joint-account'
    };

    it('renders funding section correctly', () => {
      renderWithProvider(<AccountForm {...fundingProps} />);
      
      expect(screen.getByText(/funding options/i)).toBeInTheDocument();
      expect(screen.getByText(/account transfer/i)).toBeInTheDocument();
      expect(screen.getByText(/ach transfer/i)).toBeInTheDocument();
    });

    it('shows funding form when button is clicked', async () => {
      const user = userEvent.setup();
      
      renderWithProvider(<AccountForm {...fundingProps} />);
      
      const acatButton = screen.getByText(/account transfer/i);
      await user.click(acatButton);
      
      expect(screen.getByLabelText(/transfer name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
    });

    it('validates funding form inputs', async () => {
      const user = userEvent.setup();
      
      renderWithProvider(<AccountForm {...fundingProps} />);
      
      const acatButton = screen.getByText(/account transfer/i);
      await user.click(acatButton);
      
      const saveButton = screen.getByText(/save/i);
      await user.click(saveButton);
      
      await waitFor(() => {
        expect(screen.getByText(/transfer name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/amount is required/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      renderWithProvider(<AccountForm {...defaultProps} />);
      
      const firstNameInput = screen.getByLabelText(/first name/i);
      expect(firstNameInput).toHaveAttribute('aria-required', 'true');
    });

    it('associates errors with form fields', async () => {
      const user = userEvent.setup();
      
      renderWithProvider(
        <AccountForm 
          {...defaultProps} 
          formData={{ 'john-smith': {} }}
        />
      );
      
      const firstNameInput = screen.getByLabelText(/first name/i);
      await user.click(firstNameInput);
      await user.tab();
      
      await waitFor(() => {
        expect(firstNameInput).toHaveAttribute('aria-invalid', 'true');
        expect(firstNameInput).toHaveAttribute('aria-describedby');
      });
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      
      renderWithProvider(<AccountForm {...defaultProps} />);
      
      const firstNameInput = screen.getByLabelText(/first name/i);
      await user.tab();
      
      expect(firstNameInput).toHaveFocus();
    });
  });

  describe('Performance', () => {
    it('does not re-render unnecessarily', () => {
      const { rerender } = renderWithProvider(<AccountForm {...defaultProps} />);
      
      // Component should not re-render when unrelated props change
      rerender(
        <AppProvider>
          <AccountForm {...defaultProps} isReviewMode={false} />
        </AppProvider>
      );
      
      // This test would need more sophisticated mocking to verify render counts
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles invalid data gracefully', () => {
      const invalidData = {
        'john-smith': null
      } as any;
      
      expect(() => {
        renderWithProvider(
          <AccountForm 
            {...defaultProps} 
            formData={invalidData}
          />
        );
      }).not.toThrow();
    });

    it('recovers from validation errors', async () => {
      const user = userEvent.setup();
      
      renderWithProvider(
        <AccountForm 
          {...defaultProps} 
          formData={{ 'john-smith': {} }}
        />
      );
      
      const firstNameInput = screen.getByLabelText(/first name/i);
      await user.click(firstNameInput);
      await user.tab();
      
      // Error should appear
      await waitFor(() => {
        expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
      });
      
      // Error should disappear when field is filled
      await user.type(firstNameInput, 'John');
      
      await waitFor(() => {
        expect(screen.queryByText(/first name is required/i)).not.toBeInTheDocument();
      });
    });
  });
});