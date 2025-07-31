import { Component, ViewChild, HostListener, ElementRef, signal, computed } from '@angular/core';
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
    ReviewSummaryComponent
  ],
  providers: [MessageService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  @ViewChild('toast') toast!: Toast;

  // State management with signals
  title = 'account-setup-v3';
  isInitialLoad = true;
  sidebarVisible = false;
  sidebarWidth = 320;
  isResizing = false;
  expandedMemberTabs: number[] = [0];
  expandedAccountTabs: number[] = [];
  currentSection: Section = 'owner-details';
  currentMember = 'john-smith';
  currentAccount = '';
  isReviewMode = false;
  showReviewSummaryMode = false;

  // Form data with same initial data as V2
  formData: FormData = {
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
      accountType: 'roth-ira',
      investmentObjective: 'growth',
      riskTolerance: 'moderate',
      fundingInstances: {
        'acat': [],
        'ach': [],
        'initial-ach': [],
        'withdrawal': [],
        'contribution': []
      },
      beneficiaries: []
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
      'roth-ira-account': {
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

  constructor(private messageService: MessageService) {
    // Auto-save functionality
    this.setupAutoSave();
  }

  ngOnInit() {
    // Load saved data from localStorage
    const savedData = localStorage.getItem('accountSetupData');
    if (savedData) {
      try {
        this.formData = JSON.parse(savedData);
      } catch (e) {
        console.error('Failed to parse saved form data:', e);
      }
    }
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
      
      // Auto-expand the accordion for the current member (only one at a time)
      const memberIds = ['john-smith', 'mary-smith', 'smith-trust'];
      const memberIndex = memberIds.indexOf(memberId);
      if (memberIndex !== -1) {
        this.expandedMemberTabs = [memberIndex];
        this.expandedAccountTabs = []; // Close account tabs
      }
    }
    
    if (accountId) {
      this.currentAccount = accountId;
      this.currentMember = '';
      
      // Auto-expand the accordion for the current account (only one at a time)
      const accountIds = ['joint-account', 'roth-ira-account', 'trust-account'];
      const accountIndex = accountIds.indexOf(accountId);
      if (accountIndex !== -1) {
        this.expandedAccountTabs = [accountIndex];
        this.expandedMemberTabs = []; // Close member tabs
      }
    }

    // Auto-save notification removed per user request

    this.isInitialLoad = false;

    // Scroll to top of main content area
    setTimeout(() => {
      // Try multiple scroll targets to ensure it works
      const mainContentArea = document.querySelector('.main-content-area');
      const cardBody = document.querySelector('.p-card .p-card-body');
      const flexContent = document.querySelector('.flex-1');
      
      if (mainContentArea) {
        mainContentArea.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      } else if (cardBody) {
        cardBody.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      } else if (flexContent) {
        flexContent.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      } else {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    }, 100);
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
    const entityStatus = this.completionStatus[entityType][entityId];
    return entityStatus ? Object.values(entityStatus).every(Boolean) : false;
  }

  getSectionCompletion(entityType: 'members' | 'accounts', entityId: string, sectionId: string): boolean {
    const entityStatus = this.completionStatus[entityType][entityId];
    return entityStatus ? !!entityStatus[sectionId] : false;
  }

  // Accordion event handlers - only allow one section expanded at a time
  onMemberTabChange(event: any) {
    // Close all account tabs when opening member tabs
    this.expandedAccountTabs = [];
    // Only allow one member tab open at a time
    this.expandedMemberTabs = Array.isArray(event.index) ? [event.index[event.index.length - 1]] : [event.index];
  }

  onAccountTabChange(event: any) {
    // Close all member tabs when opening account tabs
    this.expandedMemberTabs = [];
    // Only allow one account tab open at a time
    this.expandedAccountTabs = Array.isArray(event.index) ? [event.index[event.index.length - 1]] : [event.index];
  }

  // Form data change handlers
  onFormDataChange(newFormData: FormData) {
    this.formData = newFormData;
    // Trigger auto-save
    localStorage.setItem('accountSetupData', JSON.stringify(this.formData));
  }

  onCompletionStatusChange(newStatus: CompletionStatus) {
    this.completionStatus = newStatus;
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
    // Navigate to the account's setup section
    this.handleSectionChange('account-setup', '', accountId);
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
}