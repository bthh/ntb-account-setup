import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from 'primereact/sidebar';
import { Button } from 'primereact/button';
import { InputSwitch } from 'primereact/inputswitch';
import { Badge } from 'primereact/badge';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import { Accordion, AccordionTab } from 'primereact/accordion';

// Import PrimeReact CSS
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

import './App.css';
import { AccountForm } from './components/AccountForm';
import { CompletionStatus, FormData, Section } from './types/index';

const App: React.FC = () => {
  const toast = useRef<Toast>(null);
  const isInitialLoad = useRef(true);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(320); // Default width in pixels
  const [isResizing, setIsResizing] = useState(false);
  const [expandedMemberTabs, setExpandedMemberTabs] = useState<number[]>([0]); // Track expanded member tabs (by index)
  const [expandedAccountTabs, setExpandedAccountTabs] = useState<number[]>([]); // Track expanded account tabs (by index)
  const [currentSection, setCurrentSection] = useState<Section>('owner-details');
  const [currentMember, setCurrentMember] = useState<string>('john-smith');
  const [currentAccount, setCurrentAccount] = useState<string>('');
  const [isReviewMode, setIsReviewMode] = useState(false);
  // Initialize with sample data like V1
  const [formData, setFormData] = useState<FormData>({
    'john-smith': {
      firstName: 'John',
      middleInitial: 'A', 
      lastName: 'Smith',
      dateOfBirth: new Date('1985-06-15'),
      ssn: '123-45-6789',
      email: 'john.smith@example.com',
      phoneHome: '(555) 123-4567',
      phoneMobile: '(555) 987-6543',
      homeAddress: '123 Main Street, Anytown, ST 12345',
      mailingAddress: 'Same as home address',
      citizenship: 'us-citizen',
      employmentStatus: 'employed',
      annualIncome: '100k-250k',
      netWorth: '500k-1m',
      fundsSource: 'Employment and investment income'
    },
    'mary-smith': {
      firstName: 'Mary',
      middleInitial: 'L',
      lastName: 'Smith', 
      dateOfBirth: new Date('1987-08-22'),
      email: 'mary.smith@example.com',
      phoneHome: '(555) 123-4567',
      phoneMobile: '(555) 987-6544',
      homeAddress: '123 Main Street, Anytown, ST 12345',
      employmentStatus: 'employed',
      annualIncome: '50k-100k'
    },
    'smith-trust': {
      firstName: 'Smith Family',
      middleInitial: '',
      lastName: 'Trust',
      dateOfBirth: new Date('2020-01-01'),
      email: 'trust@smithfamily.com',
      phoneHome: '(555) 123-4567',
      phoneMobile: '(555) 123-4567',
      homeAddress: '123 Main Street, Anytown, ST 12345',
      employmentStatus: 'trust',
      annualIncome: 'over-500k'
    },
    'joint-account': {
      accountType: 'joint-taxable',
      investmentObjective: 'growth',
      riskTolerance: 'moderate',
      initialDeposit: '$50,000',
      fundingInstances: {
        'acat': [
          {
            id: 'acat-1',
            name: 'Wells Fargo Transfer',
            details: 'Wells Fargo • Full Transfer • $75,000',
            amount: '75000',
            frequency: 'one-time',
            type: 'acat',
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01')
          }
        ],
        'ach': [
          {
            id: 'ach-1',
            name: 'Chase Bank ACH',
            details: 'Chase Bank • $25,000',
            amount: '25000',
            frequency: 'one-time',
            type: 'ach',
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01')
          }
        ],
        'initial-ach': [],
        'withdrawal': [],
        'contribution': [
          {
            id: 'contrib-1',
            name: 'Monthly Contribution',
            details: 'Monthly • $2,000 • Chase Bank',
            amount: '2000',
            frequency: 'monthly',
            type: 'contribution',
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01')
          }
        ]
      }
    },
    'individual-account': {
      accountType: 'individual-taxable',
      investmentObjective: 'income',
      riskTolerance: 'conservative',
      fundingInstances: {
        'acat': [],
        'ach': [],
        'initial-ach': [],
        'withdrawal': [],
        'contribution': []
      }
    },
    'trust-account': {
      accountType: 'trust',
      investmentObjective: 'growth',
      riskTolerance: 'aggressive',
      trustName: 'Smith Family Revocable Living Trust',
      trustType: 'revocable-living',
      trustEffectiveDate: new Date('2020-01-15'),
      trustEin: '12-3456789',
      trustState: 'CA',
      trustPurpose: 'To manage and distribute family assets for the benefit of current and future generations of the Smith family, providing financial security and wealth preservation.',
      trusteeName: 'John A. Smith',
      trusteePhone: '(555) 123-4567',
      trusteeAddress: '123 Main Street, Anytown, CA 12345',
      hasSuccessorTrustee: true,
      fundingInstances: {
        'acat': [],
        'ach': [],
        'initial-ach': [],
        'withdrawal': [],
        'contribution': []
      }
    }
  });
  const [completionStatus, setCompletionStatus] = useState<CompletionStatus>({
    members: {
      'john-smith': {
        'owner-details': false,  // Will be calculated based on actual data
        'firm-details': false
      },
      'mary-smith': {
        'owner-details': false,  // Will be calculated based on actual data  
        'firm-details': false
      },
      'smith-trust': {
        'owner-details': false,  // Will be calculated based on actual data
        'firm-details': false
      }
    },
    accounts: {
      'joint-account': {
        'account-setup': false,  // Will be calculated based on actual data
        'funding': false,
        'firm-details': false
      },
      'individual-account': {
        'account-setup': false,  // Will be calculated based on actual data
        'funding': false,
        'firm-details': false
      },
      'trust-account': {
        'account-setup': false,  // Will be calculated based on actual data
        'funding': false,
        'firm-details': false
      }
    }
  });

  // Recalculate completion status when form data changes
  useEffect(() => {
    const newCompletionStatus = { ...completionStatus };
    
    // Required fields mapping (same as in AccountForm)
    const requiredFields: { [section: string]: string[] } = {
      'owner-details': [
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
      ],
      'funding': []
    };

    // Check member sections
    Object.keys(newCompletionStatus.members).forEach(memberId => {
      ['owner-details', 'firm-details'].forEach(section => {
        const memberData = formData[memberId] || {};
        const fields = requiredFields[section];
        
        const isComplete = fields.every(fieldName => {
          const value = memberData[fieldName];
          if (value === null || value === undefined) return false;
          if (typeof value === 'string') return value.trim() !== '';
          if (typeof value === 'boolean') return true;
          if (value instanceof Date) return true;
          return Boolean(value);
        });
        
        newCompletionStatus.members[memberId][section] = isComplete;
      });
    });

    // Check account sections
    Object.keys(newCompletionStatus.accounts).forEach(accountId => {
      ['account-setup', 'funding'].forEach(section => {
        const accountData = formData[accountId] || {};
        
        if (section === 'funding') {
          // Special handling for funding - check if at least one funding instance exists
          const fundingInstances = accountData.fundingInstances || {};
          const hasAnyInstance = Object.values(fundingInstances).some((instances: any) => 
            Array.isArray(instances) && instances.length > 0
          );
          newCompletionStatus.accounts[accountId][section] = hasAnyInstance;
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
          
          const isComplete = allRequiredFields.every(fieldName => {
            const value = accountData[fieldName];
            if (value === null || value === undefined) return false;
            if (typeof value === 'string') return value.trim() !== '';
            if (typeof value === 'boolean') return true;
            if (value instanceof Date) return true;
            return Boolean(value);
          });
          newCompletionStatus.accounts[accountId][section] = isComplete;
        } else {
          // Regular field checking for other sections
          const fields = requiredFields[section];
          const isComplete = fields.every(fieldName => {
            const value = accountData[fieldName];
            if (value === null || value === undefined) return false;
            if (typeof value === 'string') return value.trim() !== '';
            if (typeof value === 'boolean') return true;
            if (value instanceof Date) return true;
            return Boolean(value);
          });
          newCompletionStatus.accounts[accountId][section] = isComplete;
        }
      });
    });

    setCompletionStatus(newCompletionStatus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  // Auto-save functionality - save behind the scenes without notification
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('accountSetupData', JSON.stringify(formData));
    }, 2000);

    return () => clearTimeout(timer);
  }, [formData]);

  // Show auto-save notification only on section changes (not on initial load)
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }
    
    if (toast.current) {
      toast.current.show({
        severity: 'success',
        summary: 'Auto-saved',
        detail: 'Progress saved',
        life: 2000
      });
    }
  }, [currentSection, currentMember, currentAccount]);

  // Resize handlers for sidebar
  const handleMouseDown = () => {
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const newWidth = e.clientX - 200; // Subtract parent sidebar width
      const minWidth = 250;
      const maxWidth = 500;
      
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  const getNextSectionAndEntity = () => {
    // Define navigation order
    const memberOrder = ['john-smith', 'mary-smith', 'smith-trust'];
    const accountOrder = ['joint-account', 'individual-account', 'trust-account'];
    const memberSections = ['owner-details', 'firm-details'];
    const accountSections = ['account-setup', 'funding', 'firm-details'];

    if (currentMember) {
      // Currently on a member
      const currentMemberIndex = memberOrder.indexOf(currentMember);
      const currentSectionIndex = memberSections.indexOf(currentSection);

      // If not on last section of current member
      if (currentSectionIndex < memberSections.length - 1) {
        return {
          section: memberSections[currentSectionIndex + 1] as Section,
          memberId: currentMember,
          accountId: ''
        };
      }

      // If on last section of current member, go to next member's first section
      if (currentMemberIndex < memberOrder.length - 1) {
        return {
          section: 'owner-details' as Section,
          memberId: memberOrder[currentMemberIndex + 1],
          accountId: ''
        };
      }

      // If on last member's last section, go to first account's first section
      return {
        section: 'account-setup' as Section,
        memberId: '',
        accountId: accountOrder[0]
      };
    }

    if (currentAccount) {
      // Currently on an account
      const currentAccountIndex = accountOrder.indexOf(currentAccount);
      const currentSectionIndex = accountSections.indexOf(currentSection);

      // If not on last section of current account
      if (currentSectionIndex < accountSections.length - 1) {
        return {
          section: accountSections[currentSectionIndex + 1] as Section,
          memberId: '',
          accountId: currentAccount
        };
      }

      // If on last section of current account, go to next account's first section
      if (currentAccountIndex < accountOrder.length - 1) {
        return {
          section: 'account-setup' as Section,
          memberId: '',
          accountId: accountOrder[currentAccountIndex + 1]
        };
      }

      // If on last account's last section, we're done
      return null;
    }

    // Default: start with first member's first section
    return {
      section: 'owner-details' as Section,
      memberId: memberOrder[0],
      accountId: ''
    };
  };

  const handleNextSection = () => {
    const next = getNextSectionAndEntity();
    if (next) {
      handleSectionChange(next.section, next.memberId || undefined, next.accountId || undefined);
    }
  };

  const getPreviousSectionAndEntity = () => {
    // Define navigation order
    const memberOrder = ['john-smith', 'mary-smith', 'smith-trust'];
    const accountOrder = ['joint-account', 'individual-account', 'trust-account'];
    const memberSections = ['owner-details', 'firm-details'];
    const accountSections = ['account-setup', 'funding', 'firm-details'];

    if (currentMember) {
      // Currently on a member
      const currentMemberIndex = memberOrder.indexOf(currentMember);
      const currentSectionIndex = memberSections.indexOf(currentSection);

      // If not on first section of current member
      if (currentSectionIndex > 0) {
        return {
          section: memberSections[currentSectionIndex - 1] as Section,
          memberId: currentMember,
          accountId: ''
        };
      }

      // If on first section of current member, go to previous member's last section
      if (currentMemberIndex > 0) {
        return {
          section: 'firm-details' as Section,
          memberId: memberOrder[currentMemberIndex - 1],
          accountId: ''
        };
      }

      // If on first member's first section, we're at the beginning
      return null;
    }

    if (currentAccount) {
      // Currently on an account
      const currentAccountIndex = accountOrder.indexOf(currentAccount);
      const currentSectionIndex = accountSections.indexOf(currentSection);

      // If not on first section of current account
      if (currentSectionIndex > 0) {
        return {
          section: accountSections[currentSectionIndex - 1] as Section,
          memberId: '',
          accountId: currentAccount
        };
      }

      // If on first section of current account, go to previous account's last section
      if (currentAccountIndex > 0) {
        return {
          section: 'firm-details' as Section,
          memberId: '',
          accountId: accountOrder[currentAccountIndex - 1]
        };
      }

      // If on first account's first section, go to last member's last section
      return {
        section: 'firm-details' as Section,
        memberId: memberOrder[memberOrder.length - 1],
        accountId: ''
      };
    }

    // Default: we're at the beginning
    return null;
  };

  const handlePreviousSection = () => {
    const previous = getPreviousSectionAndEntity();
    if (previous) {
      handleSectionChange(previous.section, previous.memberId || undefined, previous.accountId || undefined);
    }
  };

  const handleSectionChange = (section: Section, memberId?: string, accountId?: string) => {
    setCurrentSection(section);
    
    if (memberId) {
      setCurrentMember(memberId);
      setCurrentAccount(''); // Clear account when switching to member
      
      // Auto-expand the accordion for the current member
      const memberIds = ['john-smith', 'mary-smith', 'smith-trust'];
      const memberIndex = memberIds.indexOf(memberId);
      if (memberIndex !== -1) {
        setExpandedMemberTabs(prev => {
          if (!prev.includes(memberIndex)) {
            return [...prev, memberIndex];
          }
          return prev;
        });
      }
    }
    if (accountId) {
      setCurrentAccount(accountId);
      setCurrentMember(''); // Clear member when switching to account
      
      // Auto-expand the accordion for the current account
      const accountIds = ['joint-account', 'individual-account', 'trust-account'];
      const accountIndex = accountIds.indexOf(accountId);
      if (accountIndex !== -1) {
        setExpandedAccountTabs(prev => {
          if (!prev.includes(accountIndex)) {
            return [...prev, accountIndex];
          }
          return prev;
        });
      }
    }

    // Always scroll to top when changing sections
    // Target the scrollable card body container
    setTimeout(() => {
      const cardBody = document.querySelector('.p-card .p-card-body');
      if (cardBody) {
        cardBody.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      } else {
        // Fallback to window scroll
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    }, 50); // Small delay to ensure DOM is updated
  };

  const getCompletionIcon = (isComplete: boolean) => {
    return isComplete ? 'pi pi-check-circle' : 'pi pi-exclamation-circle';
  };

  const getCompletionSeverity = (isComplete: boolean) => {
    return isComplete ? 'success' : 'danger';
  };

  const memberData = [
    {
      id: 'john-smith',
      name: 'John Smith',
      role: 'Primary Account Holder',
      icon: 'pi pi-user',
      sections: [
        { id: 'owner-details', name: 'Personal Details', icon: 'pi pi-user' },
        { id: 'firm-details', name: 'Firm Details', icon: 'pi pi-building' }
      ]
    },
    {
      id: 'mary-smith',
      name: 'Mary Smith',
      role: 'Joint Account Holder',
      icon: 'pi pi-user',
      sections: [
        { id: 'owner-details', name: 'Personal Details', icon: 'pi pi-user' },
        { id: 'firm-details', name: 'Firm Details', icon: 'pi pi-building' }
      ]
    },
    {
      id: 'smith-trust',
      name: 'Smith Family Trust',
      role: 'Trust Entity',
      icon: 'pi pi-shield',
      sections: [
        { id: 'owner-details', name: 'Personal Details', icon: 'pi pi-user' },
        { id: 'firm-details', name: 'Firm Details', icon: 'pi pi-building' }
      ]
    }
  ];

  const accountData = [
    {
      id: 'joint-account',
      name: 'Joint Account',
      owners: 'John & Mary Smith',
      icon: 'pi pi-users',
      sections: [
        { id: 'account-setup', name: 'Account Setup', icon: 'pi pi-cog' },
        { id: 'funding', name: 'Funding', icon: 'pi pi-dollar' },
        { id: 'firm-details', name: 'Firm Details', icon: 'pi pi-building' }
      ]
    },
    {
      id: 'individual-account',
      name: 'Individual Account',
      owners: 'Mary Smith',
      icon: 'pi pi-user',
      sections: [
        { id: 'account-setup', name: 'Account Setup', icon: 'pi pi-cog' },
        { id: 'funding', name: 'Funding', icon: 'pi pi-dollar' },
        { id: 'firm-details', name: 'Firm Details', icon: 'pi pi-building' }
      ]
    },
    {
      id: 'trust-account',
      name: 'Family Trust Account',
      owners: 'Smith Family Trust',
      icon: 'pi pi-shield',
      sections: [
        { id: 'account-setup', name: 'Account Setup', icon: 'pi pi-cog' },
        { id: 'funding', name: 'Funding', icon: 'pi pi-dollar' },
        { id: 'firm-details', name: 'Firm Details', icon: 'pi pi-building' }
      ]
    }
  ];

  return (
    <div className="app">
      <Toast ref={toast} position="top-center" className="header-toast" />
      
      {/* Parent Logo */}
      <div className="parent-logo">
        <h1>WHITE LABEL</h1>
      </div>

      {/* Parent Sidebar */}
      <div className="parent-sidebar">
        <div className="parent-nav-item active">
          <i className="pi pi-th-large"></i>
          Dashboard
        </div>
        <div className="parent-nav-item">
          <i className="pi pi-users"></i>
          Clients
        </div>
        <div className="parent-nav-item">
          <i className="pi pi-briefcase"></i>
          Accounts
        </div>
        <div className="parent-nav-item">
          <i className="pi pi-chart-line"></i>
          Portfolio
        </div>
        <div className="parent-nav-item">
          <i className="pi pi-file-text"></i>
          Reports
        </div>
        <div className="parent-nav-item">
          <i className="pi pi-cog"></i>
          Settings
        </div>
        <div className="parent-nav-item">
          <i className="pi pi-question-circle"></i>
          Support
        </div>
        <div className="parent-nav-item">
          <i className="pi pi-book"></i>
          Resources
        </div>
      </div>

      {/* Parent Header */}
      <div className="parent-header">
        <div className="search-container">
          <i className="pi pi-search search-icon"></i>
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search clients..."
          />
        </div>
        <div className="profile-section">
          <span>Valued Advisor</span>
          <div className="profile-icon">
            <i className="pi pi-user"></i>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content-area">
        {/* Account Setup Header */}
        <div className="flex justify-content-between align-items-center p-3 border-bottom-1 surface-border">
        <div className="flex align-items-center gap-3">
          <Button 
            icon="pi pi-arrow-left" 
            label="Back"
            onClick={() => window.history.back()}
            className="back-button"
          />
          <Button 
            icon="pi pi-bars" 
            text 
            severity="secondary"
            onClick={() => setSidebarVisible(true)}
            className="lg:hidden"
          />
          <h1 className="text-3xl font-semibold text-900 m-0">New Account Setup</h1>
          <Badge value="Beta" severity="info" />
        </div>
        <div className="flex align-items-center gap-2">
          <Button 
            label="Previous" 
            icon="pi pi-arrow-left"
            severity="secondary"
            onClick={handlePreviousSection}
            disabled={getPreviousSectionAndEntity() === null}
            className="px-3 py-2"
            style={{ fontSize: '0.875rem' }}
          />
          <Button 
            label="Next" 
            icon="pi pi-arrow-right"
            onClick={handleNextSection}
            disabled={getNextSectionAndEntity() === null}
            className="px-3 py-2 next-button"
            style={{ fontSize: '0.875rem' }}
          />
          <div className="flex align-items-center gap-2">
            <span className="text-sm font-medium text-600">Review Mode</span>
            <InputSwitch
              checked={isReviewMode}
              onChange={(e) => setIsReviewMode(e.value)}
              className="review-mode-toggle"
            />
          </div>
        </div>
      </div>

        <div className="flex" style={{ height: 'calc(100vh - 140px)' }}>
          {/* Desktop Sidebar */}
          <div 
            className="hidden lg:block sidebar-container" 
            style={{ width: `${sidebarWidth}px`, position: 'relative' }}
          >
            <div className="household-title">
              Smith Household
            </div>
            <div className="p-2">
              {/* Members */}
              <div className="mb-4">
                <div className="section-group-header">
                  <i className="pi pi-users"></i>
                  Members
                </div>
              <Accordion 
                multiple 
                activeIndex={expandedMemberTabs}
                onTabChange={(e) => setExpandedMemberTabs(e.index as number[])}
              >
                {memberData.map((member) => (
                  <AccordionTab
                    key={member.id}
                    header={
                      <div className="flex align-items-center justify-content-between w-full">
                        <div className="flex align-items-center gap-2">
                          <i className={`${member.icon} entity-icon`}></i>
                          <div className="entity-header-info">
                            <div className="entity-name">{member.name}</div>
                            <div className="entity-role">{member.role}</div>
                          </div>
                        </div>
                        <i className={`${getCompletionIcon(
                          Object.values(completionStatus.members[member.id]).every(Boolean)
                        )} text-${getCompletionSeverity(
                          Object.values(completionStatus.members[member.id]).every(Boolean)
                        )} completion-icon`}></i>
                      </div>
                    }
                  >
                    {member.sections.map((section) => (
                      <div
                        key={section.id}
                        className={`section-nav-item ${
                          currentSection === section.id && currentMember === member.id ? 'active' : ''
                        }`}
                        onClick={() => handleSectionChange(section.id as Section, member.id)}
                      >
                        <div className="section-nav-content">
                          <i className={`${section.icon} section-nav-icon`}></i>
                          <span className="section-nav-text">{section.name}</span>
                        </div>
                        <i className={`${getCompletionIcon(
                          completionStatus.members[member.id][section.id as keyof typeof completionStatus.members[typeof member.id]]
                        )} text-${getCompletionSeverity(
                          completionStatus.members[member.id][section.id as keyof typeof completionStatus.members[typeof member.id]]
                        )} completion-icon`}></i>
                      </div>
                    ))}
                  </AccordionTab>
                ))}
              </Accordion>
            </div>

            {/* Account Types */}
            <div>
              <div className="section-group-header">
                <i className="pi pi-briefcase"></i>
                Accounts
              </div>
              <Accordion 
                multiple 
                activeIndex={expandedAccountTabs}
                onTabChange={(e) => setExpandedAccountTabs(e.index as number[])}
              >
                {accountData.map((account) => (
                  <AccordionTab
                    key={account.id}
                    header={
                      <div className="flex align-items-center justify-content-between w-full">
                        <div className="flex align-items-center gap-2">
                          <i className={`${account.icon} entity-icon`}></i>
                          <div className="entity-header-info">
                            <div className="entity-name">{account.name}</div>
                            <div className="entity-role">{account.owners}</div>
                          </div>
                        </div>
                        <i className={`${getCompletionIcon(
                          Object.values(completionStatus.accounts[account.id]).every(Boolean)
                        )} text-${getCompletionSeverity(
                          Object.values(completionStatus.accounts[account.id]).every(Boolean)
                        )} completion-icon`}></i>
                      </div>
                    }
                  >
                    {account.sections.map((section) => (
                      <div
                        key={section.id}
                        className={`section-nav-item ${
                          currentSection === section.id && currentAccount === account.id ? 'active' : ''
                        }`}
                        onClick={() => handleSectionChange(section.id as Section, undefined, account.id)}
                      >
                        <div className="section-nav-content">
                          <i className={`${section.icon} section-nav-icon`}></i>
                          <span className="section-nav-text">{section.name}</span>
                        </div>
                        <i className={`${getCompletionIcon(
                          completionStatus.accounts[account.id][section.id as keyof typeof completionStatus.accounts[typeof account.id]]
                        )} text-${getCompletionSeverity(
                          completionStatus.accounts[account.id][section.id as keyof typeof completionStatus.accounts[typeof account.id]]
                        )} completion-icon`}></i>
                      </div>
                    ))}
                  </AccordionTab>
                ))}
              </Accordion>
            </div>
            {/* Resize Handle */}
            <div 
              className="sidebar-resize-handle"
              onMouseDown={handleMouseDown}
              style={{
                position: 'absolute',
                right: 0,
                top: 0,
                bottom: 0,
                width: '4px',
                cursor: 'col-resize',
                backgroundColor: isResizing ? '#3b82f6' : 'transparent',
                transition: 'background-color 0.2s ease'
              }}
            />
          </div>
        </div>

        {/* Mobile Sidebar */}
        <Sidebar 
          visible={sidebarVisible} 
          onHide={() => setSidebarVisible(false)}
          className="w-full sm:w-20rem"
        >
          <div className="p-2">
            {/* Household Members */}
            <div className="mb-4">
              <div className="section-group-header">
                <i className="pi pi-users"></i>
                Smith Household Members
              </div>
              <Accordion 
                multiple 
                activeIndex={expandedMemberTabs}
                onTabChange={(e) => setExpandedMemberTabs(e.index as number[])}
              >
                {memberData.map((member) => (
                  <AccordionTab
                    key={member.id}
                    header={
                      <div className="flex align-items-center justify-content-between w-full">
                        <div className="flex align-items-center gap-2">
                          <i className={`${member.icon} entity-icon`}></i>
                          <div className="entity-header-info">
                            <div className="entity-name">{member.name}</div>
                            <div className="entity-role">{member.role}</div>
                          </div>
                        </div>
                        <i className={`${getCompletionIcon(
                          Object.values(completionStatus.members[member.id]).every(Boolean)
                        )} text-${getCompletionSeverity(
                          Object.values(completionStatus.members[member.id]).every(Boolean)
                        )} completion-icon`}></i>
                      </div>
                    }
                  >
                    {member.sections.map((section) => (
                      <div
                        key={section.id}
                        className={`section-nav-item ${
                          currentSection === section.id && currentMember === member.id ? 'active' : ''
                        }`}
                        onClick={() => {
                          handleSectionChange(section.id as Section, member.id);
                          setSidebarVisible(false);
                        }}
                      >
                        <div className="section-nav-content">
                          <i className={`${section.icon} section-nav-icon`}></i>
                          <span className="section-nav-text">{section.name}</span>
                        </div>
                        <i className={`${getCompletionIcon(
                          completionStatus.members[member.id][section.id as keyof typeof completionStatus.members[typeof member.id]]
                        )} text-${getCompletionSeverity(
                          completionStatus.members[member.id][section.id as keyof typeof completionStatus.members[typeof member.id]]
                        )} completion-icon`}></i>
                      </div>
                    ))}
                  </AccordionTab>
                ))}
              </Accordion>
            </div>

            {/* Account Types */}
            <div>
              <div className="section-group-header">
                <i className="pi pi-briefcase"></i>
                Accounts
              </div>
              <Accordion 
                multiple 
                activeIndex={expandedAccountTabs}
                onTabChange={(e) => setExpandedAccountTabs(e.index as number[])}
              >
                {accountData.map((account) => (
                  <AccordionTab
                    key={account.id}
                    header={
                      <div className="flex align-items-center justify-content-between w-full">
                        <div className="flex align-items-center gap-2">
                          <i className={`${account.icon} entity-icon`}></i>
                          <div className="entity-header-info">
                            <div className="entity-name">{account.name}</div>
                            <div className="entity-role">{account.owners}</div>
                          </div>
                        </div>
                        <i className={`${getCompletionIcon(
                          Object.values(completionStatus.accounts[account.id]).every(Boolean)
                        )} text-${getCompletionSeverity(
                          Object.values(completionStatus.accounts[account.id]).every(Boolean)
                        )} completion-icon`}></i>
                      </div>
                    }
                  >
                    {account.sections.map((section) => (
                      <div
                        key={section.id}
                        className={`section-nav-item ${
                          currentSection === section.id && currentAccount === account.id ? 'active' : ''
                        }`}
                        onClick={() => {
                          handleSectionChange(section.id as Section, undefined, account.id);
                          setSidebarVisible(false);
                        }}
                      >
                        <div className="section-nav-content">
                          <i className={`${section.icon} section-nav-icon`}></i>
                          <span className="section-nav-text">{section.name}</span>
                        </div>
                        <i className={`${getCompletionIcon(
                          completionStatus.accounts[account.id][section.id as keyof typeof completionStatus.accounts[typeof account.id]]
                        )} text-${getCompletionSeverity(
                          completionStatus.accounts[account.id][section.id as keyof typeof completionStatus.accounts[typeof account.id]]
                        )} completion-icon`}></i>
                      </div>
                    ))}
                  </AccordionTab>
                ))}
              </Accordion>
            </div>
          </div>
        </Sidebar>

        {/* Main Content */}
        <div className="flex-1 p-3">
          <Card className="h-full">
            <AccountForm
              section={currentSection}
              memberId={currentMember}
              accountId={currentAccount}
              isReviewMode={isReviewMode}
              formData={formData}
              setFormData={setFormData}
              completionStatus={completionStatus}
              setCompletionStatus={setCompletionStatus}
              onPrevious={handlePreviousSection}
              onNext={handleNextSection}
              canGoPrevious={getPreviousSectionAndEntity() !== null}
              canGoNext={getNextSectionAndEntity() !== null}
            />
          </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
