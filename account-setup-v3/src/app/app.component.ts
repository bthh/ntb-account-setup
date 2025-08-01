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
  registrationGroupMode = false;
  expandedRegistrationGroups: number[] = [0]; // Start with first registration expanded only
  currentRegistrationContext: string = ''; // Track which registration the user is currently focused on
  
  // Nested expansion state for registration groups (removed owners section as it's always expanded)
  
  expandedOwnerSections: { [ownerId: string]: boolean } = {
    'john-smith': false,
    'mary-smith': false,
    'smith-trust': false
  };
  
  expandedAccountSections: { [accountId: string]: boolean } = {
    'joint-account': false,
    'roth-ira-account': false,
    'trust-account': false
  };

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
      // Owner Details - Complete for demo
      firstName: 'Smith Family',
      middleInitial: '',
      lastName: 'Trust',
      dateOfBirth: new Date('2020-01-01'),
      ssn: '12-3456789', // Trust EIN format
      email: 'trust@smithfamily.com',
      phoneHome: '(555) 123-4567',
      phoneMobile: '(555) 123-4567',
      homeAddress: '123 Main Street, Anytown, ST 12345',
      mailingAddress: 'Same as home address',
      citizenship: 'us-citizen',
      employmentStatus: 'trust',
      annualIncome: 'over-500k',
      netWorth: 'over-5m',
      fundsSource: 'Trust assets and investment income',
      
      // Firm Details - Complete for demo
      totalNetWorth: 'over-5m',
      liquidNetWorth: '1m-5m',
      averageAnnualIncome: 'over-500k',
      incomeSource: 'investments',
      investmentExperience: 'extensive',
      stocksExperience: 'extensive',
      bondsExperience: 'good',
      optionsExperience: 'limited',
      liquidityNeeds: 'low',
      emergencyFund: true,
      scenario1: 'hold'
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
      
      // Base form fields for existing product information
      investmentName: 'Previous Brokerage Account',
      productType: 'Taxable Investment Account',
      accountPolicyNumber: 'JOINT-987654',
      initialDateOfPurchase: new Date('2019-05-01'),
      initialPremiumInvestment: '$75,000',
      currentAccountValue: '$125,000',
      approximateAnnualCost: '0.65%',
      currentSurrenderValue: 'N/A',
      surrenderSalesPenaltyCharges: 'None',
      deathBenefitRiderValue: 'N/A',
      livingBenefitRiderValue: 'N/A',
      outstandingLoanAmount: '$0',
      wasExistingProductRecommended: 'Partial transfer recommended',
      
      // Employer Sponsored Retirement Plans
      recommendationIncludeRetainFunds: 'Transfer 70% of existing balance',
      
      // Investment Policy Statement
      equityRatio: 'balanced-growth',
      equityRatioOther: '',
      allocationModelExplanation: 'Balanced growth allocation suitable for joint long-term goals',
      nonQualifiedAssetConsiderations: 'Tax-loss harvesting opportunities available',
      additionalInvestmentInstructions: 'Coordinate with existing retirement accounts for overall allocation',
      
      // Additional Account Information
      patriotActForeignFinancial: false,
      patriotActPrivateBanking: false,
      patriotActOffshoreBank: false,
      patriotActGovernmentOfficial: false,
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
      
      // Base form fields for existing product information
      investmentName: 'Previous Traditional IRA',
      productType: 'Traditional IRA',
      accountPolicyNumber: 'ROTH-456789',
      initialDateOfPurchase: new Date('2020-04-15'),
      initialPremiumInvestment: '$5,500',
      currentAccountValue: '$8,200',
      approximateAnnualCost: '0.25%',
      currentSurrenderValue: 'N/A',
      surrenderSalesPenaltyCharges: 'None (conversion)',
      deathBenefitRiderValue: 'N/A',
      livingBenefitRiderValue: 'N/A',
      outstandingLoanAmount: '$0',
      wasExistingProductRecommended: 'Roth conversion recommended',
      
      // Employer Sponsored Retirement Plans
      recommendationIncludeRetainFunds: 'Convert traditional IRA to Roth over time',
      
      // Investment Policy Statement
      equityRatio: 'aggressive-growth',
      equityRatioOther: '',
      allocationModelExplanation: 'Aggressive growth appropriate for long retirement timeline',
      nonQualifiedAssetConsiderations: 'N/A for Roth IRA',
      additionalInvestmentInstructions: 'Maximize annual contributions and consider backdoor Roth strategies',
      
      // Additional Account Information
      patriotActForeignFinancial: false,
      patriotActPrivateBanking: false,
      patriotActOffshoreBank: false,
      patriotActGovernmentOfficial: false,
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
      // Account setup fields - INTENTIONALLY INCOMPLETE for demo purposes
      accountType: 'trust',
      investmentObjective: 'preservation', 
      riskTolerance: 'conservative',
      trustName: 'Smith Family Revocable Living Trust',
      trustType: 'revocable-living',
      trustEffectiveDate: new Date('2020-01-15'),
      trustEin: '12-3456789',
      trustState: 'CA',
      trustPurpose: '', // EMPTY for demo - required field missing
      trusteeName: '', // EMPTY for demo - required field missing  
      trusteePhone: '(555) 123-4567',
      trusteeAddress: '', // EMPTY for demo - required field missing
      hasSuccessorTrustee: true,
      trustees: [],
      
      // Firm Details - Account-specific fields
      investmentObjectives: 'Conservative wealth preservation with modest growth. Protect principal while generating income for trust beneficiaries.',
      recommendations: 'Conservative allocation with 40% equities and 60% fixed income. Focus on dividend-paying stocks and high-grade bonds.',
      alternativeSuggestions: 'Consider municipal bonds for tax efficiency. Evaluate real estate investment trusts for diversification.',
      
      fundingInstances: {
        'acat': [
          {
            type: 'acat',
            typeName: 'ACAT Transfers',
            name: 'Trust Assets Transfer',
            amount: '500000',
            fromFirm: 'Previous Trust Custodian',
            transferType: 'Full Transfer'
          }
        ],
        'ach': [],
        'initial-ach': [],
        'withdrawal': [],
        'contribution': []
      }
    },
    'traditional-ira-account': {
      // Account setup fields - partially complete for demo
      accountType: 'traditional-ira',
      investmentObjective: 'growth',
      riskTolerance: 'moderate',
      primaryBeneficiary: 'Mary Smith',
      beneficiaryRelationship: 'Spouse',
      beneficiaryPercentage: 100,
      liquidityTiming: '10+years',
      timeHorizon: 'long-term',
      primaryGoals: 'Retirement savings with tax-deferred growth',
      
      // Source of Funds
      initialSourceOfFunds: '401k-rollover',
      investmentAmount: '$75,000',
      additionalSourceFunds: 'Annual IRA contributions up to limit',
      
      // Firm Details - Account-specific fields
      investmentObjectives: 'Long-term growth with moderate risk for retirement planning. Maximize tax-deferred growth potential.',
      recommendations: 'Growth-oriented allocation with 80% equities and 20% fixed income. Regular contributions and annual rebalancing.',
      alternativeSuggestions: 'Consider Roth conversion ladder strategy. Evaluate target-date funds for simplicity.',
      
      // Beneficiaries
      beneficiaries: [
        {
          id: 'beneficiary-1',
          name: 'Mary Smith',
          relationship: 'Spouse',
          percentage: 50,
          dateOfBirth: new Date('1987-08-22'),
          ssn: '987-65-4321',
          address: '123 Main Street, Anytown, ST 12345'
        },
        {
          id: 'beneficiary-2',
          name: 'Michael Smith',
          relationship: 'Child',
          percentage: 30,
          dateOfBirth: new Date('2010-03-15'),
          ssn: '123-45-6789',
          address: '123 Main Street, Anytown, ST 12345'
        },
        {
          id: 'beneficiary-3',
          name: 'Sarah Smith',
          relationship: 'Child',
          percentage: 20,
          dateOfBirth: new Date('2012-11-08'),
          ssn: '234-56-7890',
          address: '123 Main Street, Anytown, ST 12345'
        }
      ],
      
      fundingInstances: {
        'acat': [
          {
            type: 'acat',
            typeName: '401k Rollover',
            name: 'Previous 401k Rollover',
            amount: '75000',
            fromFirm: 'Previous Employer 401k',
            transferType: 'Direct Rollover'
          }
        ],
        'ach': [],
        'initial-ach': [],
        'withdrawal': [],
        'contribution': [
          {
            type: 'contribution',
            typeName: 'Annual Contribution',
            name: 'Annual IRA Contribution',
            amount: '6500',
            contributionMethod: 'ach',
            frequency: 'annual'
          }
        ]
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
    },
    {
      id: 'traditional-ira-account',
      name: 'Traditional IRA Account',
      owners: 'John Smith',
      icon: 'pi pi-university',
      sections: [
        { id: 'account-setup', name: 'Account Setup', icon: 'pi pi-cog' },
        { id: 'funding', name: 'Funding', icon: 'pi pi-dollar' },
        { id: 'firm-details', name: 'Firm Details', icon: 'pi pi-building' }
      ]
    }
  ];

  // Registration groups data structure
  registrationGroups = [
    {
      id: 'joint-registration',
      name: 'Joint Registration',
      icon: 'pi pi-users',
      members: [
        { id: 'john-smith', name: 'John Smith', sections: ['owner-details', 'firm-details'] },
        { id: 'mary-smith', name: 'Mary Smith', sections: ['owner-details', 'firm-details'] }
      ],
      accounts: [
        { id: 'joint-account', name: 'Joint Account', sections: ['account-setup', 'funding', 'firm-details'] }
      ]
    },
    {
      id: 'roth-registration',
      name: 'Roth Registration',
      icon: 'pi pi-star',
      members: [
        { id: 'mary-smith', name: 'Mary Smith', sections: ['owner-details', 'firm-details'] }
      ],
      accounts: [
        { id: 'roth-ira-account', name: 'Roth IRA Account', sections: ['account-setup', 'funding', 'firm-details'] }
      ]
    },
    {
      id: 'trust-registration',
      name: 'Trust Registration',
      icon: 'pi pi-shield',
      members: [
        { id: 'smith-trust', name: 'Smith Trust', sections: ['owner-details', 'firm-details'] }
      ],
      accounts: [
        { id: 'trust-account', name: 'Trust Account', sections: ['account-setup', 'funding', 'firm-details'] }
      ]
    },
    {
      id: 'traditional-ira-registration',
      name: 'Traditional IRA Registration',
      icon: 'pi pi-university',
      members: [
        { id: 'john-smith', name: 'John Smith', sections: ['owner-details', 'firm-details'] }
      ],
      accounts: [
        { id: 'traditional-ira-account', name: 'Traditional IRA Account', sections: ['account-setup', 'funding', 'firm-details'] }
      ]
    }
  ];

  constructor(private messageService: MessageService, private cdr: ChangeDetectorRef) {
    // Auto-save functionality
    this.setupAutoSave();
  }

  ngOnInit() {
    // Clear localStorage to ensure demo data is used with intentionally incomplete trust account
    localStorage.removeItem('accountSetupData');
    
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
    
    // Debug completion status calculations
    console.log('=== DETAILED COMPLETION STATUS DEBUG ===');
    
    // Debug trust account setup specifically
    const trustAccountData = this.formData['trust-account'];
    console.log('Trust account data:', trustAccountData);
    console.log('Trust account setup fields check:');
    console.log('- accountType:', trustAccountData?.accountType);
    console.log('- investmentObjective:', trustAccountData?.investmentObjective);
    console.log('- riskTolerance:', trustAccountData?.riskTolerance);
    console.log('- trustName:', trustAccountData?.trustName);
    console.log('- trustType:', trustAccountData?.trustType);
    console.log('- trustEin:', trustAccountData?.trustEin);
    console.log('- trustState:', trustAccountData?.trustState);
    console.log('- trustPurpose:', trustAccountData?.trustPurpose);
    console.log('- trusteeName:', trustAccountData?.trusteeName);
    console.log('- trusteeAddress:', trustAccountData?.trusteeAddress);
    
    console.log('Trust Account Setup Complete:', this.calculateSectionCompletion('accounts', 'trust-account', 'account-setup'));
    console.log('Trust Account Firm Details Complete:', this.calculateSectionCompletion('accounts', 'trust-account', 'firm-details'));
    console.log('Smith Trust Owner Details Complete:', this.calculateSectionCompletion('members', 'smith-trust', 'owner-details'));
    console.log('Smith Trust Firm Details Complete:', this.calculateSectionCompletion('members', 'smith-trust', 'firm-details'));
    
    // Debug overall progress calculation
    console.log('Overall progress calculation:', this.getOverallProgress());
    console.log('Overall completion status object:', this.completionStatus);
    console.log('========================================');
    
    // Initialize registration group expansion based on current section
    if (this.registrationGroupMode) {
      // Initialize registration context to the first registration
      if (this.registrationGroups.length > 0) {
        this.currentRegistrationContext = this.registrationGroups[0].id;
      }
      this.updateRegistrationGroupExpansion();
    }
  }

  private mergeFormData(defaultData: FormData, savedData: FormData): FormData {
    const merged: FormData = { ...defaultData };
    
    // For each entity in saved data, merge with default data
    Object.keys(savedData).forEach(entityId => {
      if (merged[entityId]) {
        // For demo entities, prefer default data to ensure demo data is visible
        if (entityId === 'john-smith' || entityId === 'mary-smith' || entityId === 'joint-account' || entityId === 'trust-account') {
          // Keep default demo data and only merge non-empty fields from saved data
          const defaultEntityData = merged[entityId];
          const savedEntityData = savedData[entityId];
          
          // Create merged entity data preferring default values for key demo fields
          merged[entityId] = { ...savedEntityData };
          
          // For critical demo fields, always preserve default data (including intentionally empty fields for demo)
          Object.keys(defaultEntityData).forEach(field => {
            // Always use default data for demo entities, even if it's empty (for demo purposes)
            merged[entityId][field] = defaultEntityData[field];
          });
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
    const accountOrder = ['joint-account', 'roth-ira-account', 'trust-account', 'traditional-ira-account'];
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
    const accountOrder = ['joint-account', 'roth-ira-account', 'trust-account', 'traditional-ira-account'];
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
    console.log('handleSectionChange called:', { section, memberId, accountId });
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
    
    // Update registration group expansion if in registration group mode
    if (this.registrationGroupMode) {
      this.resetSubsectionExpansions();
      this.updateRegistrationGroupExpansion();
    }

    // Scroll to top of main content area when navigating sections
    setTimeout(() => {
      if (this.scrollablePagesMode) {
        // In scrollable mode, target the scrollable view container
        const scrollableContainer = document.querySelector('.scrollable-view-container');
        
        if (scrollableContainer) {
          scrollableContainer.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        }
      } else {
        // In regular mode, try multiple scroll targets to ensure reliable scrolling
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

  // Calculate overall registration completion (rollup of all entities in registration)
  isRegistrationComplete(registrationId: string): boolean {
    const registration = this.registrationGroups.find(r => r.id === registrationId);
    if (!registration) return false;

    // Check all members in the registration
    const allMembersComplete = registration.members.every(member => 
      this.isEntityComplete('members', member.id)
    );

    // Check all accounts in the registration
    const allAccountsComplete = registration.accounts.every(account => 
      this.isEntityComplete('accounts', account.id)
    );

    return allMembersComplete && allAccountsComplete;
  }

  private calculateSectionCompletion(entityType: 'members' | 'accounts', entityId: string, sectionId: string): boolean {
    const entityData = this.formData[entityId];
    if (!entityData) {
      console.log(`calculateSectionCompletion: No data found for ${entityId}`);
      return false;
    }

    // Define required fields for each section type
    let requiredFields: string[] = [];
    
    if (sectionId === 'owner-details') {
      requiredFields = [
        'firstName', 'lastName', 'dateOfBirth', 'ssn', 'phoneHome', 'email', 
        'homeAddress', 'citizenship', 'employmentStatus', 'annualIncome', 'netWorth', 'fundsSource'
      ];
    } else if (sectionId === 'firm-details') {
      if (entityType === 'members') {
        // Member-specific firm details fields
        requiredFields = [
          'totalNetWorth', 'liquidNetWorth', 'averageAnnualIncome', 'incomeSource',
          'investmentExperience', 'stocksExperience', 'bondsExperience', 'optionsExperience',
          'liquidityNeeds', 'emergencyFund', 'scenario1'
        ];
      } else if (entityType === 'accounts') {
        // Account-specific firm details fields
        requiredFields = ['investmentObjectives', 'recommendations', 'alternativeSuggestions'];
      }
    } else if (sectionId === 'account-setup') {
      // Base required fields for all account types
      requiredFields = ['accountType', 'investmentObjective', 'riskTolerance'];
      
      // Add additional required fields based on account type
      const accountType = entityData.accountType;
      
      if (accountType === 'trust') {
        // Trust accounts require additional fields but not initialSourceOfFunds/investmentAmount
        // since they typically get funded through ACAT transfers
        requiredFields.push(
          'trustName', 'trustType', 'trustEin', 'trustState', 'trustPurpose',
          'trusteeName', 'trusteePhone', 'trusteeAddress'
        );
      } else if (accountType === 'roth-ira' || accountType === 'traditional-ira') {
        // IRA accounts require additional fields
        requiredFields.push('initialSourceOfFunds', 'investmentAmount');
      } else {
        // Regular accounts (joint, etc.) require source of funds
        requiredFields.push('initialSourceOfFunds', 'investmentAmount');
      }
    } else if (sectionId === 'funding') {
      // Special case for funding - check if fundingInstances object exists and has at least one funding method
      if (!entityData.fundingInstances) return false;
      
      // Check if at least one funding type has entries
      return Object.values(entityData.fundingInstances).some(instances => 
        Array.isArray(instances) && instances.length > 0
      );
    }

    // Debug logging for trust account setup specifically
    if (entityId === 'trust-account' && sectionId === 'account-setup') {
      console.log(`=== DEBUGGING ${entityId} ${sectionId} ===`);
      console.log('Required fields:', requiredFields);
      console.log('Field check results:');
      
      const fieldResults = requiredFields.map(field => {
        const value = entityData[field];
        const isEmpty = value === null || value === undefined || value === '';
        const isEmptyString = typeof value === 'string' && value.trim() === '';
        const isValid = !isEmpty && !isEmptyString;
        
        console.log(`- ${field}: "${value}" -> ${isValid ? 'VALID' : 'INVALID'} (isEmpty: ${isEmpty}, isEmptyString: ${isEmptyString})`);
        return isValid;
      });
      
      const allValid = fieldResults.every(result => result);
      console.log(`All fields valid: ${allValid}`);
      console.log('===============================');
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
    console.log('onMemberTabChange', event);
    
    if (!this.scrollablePagesMode) {
      // In regular mode (multiple=true), close all account tabs when opening member tabs
      this.expandedAccountTabs = [];
      
      // Get the newly expanded tab index
      const newIndex = Array.isArray(event.index) ? event.index[event.index.length - 1] : event.index;
      const previouslyExpanded = Array.isArray(this.expandedMemberTabs) ? this.expandedMemberTabs : [];
      
      // Handle multiple selection - keep only the last selected
      this.expandedMemberTabs = Array.isArray(event.index) ? [event.index[event.index.length - 1]] : [event.index];
      
      // Always navigate to the member when their accordion is opened/clicked
      // This ensures clicking on any member header navigates to their first section
      if (newIndex !== null) {
        const member = this.memberData[newIndex];
        if (member) {
          console.log('Navigating to member from accordion click:', member.id);
          // Navigate to the first section of this member (owner-details)
          this.handleSectionChange('owner-details', member.id, '');
        }
      }
    } else {
      // In scrollable mode (multiple=false), event.index is a single number or null
      // Don't close account tabs - allow one from each category
      this.expandedMemberTabs = event.index; // Single number or null for non-multiple mode
    }
  }

  onAccountTabChange(event: any) {
    console.log('onAccountTabChange', event);
    
    if (!this.scrollablePagesMode) {
      // In regular mode (multiple=true), close all member tabs when opening account tabs
      this.expandedMemberTabs = [];
      
      // Get the newly expanded tab index
      const newIndex = Array.isArray(event.index) ? event.index[event.index.length - 1] : event.index;
      const previouslyExpanded = Array.isArray(this.expandedAccountTabs) ? this.expandedAccountTabs : [];
      
      // Handle multiple selection - keep only the last selected
      this.expandedAccountTabs = Array.isArray(event.index) ? [event.index[event.index.length - 1]] : [event.index];
      
      // Always navigate to the account when their accordion is opened/clicked
      // This ensures clicking on any account header navigates to their first section
      if (newIndex !== null) {
        const account = this.accountData[newIndex];
        if (account) {
          console.log('Navigating to account from accordion click:', account.id);
          // Navigate to the first section of this account (account-setup)
          this.handleSectionChange('account-setup', '', account.id);
        }
      }
    } else {
      // In scrollable mode (multiple=false), event.index is a single number or null
      // Don't close member tabs - allow one from each category
      this.expandedAccountTabs = event.index; // Single number or null for non-multiple mode
    }
  }

  // Direct header click handlers for normal (non-registration group) mode
  onMemberHeaderClick(memberId: string) {
    if (!this.registrationGroupMode) {
      console.log('Member header clicked in normal mode:', memberId);
      // Navigate to the member's first section (owner-details)
      this.handleSectionChange('owner-details', memberId, '');
      // Note: The accordion expansion is handled by PrimeNG automatically
    }
  }

  onAccountHeaderClick(accountId: string) {
    if (!this.registrationGroupMode) {
      console.log('Account header clicked in normal mode:', accountId);
      // Navigate to the account's first section (account-setup)
      this.handleSectionChange('account-setup', '', accountId);
      // Note: The accordion expansion is handled by PrimeNG automatically
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

    // Check member sections using the unified calculation method
    ['john-smith', 'mary-smith', 'smith-trust'].forEach(memberId => {
      const ownerComplete = this.calculateSectionCompletion('members', memberId, 'owner-details');
      const firmComplete = this.calculateSectionCompletion('members', memberId, 'firm-details');
      
      newCompletionStatus.members[memberId] = {
        'owner-details': ownerComplete,
        'firm-details': firmComplete
      };
    });

    // Check account sections using the unified calculation method
    ['joint-account', 'roth-ira-account', 'trust-account', 'traditional-ira-account'].forEach(accountId => {
      const setupComplete = this.calculateSectionCompletion('accounts', accountId, 'account-setup');
      const fundingComplete = this.calculateSectionCompletion('accounts', accountId, 'funding');
      const firmComplete = this.calculateSectionCompletion('accounts', accountId, 'firm-details');
      
      newCompletionStatus.accounts[accountId] = {
        'account-setup': setupComplete,
        'funding': fundingComplete,
        'firm-details': firmComplete
      };
    });

    this.completionStatus = newCompletionStatus;
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

  // Calculate overall progress percentage based on actual completion status
  getOverallProgress(): number {
    let totalSections = 0;
    let completedSections = 0;

    // Count member sections
    Object.keys(this.completionStatus.members).forEach(memberId => {
      const memberStatus = this.completionStatus.members[memberId];
      Object.keys(memberStatus).forEach(sectionId => {
        totalSections++;
        if (memberStatus[sectionId as keyof typeof memberStatus]) {
          completedSections++;
        }
      });
    });

    // Count account sections
    Object.keys(this.completionStatus.accounts).forEach(accountId => {
      const accountStatus = this.completionStatus.accounts[accountId];
      Object.keys(accountStatus).forEach(sectionId => {
        totalSections++;
        if (accountStatus[sectionId as keyof typeof accountStatus]) {
          completedSections++;
        }
      });
    });

    const progress = totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;
    return progress;
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

  onEditAccountQuickReview(accountId: string) {
    this.hideReviewSummary();
    
    // Force enable scrollable mode, registration group mode, and review mode for quick review
    this.scrollablePagesMode = true;
    this.registrationGroupMode = true;
    this.isReviewMode = true;
    
    console.log('Quick Review Mode enabled for account:', accountId);
    
    // Get all relevant sections for this registration
    const relevantSections = this.getRelevantSectionsForAccount(accountId);
    
    // Reset all subsections and expand only relevant ones
    this.resetSubsectionExpansions();
    this.expandRelevantSections(accountId);
    this.updateRegistrationGroupExpansion();
    
    // Scroll to the first relevant section
    if (relevantSections.length > 0) {
      const firstSection = relevantSections[0];
      setTimeout(() => {
        this.scrollToSection(firstSection.entityId, firstSection.sectionId);
      }, 300);
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
    } else if (accountId === 'traditional-ira-account') {
      // John Smith sections for Traditional IRA
      sections.push(
        { entityId: 'john-smith', sectionId: 'owner-details', name: 'John Smith - Personal Details' },
        { entityId: 'john-smith', sectionId: 'firm-details', name: 'John Smith - Firm Details' }
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
    } else if (accountId === 'traditional-ira-account') {
      this.expandedMemberTabs = [0]; // John Smith
      this.expandedAccountTabs = [3]; // Traditional IRA
    }
  }

  private expandRelevantAccountForMember(accountId: string) {
    // Expand the specific account related to this member edit
    const accountIds = ['joint-account', 'roth-ira-account', 'trust-account', 'traditional-ira-account'];
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

  // Registration group helper methods
  getMemberIcon(memberId: string): string {
    const member = this.memberData.find(m => m.id === memberId);
    return member ? member.icon : 'pi pi-user';
  }

  getAccountIcon(accountId: string): string {
    const account = this.accountData.find(a => a.id === accountId);
    return account ? account.icon : 'pi pi-briefcase';
  }

  getSectionIcon(sectionId: string): string {
    const iconMap: { [key: string]: string } = {
      'owner-details': 'pi pi-user',
      'firm-details': 'pi pi-building',
      'account-setup': 'pi pi-cog',
      'funding': 'pi pi-dollar'
    };
    return iconMap[sectionId] || 'pi pi-file';
  }

  getSectionName(sectionId: string): string {
    const nameMap: { [key: string]: string } = {
      'owner-details': 'Personal Details',
      'firm-details': 'Firm Details',
      'account-setup': 'Account Setup',
      'funding': 'Funding'
    };
    return nameMap[sectionId] || sectionId;
  }

  onRegistrationGroupTabChange(event: any) {
    // For single accordion mode, store the active index as an array with one element
    this.expandedRegistrationGroups = [event.index];
    
    // Update registration context when user switches tabs
    if (event.index >= 0 && event.index < this.registrationGroups.length) {
      this.currentRegistrationContext = this.registrationGroups[event.index].id;
    }
    
    // Reset all subsection expansions when switching registration groups
    this.resetSubsectionExpansions();
    
    // Only expand subsections that contain the current active section
    this.updateRegistrationGroupExpansion();
  }


  toggleOwnerSection(ownerId: string) {
    this.expandedOwnerSections[ownerId] = !this.expandedOwnerSections[ownerId];
  }

  navigateToOwner(ownerId: string) {
    console.log('navigateToOwner called for:', ownerId);
    // Use handleSectionChange to get proper scroll-to-top behavior
    this.handleSectionChange('owner-details', ownerId, '');
    console.log('navigateToOwner completed - current state:', {
      currentMember: this.currentMember,
      currentAccount: this.currentAccount,
      currentSection: this.currentSection
    });
  }

  handleOwnerHeaderClick(event: Event, ownerId: string, registrationId?: string) {
    console.log('handleOwnerHeaderClick called:', { ownerId, registrationId, registrationGroupMode: this.registrationGroupMode });
    
    if (this.registrationGroupMode) {
      // In registration group mode, clicking owner header should navigate AND expand
      // Set the registration context to maintain correct sidebar state
      if (registrationId) {
        this.currentRegistrationContext = registrationId;
      }
      
      // Always expand the sections when clicking header
      this.expandedOwnerSections[ownerId] = true;
      console.log('Expanded owner sections:', ownerId);
      
      // Navigate to the owner (this will also trigger scroll-to-top)
      console.log('About to call navigateToOwner for:', ownerId);
      this.navigateToOwner(ownerId);
      
      console.log('Owner header clicked - expanded and navigated to:', ownerId);
    } else {
      // In normal mode, just toggle the section
      this.toggleOwnerSection(ownerId);
    }
  }

  toggleAccountSection(accountId: string) {
    this.expandedAccountSections[accountId] = !this.expandedAccountSections[accountId];
  }

  navigateToAccount(accountId: string) {
    // Use handleSectionChange to get proper scroll-to-top behavior
    this.handleSectionChange('account-setup', '', accountId);
  }

  handleAccountHeaderClick(event: Event, accountId: string, registrationId?: string) {
    if (this.registrationGroupMode) {
      // In registration group mode, clicking account header should navigate AND expand
      // Set the registration context to maintain correct sidebar state
      if (registrationId) {
        this.currentRegistrationContext = registrationId;
      }
      
      // Always expand the sections when clicking header
      this.expandedAccountSections[accountId] = true;
      
      // Navigate to the account (this will also trigger scroll-to-top)
      this.navigateToAccount(accountId);
      
      console.log('Account header clicked - expanded and navigated to:', accountId);
    } else {
      // In normal mode, just toggle the section
      this.toggleAccountSection(accountId);
    }
  }

  resetSubsectionExpansions() {
    // Reset all owner section expansion states
    Object.keys(this.expandedOwnerSections).forEach(key => {
      this.expandedOwnerSections[key] = false;
    });
    
    // Reset all account section expansion states
    Object.keys(this.expandedAccountSections).forEach(key => {
      this.expandedAccountSections[key] = false;
    });
  }

  updateRegistrationGroupExpansion() {
    // Find which registration contains the current active section
    const activeRegistration = this.findRegistrationForCurrentSection();
    
    if (activeRegistration) {
      // Find the index of the active registration and expand only that one
      const activeIndex = this.registrationGroups.findIndex(reg => reg.id === activeRegistration.id);
      if (activeIndex !== -1) {
        this.expandedRegistrationGroups = [activeIndex];
      }
      
      // Owners section is now always visible, no need to expand it
      
      // Expand the specific owner section that contains the current section
      if (this.currentMember) {
        const member = activeRegistration.members.find((m: any) => m.id === this.currentMember);
        if (member) {
          this.expandedOwnerSections[this.currentMember] = true;
        }
      }
      
      // Expand the specific account section that contains the current section
      if (this.currentAccount) {
        const account = activeRegistration.accounts.find((a: any) => a.id === this.currentAccount);
        if (account) {
          this.expandedAccountSections[this.currentAccount] = true;
        }
      }
    }
  }

  findRegistrationForCurrentSection(): any {
    // If we have a specific registration context (from user clicks), use that first
    if (this.currentRegistrationContext) {
      const contextRegistration = this.registrationGroups.find(reg => reg.id === this.currentRegistrationContext);
      if (contextRegistration) {
        // Verify this registration actually contains the current member/account
        const containsMember = this.currentMember && contextRegistration.members.some((m: any) => m.id === this.currentMember);
        const containsAccount = this.currentAccount && contextRegistration.accounts.some((a: any) => a.id === this.currentAccount);
        
        if (containsMember || containsAccount) {
          return contextRegistration;
        }
      }
    }
    
    // Fallback to finding first registration that contains the current member or account
    return this.registrationGroups.find(reg => {
      // Check if current member is in this registration
      if (this.currentMember && reg.members.some((m: any) => m.id === this.currentMember)) {
        return true;
      }
      // Check if current account is in this registration
      if (this.currentAccount && reg.accounts.some((a: any) => a.id === this.currentAccount)) {
        return true;
      }
      return false;
    });
  }

  onScrollableSectionChange(sectionData: {section: Section, memberId: string, accountId: string}) {
    // Update current section to reflect scrolling position
    this.currentSection = sectionData.section;
    this.currentMember = sectionData.memberId;
    this.currentAccount = sectionData.accountId;
    
    // Update registration group expansion if in registration group mode
    if (this.registrationGroupMode) {
      this.updateRegistrationGroupExpansion();
    }
  }

  onRegistrationGroupModeChange(enabled: boolean) {
    if (enabled) {
      // When enabling registration group mode, reset and initialize proper expansion
      // Initialize registration context to the first registration
      if (this.registrationGroups.length > 0) {
        this.currentRegistrationContext = this.registrationGroups[0].id;
      }
      this.resetSubsectionExpansions();
      this.updateRegistrationGroupExpansion();
    } else {
      // Clear registration context when disabling registration group mode
      this.currentRegistrationContext = '';
    }
  }

  handleSectionNavigation(section: Section, memberId: string, accountId: string) {
    // If review summary is showing, hide it first
    if (this.showReviewSummaryMode) {
      this.hideReviewSummary();
    }
    
    if (this.scrollablePagesMode) {
      // Check if we're switching to a different entity
      const switchingEntity = (memberId && memberId !== this.currentMember) || 
                             (accountId && accountId !== this.currentAccount);
      
      // Debug entity switching (only when switching)
      if (switchingEntity) {
        console.log('Switching entity:', { from: this.currentMember || this.currentAccount, to: memberId || accountId });
      }
      
      // In scrollable mode, first update the current entity
      this.handleSectionChange(section, memberId, accountId);
      
      if (switchingEntity) {
        // If switching entities, scroll to top (handleSectionChange already does this)
        // Don't call scrollToSection as it would override the scroll-to-top behavior
      } else {
        // If staying on same entity, scroll to the specific section
        setTimeout(() => {
          this.scrollToSection(memberId || accountId, section);
        }, 400); // Wait longer to ensure scroll-to-top and DOM updates complete
      }
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