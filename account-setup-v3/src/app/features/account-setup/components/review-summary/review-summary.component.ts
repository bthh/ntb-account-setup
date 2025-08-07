import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

// PrimeNG Imports - removed unused modules for cleaner design

// Local Imports  
import { FormData, CompletionStatus, Section } from '../../../../shared/models/types';

interface AccountSummary {
  id: string;
  name: string;
  owners: string;
  icon: string;
  completionPercentage: number;
  completedSections: number;
  totalSections: number;
  missingFields: string[];
  accountType: string;
  canSubmit: boolean;
  hasMissingFields: boolean;
  nextMissingSection: { entityId: string, sectionId: Section } | null;
}

@Component({
  selector: 'app-review-summary',
  standalone: true,
  imports: [
    CommonModule
  ],
  template: `
    <div class="review-summary-section">
      <div class="summary-header">
        <h3>Account Setup Review</h3>
        <p>Review all account registrations and submit for e-signature when ready.</p>
      </div>

      <!-- Overall Summary -->
      <div class="overall-summary">
        <div class="summary-text">
          {{getCompletedAccountsCount()}} of {{accountSummaries.length}} accounts ready for submission
        </div>
      </div>

      <!-- Account List -->
      <div class="accounts-list">
        <div *ngFor="let account of accountSummaries" class="account-row">
          <div class="account-info">
            <div class="account-basic">
              <h4 class="account-name">{{account.name}}</h4>
              <span class="account-owners">{{account.owners}}</span>
              <span class="account-type">{{account.accountType}}</span>
            </div>
          </div>
          
          <div class="account-status">
            <div class="completion-info">
              <span class="completion-text">{{account.completionPercentage}}% Complete</span>
              <span class="sections-text">{{account.completedSections}}/{{account.totalSections}} sections</span>
            </div>
            
            <div *ngIf="account.missingFields.length > 0" class="missing-info">
              <span class="missing-text">{{account.missingFields.length}} missing fields</span>
            </div>
          </div>

          <div class="account-actions">
            <button class="btn-edit" (click)="onEditAccount(account.id)">
              {{account.hasMissingFields ? 'Needs Attention' : 'Review'}}
            </button>
            
            <button 
              class="btn-submit" 
              [class.disabled]="!account.canSubmit"
              [disabled]="!account.canSubmit"
              (click)="onSubmitForESign(account.id)">
              {{account.canSubmit ? 'Send for E-Sign' : 'Cannot Submit'}}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .review-summary-section {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .summary-header {
      margin-bottom: 2rem;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 1rem;
    }

    .summary-header h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: #111827;
    }

    .summary-header p {
      margin: 0;
      color: #6b7280;
      font-size: 0.95rem;
    }

    .overall-summary {
      margin-bottom: 2rem;
      padding: 1rem 1.5rem;
      background: #fafafa;
      border-radius: 8px;
    }

    .summary-text {
      font-size: 0.95rem;
      color: #6b7280;
      text-align: center;
    }

    .accounts-list {
      display: flex;
      flex-direction: column;
      gap: 1px;
      background: #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
    }

    .account-row {
      display: flex;
      align-items: center;
      gap: 2rem;
      padding: 1.5rem 2rem;
      background: white;
      transition: background-color 0.2s ease;
    }

    .account-row:hover {
      background: #f9fafb;
    }

    .account-info {
      flex: 2;
      min-width: 0;
    }

    .account-basic {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .account-name {
      font-size: 1.125rem;
      font-weight: 600;
      color: #111827;
      margin: 0;
    }

    .account-owners {
      font-size: 0.875rem;
      color: #6b7280;
    }

    .account-type {
      font-size: 0.75rem;
      color: #9ca3af;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 500;
    }

    .account-status {
      flex: 1.5;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .completion-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .completion-text {
      font-size: 0.95rem;
      font-weight: 500;
      color: #374151;
    }

    .sections-text {
      font-size: 0.8rem;
      color: #6b7280;
    }

    .missing-info {
      margin-top: 0.25rem;
    }

    .missing-text {
      font-size: 0.8rem;
      color: #dc2626;
    }

    .account-actions {
      flex: 1;
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
    }

    .btn-edit, .btn-submit {
      padding: 0.5rem 1rem;
      border-radius: 6px;
      border: 1px solid transparent;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-edit {
      background: #0A8DFF;
      color: white;
      border-color: #0A8DFF;
    }

    .btn-edit:hover {
      background: #087AE6;
      border-color: #087AE6;
    }

    .btn-submit {
      background: #10b981;
      color: white;
    }

    .btn-submit:hover {
      background: #059669;
    }

    .btn-submit.disabled {
      background: #e5e7eb;
      color: #9ca3af;
      cursor: not-allowed;
    }

    .btn-submit.disabled:hover {
      background: #e5e7eb;
    }

    @media (max-width: 768px) {
      .account-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
        padding: 1rem;
      }

      .account-actions {
        width: 100%;
        justify-content: stretch;
      }

      .btn-edit, .btn-submit {
        flex: 1;
      }
    }
  `]
})
export class ReviewSummaryComponent {
  @Input() formData: FormData = {};
  @Input() completionStatus: CompletionStatus = { members: {}, accounts: {} };
  @Output() editAccount = new EventEmitter<string>();
  @Output() editAccountWithSection = new EventEmitter<{accountId: string, entityId: string, sectionId: Section}>();
  @Output() editAccountQuickReview = new EventEmitter<string>();
  @Output() submitForESign = new EventEmitter<string>();
  @Output() submitAllReady = new EventEmitter<string[]>();

  accountSummaries: AccountSummary[] = [];

  ngOnInit() {
    this.calculateAccountSummaries();
  }

  ngOnChanges() {
    this.calculateAccountSummaries();
  }

  private calculateAccountSummaries() {
    const accountData = [
      {
        id: 'joint-account',
        name: 'Joint Account',
        owners: 'John & Mary Smith',
        icon: 'pi pi-users'
      },
      {
        id: 'roth-ira-account',
        name: 'Roth IRA Account',
        owners: 'Mary Smith',
        icon: 'pi pi-star'
      },
      {
        id: 'trust-account',
        name: 'Family Trust Account',
        owners: 'Smith Family Trust',
        icon: 'pi pi-shield'
      },
      {
        id: 'traditional-ira-account',
        name: 'Traditional IRA Account',
        owners: 'John Smith',
        icon: 'pi pi-university'
      }
    ];

    this.accountSummaries = accountData.map(account => {
      const relevantSections = this.getRelevantSectionsForAccount(account.id);
      const { completedSections, totalSections, hasMissingFields, nextMissingSection } = this.calculateAccountCompletion(account.id, relevantSections);
      const completionPercentage = totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;
      
      const accountFormData = this.formData[account.id] || {};
      const missingFields = this.getMissingRequiredFields(account.id, accountFormData);
      
      return {
        ...account,
        completionPercentage,
        completedSections,
        totalSections,
        missingFields,
        accountType: this.getAccountTypeLabel(accountFormData?.accountType || ''),
        canSubmit: completionPercentage === 100 && missingFields.length === 0,
        hasMissingFields,
        nextMissingSection
      };
    });
  }

  private getRelevantSectionsForAccount(accountId: string): Array<{entityId: string, sectionId: Section}> {
    const sections: Array<{entityId: string, sectionId: Section}> = [];
    
    // Determine which members are relevant for this account
    if (accountId === 'joint-account') {
      // John and Mary sections
      sections.push(
        { entityId: 'john-smith', sectionId: 'owner-details' },
        { entityId: 'john-smith', sectionId: 'firm-details' },
        { entityId: 'mary-smith', sectionId: 'owner-details' },
        { entityId: 'mary-smith', sectionId: 'firm-details' }
      );
    } else if (accountId === 'roth-ira-account') {
      // Mary sections only
      sections.push(
        { entityId: 'mary-smith', sectionId: 'owner-details' },
        { entityId: 'mary-smith', sectionId: 'firm-details' }
      );
    } else if (accountId === 'trust-account') {
      // Trust sections only
      sections.push(
        { entityId: 'smith-trust', sectionId: 'owner-details' },
        { entityId: 'smith-trust', sectionId: 'firm-details' }
      );
    } else if (accountId === 'traditional-ira-account') {
      // John Smith sections for Traditional IRA
      sections.push(
        { entityId: 'john-smith', sectionId: 'owner-details' },
        { entityId: 'john-smith', sectionId: 'firm-details' }
      );
    }
    
    // Add account-specific sections
    sections.push(
      { entityId: accountId, sectionId: 'account-setup' },
      { entityId: accountId, sectionId: 'funding' },
      { entityId: accountId, sectionId: 'firm-details' }
    );
    
    return sections;
  }

  private calculateAccountCompletion(accountId: string, relevantSections: Array<{entityId: string, sectionId: Section}>) {
    let completedSections = 0;
    let totalSections = relevantSections.length;
    let firstMissingSection: { entityId: string, sectionId: Section } | null = null;
    
    for (const section of relevantSections) {
      const isComplete = this.isSectionComplete(section.entityId, section.sectionId);
      if (isComplete) {
        completedSections++;
      } else if (!firstMissingSection) {
        firstMissingSection = section;
      }
    }
    
    return {
      completedSections,
      totalSections,
      hasMissingFields: completedSections < totalSections,
      nextMissingSection: firstMissingSection
    };
  }

  private isSectionComplete(entityId: string, sectionId: Section): boolean {
    // Check if the section is complete based on completion status
    if (entityId === 'john-smith' || entityId === 'mary-smith' || entityId === 'smith-trust') {
      return this.completionStatus.members[entityId]?.[sectionId] || false;
    } else {
      return this.completionStatus.accounts[entityId]?.[sectionId] || false;
    }
  }

  private getMissingRequiredFields(accountId: string, accountData: any): string[] {
    const missingFields: string[] = [];
    
    // Check basic required fields
    if (!accountData.accountType) missingFields.push('Account Type');
    if (!accountData.investmentObjective) missingFields.push('Investment Objective');
    if (!accountData.riskTolerance) missingFields.push('Risk Tolerance');
    
    // Check trust-specific fields
    if (accountData.accountType === 'trust') {
      if (!accountData.trustName) missingFields.push('Trust Name');
      if (!accountData.trustType) missingFields.push('Trust Type');
      if (!accountData.trustEin) missingFields.push('Trust EIN');
    }
    
    return missingFields;
  }

  private getAccountTypeLabel(accountType: string): string {
    const typeMap: { [key: string]: string } = {
      'joint-taxable': 'Joint Taxable',
      'individual-taxable': 'Individual Taxable', 
      'trust': 'Trust',
      'ira': 'IRA',
      'roth-ira': 'Roth IRA',
      'traditional-ira': 'Traditional IRA'
    };
    return typeMap[accountType] || accountType || 'Not Set';
  }

  getOverallCompletionPercentage(): number {
    // Use the same calculation as the main app header for consistency
    return this.getOverallProgress();
  }

  private getOverallProgress(): number {
    let totalRequiredFields = 0;
    let filledRequiredFields = 0;

    // Define required fields for each entity type (matching main app)
    const memberRequiredFields = [
      'firstName', 'lastName', 'dateOfBirth', 'ssn', 'phoneHome', 'email', 
      'homeAddress', 'citizenship', 'employmentStatus', 'annualIncome', 'netWorth', 'fundsSource'
    ];
    
    const accountRequiredFields = [
      'accountType', 'investmentObjective', 'riskTolerance'
    ];

    // Count member fields
    const memberIds = ['john-smith', 'mary-smith', 'smith-trust'];
    memberIds.forEach(memberId => {
      const memberData = this.formData[memberId];
      memberRequiredFields.forEach(field => {
        totalRequiredFields++;
        if (memberData && memberData[field] && memberData[field].toString().trim()) {
          filledRequiredFields++;
        }
      });
    });

    // Count account fields
    const accountIds = ['joint-account', 'roth-ira-account', 'trust-account', 'traditional-ira-account'];
    accountIds.forEach(accountId => {
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

  getCompletedAccountsCount(): number {
    return this.accountSummaries.filter(account => account.completionPercentage === 100).length;
  }

  getReadyAccountsCount(): number {
    return this.accountSummaries.filter(account => account.canSubmit).length;
  }

  onEditAccount(accountId: string) {
    const account = this.accountSummaries.find(a => a.id === accountId);
    if (account && account.nextMissingSection) {
      // Navigate to the next missing field
      this.editAccountWithSection.emit({
        accountId,
        entityId: account.nextMissingSection.entityId,
        sectionId: account.nextMissingSection.sectionId
      });
    } else {
      // If no missing fields (registration complete), automatically enter quick review mode
      // Emit a new event specifically for quick review mode
      this.editAccountQuickReview.emit(accountId);
    }
  }

  onSubmitForESign(accountId: string) {
    this.submitForESign.emit(accountId);
  }

  onSubmitAllReady() {
    const readyAccounts = this.accountSummaries.filter(account => account.canSubmit).map(account => account.id);
    this.submitAllReady.emit(readyAccounts);
  }
}