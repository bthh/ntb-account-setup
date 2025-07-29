import React, { useRef, useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { Checkbox } from 'primereact/checkbox';
import { FileUpload } from 'primereact/fileupload';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import { InputMask } from 'primereact/inputmask';
import { AccountFormProps, RequiredFields } from '../types/index';

const requiredFields: RequiredFields = {
  'owner-details': [  // Personal Details section - based on actual form fields with asterisks
    'firstName', 'lastName', 'dateOfBirth', 'ssn', 
    'phoneHome', 'email', 'homeAddress', 'citizenship',
    'employmentStatus', 'annualIncome', 'netWorth', 'fundsSource'
  ],
  'firm-details': [
    'totalNetWorth', 'liquidNetWorth', 'averageAnnualIncome', 'incomeSource',
    'investmentExperience', 'stocksExperience', 'bondsExperience', 'optionsExperience',
    'liquidityNeeds', 'emergencyFund', 'scenario1'
  ],
  'account-setup': [
    'accountType', 'investmentObjective', 'riskTolerance'
    // Trust-specific fields are conditionally required based on account type
  ],
  'funding': [
    // For funding, we'll check if at least one funding instance exists instead of specific fields
  ]
};

export const AccountForm: React.FC<AccountFormProps> = ({
  section,
  memberId,
  accountId,
  isReviewMode,
  formData,
  setFormData,
  completionStatus,
  setCompletionStatus,
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext
}) => {
  const toast = useRef<Toast>(null);
  const [showFundingForm, setShowFundingForm] = useState<string | null>(null);
  const [fundingFormData, setFundingFormData] = useState<any>({});
  const [editingInstance, setEditingInstance] = useState<{type: string, index: number} | null>(null);

  // Currency formatting utility functions
  const formatCurrency = (value: string): string => {
    // Remove all non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    
    // Handle empty or invalid input
    if (!numericValue || numericValue === '.') return '';
    
    // Parse as number and format
    const number = parseFloat(numericValue);
    if (isNaN(number)) return '';
    
    // Format as currency without cents if it's a whole number, with cents if not
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: number % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2
    }).format(number);
  };

  const parseCurrencyValue = (formattedValue: string): string => {
    // Extract numeric value from formatted currency for storage
    return formattedValue.replace(/[^0-9.]/g, '');
  };

  const formatStoredAmount = (amount: string | number): string => {
    // Format stored amount for display
    if (!amount) return 'N/A';
    const numValue = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numValue)) return 'N/A';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: numValue % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2
    }).format(numValue);
  };

  const handleCurrencyInputChange = (field: string, value: string) => {
    const formatted = formatCurrency(value);
    setFundingFormData({
      ...fundingFormData,
      [field]: formatted
    });
  };

  const handleInputChange = (field: string, value: any) => {
    // Create context-specific storage
    const contextKey = memberId || accountId;
    const newFormData = { ...formData };
    
    if (!newFormData[contextKey]) {
      newFormData[contextKey] = {};
    }
    
    newFormData[contextKey][field] = value;
    setFormData(newFormData);
    
    // Check if section is complete after a short delay
    setTimeout(() => {
      checkSectionCompletion();
    }, 100);
  };

  // Ensure review mode gets the latest data by using a getter function
  const getCurrentFormData = () => {
    const contextKey = memberId || accountId;
    return formData[contextKey] || {};
  };

  const checkSectionCompletion = () => {
    const contextKey = memberId || accountId;
    const contextData = formData[contextKey] || {};
    
    let isComplete = false;
    
    // Special handling for funding section - check if at least one funding instance exists
    if (section === 'funding') {
      const fundingInstances = contextData.fundingInstances || {};
      const hasAnyInstance = Object.values(fundingInstances).some((instances: any) => 
        Array.isArray(instances) && instances.length > 0
      );
      isComplete = hasAnyInstance;
    } else if (section === 'account-setup') {
      // For account setup, check basic fields plus trust-specific fields if it's a trust account
      const basicFields = ['accountType', 'investmentObjective', 'riskTolerance'];
      const isTrustAccount = accountId === 'trust-account';
      
      // Trust-specific required fields
      const trustFields = isTrustAccount ? [
        'trustName', 'trustType', 'trustEffectiveDate', 'trustEin', 'trustState', 'trustPurpose',
        'trusteeName', 'trusteePhone', 'trusteeAddress'
      ] : [];
      
      const allRequiredFields = [...basicFields, ...trustFields];
      
      isComplete = allRequiredFields.every(fieldName => {
        const value = contextData[fieldName];
        // Handle different value types
        if (value === null || value === undefined) return false;
        if (typeof value === 'string') return value.trim() !== '';
        if (typeof value === 'boolean') return true; // Checkboxes are valid if false or true
        if (value instanceof Date) return true; // Valid date objects are complete
        return Boolean(value); // For other types, check truthiness
      });
    } else {
      // For other sections, check required fields
      const fields = requiredFields[section];
      if (!fields || fields.length === 0) {
        // If no required fields are defined, consider it complete
        isComplete = true;
      } else {
        isComplete = fields.every(fieldName => {
          const value = contextData[fieldName];
          // Handle different value types
          if (value === null || value === undefined) return false;
          if (typeof value === 'string') return value.trim() !== '';
          if (typeof value === 'boolean') return true; // Checkboxes are valid if false or true
          if (value instanceof Date) return true; // Valid date objects are complete
          return Boolean(value); // For other types, check truthiness
        });
      }
    }

    // Update completion status
    const newCompletionStatus = { ...completionStatus };
    
    // Determine if this is a member or account section
    if (['owner-details', 'firm-details'].includes(section) && memberId) {
      if (!newCompletionStatus.members[memberId]) {
        newCompletionStatus.members[memberId] = {};
      }
      newCompletionStatus.members[memberId][section] = isComplete;
    } else if (['account-setup', 'funding'].includes(section) && accountId) {
      if (!newCompletionStatus.accounts[accountId]) {
        newCompletionStatus.accounts[accountId] = {};
      }
      newCompletionStatus.accounts[accountId][section] = isComplete;
    }
    
    setCompletionStatus(newCompletionStatus);
    
    return isComplete;
  };


  const getContextData = (field: string) => {
    const contextKey = memberId || accountId;
    return formData[contextKey]?.[field] || '';
  };

  const getCurrentEntityName = () => {
    if (memberId) {
      const member = [
        { id: 'john-smith', name: 'John Smith' },
        { id: 'mary-smith', name: 'Mary Smith' },
        { id: 'smith-trust', name: 'Smith Family Trust' }
      ].find(m => m.id === memberId);
      return member?.name || 'Unknown Member';
    }
    
    if (accountId) {
      const account = [
        { id: 'joint-account', name: 'John & Mary Smith Joint Account' },
        { id: 'individual-account', name: 'Mary Smith Individual Account' },
        { id: 'trust-account', name: 'Smith Family Trust Account' }
      ].find(a => a.id === accountId);
      return account?.name || 'Unknown Account';
    }
    
    return 'Entity';
  };

  const renderOwnerDetailsForm = () => (
    <div className="grid">
      <div className="col-12">
        <Card title={`${getCurrentEntityName()} - Personal Details`} className="mb-4">
          <div className="grid">
            <div className="col-12 md:col-4">
              <label htmlFor="firstName" className="block text-900 font-medium mb-2">
                First Name *
              </label>
              <InputText
                id="firstName"
                value={getContextData('firstName')}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="w-full"
                disabled={isReviewMode}
              />
            </div>
            
            <div className="col-12 md:col-4">
              <label htmlFor="middleInitial" className="block text-900 font-medium mb-2">
                Middle Initial
              </label>
              <InputText
                id="middleInitial"
                value={getContextData('middleInitial')}
                onChange={(e) => handleInputChange('middleInitial', e.target.value)}
                className="w-full"
                disabled={isReviewMode}
              />
            </div>
            
            <div className="col-12 md:col-4">
              <label htmlFor="lastName" className="block text-900 font-medium mb-2">
                Last Name *
              </label>
              <InputText
                id="lastName"
                value={getContextData('lastName')}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="w-full"
                disabled={isReviewMode}
              />
            </div>
            
            <div className="col-12 md:col-4">
              <label htmlFor="dateOfBirth" className="block text-900 font-medium mb-2">
                Date of Birth *
              </label>
              <Calendar
                id="dateOfBirth"
                value={getContextData('dateOfBirth') || null}
                onChange={(e) => handleInputChange('dateOfBirth', e.value)}
                className="w-full"
                showIcon
                disabled={isReviewMode}
              />
            </div>
            
            <div className="col-12 md:col-4">
              <label htmlFor="ssn" className="block text-900 font-medium mb-2">
                Social Security Number *
              </label>
              <InputMask
                id="ssn"
                mask="999-99-9999"
                value={getContextData('ssn')}
                onChange={(e) => handleInputChange('ssn', e.target.value)}
                className="w-full"
                placeholder="***-**-****"
                disabled={isReviewMode}
              />
            </div>
            
            <div className="col-12 md:col-4">
              <label htmlFor="phoneHome" className="block text-900 font-medium mb-2">
                Phone (Home) *
              </label>
              <InputMask
                id="phoneHome"
                mask="(999) 999-9999"
                value={getContextData('phoneHome')}
                onChange={(e) => handleInputChange('phoneHome', e.target.value)}
                className="w-full"
                disabled={isReviewMode}
              />
            </div>
            
            <div className="col-12 md:col-4">
              <label htmlFor="phoneMobile" className="block text-900 font-medium mb-2">
                Phone (Mobile)
              </label>
              <InputMask
                id="phoneMobile"
                mask="(999) 999-9999"
                value={getContextData('phoneMobile')}
                onChange={(e) => handleInputChange('phoneMobile', e.target.value)}
                className="w-full"
                disabled={isReviewMode}
              />
            </div>
            
            <div className="col-12 md:col-8">
              <label htmlFor="email" className="block text-900 font-medium mb-2">
                Email Address *
              </label>
              <InputText
                id="email"
                type="email"
                value={getContextData('email')}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full"
                disabled={isReviewMode}
              />
            </div>
          </div>
        </Card>
      </div>

      <div className="col-12">
        <Card title="Address Information" className="mb-4">
          <div className="grid">
            <div className="col-12">
              <label htmlFor="homeAddress" className="block text-900 font-medium mb-2">
                Home Address *
              </label>
              <InputText
                id="homeAddress"
                value={getContextData('homeAddress')}
                onChange={(e) => handleInputChange('homeAddress', e.target.value)}
                className="w-full"
                disabled={isReviewMode}
              />
            </div>
            
            <div className="col-12">
              <label htmlFor="mailingAddress" className="block text-900 font-medium mb-2">
                Mailing Address
              </label>
              <InputText
                id="mailingAddress"
                value={getContextData('mailingAddress')}
                onChange={(e) => handleInputChange('mailingAddress', e.target.value)}
                className="w-full"
                disabled={isReviewMode}
              />
            </div>
            
            <div className="col-12 md:col-6">
              <label htmlFor="citizenship" className="block text-900 font-medium mb-2">
                Citizenship Type *
              </label>
              <Dropdown
                id="citizenship"
                value={getContextData('citizenship')}
                options={[
                  { label: 'US Citizen', value: 'us-citizen' },
                  { label: 'Permanent Resident', value: 'permanent-resident' },
                  { label: 'Non-Resident Alien', value: 'non-resident' }
                ]}
                onChange={(e) => handleInputChange('citizenship', e.value)}
                className="w-full"
                placeholder="Select citizenship type"
                disabled={isReviewMode}
              />
            </div>
          </div>
        </Card>
      </div>

      <div className="col-12">
        <Card title="Identification" className="mb-4">
          <FileUpload
            mode="basic"
            name="identification"
            url="/api/upload"
            accept="image/*,.pdf"
            chooseLabel="Upload ID Document"
            className="w-full"
            disabled={isReviewMode}
          />
        </Card>
      </div>

      <div className="col-12">
        <Card title="Employment Information" className="mb-4">
          <div className="grid">
            <div className="col-12 md:col-4">
              <label htmlFor="employmentStatus" className="block text-900 font-medium mb-2">
                Employment Status *
              </label>
              <Dropdown
                id="employmentStatus"
                value={getContextData('employmentStatus')}
                options={[
                  { label: 'Employed', value: 'employed' },
                  { label: 'Self-Employed', value: 'self-employed' },
                  { label: 'Retired', value: 'retired' },
                  { label: 'Unemployed', value: 'unemployed' }
                ]}
                onChange={(e) => handleInputChange('employmentStatus', e.value)}
                className="w-full"
                placeholder="Select employment status"
                disabled={isReviewMode}
              />
            </div>
            
            <div className="col-12 md:col-4">
              <label htmlFor="annualIncome" className="block text-900 font-medium mb-2">
                Annual Income Range *
              </label>
              <Dropdown
                id="annualIncome"
                value={getContextData('annualIncome')}
                options={[
                  { label: 'Under $50,000', value: 'under-50k' },
                  { label: '$50,000 - $100,000', value: '50k-100k' },
                  { label: '$100,000 - $250,000', value: '100k-250k' },
                  { label: '$250,000 - $500,000', value: '250k-500k' },
                  { label: 'Over $500,000', value: 'over-500k' }
                ]}
                onChange={(e) => handleInputChange('annualIncome', e.value)}
                className="w-full"
                placeholder="Select income range"
                disabled={isReviewMode}
              />
            </div>
            
            <div className="col-12 md:col-4">
              <label htmlFor="netWorth" className="block text-900 font-medium mb-2">
                Net Worth Range *
              </label>
              <Dropdown
                id="netWorth"
                value={getContextData('netWorth')}
                options={[
                  { label: 'Under $100,000', value: 'under-100k' },
                  { label: '$100,000 - $500,000', value: '100k-500k' },
                  { label: '$500,000 - $1,000,000', value: '500k-1m' },
                  { label: '$1,000,000 - $5,000,000', value: '1m-5m' },
                  { label: 'Over $5,000,000', value: 'over-5m' }
                ]}
                onChange={(e) => handleInputChange('netWorth', e.value)}
                className="w-full"
                placeholder="Select net worth range"
                disabled={isReviewMode}
              />
            </div>
            
            <div className="col-12">
              <label htmlFor="fundsSource" className="block text-900 font-medium mb-2">
                Source of Funds *
              </label>
              <InputTextarea
                id="fundsSource"
                value={getContextData('fundsSource')}
                onChange={(e) => handleInputChange('fundsSource', e.target.value)}
                rows={3}
                className="w-full"
                placeholder="Please describe the source of funds for this account..."
                disabled={isReviewMode}
              />
            </div>
          </div>
          
          <div className="mt-4">
            <h4 className="text-lg font-medium mb-3">Disclosure Questions</h4>
            <div className="grid">
              <div className="col-12">
                <div className="flex align-items-center mb-3">
                  <Checkbox
                    id="affiliatedFirm"
                    checked={getContextData('affiliatedFirm') || false}
                    onChange={(e) => handleInputChange('affiliatedFirm', e.checked)}
                    disabled={isReviewMode}
                  />
                  <label htmlFor="affiliatedFirm" className="ml-2">
                    I am affiliated with a financial services firm
                  </label>
                </div>
                
                <div className="flex align-items-center">
                  <Checkbox
                    id="professionalAdvisor"
                    checked={getContextData('professionalAdvisor') || false}
                    onChange={(e) => handleInputChange('professionalAdvisor', e.checked)}
                    disabled={isReviewMode}
                  />
                  <label htmlFor="professionalAdvisor" className="ml-2">
                    I am a professional financial advisor
                  </label>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="col-12">
        <Card title="Trusted Contact Information">
          <p className="text-600 mb-3">Add an emergency contact who can be reached if we're unable to contact you.</p>
          <div className="grid">
            <div className="col-12 md:col-6">
              <label htmlFor="trustedName" className="block text-900 font-medium mb-2">
                Contact Name
              </label>
              <InputText
                id="trustedName"
                value={getContextData('trustedName')}
                onChange={(e) => handleInputChange('trustedName', e.target.value)}
                className="w-full"
                placeholder="Full name"
                disabled={isReviewMode}
              />
            </div>
            
            <div className="col-12 md:col-6">
              <label htmlFor="trustedPhone" className="block text-900 font-medium mb-2">
                Contact Phone
              </label>
              <InputMask
                id="trustedPhone"
                mask="(999) 999-9999"
                value={getContextData('trustedPhone')}
                onChange={(e) => handleInputChange('trustedPhone', e.target.value)}
                className="w-full"
                placeholder="Phone number"
                disabled={isReviewMode}
              />
            </div>
            
            <div className="col-12 md:col-6">
              <label htmlFor="trustedEmail" className="block text-900 font-medium mb-2">
                Contact Email
              </label>
              <InputText
                id="trustedEmail"
                type="email"
                value={getContextData('trustedEmail')}
                onChange={(e) => handleInputChange('trustedEmail', e.target.value)}
                className="w-full"
                placeholder="Email address"
                disabled={isReviewMode}
              />
            </div>
            
            <div className="col-12 md:col-6">
              <label htmlFor="trustedRelationship" className="block text-900 font-medium mb-2">
                Relationship
              </label>
              <Dropdown
                id="trustedRelationship"
                value={getContextData('trustedRelationship')}
                options={[
                  { label: 'Spouse', value: 'spouse' },
                  { label: 'Parent', value: 'parent' },
                  { label: 'Child', value: 'child' },
                  { label: 'Sibling', value: 'sibling' },
                  { label: 'Friend', value: 'friend' },
                  { label: 'Other', value: 'other' }
                ]}
                onChange={(e) => handleInputChange('trustedRelationship', e.value)}
                className="w-full"
                placeholder="Select relationship"
                disabled={isReviewMode}
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderFirmDetailsForm = () => (
    <div className="grid">
      <div className="col-12">
        <Card title="Net Worth Assessment" className="mb-4">
          <div className="grid">
            <div className="col-12 md:col-6">
              <label htmlFor="totalNetWorth" className="block text-900 font-medium mb-2">
                Total Net Worth *
              </label>
              <Dropdown
                id="totalNetWorth"
                value={getContextData('totalNetWorth')}
                options={[
                  { label: 'Under $250,000', value: 'under-250k' },
                  { label: '$250,000 - $500,000', value: '250k-500k' },
                  { label: '$500,000 - $1,000,000', value: '500k-1m' },
                  { label: '$1,000,000 - $5,000,000', value: '1m-5m' },
                  { label: 'Over $5,000,000', value: 'over-5m' }
                ]}
                onChange={(e) => handleInputChange('totalNetWorth', e.value)}
                className="w-full"
                placeholder="Select total net worth"
                disabled={isReviewMode}
              />
            </div>
            
            <div className="col-12 md:col-6">
              <label htmlFor="liquidNetWorth" className="block text-900 font-medium mb-2">
                Liquid Net Worth *
              </label>
              <Dropdown
                id="liquidNetWorth"
                value={getContextData('liquidNetWorth')}
                options={[
                  { label: 'Under $100,000', value: 'under-100k' },
                  { label: '$100,000 - $250,000', value: '100k-250k' },
                  { label: '$250,000 - $500,000', value: '250k-500k' },
                  { label: '$500,000 - $1,000,000', value: '500k-1m' },
                  { label: 'Over $1,000,000', value: 'over-1m' }
                ]}
                onChange={(e) => handleInputChange('liquidNetWorth', e.value)}
                className="w-full"
                placeholder="Select liquid net worth"
                disabled={isReviewMode}
              />
            </div>
            
            <div className="col-12 md:col-6">
              <label htmlFor="averageAnnualIncome" className="block text-900 font-medium mb-2">
                Average Annual Income (Last 3 Years) *
              </label>
              <Dropdown
                id="averageAnnualIncome"
                value={getContextData('averageAnnualIncome')}
                options={[
                  { label: 'Under $75,000', value: 'under-75k' },
                  { label: '$75,000 - $150,000', value: '75k-150k' },
                  { label: '$150,000 - $300,000', value: '150k-300k' },
                  { label: '$300,000 - $500,000', value: '300k-500k' },
                  { label: 'Over $500,000', value: 'over-500k' }
                ]}
                onChange={(e) => handleInputChange('averageAnnualIncome', e.value)}
                className="w-full"
                placeholder="Select average annual income"
                disabled={isReviewMode}
              />
            </div>
            
            <div className="col-12 md:col-6">
              <label htmlFor="incomeSource" className="block text-900 font-medium mb-2">
                Primary Source of Income *
              </label>
              <Dropdown
                id="incomeSource"
                value={getContextData('incomeSource')}
                options={[
                  { label: 'Employment/Salary', value: 'employment' },
                  { label: 'Business Ownership', value: 'business' },
                  { label: 'Investment Income', value: 'investments' },
                  { label: 'Retirement/Pension', value: 'retirement' },
                  { label: 'Other', value: 'other' }
                ]}
                onChange={(e) => handleInputChange('incomeSource', e.value)}
                className="w-full"
                placeholder="Select primary income source"
                disabled={isReviewMode}
              />
            </div>
          </div>
        </Card>
      </div>

      <div className="col-12">
        <Card title="Investment Experience" className="mb-4">
          <div className="grid">
            <div className="col-12 md:col-6">
              <label htmlFor="investmentExperience" className="block text-900 font-medium mb-2">
                Overall Investment Experience *
              </label>
              <Dropdown
                id="investmentExperience"
                value={getContextData('investmentExperience')}
                options={[
                  { label: 'No Experience', value: 'none' },
                  { label: 'Limited (1-3 years)', value: 'limited' },
                  { label: 'Moderate (3-10 years)', value: 'moderate' },
                  { label: 'Extensive (10+ years)', value: 'extensive' },
                  { label: 'Professional', value: 'professional' }
                ]}
                onChange={(e) => handleInputChange('investmentExperience', e.value)}
                className="w-full"
                placeholder="Select investment experience"
                disabled={isReviewMode}
              />
            </div>
            
            <div className="col-12 md:col-6">
              <label htmlFor="stocksExperience" className="block text-900 font-medium mb-2">
                Stocks Experience *
              </label>
              <Dropdown
                id="stocksExperience"
                value={getContextData('stocksExperience')}
                options={[
                  { label: 'None', value: 'none' },
                  { label: 'Limited', value: 'limited' },
                  { label: 'Moderate', value: 'moderate' },
                  { label: 'Extensive', value: 'extensive' }
                ]}
                onChange={(e) => handleInputChange('stocksExperience', e.value)}
                className="w-full"
                placeholder="Select stocks experience"
                disabled={isReviewMode}
              />
            </div>
            
            <div className="col-12 md:col-6">
              <label htmlFor="bondsExperience" className="block text-900 font-medium mb-2">
                Bonds Experience *
              </label>
              <Dropdown
                id="bondsExperience"
                value={getContextData('bondsExperience')}
                options={[
                  { label: 'None', value: 'none' },
                  { label: 'Limited', value: 'limited' },
                  { label: 'Moderate', value: 'moderate' },
                  { label: 'Extensive', value: 'extensive' }
                ]}
                onChange={(e) => handleInputChange('bondsExperience', e.value)}
                className="w-full"
                placeholder="Select bonds experience"
                disabled={isReviewMode}
              />
            </div>
            
            <div className="col-12 md:col-6">
              <label htmlFor="optionsExperience" className="block text-900 font-medium mb-2">
                Options/Derivatives Experience *
              </label>
              <Dropdown
                id="optionsExperience"
                value={getContextData('optionsExperience')}
                options={[
                  { label: 'None', value: 'none' },
                  { label: 'Limited', value: 'limited' },
                  { label: 'Moderate', value: 'moderate' },
                  { label: 'Extensive', value: 'extensive' }
                ]}
                onChange={(e) => handleInputChange('optionsExperience', e.value)}
                className="w-full"
                placeholder="Select options experience"
                disabled={isReviewMode}
              />
            </div>
          </div>
        </Card>
      </div>

      <div className="col-12">
        <Card title="Liquidity Needs" className="mb-4">
          <div className="grid">
            <div className="col-12 md:col-6">
              <label htmlFor="liquidityNeeds" className="block text-900 font-medium mb-2">
                How much of your portfolio do you need to access within 2 years? *
              </label>
              <Dropdown
                id="liquidityNeeds"
                value={getContextData('liquidityNeeds')}
                options={[
                  { label: 'None (0%)', value: 'none' },
                  { label: 'Low (1-10%)', value: 'low' },
                  { label: 'Moderate (11-25%)', value: 'moderate' },
                  { label: 'High (26-50%)', value: 'high' },
                  { label: 'Very High (50%+)', value: 'very-high' }
                ]}
                onChange={(e) => handleInputChange('liquidityNeeds', e.value)}
                className="w-full"
                placeholder="Select liquidity needs"
                disabled={isReviewMode}
              />
            </div>
            
            <div className="col-12 md:col-6">
              <label htmlFor="emergencyFund" className="block text-900 font-medium mb-2">
                Do you have an emergency fund outside of this account? *
              </label>
              <Dropdown
                id="emergencyFund"
                value={getContextData('emergencyFund')}
                options={[
                  { label: 'Yes, 6+ months expenses', value: 'yes' },
                  { label: 'Yes, 3-6 months expenses', value: 'partial' },
                  { label: 'Yes, less than 3 months', value: 'minimal' },
                  { label: 'No emergency fund', value: 'no' }
                ]}
                onChange={(e) => handleInputChange('emergencyFund', e.value)}
                className="w-full"
                placeholder="Select emergency fund status"
                disabled={isReviewMode}
              />
            </div>
            
            <div className="col-12">
              <label htmlFor="liquidityPurpose" className="block text-900 font-medium mb-2">
                If you need liquidity, what would be the primary purpose?
              </label>
              <InputTextarea
                id="liquidityPurpose"
                value={getContextData('liquidityPurpose')}
                onChange={(e) => handleInputChange('liquidityPurpose', e.target.value)}
                rows={2}
                className="w-full"
                placeholder="e.g., home purchase, education, medical expenses, etc."
                disabled={isReviewMode}
              />
            </div>
          </div>
        </Card>
      </div>

      <div className="col-12">
        <Card title="Market Conditions Comfort Level">
          <div className="mb-4">
            <h4 className="text-lg font-medium mb-3">If your investment portfolio declined by 10% in one month, you would:</h4>
            <div className="grid">
              <div className="col-12">
                <div className="flex flex-column gap-3">
                  <div className="flex align-items-center">
                    <input 
                      type="radio" 
                      id="scenario1-sell-all" 
                      name="scenario1" 
                      value="sell-all"
                      checked={getContextData('scenario1') === 'sell-all'}
                      onChange={(e) => handleInputChange('scenario1', e.target.value)}
                      disabled={isReviewMode}
                      className="mr-2"
                    />
                    <label htmlFor="scenario1-sell-all">Sell all investments immediately</label>
                  </div>
                  
                  <div className="flex align-items-center">
                    <input 
                      type="radio" 
                      id="scenario1-sell-some" 
                      name="scenario1" 
                      value="sell-some"
                      checked={getContextData('scenario1') === 'sell-some'}
                      onChange={(e) => handleInputChange('scenario1', e.target.value)}
                      disabled={isReviewMode}
                      className="mr-2"
                    />
                    <label htmlFor="scenario1-sell-some">Sell some investments to reduce risk</label>
                  </div>
                  
                  <div className="flex align-items-center">
                    <input 
                      type="radio" 
                      id="scenario1-hold" 
                      name="scenario1" 
                      value="hold"
                      checked={getContextData('scenario1') === 'hold'}
                      onChange={(e) => handleInputChange('scenario1', e.target.value)}
                      disabled={isReviewMode}
                      className="mr-2"
                    />
                    <label htmlFor="scenario1-hold">Hold your investments and wait for recovery</label>
                  </div>
                  
                  <div className="flex align-items-center">
                    <input 
                      type="radio" 
                      id="scenario1-buy-more" 
                      name="scenario1" 
                      value="buy-more"
                      checked={getContextData('scenario1') === 'buy-more'}
                      onChange={(e) => handleInputChange('scenario1', e.target.value)}
                      disabled={isReviewMode}
                      className="mr-2"
                    />
                    <label htmlFor="scenario1-buy-more">Buy more investments at lower prices</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderAccountSetupForm = () => {
    const isTrustAccount = accountId === 'trust-account';
    
    return (
      <div className="grid">
        {/* Trust Information Section - Only show for trust accounts */}
        {isTrustAccount && (
          <div className="col-12">
            <Card title="Trust Information" className="mb-4">
              <div className="grid">
                <div className="col-12 md:col-6">
                  <label htmlFor="trustName" className="block text-900 font-medium mb-2">
                    Trust Name *
                  </label>
                  <InputText
                    id="trustName"
                    value={getContextData('trustName')}
                    onChange={(e) => handleInputChange('trustName', e.target.value)}
                    className="w-full"
                    placeholder="Enter full legal trust name"
                    disabled={isReviewMode}
                  />
                </div>
                
                <div className="col-12 md:col-6">
                  <label htmlFor="trustType" className="block text-900 font-medium mb-2">
                    Trust Type *
                  </label>
                  <Dropdown
                    id="trustType"
                    value={getContextData('trustType')}
                    options={[
                      { label: 'Revocable Living Trust', value: 'revocable-living' },
                      { label: 'Irrevocable Trust', value: 'irrevocable' },
                      { label: 'Charitable Remainder Trust', value: 'charitable-remainder' },
                      { label: 'Charitable Lead Trust', value: 'charitable-lead' },
                      { label: 'Grantor Trust', value: 'grantor' },
                      { label: 'Non-Grantor Trust', value: 'non-grantor' },
                      { label: 'Testamentary Trust', value: 'testamentary' }
                    ]}
                    onChange={(e) => handleInputChange('trustType', e.value)}
                    className="w-full"
                    placeholder="Select trust type"
                    disabled={isReviewMode}
                  />
                </div>
                
                <div className="col-12 md:col-4">
                  <label htmlFor="trustEffectiveDate" className="block text-900 font-medium mb-2">
                    Trust Effective Date *
                  </label>
                  <Calendar
                    id="trustEffectiveDate"
                    value={getContextData('trustEffectiveDate') || null}
                    onChange={(e) => handleInputChange('trustEffectiveDate', e.value)}
                    className="w-full"
                    showIcon
                    placeholder="Select effective date"
                    disabled={isReviewMode}
                  />
                </div>
                
                <div className="col-12 md:col-4">
                  <label htmlFor="trustEin" className="block text-900 font-medium mb-2">
                    Trust EIN *
                  </label>
                  <InputMask
                    id="trustEin"
                    mask="99-9999999"
                    value={getContextData('trustEin')}
                    onChange={(e) => handleInputChange('trustEin', e.target.value)}
                    className="w-full"
                    placeholder="XX-XXXXXXX"
                    disabled={isReviewMode}
                  />
                </div>
                
                <div className="col-12 md:col-4">
                  <label htmlFor="trustState" className="block text-900 font-medium mb-2">
                    State of Formation *
                  </label>
                  <Dropdown
                    id="trustState"
                    value={getContextData('trustState')}
                    options={[
                      { label: 'Alabama', value: 'AL' },
                      { label: 'Alaska', value: 'AK' },
                      { label: 'Arizona', value: 'AZ' },
                      { label: 'Arkansas', value: 'AR' },
                      { label: 'California', value: 'CA' },
                      { label: 'Colorado', value: 'CO' },
                      { label: 'Connecticut', value: 'CT' },
                      { label: 'Delaware', value: 'DE' },
                      { label: 'Florida', value: 'FL' },
                      { label: 'Georgia', value: 'GA' },
                      { label: 'Hawaii', value: 'HI' },
                      { label: 'Idaho', value: 'ID' },
                      { label: 'Illinois', value: 'IL' },
                      { label: 'Indiana', value: 'IN' },
                      { label: 'Iowa', value: 'IA' },
                      { label: 'Kansas', value: 'KS' },
                      { label: 'Kentucky', value: 'KY' },
                      { label: 'Louisiana', value: 'LA' },
                      { label: 'Maine', value: 'ME' },
                      { label: 'Maryland', value: 'MD' },
                      { label: 'Massachusetts', value: 'MA' },
                      { label: 'Michigan', value: 'MI' },
                      { label: 'Minnesota', value: 'MN' },
                      { label: 'Mississippi', value: 'MS' },
                      { label: 'Missouri', value: 'MO' },
                      { label: 'Montana', value: 'MT' },
                      { label: 'Nebraska', value: 'NE' },
                      { label: 'Nevada', value: 'NV' },
                      { label: 'New Hampshire', value: 'NH' },
                      { label: 'New Jersey', value: 'NJ' },
                      { label: 'New Mexico', value: 'NM' },
                      { label: 'New York', value: 'NY' },
                      { label: 'North Carolina', value: 'NC' },
                      { label: 'North Dakota', value: 'ND' },
                      { label: 'Ohio', value: 'OH' },
                      { label: 'Oklahoma', value: 'OK' },
                      { label: 'Oregon', value: 'OR' },
                      { label: 'Pennsylvania', value: 'PA' },
                      { label: 'Rhode Island', value: 'RI' },
                      { label: 'South Carolina', value: 'SC' },
                      { label: 'South Dakota', value: 'SD' },
                      { label: 'Tennessee', value: 'TN' },
                      { label: 'Texas', value: 'TX' },
                      { label: 'Utah', value: 'UT' },
                      { label: 'Vermont', value: 'VT' },
                      { label: 'Virginia', value: 'VA' },
                      { label: 'Washington', value: 'WA' },
                      { label: 'West Virginia', value: 'WV' },
                      { label: 'Wisconsin', value: 'WI' },
                      { label: 'Wyoming', value: 'WY' }
                    ]}
                    onChange={(e) => handleInputChange('trustState', e.value)}
                    className="w-full"
                    placeholder="Select state"
                    disabled={isReviewMode}
                    filter
                    filterBy="label"
                  />
                </div>
                
                <div className="col-12">
                  <label htmlFor="trustPurpose" className="block text-900 font-medium mb-2">
                    Trust Purpose *
                  </label>
                  <InputTextarea
                    id="trustPurpose"
                    value={getContextData('trustPurpose')}
                    onChange={(e) => handleInputChange('trustPurpose', e.target.value)}
                    rows={3}
                    className="w-full"
                    placeholder="Describe the primary purpose and objectives of the trust..."
                    disabled={isReviewMode}
                  />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Trustee Information - Only show for trust accounts */}
        {isTrustAccount && (
          <div className="col-12">
            <Card title="Trustee Information" className="mb-4">
              <div className="grid">
                <div className="col-12 md:col-6">
                  <label htmlFor="trusteeName" className="block text-900 font-medium mb-2">
                    Primary Trustee Name *
                  </label>
                  <InputText
                    id="trusteeName"
                    value={getContextData('trusteeName')}
                    onChange={(e) => handleInputChange('trusteeName', e.target.value)}
                    className="w-full"
                    placeholder="Full name of primary trustee"
                    disabled={isReviewMode}
                  />
                </div>
                
                <div className="col-12 md:col-6">
                  <label htmlFor="trusteePhone" className="block text-900 font-medium mb-2">
                    Trustee Phone *
                  </label>
                  <InputMask
                    id="trusteePhone"
                    mask="(999) 999-9999"
                    value={getContextData('trusteePhone')}
                    onChange={(e) => handleInputChange('trusteePhone', e.target.value)}
                    className="w-full"
                    placeholder="(XXX) XXX-XXXX"
                    disabled={isReviewMode}
                  />
                </div>
                
                <div className="col-12">
                  <label htmlFor="trusteeAddress" className="block text-900 font-medium mb-2">
                    Trustee Address *
                  </label>
                  <InputText
                    id="trusteeAddress"
                    value={getContextData('trusteeAddress')}
                    onChange={(e) => handleInputChange('trusteeAddress', e.target.value)}
                    className="w-full"
                    placeholder="Full address of primary trustee"
                    disabled={isReviewMode}
                  />
                </div>
                
                <div className="col-12">
                  <div className="flex align-items-center">
                    <Checkbox
                      id="hasSuccessorTrustee"
                      checked={getContextData('hasSuccessorTrustee') || false}
                      onChange={(e) => handleInputChange('hasSuccessorTrustee', e.checked)}
                      disabled={isReviewMode}
                    />
                    <label htmlFor="hasSuccessorTrustee" className="ml-2">
                      Successor trustee has been named
                    </label>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Standard Account Setup */}
        <div className="col-12">
          <Card title={`${getCurrentEntityName()} - Account Setup`} className="mb-4">
            <div className="grid">
              <div className="col-12 md:col-6">
                <label htmlFor="accountType" className="block text-900 font-medium mb-2">
                  Account Type *
                </label>
                <Dropdown
                  id="accountType"
                  value={getContextData('accountType')}
                  options={[
                    { label: 'Joint Taxable Account', value: 'joint-taxable' },
                    { label: 'Individual Taxable Account', value: 'individual-taxable' },
                    { label: 'Trust Account', value: 'trust' },
                    { label: 'IRA', value: 'ira' },
                    { label: 'Roth IRA', value: 'roth-ira' }
                  ]}
                  onChange={(e) => handleInputChange('accountType', e.value)}
                  className="w-full"
                  placeholder="Select account type"
                  disabled={isReviewMode}
                />
              </div>
            
            <div className="col-12 md:col-6">
              <label htmlFor="investmentObjective" className="block text-900 font-medium mb-2">
                Investment Objective *
              </label>
              <Dropdown
                id="investmentObjective"
                value={getContextData('investmentObjective')}
                options={[
                  { label: 'Growth', value: 'growth' },
                  { label: 'Income', value: 'income' },
                  { label: 'Balanced', value: 'balanced' },
                  { label: 'Capital Preservation', value: 'preservation' },
                  { label: 'Speculation', value: 'speculation' }
                ]}
                onChange={(e) => handleInputChange('investmentObjective', e.value)}
                className="w-full"
                placeholder="Select investment objective"
                disabled={isReviewMode}
              />
            </div>
            
            <div className="col-12 md:col-6">
              <label htmlFor="riskTolerance" className="block text-900 font-medium mb-2">
                Risk Tolerance *
              </label>
              <Dropdown
                id="riskTolerance"
                value={getContextData('riskTolerance')}
                options={[
                  { label: 'Conservative', value: 'conservative' },
                  { label: 'Moderate', value: 'moderate' },
                  { label: 'Aggressive', value: 'aggressive' },
                  { label: 'Very Aggressive', value: 'very-aggressive' }
                ]}
                onChange={(e) => handleInputChange('riskTolerance', e.value)}
                className="w-full"
                placeholder="Select risk tolerance"
                disabled={isReviewMode}
              />
            </div>
            
            <div className="col-12 md:col-6">
              <label htmlFor="timeHorizon" className="block text-900 font-medium mb-2">
                Time Horizon
              </label>
              <Dropdown
                id="timeHorizon"
                value={getContextData('timeHorizon')}
                options={[
                  { label: 'Less than 1 year', value: 'less-1' },
                  { label: '1-3 years', value: '1-3' },
                  { label: '3-5 years', value: '3-5' },
                  { label: '5-10 years', value: '5-10' },
                  { label: 'More than 10 years', value: 'more-10' }
                ]}
                onChange={(e) => handleInputChange('timeHorizon', e.value)}
                className="w-full"
                placeholder="Select time horizon"
                disabled={isReviewMode}
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
    );
  };

  const fundingInstances = {
    'acat': getContextData('fundingInstances')?.acat || [],
    'ach': getContextData('fundingInstances')?.ach || [],
    'initial-ach': getContextData('fundingInstances')?.['initial-ach'] || [],
    'withdrawal': getContextData('fundingInstances')?.withdrawal || [],
    'contribution': getContextData('fundingInstances')?.contribution || []
  };

  const fundingTypeNames = {
    'acat': 'ACAT Transfers',
    'ach': 'ACH Transfers', 
    'initial-ach': 'Initial ACH Transfers',
    'withdrawal': 'Systematic Withdrawals',
    'contribution': 'Systematic Contributions'
  };

  const getTotalFundingInstances = () => {
    return Object.values(fundingInstances).reduce((total, instances) => total + instances.length, 0);
  };

  const handleFundingTypeClick = (type: string) => {
    if (isReviewMode) return;
    
    const typeInstances = (fundingInstances as any)[type]?.length || 0;
    const totalInstances = getTotalFundingInstances();
    
    if (typeInstances >= 4) {
      if (toast.current) {
        toast.current.show({
          severity: 'warn',
          summary: 'Limit Reached',
          detail: `Maximum of 4 ${type.toUpperCase()} instances allowed.`,
          life: 3000
        });
      }
      return;
    }
    
    if (totalInstances >= 20) {
      if (toast.current) {
        toast.current.show({
          severity: 'warn',
          summary: 'Limit Reached',
          detail: 'Maximum of 20 total funding instances allowed.',
          life: 3000
        });
      }
      return;
    }
    
    // Show the funding form for this type
    setShowFundingForm(type);
  };

  const getAllFundingInstances = () => {
    const allInstances: any[] = [];
    Object.keys(fundingInstances).forEach(type => {
      const instances = (fundingInstances as any)[type] || [];
      instances.forEach((instance: any, index: number) => {
        allInstances.push({
          ...instance,
          type: type,
          typeName: (fundingTypeNames as any)[type] || type,
          originalIndex: index
        });
      });
    });
    return allInstances;
  };

  const handleEditInstance = (instance: any) => {
    if (isReviewMode) return;
    
    // Set up the editing state
    setEditingInstance({ type: instance.type, index: instance.originalIndex });
    
    // Pre-populate the form with existing data
    const editData: any = {};
    
    switch (instance.type) {
      case 'acat':
        editData.acatName = instance.name;
        editData.acatAmount = formatCurrency(instance.amount || '');
        editData.fromFirm = instance.details?.split(' • ')[0] || '';
        editData.transferType = instance.details?.includes('Full Transfer') ? 'Full Transfer' : 'Partial Transfer';
        break;
      case 'ach':
        editData.achName = instance.name;
        editData.achAmount = formatCurrency(instance.amount || '');
        editData.bankName = instance.details?.split(' • ')[0] || '';
        editData.achFrequency = instance.frequency;
        break;
      case 'initial-ach':
        editData['initial-achName'] = instance.name;
        editData['initial-achAmount'] = formatCurrency(instance.amount || '');
        editData.initialBank = instance.details?.split(' • ')[0] || '';
        break;
      case 'withdrawal':
        editData.withdrawalName = instance.name;
        editData.withdrawalAmount = formatCurrency(instance.amount || '');
        editData.withdrawalFreq = instance.frequency;
        break;
      case 'contribution':
        editData.contributionName = instance.name;
        editData.contributionAmount = formatCurrency(instance.amount || '');
        editData.contributionBank = instance.details?.split(' • ')[0] || '';
        editData.contributionFreq = instance.frequency;
        break;
    }
    
    setFundingFormData(editData);
    setShowFundingForm(instance.type);
  };

  const handleDeleteInstance = (instance: any) => {
    if (isReviewMode) return;
    
    const contextKey = memberId || accountId;
    const currentFormData = { ...formData };
    
    if (currentFormData[contextKey]?.fundingInstances?.[instance.type]) {
      // Remove the instance at the original index
      currentFormData[contextKey].fundingInstances![instance.type].splice(instance.originalIndex, 1);
      
      // Update the form data
      setFormData(currentFormData);
      
      // Show success message
      if (toast.current) {
        toast.current.show({
          severity: 'success',
          summary: 'Deleted',
          detail: `${instance.name} has been deleted`,
          life: 3000
        });
      }
    }
  };

  const handleFundingFormChange = (field: string, value: any) => {
    setFundingFormData({
      ...fundingFormData,
      [field]: value
    });
  };

  const collectFormData = (type: string) => {
    let name, amount;
    
    // Map the field names based on the funding type
    switch (type) {
      case 'acat':
        name = fundingFormData.acatName;
        amount = fundingFormData.acatAmount;
        break;
      case 'ach':
        name = fundingFormData.achName;
        amount = fundingFormData.achAmount;
        break;
      case 'initial-ach':
        name = fundingFormData['initial-achName'];
        amount = fundingFormData['initial-achAmount'];
        break;
      case 'withdrawal':
        name = fundingFormData.withdrawalName;
        amount = fundingFormData.withdrawalAmount;
        break;
      case 'contribution':
        name = fundingFormData.contributionName;
        amount = fundingFormData.contributionAmount;
        break;
      default:
        return null;
    }
    
    // Parse currency back to numeric value for storage
    const numericAmount = amount ? parseCurrencyValue(amount) : amount;

    if (!name || !amount) return null;

    switch (type) {
      case 'acat':
        const fromFirm = fundingFormData.fromFirm;
        const transferType = fundingFormData.transferType;
        if (!fromFirm || !transferType) return null;
        return {
          name,
          amount: numericAmount,
          frequency: 'One-time',
          details: `${fromFirm} • ${transferType} • ${amount}`,
          fromFirm,
          transferType
        };
      
      case 'ach':
        const bankName = fundingFormData.bankName;
        const achFrequency = fundingFormData.achFrequency || 'One-time';
        if (!bankName) return null;
        return {
          name,
          amount: numericAmount,
          frequency: achFrequency,
          details: `${bankName} • ${amount}`,
          bankName
        };
      
      case 'initial-ach':
        const initialBank = fundingFormData.initialBank;
        const transferDate = fundingFormData.transferDate;
        if (!initialBank || !transferDate) return null;
        return {
          name,
          amount: numericAmount,
          frequency: 'One-time',
          details: `${initialBank} • ${amount} • ${transferDate instanceof Date ? transferDate.toLocaleDateString() : transferDate}`,
          bankName: initialBank,
          transferDate
        };
      
      case 'withdrawal':
        const withdrawalFreq = fundingFormData.withdrawalFreq;
        const startDate = fundingFormData.startDate;
        if (!withdrawalFreq || !startDate) return null;
        return {
          name,
          amount: numericAmount,
          frequency: withdrawalFreq,
          details: `${withdrawalFreq} • ${amount} • Start: ${startDate instanceof Date ? startDate.toLocaleDateString() : startDate}`,
          startDate
        };
      
      case 'contribution':
        const contributionBank = fundingFormData.contributionBank;
        const contributionFreq = fundingFormData.contributionFreq;
        if (!contributionBank || !contributionFreq) return null;
        return {
          name,
          amount: numericAmount,
          frequency: contributionFreq,
          details: `${contributionFreq} • ${amount} • ${contributionBank}`,
          bankName: contributionBank
        };
      
      default:
        return null;
    }
  };

  const saveFundingInstance = (type: string, instanceData: any) => {
    const contextKey = memberId || accountId;
    const currentFormData = { ...formData };
    
    if (!currentFormData[contextKey]) {
      currentFormData[contextKey] = {};
    }
    
    if (!currentFormData[contextKey].fundingInstances) {
      currentFormData[contextKey].fundingInstances = {
        'acat': [],
        'ach': [],
        'initial-ach': [],
        'withdrawal': [],
        'contribution': []
      };
    }
    
    if (!currentFormData[contextKey].fundingInstances![type]) {
      currentFormData[contextKey].fundingInstances![type] = [];
    }
    
    // Check if we're editing an existing instance
    if (editingInstance && editingInstance.type === type) {
      // Update existing instance
      currentFormData[contextKey].fundingInstances![type][editingInstance.index] = instanceData;
      setEditingInstance(null); // Clear editing state
      
      // Show success message
      if (toast.current) {
        toast.current.show({
          severity: 'success',
          summary: 'Updated',
          detail: `${instanceData.name} has been updated`,
          life: 3000
        });
      }
    } else {
      // Add new instance
      currentFormData[contextKey].fundingInstances![type].push(instanceData);
      
      // Show success message
      if (toast.current) {
        toast.current.show({
          severity: 'success',
          summary: 'Added',
          detail: `${instanceData.name} has been added`,
          life: 3000
        });
      }
    }
    
    // Update the form data
    setFormData(currentFormData);
    
    // Recheck completion status for funding section after adding/updating instance
    setTimeout(() => {
      checkSectionCompletion();
    }, 100);
  };

  const renderFundingTypeForm = (type: string) => {
    const forms = {
      'acat': (
        <Card title="New ACAT Transfer" className="mb-4">
          <div className="grid">
            <div className="col-12 md:col-6">
              <label htmlFor="acatName" className="block text-900 font-medium mb-2">Name *</label>
              <InputText 
                id="acatName" 
                className="w-full" 
                placeholder="Transfer name"
                value={fundingFormData.acatName || ''}
                onChange={(e) => handleFundingFormChange('acatName', e.target.value)}
              />
            </div>
            <div className="col-12 md:col-6">
              <label htmlFor="acatAmount" className="block text-900 font-medium mb-2">Amount *</label>
              <InputText 
                id="acatAmount" 
                className="w-full" 
                placeholder="$0.00"
                value={fundingFormData.acatAmount || ''}
                onChange={(e) => handleCurrencyInputChange('acatAmount', e.target.value)}
              />
            </div>
            <div className="col-12 md:col-6">
              <label htmlFor="fromFirm" className="block text-900 font-medium mb-2">From Firm *</label>
              <InputText 
                id="fromFirm" 
                className="w-full" 
                placeholder="Current custodian"
                value={fundingFormData.fromFirm || ''}
                onChange={(e) => handleFundingFormChange('fromFirm', e.target.value)}
              />
            </div>
            <div className="col-12 md:col-6">
              <label htmlFor="transferType" className="block text-900 font-medium mb-2">Transfer Type *</label>
              <Dropdown 
                id="transferType" 
                className="w-full" 
                options={[
                  { label: 'Full Transfer', value: 'Full Transfer' },
                  { label: 'Partial Transfer', value: 'Partial Transfer' }
                ]} 
                placeholder="Select type"
                value={fundingFormData.transferType || ''}
                onChange={(e) => handleFundingFormChange('transferType', e.value)}
              />
            </div>
          </div>
        </Card>
      ),
      'ach': (
        <Card title="New ACH Transfer" className="mb-4">
          <div className="grid">
            <div className="col-12 md:col-6">
              <label htmlFor="achName" className="block text-900 font-medium mb-2">Name *</label>
              <InputText 
                id="achName" 
                className="w-full" 
                placeholder="Transfer name"
                value={fundingFormData.achName || ''}
                onChange={(e) => handleFundingFormChange('achName', e.target.value)}
              />
            </div>
            <div className="col-12 md:col-6">
              <label htmlFor="achAmount" className="block text-900 font-medium mb-2">Amount *</label>
              <InputText 
                id="achAmount" 
                className="w-full" 
                placeholder="$0.00"
                value={fundingFormData.achAmount || ''}
                onChange={(e) => handleCurrencyInputChange('achAmount', e.target.value)}
              />
            </div>
            <div className="col-12 md:col-6">
              <label htmlFor="bankName" className="block text-900 font-medium mb-2">Bank Name *</label>
              <InputText 
                id="bankName" 
                className="w-full" 
                placeholder="Bank name"
                value={fundingFormData.bankName || ''}
                onChange={(e) => handleFundingFormChange('bankName', e.target.value)}
              />
            </div>
            <div className="col-12 md:col-6">
              <label htmlFor="achFrequency" className="block text-900 font-medium mb-2">Frequency</label>
              <Dropdown 
                id="achFrequency" 
                className="w-full" 
                options={[
                  { label: 'One-time', value: 'One-time' },
                  { label: 'Monthly', value: 'Monthly' },
                  { label: 'Quarterly', value: 'Quarterly' }
                ]} 
                placeholder="Select frequency"
                value={fundingFormData.achFrequency || ''}
                onChange={(e) => handleFundingFormChange('achFrequency', e.value)}
              />
            </div>
          </div>
        </Card>
      ),
      'initial-ach': (
        <Card title="New Initial ACH Transfer" className="mb-4">
          <div className="grid">
            <div className="col-12 md:col-6">
              <label htmlFor="initialName" className="block text-900 font-medium mb-2">Name *</label>
              <InputText 
                id="initialName" 
                className="w-full" 
                placeholder="Transfer name"
                value={fundingFormData['initial-achName'] || ''}
                onChange={(e) => handleFundingFormChange('initial-achName', e.target.value)}
              />
            </div>
            <div className="col-12 md:col-6">
              <label htmlFor="initialAmount" className="block text-900 font-medium mb-2">Amount *</label>
              <InputText 
                id="initialAmount" 
                className="w-full" 
                placeholder="$0.00"
                value={fundingFormData['initial-achAmount'] || ''}
                onChange={(e) => handleCurrencyInputChange('initial-achAmount', e.target.value)}
              />
            </div>
            <div className="col-12 md:col-6">
              <label htmlFor="initialBank" className="block text-900 font-medium mb-2">Bank Name *</label>
              <InputText 
                id="initialBank" 
                className="w-full" 
                placeholder="Bank name"
                value={fundingFormData.initialBank || ''}
                onChange={(e) => handleFundingFormChange('initialBank', e.target.value)}
              />
            </div>
            <div className="col-12 md:col-6">
              <label htmlFor="transferDate" className="block text-900 font-medium mb-2">Transfer Date *</label>
              <Calendar 
                id="transferDate" 
                className="w-full"
                value={fundingFormData.transferDate || null}
                onChange={(e) => handleFundingFormChange('transferDate', e.value)}
              />
            </div>
          </div>
        </Card>
      ),
      'withdrawal': (
        <Card title="New Systematic Withdrawal" className="mb-4">
          <div className="grid">
            <div className="col-12 md:col-6">
              <label htmlFor="withdrawalName" className="block text-900 font-medium mb-2">Name *</label>
              <InputText 
                id="withdrawalName" 
                className="w-full" 
                placeholder="Withdrawal name"
                value={fundingFormData.withdrawalName || ''}
                onChange={(e) => handleFundingFormChange('withdrawalName', e.target.value)}
              />
            </div>
            <div className="col-12 md:col-6">
              <label htmlFor="withdrawalAmount" className="block text-900 font-medium mb-2">Amount *</label>
              <InputText 
                id="withdrawalAmount" 
                className="w-full" 
                placeholder="$0.00"
                value={fundingFormData.withdrawalAmount || ''}
                onChange={(e) => handleCurrencyInputChange('withdrawalAmount', e.target.value)}
              />
            </div>
            <div className="col-12 md:col-6">
              <label htmlFor="withdrawalFreq" className="block text-900 font-medium mb-2">Frequency *</label>
              <Dropdown 
                id="withdrawalFreq" 
                className="w-full" 
                options={[
                  { label: 'Monthly', value: 'Monthly' },
                  { label: 'Quarterly', value: 'Quarterly' },
                  { label: 'Semi-Annually', value: 'Semi-Annually' },
                  { label: 'Annually', value: 'Annually' }
                ]} 
                placeholder="Select frequency"
                value={fundingFormData.withdrawalFreq || ''}
                onChange={(e) => handleFundingFormChange('withdrawalFreq', e.value)}
              />
            </div>
            <div className="col-12 md:col-6">
              <label htmlFor="startDate" className="block text-900 font-medium mb-2">Start Date *</label>
              <Calendar 
                id="startDate" 
                className="w-full"
                value={fundingFormData.startDate || null}
                onChange={(e) => handleFundingFormChange('startDate', e.value)}
              />
            </div>
          </div>
        </Card>
      ),
      'contribution': (
        <Card title="New Systematic Contribution" className="mb-4">
          <div className="grid">
            <div className="col-12 md:col-6">
              <label htmlFor="contributionName" className="block text-900 font-medium mb-2">Name *</label>
              <InputText 
                id="contributionName" 
                className="w-full" 
                placeholder="Contribution name"
                value={fundingFormData.contributionName || ''}
                onChange={(e) => handleFundingFormChange('contributionName', e.target.value)}
              />
            </div>
            <div className="col-12 md:col-6">
              <label htmlFor="contributionAmount" className="block text-900 font-medium mb-2">Amount *</label>
              <InputText 
                id="contributionAmount" 
                className="w-full" 
                placeholder="$0.00"
                value={fundingFormData.contributionAmount || ''}
                onChange={(e) => handleCurrencyInputChange('contributionAmount', e.target.value)}
              />
            </div>
            <div className="col-12 md:col-6">
              <label htmlFor="contributionBank" className="block text-900 font-medium mb-2">Bank Name *</label>
              <InputText 
                id="contributionBank" 
                className="w-full" 
                placeholder="Bank name"
                value={fundingFormData.contributionBank || ''}
                onChange={(e) => handleFundingFormChange('contributionBank', e.target.value)}
              />
            </div>
            <div className="col-12 md:col-6">
              <label htmlFor="contributionFreq" className="block text-900 font-medium mb-2">Frequency *</label>
              <Dropdown 
                id="contributionFreq" 
                className="w-full" 
                options={[
                  { label: 'Monthly', value: 'Monthly' },
                  { label: 'Bi-weekly', value: 'Bi-weekly' },
                  { label: 'Weekly', value: 'Weekly' }
                ]} 
                placeholder="Select frequency"
                value={fundingFormData.contributionFreq || ''}
                onChange={(e) => handleFundingFormChange('contributionFreq', e.value)}
              />
            </div>
          </div>
        </Card>
      )
    };

    return (
      <div>
        {(forms as any)[type]}
        <div className="flex gap-2 justify-content-end">
          <Button 
            label="Cancel" 
            severity="secondary" 
            onClick={() => {
              setShowFundingForm(null);
              setFundingFormData({});
              setEditingInstance(null);
            }}
          />
          <Button 
            label={editingInstance ? "Update Instance" : "Save Instance"}
            onClick={() => {
              // Collect form data based on type
              const formData = collectFormData(type);
              if (formData) {
                saveFundingInstance(type, formData);
                if (toast.current) {
                  toast.current.show({
                    severity: 'success',
                    summary: 'Instance Created',
                    detail: `${(fundingTypeNames as any)[type]} instance saved`,
                    life: 2000
                  });
                }
                // Clear form data and hide form
                setFundingFormData({});
                setShowFundingForm(null);
              } else {
                if (toast.current) {
                  toast.current.show({
                    severity: 'error',
                    summary: 'Missing Data',
                    detail: 'Please fill in all required fields',
                    life: 3000
                  });
                }
              }
            }}
          />
        </div>
      </div>
    );
  };

  const renderFundingForm = () => (
    <div className="grid">
      <div className="col-12">
        <Card title={`${getCurrentEntityName()} - Funding`} className="mb-4">
          <div className="funding-dashboard">
            <div className="flex justify-content-between align-items-center mb-4">
              <h3 className="text-xl font-semibold m-0">Funding Types</h3>
            </div>
            
            {/* Smaller buttons in a single row */}
            <div className="grid">
              <div className="col">
                <div 
                  className={`funding-type-button ${fundingInstances.acat.length >= 4 ? 'disabled' : ''}`}
                  onClick={() => handleFundingTypeClick('acat')}
                >
                  <div className="funding-type-name">Add ACAT <i className="pi pi-plus"></i></div>
                </div>
              </div>
              
              <div className="col">
                <div 
                  className={`funding-type-button ${fundingInstances.ach.length >= 4 ? 'disabled' : ''}`}
                  onClick={() => handleFundingTypeClick('ach')}
                >
                  <div className="funding-type-name">Add ACH <i className="pi pi-plus"></i></div>
                </div>
              </div>
              
              <div className="col">
                <div 
                  className={`funding-type-button ${fundingInstances['initial-ach'].length >= 4 ? 'disabled' : ''}`}
                  onClick={() => handleFundingTypeClick('initial-ach')}
                >
                  <div className="funding-type-name">Add Initial ACH <i className="pi pi-plus"></i></div>
                </div>
              </div>
              
              <div className="col">
                <div 
                  className={`funding-type-button ${fundingInstances.withdrawal.length >= 4 ? 'disabled' : ''}`}
                  onClick={() => handleFundingTypeClick('withdrawal')}
                >
                  <div className="funding-type-name">Add Withdrawal <i className="pi pi-plus"></i></div>
                </div>
              </div>
              
              <div className="col">
                <div 
                  className={`funding-type-button ${fundingInstances.contribution.length >= 4 ? 'disabled' : ''}`}
                  onClick={() => handleFundingTypeClick('contribution')}
                >
                  <div className="funding-type-name">Add Contribution <i className="pi pi-plus"></i></div>
                </div>
              </div>
            </div>
            
            {/* Show funding form if one is selected */}
            {showFundingForm && (
              <div className="mt-4">
                {renderFundingTypeForm(showFundingForm)}
              </div>
            )}
            
            {/* Unified Funding Instances Grid */}
            {getAllFundingInstances().length > 0 && (
              <div className="mt-4">
                <h4 className="text-lg font-medium mb-3">Current Funding Instances</h4>
                <div className="grid">
                  <div className="col-12">
                    <div className="funding-instances-table">
                      <div className="grid bg-blue-50 p-2 font-semibold text-sm">
                        <div className="col-3">Type</div>
                        <div className="col-3">Name</div>
                        <div className="col-2">Amount</div>
                        <div className="col-2">Frequency</div>
                        <div className="col-2">Actions</div>
                      </div>
                      {getAllFundingInstances().map((instance: any, index: number) => (
                        <div key={index} className="grid p-2 border-bottom-1 surface-border align-items-center">
                          <div className="col-3">
                            <span className="text-sm font-medium">{instance.typeName}</span>
                          </div>
                          <div className="col-3">
                            <span className="text-sm">{instance.name}</span>
                          </div>
                          <div className="col-2">
                            <span className="text-sm">
                              {formatStoredAmount(instance.amount)}
                            </span>
                          </div>
                          <div className="col-2">
                            <span className="text-sm">
                              {instance.frequency || 'N/A'}
                            </span>
                          </div>
                          <div className="col-2">
                            <div className="flex gap-1">
                              <Button 
                                icon="pi pi-pencil" 
                                size="small" 
                                text 
                                severity="secondary"
                                disabled={isReviewMode}
                                onClick={() => handleEditInstance(instance)}
                                tooltip="Edit"
                                tooltipOptions={{ position: 'top' }}
                              />
                              <Button 
                                icon="pi pi-trash" 
                                size="small" 
                                text 
                                severity="danger"
                                disabled={isReviewMode}
                                onClick={() => handleDeleteInstance(instance)}
                                tooltip="Delete"
                                tooltipOptions={{ position: 'top' }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {getAllFundingInstances().length === 0 && !showFundingForm && (
              <div className="text-center text-600 py-6">
                <i className="pi pi-info-circle text-2xl mb-3"></i>
                <p>No funding instances created yet.</p>
                <p>Click on a funding type above to get started.</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );

  const renderReviewMode = () => {
    // Use the getter function to ensure we have the latest data
    const currentFormData = getCurrentFormData();
    
    // Define memberData and accountData for the review mode
    const memberData = [
      { id: 'john-smith', name: 'John Smith' },
      { id: 'mary-smith', name: 'Mary Smith' },
      { id: 'smith-trust', name: 'Smith Family Trust' }
    ];
    
    const accountData = [
      { id: 'joint-account', name: 'Joint Account' },
      { id: 'individual-account', name: 'Individual Account' },
      { id: 'trust-account', name: 'Family Trust Account' }
    ];

    const getCurrentSectionTitle = () => {
      const entityName = memberId ? 
        memberData.find(m => m.id === memberId)?.name : 
        accountData.find(a => a.id === accountId)?.name;
      
      switch (section) {
        case 'owner-details': return `${entityName} - Personal Details`;
        case 'firm-details': return `${entityName} - Firm Details`;
        case 'account-setup': return `${entityName} - Account Setup`;
        case 'funding': return `${entityName} - Funding`;
        default: return 'Review';
      }
    };

    const formatValue = (key: string, value: any) => {
      if (!value) return 'Not provided';
      
      // Handle Date objects
      if (value instanceof Date) {
        return value.toLocaleDateString();
      }
      
      // Handle boolean values
      if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
      }
      
      // Handle complex objects (like fundingInstances)
      if (typeof value === 'object' && !Array.isArray(value)) {
        return 'See details below';
      }
      
      return value.toString();
    };

    const formatFieldName = (key: string) => {
      const fieldNames: { [key: string]: string } = {
        firstName: 'First Name',
        middleInitial: 'Middle Initial',
        lastName: 'Last Name',
        dateOfBirth: 'Date of Birth',
        ssn: 'Social Security Number',
        phoneHome: 'Home Phone',
        phoneMobile: 'Mobile Phone',
        email: 'Email Address',
        homeAddress: 'Home Address',
        mailingAddress: 'Mailing Address',
        citizenship: 'Citizenship Type',
        employmentStatus: 'Employment Status',
        annualIncome: 'Annual Income',
        netWorth: 'Net Worth',
        fundsSource: 'Source of Funds',
        totalNetWorth: 'Total Net Worth',
        liquidNetWorth: 'Liquid Net Worth',
        averageAnnualIncome: 'Average Annual Income (Last 3 Years)',
        incomeSource: 'Primary Source of Income',
        investmentExperience: 'Overall Investment Experience',
        stocksExperience: 'Stocks Experience',
        bondsExperience: 'Bonds Experience',
        optionsExperience: 'Options/Derivatives Experience',
        liquidityNeeds: 'Portfolio Liquidity Needs (2 Years)',
        emergencyFund: 'Emergency Fund Status',
        liquidityPurpose: 'Primary Liquidity Purpose',
        scenario1: 'Market Decline Response (10% Drop)',
        accountType: 'Account Type',
        investmentObjective: 'Investment Objective',
        riskTolerance: 'Risk Tolerance',
        timeHorizon: 'Time Horizon',
        trustedName: 'Trusted Contact Name',
        trustedPhone: 'Trusted Contact Phone',
        trustedEmail: 'Trusted Contact Email',
        trustedRelationship: 'Trusted Contact Relationship',
        affiliatedFirm: 'Affiliated with Financial Firm',
        professionalAdvisor: 'Professional Financial Advisor',
        trustName: 'Trust Name',
        trustType: 'Trust Type',
        trustEffectiveDate: 'Trust Effective Date',
        trustEin: 'Trust EIN',
        trustState: 'State of Formation',
        trustPurpose: 'Trust Purpose',
        trusteeName: 'Primary Trustee Name',
        trusteePhone: 'Trustee Phone',
        trusteeAddress: 'Trustee Address',
        hasSuccessorTrustee: 'Successor Trustee Named'
      };
      
      return fieldNames[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    };

    // Special handling for funding section in review mode - table format
    if (section === 'funding') {
      const allInstances = getAllFundingInstances();

      return (
        <div className="grid">
          <div className="col-12">
            <Card title={`Review: ${getCurrentSectionTitle()}`} className="mb-4">
              {allInstances.length > 0 ? (
                <div>
                  <div className="review-section-header">
                    <i className="pi pi-dollar"></i>
                    Funding Instances ({allInstances.length})
                  </div>
                  <div className="funding-review-table">
                    {/* Table Header */}
                    <div className="grid bg-blue-50 p-3 font-semibold text-sm border-round-top">
                      <div className="col-3">Type</div>
                      <div className="col-3">Name</div>
                      <div className="col-3">Amount</div>
                      <div className="col-3">Frequency</div>
                    </div>
                    {/* Table Rows */}
                    {allInstances.map((instance: any, index: number) => (
                      <div key={index} className="grid p-3 border-bottom-1 surface-border align-items-center review-table-row">
                        <div className="col-3">
                          <span className="text-sm font-medium text-blue-600">{instance.typeName}</span>
                        </div>
                        <div className="col-3">
                          <span className="text-sm font-medium">{instance.name}</span>
                        </div>
                        <div className="col-3">
                          <span className="text-sm font-semibold text-green-600">
                            {formatStoredAmount(instance.amount)}
                          </span>
                        </div>
                        <div className="col-3">
                          <span className="text-sm text-600 capitalize">{instance.frequency}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center text-600 py-4">
                  <i className="pi pi-info-circle text-2xl mb-3"></i>
                  <p>No funding instances created yet.</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      );
    }

    // Regular review mode for other sections - organize by logical groups with headers
    const renderSectionContent = () => {
      if (section === 'owner-details') {
        const sectionGroups = [
          {
            title: 'Personal Information',
            icon: 'pi pi-user',
            fields: ['firstName', 'middleInitial', 'lastName', 'dateOfBirth', 'ssn']
          },
          {
            title: 'Contact Information', 
            icon: 'pi pi-phone',
            fields: ['phoneHome', 'phoneMobile', 'email', 'homeAddress', 'mailingAddress']
          },
          {
            title: 'Identity & Employment',
            icon: 'pi pi-id-card', 
            fields: ['citizenship', 'employmentStatus', 'annualIncome', 'netWorth', 'fundsSource']
          },
          {
            title: 'Disclosure Questions',
            icon: 'pi pi-question-circle',
            fields: ['affiliatedFirm', 'professionalAdvisor']
          },
          {
            title: 'Trusted Contact',
            icon: 'pi pi-users',
            fields: ['trustedName', 'trustedPhone', 'trustedEmail', 'trustedRelationship']
          }
        ];

        return renderGroupedFields(sectionGroups);
      } else if (section === 'firm-details') {
        const sectionGroups = [
          {
            title: 'Net Worth Assessment',
            icon: 'pi pi-chart-line',
            fields: ['totalNetWorth', 'liquidNetWorth', 'averageAnnualIncome', 'incomeSource']
          },
          {
            title: 'Investment Experience',
            icon: 'pi pi-star',
            fields: ['investmentExperience', 'stocksExperience', 'bondsExperience', 'optionsExperience']
          },
          {
            title: 'Liquidity Needs',
            icon: 'pi pi-dollar',
            fields: ['liquidityNeeds', 'emergencyFund', 'liquidityPurpose']
          },
          {
            title: 'Market Conditions',
            icon: 'pi pi-trending-up',
            fields: ['scenario1']
          }
        ];

        return renderGroupedFields(sectionGroups);
      } else if (section === 'account-setup') {
        const isTrustAccount = accountId === 'trust-account';
        const sectionGroups = [
          {
            title: 'Account Information',
            icon: 'pi pi-briefcase',
            fields: ['accountType', 'investmentObjective', 'riskTolerance', 'timeHorizon']
          }
        ];

        if (isTrustAccount) {
          sectionGroups.push(
            {
              title: 'Trust Details',
              icon: 'pi pi-shield',
              fields: ['trustName', 'trustType', 'trustEffectiveDate', 'trustEin', 'trustState', 'trustPurpose']
            },
            {
              title: 'Trustee Information', 
              icon: 'pi pi-user-plus',
              fields: ['trusteeName', 'trusteePhone', 'trusteeAddress', 'hasSuccessorTrustee']
            }
          );
        }

        return renderGroupedFields(sectionGroups);
      }

      return null;
    };

    const renderGroupedFields = (sectionGroups: any[]) => {
      const hasAnyData = sectionGroups.some(group => 
        group.fields.some((field: string) => {
          const value = currentFormData[field];
          return value !== null && value !== undefined && value !== '';
        })
      );

      if (!hasAnyData) {
        return (
          <div className="text-center text-600 py-4">
            <i className="pi pi-info-circle text-2xl mb-3"></i>
            <p>No data available for review in this section.</p>
            <p>Switch to Edit mode to add information.</p>
          </div>
        );
      }

      return (
        <div>
          {sectionGroups.map((group, groupIndex) => {
            const fieldsWithData = group.fields.filter((field: string) => {
              const value = currentFormData[field];
              return value !== null && value !== undefined && value !== '';
            });

            if (fieldsWithData.length === 0) return null;

            return (
              <div key={groupIndex}>
                <div className="review-section-header">
                  <i className={group.icon}></i>
                  {group.title}
                </div>
                <div className="grid">
                  {fieldsWithData.map((field: string) => (
                    <div key={field} className="col-12 md:col-6 mb-2">
                      <div className="review-item">
                        <div className="review-field-label">
                          {formatFieldName(field)}
                        </div>
                        <div className="review-field-value">
                          {formatValue(field, currentFormData[field])}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      );
    };

    return (
      <div className="grid">
        <div className="col-12">
          <Card title={`Review: ${getCurrentSectionTitle()}`} className="mb-4">
            {renderSectionContent()}
          </Card>
        </div>
      </div>
    );
  };

  const renderForm = () => {
    if (isReviewMode) {
      return renderReviewMode();
    }

    switch (section) {
      case 'owner-details':  // Personal Details
        return renderOwnerDetailsForm();
      case 'firm-details':
        return renderFirmDetailsForm();
      case 'account-setup':
        return renderAccountSetupForm();
      case 'funding':
        return renderFundingForm();
      default:
        return (
          <Card title="Form">
            <p>Select a section from the sidebar to begin.</p>
          </Card>
        );
    }
  };

  return (
    <div className="account-form" key={`${section}-${memberId}-${accountId}-${isReviewMode}`}>
      {renderForm()}
      
      <div className="flex justify-content-between align-items-center mt-4 pt-3 border-top-1 surface-border">
        <Button 
          label="Previous" 
          icon="pi pi-arrow-left"
          severity="secondary"
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className="px-4 py-2"
        />
        <div className="flex align-items-center gap-2 text-600 text-sm">
          {canGoPrevious && canGoNext && (
            <span>Navigate between sections</span>
          )}
          {!canGoPrevious && canGoNext && (
            <span>Beginning of form</span>
          )}
          {canGoPrevious && !canGoNext && (
            <span>End of form</span>
          )}
        </div>
        <Button 
          label="Next" 
          icon="pi pi-arrow-right"
          onClick={onNext}
          disabled={!canGoNext}
          className="px-4 py-2 next-button"
        />
      </div>
    </div>
  );
};