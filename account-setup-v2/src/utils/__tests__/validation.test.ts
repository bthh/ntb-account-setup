import {
  validateEmail,
  validatePhone,
  validateSSN,
  validateRequired,
  validateDate,
  validateMinLength,
  validateAddress,
  validateFormSection,
  validateAmount,
  getFieldDisplayName
} from '../validation';

describe('Validation Utilities', () => {
  describe('validateEmail', () => {
    it('accepts valid email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'first+last@company.org',
        'numbers123@test.io'
      ];

      validEmails.forEach(email => {
        expect(validateEmail(email)).toBeNull();
      });
    });

    it('rejects invalid email addresses', () => {
      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user..name@domain.com',
        'user@domain',
        ''
      ];

      invalidEmails.forEach(email => {
        const result = validateEmail(email);
        expect(result).not.toBeNull();
        expect(result?.severity).toBe('error');
      });
    });

    it('handles empty/null input', () => {
      expect(validateEmail('')).toMatchObject({
        field: 'email',
        message: 'Email address is required',
        severity: 'error'
      });

      expect(validateEmail(null as any)).toMatchObject({
        field: 'email',
        message: 'Email address is required',
        severity: 'error'
      });
    });
  });

  describe('validatePhone', () => {
    it('accepts valid US phone numbers', () => {
      const validPhones = [
        '(555) 123-4567',
        '(999) 888-7777',
        '(123) 456-7890'
      ];

      validPhones.forEach(phone => {
        expect(validatePhone(phone)).toBeNull();
      });
    });

    it('rejects invalid phone numbers', () => {
      const invalidPhones = [
        '555-123-4567',
        '(555) 123-456',
        '(555) 123-45678',
        '555 123 4567',
        'not-a-phone',
        ''
      ];

      invalidPhones.forEach(phone => {
        const result = validatePhone(phone);
        expect(result).not.toBeNull();
        expect(result?.severity).toBe('error');
      });
    });

    it('uses custom field name', () => {
      const result = validatePhone('invalid', 'mobile');
      expect(result?.field).toBe('mobile');
    });
  });

  describe('validateSSN', () => {
    it('accepts valid SSN format', () => {
      const validSSNs = [
        '123-45-6789',
        '999-88-7777',
        '000-00-0000'
      ];

      validSSNs.forEach(ssn => {
        expect(validateSSN(ssn)).toBeNull();
      });
    });

    it('rejects invalid SSN format', () => {
      const invalidSSNs = [
        '123456789',
        '123-456-789',
        '12-34-5678',
        '123-45-67890',
        'not-a-ssn',
        ''
      ];

      invalidSSNs.forEach(ssn => {
        const result = validateSSN(ssn);
        expect(result).not.toBeNull();
        expect(result?.severity).toBe('error');
      });
    });
  });

  describe('validateRequired', () => {
    it('accepts non-empty values', () => {
      const validValues = [
        'text',
        123,
        true,
        false,
        0,
        new Date()
      ];

      validValues.forEach(value => {
        expect(validateRequired(value, 'field')).toBeNull();
      });
    });

    it('rejects empty values', () => {
      const emptyValues = [
        '',
        '   ',
        null,
        undefined
      ];

      emptyValues.forEach(value => {
        const result = validateRequired(value, 'field');
        expect(result).not.toBeNull();
        expect(result?.severity).toBe('error');
      });
    });

    it('uses display name when provided', () => {
      const result = validateRequired('', 'firstName', 'First Name');
      expect(result?.message).toContain('First Name');
    });
  });

  describe('validateDate', () => {
    it('accepts valid dates', () => {
      const validDates = [
        new Date('1990-01-01'),
        new Date('2000-12-31'),
        new Date('1985-06-15')
      ];

      validDates.forEach(date => {
        expect(validateDate(date, 'dateOfBirth')).toBeNull();
      });
    });

    it('rejects null dates', () => {
      const result = validateDate(null, 'dateOfBirth');
      expect(result).not.toBeNull();
      expect(result?.severity).toBe('error');
    });

    it('rejects future birth dates', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      
      const result = validateDate(futureDate, 'dateOfBirth');
      expect(result).not.toBeNull();
      expect(result?.message).toContain('cannot be in the future');
    });

    it('rejects dates for minors', () => {
      const minorDate = new Date();
      minorDate.setFullYear(minorDate.getFullYear() - 10);
      
      const result = validateDate(minorDate, 'dateOfBirth');
      expect(result).not.toBeNull();
      expect(result?.message).toContain('at least 18 years old');
    });

    it('accepts valid adult birth dates', () => {
      const adultDate = new Date();
      adultDate.setFullYear(adultDate.getFullYear() - 25);
      
      expect(validateDate(adultDate, 'dateOfBirth')).toBeNull();
    });
  });

  describe('validateMinLength', () => {
    it('accepts strings meeting minimum length', () => {
      expect(validateMinLength('hello', 3, 'field')).toBeNull();
      expect(validateMinLength('test', 4, 'field')).toBeNull();
      expect(validateMinLength('longer text', 5, 'field')).toBeNull();
    });

    it('rejects strings below minimum length', () => {
      const result = validateMinLength('hi', 5, 'field');
      expect(result).not.toBeNull();
      expect(result?.message).toContain('at least 5 characters');
    });

    it('handles empty strings', () => {
      expect(validateMinLength('', 5, 'field')).toBeNull();
    });
  });

  describe('validateAddress', () => {
    it('accepts valid addresses', () => {
      const validAddresses = [
        '123 Main Street, Anytown, ST 12345',
        '456 Oak Ave, Suite 100, City, State 54321',
        '789 First St, Apartment 2B, Town, ST 98765'
      ];

      validAddresses.forEach(address => {
        expect(validateAddress(address)).toBeNull();
      });
    });

    it('rejects short addresses', () => {
      const result = validateAddress('123 Main');
      expect(result).not.toBeNull();
      expect(result?.message).toContain('at least 10 characters');
    });

    it('rejects empty addresses', () => {
      const result = validateAddress('');
      expect(result).not.toBeNull();
      expect(result?.message).toContain('required');
    });
  });

  describe('validateAmount', () => {
    it('accepts valid amounts', () => {
      const validAmounts = [
        '$1,000',
        '$50,000.00',
        '$100000',
        '25000',
        '$2,500.99'
      ];

      validAmounts.forEach(amount => {
        expect(validateAmount(amount)).toBeNull();
      });
    });

    it('rejects invalid amounts', () => {
      const invalidAmounts = [
        '',
        '$0',
        '-$1000',
        'not-a-number',
        '$abc'
      ];

      invalidAmounts.forEach(amount => {
        const result = validateAmount(amount);
        expect(result).not.toBeNull();
        expect(result?.severity).toBe('error');
      });
    });

    it('warns about minimum amounts', () => {
      const result = validateAmount('$500');
      expect(result).not.toBeNull();
      expect(result?.severity).toBe('warning');
      expect(result?.message).toContain('Minimum amount is $1,000');
    });
  });

  describe('validateFormSection', () => {
    const requiredFields = ['firstName', 'lastName', 'email'];
    
    it('validates complete form sections', () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com'
      };

      const result = validateFormSection(validData, requiredFields);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('finds validation errors', () => {
      const invalidData = {
        firstName: '',
        lastName: 'Doe',
        email: 'invalid-email'
      };

      const result = validateFormSection(invalidData, requiredFields);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      
      const firstNameError = result.errors.find(e => e.field === 'firstName');
      const emailError = result.errors.find(e => e.field === 'email');
      
      expect(firstNameError).toBeDefined();
      expect(emailError).toBeDefined();
    });

    it('generates warnings for optional fields', () => {
      const dataWithMissingOptional = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phoneHome: '(555) 123-4567'
        // phoneMobile missing
      };

      const result = validateFormSection(dataWithMissingOptional, requiredFields);
      expect(result.isValid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      
      const mobileWarning = result.warnings.find(w => w.field === 'phoneMobile');
      expect(mobileWarning).toBeDefined();
    });
  });

  describe('getFieldDisplayName', () => {
    it('returns mapped display names', () => {
      expect(getFieldDisplayName('firstName')).toBe('First Name');
      expect(getFieldDisplayName('lastName')).toBe('Last Name');
      expect(getFieldDisplayName('phoneHome')).toBe('Home Phone');
      expect(getFieldDisplayName('ssn')).toBe('Social Security Number');
    });

    it('returns original field name for unmapped fields', () => {
      expect(getFieldDisplayName('customField')).toBe('customField');
      expect(getFieldDisplayName('unknown')).toBe('unknown');
    });
  });
});