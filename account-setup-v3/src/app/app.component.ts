import { Component, ViewChild, HostListener, ElementRef, signal, computed, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Imports
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { InputSwitchModule } from 'primeng/inputswitch';
import { SidebarModule } from 'primeng/sidebar';
import { CardModule } from 'primeng/card';
import { AccordionModule } from 'primeng/accordion';
import { Toast } from 'primeng/toast';

// Local Imports
import { FormData, CompletionStatus, Section } from './shared/models/types';
import { AccountFormComponent } from './features/account-setup/components/account-form/account-form.component';
import { ReviewSummaryComponent } from './features/account-setup/components/review-summary/review-summary.component';
import { ScrollableViewComponent } from './features/account-setup/components/scrollable-view/scrollable-view.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ToastModule,
    ButtonModule,
    BadgeModule,
    InputSwitchModule,
    SidebarModule,
    CardModule,
    AccordionModule,
    AccountFormComponent,
    ReviewSummaryComponent,
    ScrollableViewComponent
  ],
  providers: [MessageService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  @ViewChild('toast') toast!: Toast;
  @ViewChild(ScrollableViewComponent) scrollableViewComponent!: ScrollableViewComponent;

  // State management with signals
  title = 'account-setup-v3';
  isInitialLoad = true;
  sidebarVisible = false;
  sidebarWidth = 320;
  isResizing = false;
  expandedMemberTabs: number[] | number | null = [0];
  expandedAccountTabs: number[] | number | null = [];
  currentSection: Section = 'owner-details';
  currentMember = 'john-smith';
  currentAccount = '';
  isReviewMode = false;
  showReviewSummaryMode = false;
  scrollablePagesMode = true;
  showProfileMenu = false;

  // Form data with same initial data as V2
  formData: FormData = {
    'john-smith': {
      // Owner Details
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
      fundsSource: 'Employment and investment income',
      
      // Firm Details - Net Worth Assessment
      totalNetWorth: '1m-5m',
      liquidNetWorth: '500k-1m',
      averageAnnualIncome: '100k-250k',
      incomeSource: 'salary',
      
      // Firm Details - Investment Experience
      investmentExperience: 'good',
      stocksExperience: 'good',
      bondsExperience: 'limited',
      optionsExperience: 'none',
      
      // Firm Details - Liquidity Needs
      liquidityNeeds: 'low',
      emergencyFund: true,
      liquidityPurpose: 'No immediate liquidity needs, maintaining emergency fund',
      
      // Firm Details - Market Conditions
      scenario1: 'hold',
      
      // Firm Details - Existing Product Information
      investmentName: 'Vanguard Total Stock Market Index',
      productType: 'Mutual Fund',
      accountPolicyNumber: 'VG-123456789',
      initialDateOfPurchase: new Date('2015-03-15'),
      initialPremiumInvestment: '$25,000',
      currentAccountValue: '$45,000',
      approximateAnnualCost: '0.04%',
      currentSurrenderValue: 'N/A',
      surrenderSalesPenaltyCharges: 'None',
      deathBenefitRiderValue: 'N/A',
      livingBenefitRiderValue: 'N/A',
      outstandingLoanAmount: '$0',
      wasExistingProductRecommended: 'No',
      
      // Firm Details - Employer Sponsored Retirement Plans
      recommendationIncludeRetainFunds: 'N/A',
      
      // Firm Details - Investment Policy Statement
      equityRatio: 'growth',
      equityRatioOther: '',
      allocationModelExplanation: 'N/A',
      nonQualifiedAssetConsiderations: 'No additional tax considerations',
      additionalInvestmentInstructions: 'Maintain diversified portfolio with focus on growth',
      
      // Firm Details - Additional Account Information
      patriotActForeignFinancial: false,
      patriotActPrivateBanking: false,
      patriotActOffshoreBank: false,
      patriotActGovernmentOfficial: false
    },
    'mary-smith': {
      // Owner Details - Complete for demo
      firstName: 'Mary',
      middleInitial: 'L',
      lastName: 'Smith', 
      dateOfBirth: new Date('1987-08-22'),
      ssn: '987-65-4321',
      email: 'mary.smith@example.com',
      phoneHome: '(555) 123-4567',
      phoneMobile: '(555) 987-6544',
      homeAddress: '123 Main Street, Anytown, ST 12345',
      mailingAddress: 'Same as home address',
      citizenship: 'us-citizen',
      employmentStatus: 'employed',
      annualIncome: '50k-100k',
      netWorth: '250k-500k',
      fundsSource: 'Dual-income household and investment returns',
      
      // Firm Details - Complete for demo
      totalNetWorth: '500k-1m',
      liquidNetWorth: '250k-500k',
      averageAnnualIncome: '50k-100k',
      incomeSource: 'salary',
      investmentExperience: 'limited',
      stocksExperience: 'limited',
      bondsExperience: 'none',
      optionsExperience: 'none',
      liquidityNeeds: 'moderate',
      emergencyFund: true,
      liquidityPurpose: 'Emergency fund maintenance and planned expenses',
      scenario1: 'buy-more',
      
      // Existing Product Information (if applicable)
      investmentName: 'Fidelity 401k Plan',
      productType: '401k Retirement Plan',
      accountPolicyNumber: 'FID-401K-789',
      initialDateOfPurchase: new Date('2018-01-15'),
      initialPremiumInvestment: '$15,000',
      currentAccountValue: '$28,000',
      approximateAnnualCost: '0.75%',
      currentSurrenderValue: 'N/A',
      surrenderSalesPenaltyCharges: 'None',
      deathBenefitRiderValue: 'N/A',
      livingBenefitRiderValue: 'N/A',
      outstandingLoanAmount: '$0',
      wasExistingProductRecommended: 'Yes',
      
      // Employer Sponsored Retirement Plans
      recommendationIncludeRetainFunds: 'Yes, continue 401k contributions',
      
      // Investment Policy Statement
      equityRatio: 'moderate-growth',
      equityRatioOther: '',
      allocationModelExplanation: 'Moderate allocation matches risk tolerance and time horizon',
      nonQualifiedAssetConsiderations: 'None applicable',
      additionalInvestmentInstructions: 'Review annually and rebalance as needed',
      
      // Additional Account Information
      patriotActForeignFinancial: false,
      patriotActPrivateBanking: false,
      patriotActOffshoreBank: false,
      patriotActGovernmentOfficial: false
    },
    'smith-trust': {
      // Owner Details - Basic trust info only (incomplete for demo)
      firstName: 'Smith Family',
      middleInitial: '',
      lastName: 'Trust',
      dateOfBirth: new Date('2020-01-01'),
      // ssn intentionally left empty for demo
      email: 'trust@smithfamily.com',
      phoneHome: '(555) 123-4567',
      phoneMobile: '(555) 123-4567',
      homeAddress: '123 Main Street, Anytown, ST 12345',
      // citizenship intentionally left empty for demo
      employmentStatus: 'trust',
      annualIncome: 'over-500k'
      // netWorth and fundsSource intentionally left empty for demo
    },
    'joint-account': {
      // Account Setup fields
      accountType: 'joint-taxable',
      accountProfile: 'standard',
      investmentObjective: 'growth',
      liquidityTiming: '5-10years',
      timeHorizon: 'long-term',
      riskTolerance: 'moderate',
      primaryGoals: 'Retirement planning and wealth accumulation',
      
      // Source of Funds
      initialSourceOfFunds: 'savings',
      investmentAmount: '$100,000',
      additionalSourceFunds: 'Annual contributions from employment income',
      
      // Firm Details - Account-specific fields
      investmentObjectives: 'Long-term growth with moderate risk tolerance. Building wealth for retirement while maintaining liquidity for major purchases.',
      recommendations: 'Diversified portfolio with 70% equities (mix of domestic and international) and 30% fixed income. Regular rebalancing quarterly.',
      alternativeSuggestions: 'Consider tax-advantaged accounts for additional retirement savings. Municipal bonds may provide tax benefits given income level.',
      fundingInstances: {
        'acat': [
          {
            type: 'acat',
            typeName: 'ACAT Transfers',
            name: 'Wells Fargo Transfer',
            amount: '75000',
            fromFirm: 'Wells Fargo',
            transferType: 'Full Transfer'
          }
        ],
        'ach': [
          {
            type: 'ach',
            typeName: 'ACH Transfers',
            name: 'Chase Bank ACH',
            amount: '25000',
            bankName: 'Chase Bank',
            frequency: 'One-time'
          }
        ],
        'initial-ach': [],
        'withdrawal': [],
        'contribution': [
          {
            type: 'contribution',
            typeName: 'Systematic Contributions',
            name: 'Monthly Contribution',
            amount: '2000',
            bankName: 'Chase Bank',
            frequency: 'Monthly'
          }
        ]
      }
    },
    'roth-ira-account': {
      // Account Setup fields
      accountType: 'roth-ira',
      accountProfile: 'retirement',
      investmentObjective: 'growth',
      liquidityTiming: 'retirement',
      timeHorizon: 'long-term',
      riskTolerance: 'moderate',
      primaryGoals: 'Retirement savings with tax-free growth',
      
      // Source of Funds
      initialSourceOfFunds: 'employment',
      investmentAmount: '$6,000',
      additionalSourceFunds: 'Annual IRA contribution limit',
      
      // Firm Details - Account-specific fields
      investmentObjectives: 'Tax-free growth for retirement. Maximize long-term growth potential given extended time horizon until retirement.',
      recommendations: 'Growth-oriented portfolio with 85% equities and 15% fixed income. Focus on low-cost index funds to minimize fees.',
      alternativeSuggestions: 'Consider automatic annual contributions to maximize tax-free growth. Review beneficiary designations annually.',
      fundingInstances: {
        'acat': [],
        'ach': [
          {
            type: 'ach',
            typeName: 'ACH Transfers',
            name: 'Mary\'s Checking Account',
            amount: '6000',
            bankName: 'Wells Fargo',
            frequency: 'One-time'
          }
        ],
        'initial-ach': [],
        'withdrawal': [],
        'contribution': []
      },
      beneficiaries: []
    },
    'trust-account': {
      // accountType intentionally left empty for demo
      // investmentObjective intentionally left empty for demo  
      // riskTolerance intentionally left empty for demo
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
      trustees: [],
      fundingInstances: {
        'acat': [],
        'ach': [],
        'initial-ach': [],
        'withdrawal': [],
        'contribution': []
      }
    }
  };

  completionStatus: CompletionStatus = {
    members: {},
    accounts: {}
  };

  // Data arrays matching V2 exactly
  memberData = [
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

  accountData = [
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
      id: 'roth-ira-account',
      name: 'Roth IRA Account',
      owners: 'Mary Smith',
      icon: 'pi pi-star',
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

  constructor(private messageService: MessageService, private cdr: ChangeDetectorRef) {
    // Auto-save functionality
    this.setupAutoSave();
  }

  ngOnInit() {
    // Clear localStorage to ensure demo data is used (uncomment if needed)
    // localStorage.removeItem('accountSetupData');
    
    // For demo purposes, prefer default data over saved data to ensure John Smith's data is visible
    const savedData = localStorage.getItem('accountSetupData');
    if (savedData) {
      try {
        const parsedSavedData = JSON.parse(savedData);
        // Merge saved data with default data, but prefer default data for demo entities
        this.formData = this.mergeFormData(this.formData, parsedSavedData);
      } catch (e) {
        console.error('Failed to parse saved form data:', e);
        // Keep the default form data if parsing fails
      }
    }
    
    
    // Save the merged data back to localStorage to ensure consistency
    localStorage.setItem('accountSetupData', JSON.stringify(this.formData));
    
    // Update completion status based on actual form data
    this.updateCompletionStatus();
  }

  private mergeFormData(defaultData: FormData, savedData: FormData): FormData {
    const merged: FormData = { ...defaultData };
    
    // For each entity in saved data, merge with default data
    Object.keys(savedData).forEach(entityId => {
      if (merged[entityId]) {
        // For demo entities, prefer default data to ensure demo data is visible
        if (entityId === 'john-smith' || entityId === 'mary-smith' || entityId === 'joint-account') {
          // Keep default demo data and only merge non-conflicting fields
          merged[entityId] = { ...savedData[entityId], ...merged[entityId] };
        } else {
          // For other entities, merge normally (prefer saved values but keep default values for missing fields)
          merged[entityId] = { ...merged[entityId], ...savedData[entityId] };
        }
      } else {
        // If entity doesn't exist in default data, use saved data
        merged[entityId] = savedData[entityId];
      }
    });
    
    return merged;
  }

  private setupAutoSave() {
    let autoSaveTimer: any;
    
    // Set up auto-save with 2-second delay like V2
    const saveFormData = () => {
      clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(() => {
        localStorage.setItem('accountSetupData', JSON.stringify(this.formData));
      }, 2000);
    };

    // Auto-save on form data changes
    // This will be triggered by form data updates
  }

  // Event handlers
  goBack() {
    window.history.back();
  }

  showSidebar() {
    this.sidebarVisible = true;
  }

  // Navigation logic identical to V2
  getNextSectionAndEntity() {
    const memberOrder = ['john-smith', 'mary-smith', 'smith-trust'];
    const accountOrder = ['joint-account', 'roth-ira-account', 'trust-account'];
    const memberSections = ['owner-details', 'firm-details'];
    const accountSections = ['account-setup', 'funding', 'firm-details'];

    if (this.currentMember) {
      const currentMemberIndex = memberOrder.indexOf(this.currentMember);
      const currentSectionIndex = memberSections.indexOf(this.currentSection);

      if (currentSectionIndex < memberSections.length - 1) {
        return {
          section: memberSections[currentSectionIndex + 1] as Section,
          memberId: this.currentMember,
          accountId: ''
        };
      }

      if (currentMemberIndex < memberOrder.length - 1) {
        return {
          section: 'owner-details' as Section,
          memberId: memberOrder[currentMemberIndex + 1],
          accountId: ''
        };
      }

      return {
        section: 'account-setup' as Section,
        memberId: '',
        accountId: accountOrder[0]
      };
    }

    if (this.currentAccount) {
      const currentAccountIndex = accountOrder.indexOf(this.currentAccount);
      const currentSectionIndex = accountSections.indexOf(this.currentSection);

      if (currentSectionIndex < accountSections.length - 1) {
        return {
          section: accountSections[currentSectionIndex + 1] as Section,
          memberId: '',
          accountId: this.currentAccount
        };
      }

      if (currentAccountIndex < accountOrder.length - 1) {
        return {
          section: 'account-setup' as Section,
          memberId: '',
          accountId: accountOrder[currentAccountIndex + 1]
        };
      }

      return null;
    }

    return {
      section: 'owner-details' as Section,
      memberId: memberOrder[0],
      accountId: ''
    };
  }

  getPreviousSectionAndEntity() {
    const memberOrder = ['john-smith', 'mary-smith', 'smith-trust'];
    const accountOrder = ['joint-account', 'roth-ira-account', 'trust-account'];
    const memberSections = ['owner-details', 'firm-details'];
    const accountSections = ['account-setup', 'funding', 'firm-details'];

    if (this.currentMember) {
      const currentMemberIndex = memberOrder.indexOf(this.currentMember);
      const currentSectionIndex = memberSections.indexOf(this.currentSection);

      if (currentSectionIndex > 0) {
        return {
          section: memberSections[currentSectionIndex - 1] as Section,
          memberId: this.currentMember,
          accountId: ''
        };
      }

      if (currentMemberIndex > 0) {
        return {
          section: 'firm-details' as Section,
          memberId: memberOrder[currentMemberIndex - 1],
          accountId: ''
        };
      }

      return null;
    }

    if (this.currentAccount) {
      const currentAccountIndex = accountOrder.indexOf(this.currentAccount);
      const currentSectionIndex = accountSections.indexOf(this.currentSection);

      if (currentSectionIndex > 0) {
        return {
          section: accountSections[currentSectionIndex - 1] as Section,
          memberId: '',
          accountId: this.currentAccount
        };
      }

      if (currentAccountIndex > 0) {
        return {
          section: 'firm-details' as Section,
          memberId: '',
          accountId: accountOrder[currentAccountIndex - 1]
        };
      }

      return {
        section: 'firm-details' as Section,
        memberId: memberOrder[memberOrder.length - 1],
        accountId: ''
      };
    }

    return null;
  }

  handleNextSection() {
    const next = this.getNextSectionAndEntity();
    if (next) {
      this.handleSectionChange(next.section, next.memberId || '', next.accountId || '');
    }
  }

  handlePreviousSection() {
    const previous = this.getPreviousSectionAndEntity();
    if (previous) {
      this.handleSectionChange(previous.section, previous.memberId || '', previous.accountId || '');
    }
  }

  canGoNext(): boolean {
    return this.getNextSectionAndEntity() !== null;
  }

  canGoPrevious(): boolean {
    return this.getPreviousSectionAndEntity() !== null;
  }

  handleSectionChange(section: Section, memberId: string, accountId: string) {
    this.currentSection = section;
    
    if (memberId) {
      this.currentMember = memberId;
      this.currentAccount = '';
      
      // Auto-expand the accordion for the current member with proper change detection
      this.expandMemberAccordion(memberId);
    }
    
    if (accountId) {
      this.currentAccount = accountId;
      this.currentMember = '';
      
      // Auto-expand the accordion for the current account with proper change detection
      this.expandAccountAccordion(accountId);
    }

    // Auto-save notification removed per user request

    this.isInitialLoad = false;

    // Scroll to top of main content area when navigating sections
    setTimeout(() => {
      // Try multiple scroll targets to ensure reliable scrolling
      const flexContent = document.querySelector('.flex-1');
      const mainContentArea = document.querySelector('.main-content-area');
      const accountForm = document.querySelector('app-account-form');
      
      // Priority order: flex-1 content, main area, account form, then window
      if (flexContent) {
        flexContent.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      } else if (mainContentArea) {
        mainContentArea.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      } else if (accountForm) {
        accountForm.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      } else {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    }, 150);
  }

  handleMobileSectionChange(section: Section, memberId: string, accountId: string) {
    this.handleSectionChange(section, memberId, accountId);
    this.sidebarVisible = false;
  }

  // Completion status helpers
  getCompletionIcon(isComplete: boolean): string {
    return isComplete ? 'pi pi-check-circle' : 'pi pi-exclamation-circle';
  }

  getCompletionSeverity(isComplete: boolean): string {
    return isComplete ? 'success' : 'danger';
  }

  isEntityComplete(entityType: 'members' | 'accounts', entityId: string): boolean {
    // Calculate completion based on actual form data instead of hardcoded status
    const entityData = entityType === 'members' ? this.memberData.find(m => m.id === entityId) : this.accountData.find(a => a.id === entityId);
    if (!entityData) return false;

    // Check if all sections for this entity are complete
    return entityData.sections.every(section => 
      this.calculateSectionCompletion(entityType, entityId, section.id)
    );
  }

  getSectionCompletion(entityType: 'members' | 'accounts', entityId: string, sectionId: string): boolean {
    // Calculate completion based on actual form data instead of hardcoded status
    return this.calculateSectionCompletion(entityType, entityId, sectionId);
  }

  private calculateSectionCompletion(entityType: 'members' | 'accounts', entityId: string, sectionId: string): boolean {
    const entityData = this.formData[entityId];
    if (!entityData) return false;

    // Define required fields for each section type
    let requiredFields: string[] = [];
    
    if (sectionId === 'owner-details') {
      requiredFields = [
        'firstName', 'lastName', 'dateOfBirth', 'ssn', 'phoneHome', 'email', 
        'homeAddress', 'citizenship', 'employmentStatus', 'annualIncome', 'netWorth', 'fundsSource'
      ];
    } else if (sectionId === 'firm-details') {
      // Base firm details fields (required for both members and accounts)
      requiredFields = [
        'totalNetWorth', 'liquidNetWorth', 'averageAnnualIncome', 'incomeSource',
        'investmentExperience', 'stocksExperience', 'bondsExperience', 'optionsExperience',
        'liquidityNeeds', 'emergencyFund', 'scenario1'
      ];
      
      // Additional fields only required for account firm details
      if (entityType === 'accounts') {
        requiredFields.push('investmentObjectives', 'recommendations', 'alternativeSuggestions');
      }
    } else if (sectionId === 'account-setup') {
      requiredFields = ['accountType', 'investmentObjective', 'riskTolerance'];
    } else if (sectionId === 'funding') {
      // Special case for funding - check if fundingInstances object exists
      return entityData.fundingInstances !== undefined;
    }

    // Check if all required fields are filled
    return requiredFields.every(field => {
      const value = entityData[field];
      if (value === null || value === undefined || value === '') return false;
      if (typeof value === 'string' && value.trim() === '') return false;
      return true;
    });
  }

  // Accordion event handlers - allow multiple sections when needed
  onMemberTabChange(event: any) {
    if (!this.scrollablePagesMode) {
      // In regular mode (multiple=true), close all account tabs when opening member tabs
      this.expandedAccountTabs = [];
      // Handle multiple selection - keep only the last selected
      this.expandedMemberTabs = Array.isArray(event.index) ? [event.index[event.index.length - 1]] : [event.index];
    } else {
      // In scrollable mode (multiple=false), event.index is a single number or null
      // Don't close account tabs - allow one from each category
      this.expandedMemberTabs = event.index; // Single number or null for non-multiple mode
    }
  }

  onAccountTabChange(event: any) {
    if (!this.scrollablePagesMode) {
      // In regular mode (multiple=true), close all member tabs when opening account tabs
      this.expandedMemberTabs = [];
      // Handle multiple selection - keep only the last selected
      this.expandedAccountTabs = Array.isArray(event.index) ? [event.index[event.index.length - 1]] : [event.index];
    } else {
      // In scrollable mode (multiple=false), event.index is a single number or null
      // Don't close member tabs - allow one from each category
      this.expandedAccountTabs = event.index; // Single number or null for non-multiple mode
    }
  }

  // Form data change handlers
  onFormDataChange(newFormData: FormData) {
    this.formData = newFormData;
    // Trigger auto-save
    localStorage.setItem('accountSetupData', JSON.stringify(this.formData));
    // Update completion status based on actual form data
    this.updateCompletionStatus();
  }

  onCompletionStatusChange(newStatus: CompletionStatus) {
    this.completionStatus = newStatus;
  }

  private updateCompletionStatus() {
    const newCompletionStatus: CompletionStatus = {
      members: {},
      accounts: {}
    };

    // Check member sections
    ['john-smith', 'mary-smith', 'smith-trust'].forEach(memberId => {
      newCompletionStatus.members[memberId] = {
        'owner-details': this.isMemberOwnerDetailsComplete(memberId),
        'firm-details': this.isMemberFirmDetailsComplete(memberId)
      };
    });

    // Check account sections
    ['joint-account', 'roth-ira-account', 'trust-account'].forEach(accountId => {
      newCompletionStatus.accounts[accountId] = {
        'account-setup': this.isAccountSetupComplete(accountId),
        'funding': this.isFundingComplete(accountId),
        'firm-details': this.isAccountFirmDetailsComplete(accountId)
      };
    });

    this.completionStatus = newCompletionStatus;
  }

  private isMemberOwnerDetailsComplete(memberId: string): boolean {
    const data = this.formData[memberId];
    if (!data) return false;

    const requiredFields = [
      'firstName', 'lastName', 'dateOfBirth', 'ssn', 'phoneHome', 'email',
      'homeAddress', 'citizenship', 'employmentStatus', 'annualIncome', 'netWorth', 'fundsSource'
    ];

    return requiredFields.every(field => data[field] && data[field].toString().trim() !== '');
  }

  private isMemberFirmDetailsComplete(memberId: string): boolean {
    const data = this.formData[memberId];
    if (!data) return false;

    const requiredFields = [
      'totalNetWorth', 'liquidNetWorth', 'averageAnnualIncome', 'incomeSource',
      'investmentExperience', 'stocksExperience', 'bondsExperience', 'optionsExperience',
      'liquidityNeeds', 'emergencyFund', 'scenario1'
    ];

    return requiredFields.every(field => 
      field === 'emergencyFund' ? data[field] !== undefined : data[field] && data[field].toString().trim() !== ''
    );
  }

  private isAccountSetupComplete(accountId: string): boolean {
    const data = this.formData[accountId];
    if (!data) return false;

    const requiredFields = ['accountType', 'investmentObjective', 'riskTolerance', 'initialSourceOfFunds', 'investmentAmount'];
    
    // Additional fields for trust accounts
    if (data.accountType === 'trust') {
      requiredFields.push('trustName', 'trustType', 'trustEin');
    }

    return requiredFields.every(field => data[field] && data[field].toString().trim() !== '');
  }

  private isFundingComplete(accountId: string): boolean {
    const data = this.formData[accountId];
    if (!data) return false;

    // For funding, we check if there's at least one funding instance
    const fundingInstances = data.fundingInstances;
    if (!fundingInstances) return false;

    // Check if at least one funding type has entries
    return Object.values(fundingInstances).some(instances => 
      Array.isArray(instances) && instances.length > 0
    );
  }

  private isAccountFirmDetailsComplete(accountId: string): boolean {
    const data = this.formData[accountId];
    if (!data) return false;

    // Account firm details have different fields than member firm details
    const requiredFields = [
      'investmentObjectives', 'recommendations', 'alternativeSuggestions'
    ];

    return requiredFields.every(field => data[field] && data[field].toString().trim() !== '');
  }

  // Sidebar resize functionality
  handleMouseDown() {
    this.isResizing = true;
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.isResizing) return;
    
    const newWidth = event.clientX - 200; // Subtract parent sidebar width
    const minWidth = 250;
    const maxWidth = 500;
    
    if (newWidth >= minWidth && newWidth <= maxWidth) {
      this.sidebarWidth = newWidth;
    }
  }

  @HostListener('document:mouseup')
  onMouseUp() {
    if (this.isResizing) {
      this.isResizing = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMoveResize(event: MouseEvent) {
    if (this.isResizing) {
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }
  }

  // Helper method to cast section ID to Section type
  castToSection(sectionId: string): Section {
    return sectionId as Section;
  }

  // Calculate overall progress percentage based on filled required fields
  getOverallProgress(): number {
    let totalRequiredFields = 0;
    let filledRequiredFields = 0;

    // Define required fields for each entity type
    const memberRequiredFields = [
      'firstName', 'lastName', 'dateOfBirth', 'ssn', 'phoneHome', 'email', 
      'homeAddress', 'citizenship', 'employmentStatus', 'annualIncome', 'netWorth', 'fundsSource'
    ];
    
    const accountRequiredFields = [
      'accountType', 'investmentObjective', 'riskTolerance'
    ];

    // Count member fields
    Object.keys(this.completionStatus.members).forEach(memberId => {
      const memberData = this.formData[memberId];
      memberRequiredFields.forEach(field => {
        totalRequiredFields++;
        if (memberData && memberData[field] && memberData[field].toString().trim()) {
          filledRequiredFields++;
        }
      });
    });

    // Count account fields
    Object.keys(this.completionStatus.accounts).forEach(accountId => {
      const accountData = this.formData[accountId];
      accountRequiredFields.forEach(field => {
        totalRequiredFields++;
        if (accountData && accountData[field] && accountData[field].toString().trim()) {
          filledRequiredFields++;
        }
      });
    });

    return totalRequiredFields > 0 ? Math.round((filledRequiredFields / totalRequiredFields) * 100) : 0;
  }

  // Review Summary methods
  showReviewSummary() {
    this.showReviewSummaryMode = true;
  }

  hideReviewSummary() {
    this.showReviewSummaryMode = false;
  }

  onEditAccount(accountId: string) {
    this.hideReviewSummary();
    
    // Get all relevant sections for this registration
    const relevantSections = this.getRelevantSectionsForAccount(accountId);
    
    if (this.scrollablePagesMode) {
      // In scrollable mode, enable all relevant sections to be visible and scroll to first one
      this.expandRelevantSections(accountId);
      if (relevantSections.length > 0) {
        const firstSection = relevantSections[0];
        this.scrollToSection(firstSection.entityId, firstSection.sectionId);
      }
    } else {
      // In regular mode, navigate to account setup section
      this.handleSectionChange('account-setup', '', accountId);
    }
  }

  onEditAccountWithSection(data: {accountId: string, entityId: string, sectionId: Section}) {
    
    this.hideReviewSummary();
    
    if (this.scrollablePagesMode) {
      // First, determine if it's a member or account section
      const isMember = this.memberData.some(m => m.id === data.entityId);
      const isAccount = this.accountData.some(a => a.id === data.entityId);
      
      if (isMember) {
        // It's a member section - ensure only this member is expanded
        const memberIndex = this.memberData.findIndex(m => m.id === data.entityId);
        
        if (memberIndex !== -1) {
          // First, update the current state to match the target
          this.currentMember = data.entityId;
          this.currentAccount = '';
          this.currentSection = data.sectionId;
          
          // Then expand the correct accordion with change detection
          // In scrollable mode, multiple=false, so activeIndex should be a single number
          this.expandedMemberTabs = memberIndex; // Single number for non-multiple mode
          this.expandedAccountTabs = null; // No account expanded in scrollable mode
          
          // Force change detection for PrimeNG accordion
          this.cdr.detectChanges();
          
          // Use a longer timeout to ensure accordion expansion completes before scrolling
          setTimeout(() => {
            this.scrollToSection(data.entityId, data.sectionId);
          }, 300);
        }
      } else if (isAccount) {
        // It's an account section - ensure only this account is expanded
        const accountIndex = this.accountData.findIndex(a => a.id === data.entityId);
        
        if (accountIndex !== -1) {
          // First, update the current state to match the target
          this.currentAccount = data.entityId;
          this.currentMember = '';
          this.currentSection = data.sectionId;
          
          // Then expand the correct accordion with change detection
          // In scrollable mode, multiple=false, so activeIndex should be a single number
          this.expandedAccountTabs = accountIndex; // Single number for non-multiple mode
          this.expandedMemberTabs = null; // No member expanded in scrollable mode
          
          // Force change detection for PrimeNG accordion
          this.cdr.detectChanges();
          
          // Use a longer timeout to ensure accordion expansion completes before scrolling
          setTimeout(() => {
            this.scrollToSection(data.entityId, data.sectionId);
          }, 300);
        }
      } else {
        // Entity might be part of account's relevant sections (like member sections for an account)
        // This handles cases where we're editing a member section but it's related to an account
        const memberIndex = this.memberData.findIndex(m => m.id === data.entityId);
        
        if (memberIndex !== -1) {
          // First, update the current state to match the target
          this.currentMember = data.entityId;
          this.currentAccount = '';
          this.currentSection = data.sectionId;
          
          // Then expand the correct accordion
          // In scrollable mode, multiple=false, so activeIndex should be a single number
          this.expandedMemberTabs = memberIndex; // Single number for non-multiple mode
          // Also expand relevant account if needed
          this.expandRelevantAccountForMember(data.accountId);
          
          // Force change detection for PrimeNG accordion
          this.cdr.detectChanges();
          
          // Use a longer timeout to ensure accordion expansion completes before scrolling
          setTimeout(() => {
            this.scrollToSection(data.entityId, data.sectionId);
          }, 300);
        }
      }
    } else {
      // In regular mode, navigate directly to the missing section
      const isMember = this.memberData.some(m => m.id === data.entityId);
      
      // Use a timeout to ensure proper accordion expansion after review summary is hidden
      setTimeout(() => {
        this.handleSectionChange(data.sectionId, isMember ? data.entityId : '', isMember ? '' : data.entityId);
      }, 100);
    }
  }

  private getRelevantSectionsForAccount(accountId: string): Array<{entityId: string, sectionId: string, name: string}> {
    const sections: Array<{entityId: string, sectionId: string, name: string}> = [];
    
    // Get account information
    const account = this.accountData.find(a => a.id === accountId);
    if (!account) return sections;

    // Add all owners' sections based on account type
    if (accountId === 'joint-account') {
      // John Smith sections
      sections.push(
        { entityId: 'john-smith', sectionId: 'owner-details', name: 'John Smith - Personal Details' },
        { entityId: 'john-smith', sectionId: 'firm-details', name: 'John Smith - Firm Details' }
      );
      // Mary Smith sections  
      sections.push(
        { entityId: 'mary-smith', sectionId: 'owner-details', name: 'Mary Smith - Personal Details' },
        { entityId: 'mary-smith', sectionId: 'firm-details', name: 'Mary Smith - Firm Details' }
      );
    } else if (accountId === 'roth-ira-account') {
      // Mary Smith sections
      sections.push(
        { entityId: 'mary-smith', sectionId: 'owner-details', name: 'Mary Smith - Personal Details' },
        { entityId: 'mary-smith', sectionId: 'firm-details', name: 'Mary Smith - Firm Details' }
      );
    } else if (accountId === 'trust-account') {
      // Trust sections
      sections.push(
        { entityId: 'smith-trust', sectionId: 'owner-details', name: 'Trust - Personal Details' },
        { entityId: 'smith-trust', sectionId: 'firm-details', name: 'Trust - Firm Details' }
      );
    }

    // Add account-specific sections
    account.sections.forEach(section => {
      sections.push({
        entityId: accountId,
        sectionId: section.id,
        name: `${account.name} - ${section.name}`
      });
    });

    return sections;
  }

  private expandRelevantSections(accountId: string) {
    // Expand relevant accordion sections based on account
    if (accountId === 'joint-account') {
      this.expandedMemberTabs = [0, 1]; // John and Mary
      this.expandedAccountTabs = [0]; // Joint account
    } else if (accountId === 'roth-ira-account') {
      this.expandedMemberTabs = [1]; // Mary
      this.expandedAccountTabs = [1]; // Roth IRA
    } else if (accountId === 'trust-account') {
      this.expandedMemberTabs = [2]; // Trust
      this.expandedAccountTabs = [2]; // Trust account
    }
  }

  private expandRelevantAccountForMember(accountId: string) {
    // Expand the specific account related to this member edit
    const accountIds = ['joint-account', 'roth-ira-account', 'trust-account'];
    const accountIndex = accountIds.indexOf(accountId);
    if (accountIndex !== -1) {
      this.expandedAccountTabs = [accountIndex];
    }
  }

  private highlightSectionInSidebar(entityId: string, sectionId: string) {
    // Set current section and entity to highlight in sidebar
    const isMember = this.memberData.some(m => m.id === entityId);
    if (isMember) {
      this.currentMember = entityId;
      this.currentAccount = '';
    } else {
      this.currentAccount = entityId;
      this.currentMember = '';
    }
    this.currentSection = sectionId as Section;
  }

  onSubmitForESign(accountId: string) {
    // Implementation for e-signature would go here
    this.messageService.add({
      severity: 'success',
      summary: 'Submitted for E-Signature',
      detail: `Account ${accountId} has been submitted for e-signature`,
      life: 5000
    });
  }

  onSubmitAllReady(accountIds: string[]) {
    // Implementation for bulk e-signature would go here
    this.messageService.add({
      severity: 'success',
      summary: 'All Ready Accounts Submitted',
      detail: `${accountIds.length} accounts submitted for e-signature`,
      life: 5000
    });
  }

  toggleProfileMenu(event: Event) {
    event.stopPropagation();
    this.showProfileMenu = !this.showProfileMenu;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    const profileContainer = target.closest('.profile-dropdown-container');
    
    if (!profileContainer) {
      this.showProfileMenu = false;
    }
  }

  onScrollableSectionChange(sectionData: {section: Section, memberId: string, accountId: string}) {
    // Update current section to reflect scrolling position
    this.currentSection = sectionData.section;
    // Don't change currentMember/currentAccount here as they're already set
  }

  handleSectionNavigation(section: Section, memberId: string, accountId: string) {
    // If review summary is showing, hide it first
    if (this.showReviewSummaryMode) {
      this.hideReviewSummary();
    }
    
    if (this.scrollablePagesMode) {
      // In scrollable mode, first update the current entity, then scroll to the section
      this.handleSectionChange(section, memberId, accountId);
      setTimeout(() => {
        this.scrollToSection(memberId || accountId, section);
      }, 100);
    } else {
      // In regular mode, use normal section change
      this.handleSectionChange(section, memberId, accountId);
    }
  }

  handleMobileSectionNavigation(section: Section, memberId: string, accountId: string) {
    this.handleSectionNavigation(section, memberId, accountId);
    this.sidebarVisible = false;
  }

  /**
   * Expand member accordion with proper change detection and timing
   */
  private expandMemberAccordion(memberId: string) {
    // Use actual memberData array instead of hardcoded array
    const memberIndex = this.memberData.findIndex(m => m.id === memberId);
    
    if (memberIndex !== -1) {
      if (this.scrollablePagesMode) {
        // In scrollable mode (multiple=false), activeIndex should be a single number
        this.expandedMemberTabs = memberIndex;
        this.expandedAccountTabs = null; // Close accounts
      } else {
        // In non-scrollable mode (multiple=true), activeIndex should be an array
        // Ensure the target member is expanded
        const currentTabs = Array.isArray(this.expandedMemberTabs) ? this.expandedMemberTabs : [];
        if (!currentTabs.includes(memberIndex)) {
          this.expandedMemberTabs = [...currentTabs, memberIndex];
        }
        this.expandedAccountTabs = []; // Close account tabs
      }
      
      // Force change detection to ensure PrimeNG accordion updates
      this.cdr.detectChanges();
    }
  }

  /**
   * Expand account accordion with proper change detection and timing
   */
  private expandAccountAccordion(accountId: string) {
    // Use actual accountData array instead of hardcoded array
    const accountIndex = this.accountData.findIndex(a => a.id === accountId);
    
    if (accountIndex !== -1) {
      if (this.scrollablePagesMode) {
        // In scrollable mode (multiple=false), activeIndex should be a single number
        this.expandedAccountTabs = accountIndex;
        this.expandedMemberTabs = null; // Close members
      } else {
        // In non-scrollable mode (multiple=true), activeIndex should be an array
        // Ensure the target account is expanded
        const currentTabs = Array.isArray(this.expandedAccountTabs) ? this.expandedAccountTabs : [];
        if (!currentTabs.includes(accountIndex)) {
          this.expandedAccountTabs = [...currentTabs, accountIndex];
        }
        this.expandedMemberTabs = []; // Close member tabs
      }
      
      // Force change detection to ensure PrimeNG accordion updates
      this.cdr.detectChanges();
    }
  }

  private scrollToSection(entityId: string, sectionId: string) {
    // Use ViewChild reference to call scroll method
    if (this.scrollableViewComponent) {
      this.scrollableViewComponent.scrollToSection(entityId, sectionId);
    }
    
    // Highlight the section in the sidebar
    this.highlightSectionInSidebar(entityId, sectionId);
  }
}