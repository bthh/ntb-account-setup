import { ValidationError, FormValidationResult } from '../types/index';

/**
 * Enterprise-grade form validation utilities
 * Provides comprehensive validation for all form fields with proper error messaging
 */

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Phone validation regex (US format)
const PHONE_REGEX = /^\(\d{3}\)\s\d{3}-\d{4}$/;

// SSN validation regex (XXX-XX-XXXX)
const SSN_REGEX = /^\d{3}-\d{2}-\d{4}$/;

/**
 * Validates an email address
 */
export const validateEmail = (email: string): ValidationError | null => {
  if (!email?.trim()) {
    return {
      field: 'email',
      message: 'Email address is required',
      severity: 'error'
    };
  }
  
  if (!EMAIL_REGEX.test(email)) {
    return {
      field: 'email',
      message: 'Please enter a valid email address',
      severity: 'error'
    };
  }
  
  return null;
};

/**
 * Validates a phone number
 */
export const validatePhone = (phone: string, fieldName: string = 'phone'): ValidationError | null => {
  if (!phone?.trim()) {
    return {
      field: fieldName,
      message: 'Phone number is required',
      severity: 'error'
    };
  }
  
  if (!PHONE_REGEX.test(phone)) {
    return {
      field: fieldName,
      message: 'Please enter phone number in format: (XXX) XXX-XXXX',
      severity: 'error'
    };
  }
  
  return null;
};

/**
 * Validates a Social Security Number
 */
export const validateSSN = (ssn: string): ValidationError | null => {
  if (!ssn?.trim()) {
    return {
      field: 'ssn',
      message: 'Social Security Number is required',
      severity: 'error'
    };
  }
  
  if (!SSN_REGEX.test(ssn)) {
    return {
      field: 'ssn',
      message: 'Please enter SSN in format: XXX-XX-XXXX',
      severity: 'error'
    };
  }
  
  return null;
};

/**
 * Validates a required text field
 */
export const validateRequired = (value: any, fieldName: string, displayName?: string): ValidationError | null => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return {
      field: fieldName,
      message: `${displayName || fieldName} is required`,
      severity: 'error'
    };
  }
  
  return null;
};

/**
 * Validates a date field
 */
export const validateDate = (date: Date | null, fieldName: string, displayName?: string): ValidationError | null => {
  if (!date) {
    return {
      field: fieldName,
      message: `${displayName || fieldName} is required`,
      severity: 'error'
    };
  }
  
  // Check if date is in the future (for birth dates)
  if (fieldName === 'dateOfBirth' && date > new Date()) {
    return {
      field: fieldName,
      message: 'Date of birth cannot be in the future',
      severity: 'error'
    };
  }
  
  // Check if person is too young (must be at least 18)
  if (fieldName === 'dateOfBirth') {
    const age = new Date().getFullYear() - date.getFullYear();
    if (age < 18) {
      return {
        field: fieldName,
        message: 'Account holder must be at least 18 years old',
        severity: 'error'
      };
    }
  }
  
  return null;
};

/**
 * Validates minimum length for text fields
 */
export const validateMinLength = (value: string, minLength: number, fieldName: string, displayName?: string): ValidationError | null => {
  if (value && value.length < minLength) {
    return {
      field: fieldName,
      message: `${displayName || fieldName} must be at least ${minLength} characters`,
      severity: 'error'
    };
  }
  
  return null;
};

/**
 * Validates address field
 */
export const validateAddress = (address: string): ValidationError | null => {
  const requiredError = validateRequired(address, 'address', 'Address');
  if (requiredError) return requiredError;
  
  const minLengthError = validateMinLength(address, 10, 'address', 'Address');
  if (minLengthError) return minLengthError;
  
  return null;
};

/**
 * Field display name mapping for better error messages
 */
const FIELD_DISPLAY_NAMES: { [key: string]: string } = {
  firstName: 'First Name',
  lastName: 'Last Name',
  middleInitial: 'Middle Initial',
  dateOfBirth: 'Date of Birth',
  ssn: 'Social Security Number',
  phoneHome: 'Home Phone',
  phoneMobile: 'Mobile Phone',
  email: 'Email Address',
  homeAddress: 'Home Address',
  mailingAddress: 'Mailing Address',
  citizenship: 'Citizenship Status',
  employmentStatus: 'Employment Status',
  annualIncome: 'Annual Income',
  netWorth: 'Net Worth',
  fundsSource: 'Source of Funds',
  totalNetWorth: 'Total Net Worth',
  liquidNetWorth: 'Liquid Net Worth',
  averageAnnualIncome: 'Average Annual Income',
  incomeSource: 'Primary Income Source',
  investmentExperience: 'Investment Experience',
  stocksExperience: 'Stocks Experience',
  bondsExperience: 'Bonds Experience',
  optionsExperience: 'Options Experience',
  liquidityNeeds: 'Liquidity Needs',
  emergencyFund: 'Emergency Fund',
  scenario1: 'Market Scenario Response',
  accountType: 'Account Type',
  investmentObjective: 'Investment Objective',
  riskTolerance: 'Risk Tolerance',
  initialDeposit: 'Initial Deposit',
  fundingMethod: 'Funding Method',
  bankAccount: 'Bank Account'
};

/**
 * Get display name for a field
 */
export const getFieldDisplayName = (fieldName: string): string => {
  return FIELD_DISPLAY_NAMES[fieldName] || fieldName;
};

/**
 * Validates a complete form section
 */
export const validateFormSection = (data: any, requiredFields: string[]): FormValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  
  requiredFields.forEach(fieldName => {
    const value = data[fieldName];
    const displayName = getFieldDisplayName(fieldName);
    
    // Field-specific validation
    switch (fieldName) {
      case 'email':
        const emailError = validateEmail(value);
        if (emailError) errors.push(emailError);
        break;
        
      case 'phoneHome':
      case 'phoneMobile':
        if (fieldName === 'phoneHome' || (fieldName === 'phoneMobile' && value)) {
          const phoneError = validatePhone(value, fieldName);
          if (phoneError) errors.push(phoneError);
        }
        break;
        
      case 'ssn':
        const ssnError = validateSSN(value);
        if (ssnError) errors.push(ssnError);
        break;
        
      case 'dateOfBirth':
        const dateError = validateDate(value, fieldName, displayName);
        if (dateError) errors.push(dateError);
        break;
        
      case 'homeAddress':
        const addressError = validateAddress(value);
        if (addressError) errors.push(addressError);
        break;
        
      case 'firstName':
      case 'lastName':
        const nameError = validateRequired(value, fieldName, displayName);
        if (nameError) errors.push(nameError);
        
        if (value && value.length < 2) {
          errors.push({
            field: fieldName,
            message: `${displayName} must be at least 2 characters`,
            severity: 'error'
          });
        }
        break;
        
      default:
        // Generic required field validation
        const requiredError = validateRequired(value, fieldName, displayName);
        if (requiredError) errors.push(requiredError);
        break;
    }
  });
  
  // Add warnings for optional but recommended fields
  if (!data.phoneMobile && data.phoneHome) {
    warnings.push({
      field: 'phoneMobile',
      message: 'Mobile phone number is recommended for account notifications',
      severity: 'warning'
    });
  }
  
  if (!data.mailingAddress && data.homeAddress) {
    warnings.push({
      field: 'mailingAddress',
      message: 'Consider specifying a mailing address if different from home address',
      severity: 'warning'
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validates funding amount format
 */
export const validateAmount = (amount: string): ValidationError | null => {
  if (!amount?.trim()) {
    return {
      field: 'amount',
      message: 'Amount is required',
      severity: 'error'
    };
  }
  
  // Remove $ and commas for validation
  const cleanAmount = amount.replace(/[$,]/g, '');
  const numAmount = parseFloat(cleanAmount);
  
  if (isNaN(numAmount) || numAmount <= 0) {
    return {
      field: 'amount',
      message: 'Please enter a valid amount greater than $0',
      severity: 'error'
    };
  }
  
  if (numAmount < 1000) {
    return {
      field: 'amount',
      message: 'Minimum amount is $1,000',
      severity: 'warning'
    };
  }
  
  return null;
};