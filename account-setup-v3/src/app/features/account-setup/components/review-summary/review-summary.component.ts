import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';

// Local Imports  
import { FormData, CompletionStatus } from '../../../../shared/models/types';

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
}

@Component({
  selector: 'app-review-summary',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    ProgressBarModule,
    BadgeModule,
    TooltipModule
  ],
  template: `
    <div class="review-summary-section">
      <p-card header="Registration Summary" class="mb-4">
        <div class="summary-header mb-4">
          <h3 class="text-2xl font-semibold m-0 mb-2">Account Setup Review</h3>
          <p class="text-600 m-0">Review all account registrations and submit for e-signature when ready.</p>
        </div>

        <!-- Overall Progress -->
        <div class="overall-progress-card mb-4">
          <div class="flex justify-content-between align-items-center mb-3">
            <h4 class="text-lg font-medium m-0">Overall Progress</h4>
            <span class="text-lg font-semibold">{{getOverallCompletionPercentage()}}%</span>
          </div>
          <p-progressBar 
            [value]="getOverallCompletionPercentage()" 
            [showValue]="false"
            styleClass="mb-2">
          </p-progressBar>
          <div class="text-sm text-600">
            {{getCompletedAccountsCount()}} of {{accountSummaries.length}} accounts ready for submission
          </div>
        </div>

        <!-- Account Summaries -->
        <div class="accounts-grid">
          <div *ngFor="let account of accountSummaries" class="account-summary-card">
            <div class="account-header">
              <div class="account-info">
                <div class="account-icon">
                  <i [class]="account.icon"></i>
                </div>
                <div class="account-details">
                  <h5 class="account-name">{{account.name}}</h5>
                  <p class="account-owners">{{account.owners}}</p>
                  <span class="account-type-badge">{{account.accountType}}</span>
                </div>
              </div>
              <div class="account-progress">
                <div class="progress-circle" [class.complete]="account.completionPercentage === 100">
                  <span class="progress-text">{{account.completionPercentage}}%</span>
                </div>
              </div>
            </div>

            <div class="account-progress-bar mb-3">
              <p-progressBar 
                [value]="account.completionPercentage" 
                [showValue]="false"
                [styleClass]="account.completionPercentage === 100 ? 'complete' : ''">
              </p-progressBar>
              <div class="text-xs text-600 mt-1">
                {{account.completedSections}} of {{account.totalSections}} sections complete
              </div>
            </div>

            <!-- Missing Fields -->
            <div *ngIf="account.missingFields.length > 0" class="missing-fields mb-3">
              <h6 class="text-sm font-medium text-orange-600 mb-2">
                <i class="pi pi-exclamation-triangle mr-1"></i>
                Missing Required Fields
              </h6>
              <div class="missing-fields-list">
                <span *ngFor="let field of account.missingFields" class="missing-field-tag">
                  {{field}}
                </span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="account-actions">
              <p-button 
                label="Review & Edit" 
                icon="pi pi-pencil"
                severity="secondary"
                size="small"
                styleClass="mr-2"
                (onClick)="onEditAccount(account.id)">
              </p-button>
              
              <p-button 
                [label]="account.canSubmit ? 'Send for E-Sign' : 'Cannot Submit'"
                [icon]="account.canSubmit ? 'pi pi-send' : 'pi pi-times'"
                [severity]="account.canSubmit ? 'success' : 'danger'"
                [disabled]="!account.canSubmit"
                size="small"
                [pTooltip]="account.canSubmit ? 'Ready to submit for e-signature' : 'Complete all required fields first'"
                tooltipPosition="top"
                (onClick)="onSubmitForESign(account.id)">
              </p-button>
            </div>
          </div>
        </div>

        <!-- Bulk Actions -->
        <div class="bulk-actions mt-4" *ngIf="getReadyAccountsCount() > 0">
          <p-button 
            label="Submit All Ready Accounts ({{getReadyAccountsCount()}})"
            icon="pi pi-send"
            severity="success"
            (onClick)="onSubmitAllReady()">
          </p-button>
        </div>

      </p-card>
    </div>
  `,
  styles: [`
    .review-summary-section {
      padding: 0;
    }

    .summary-header {
      border-bottom: 1px solid var(--surface-border);
      padding-bottom: 1rem;
    }

    .overall-progress-card {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border: 1px solid var(--surface-border);
      border-radius: 8px;
      padding: 1.5rem;
    }

    .accounts-grid {
      display: grid;
      gap: 1.5rem;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    }

    .account-summary-card {
      border: 1px solid var(--surface-border);
      border-radius: 8px;
      padding: 1.5rem;
      background: white;
      transition: all 0.3s ease;
    }

    .account-summary-card:hover {
      border-color: var(--primary-color);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .account-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .account-info {
      display: flex;
      gap: 1rem;
      flex: 1;
    }

    .account-icon {
      width: 48px;
      height: 48px;
      background: var(--primary-color);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.25rem;
    }

    .account-details {
      flex: 1;
    }

    .account-name {
      font-size: 1.1rem;
      font-weight: 600;
      margin: 0 0 0.25rem 0;
      color: var(--text-color);
    }

    .account-owners {
      font-size: 0.875rem;
      color: var(--text-color-secondary);
      margin: 0 0 0.5rem 0;
    }

    .account-type-badge {
      background: var(--blue-100);
      color: var(--blue-800);
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }

    .account-progress {
      margin-left: 1rem;
    }

    .progress-circle {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      border: 3px solid var(--surface-300);
      display: flex;
      align-items: center;
      justify-content: center;
      background: white;
      position: relative;
    }

    .progress-circle.complete {
      border-color: var(--green-500);
      background: var(--green-50);
    }

    .progress-text {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-color);
    }

    .progress-circle.complete .progress-text {
      color: var(--green-700);
    }

    .missing-fields {
      background: var(--orange-50);
      border: 1px solid var(--orange-200);
      border-radius: 6px;
      padding: 1rem;
    }

    .missing-fields-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .missing-field-tag {
      background: var(--orange-100);
      color: var(--orange-800);
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .account-actions {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .bulk-actions {
      text-align: center;
      padding-top: 1.5rem;
      border-top: 1px solid var(--surface-border);
    }

    ::ng-deep .p-progressbar.complete .p-progressbar-value {
      background: var(--green-500) !important;
    }
  `]
})
export class ReviewSummaryComponent {
  @Input() formData: FormData = {};
  @Input() completionStatus: CompletionStatus = { members: {}, accounts: {} };
  @Output() editAccount = new EventEmitter<string>();
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
      }
    ];

    this.accountSummaries = accountData.map(account => {
      const accountStatus = this.completionStatus.accounts[account.id] || {};
      const sections = Object.keys(accountStatus);
      const completedSections = sections.filter(section => accountStatus[section]).length;
      const totalSections = sections.length;
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
        canSubmit: completionPercentage === 100 && missingFields.length === 0
      };
    });
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
      'roth-ira': 'Roth IRA'
    };
    return typeMap[accountType] || accountType || 'Not Set';
  }

  getOverallCompletionPercentage(): number {
    if (this.accountSummaries.length === 0) return 0;
    const totalPercentage = this.accountSummaries.reduce((sum, account) => sum + account.completionPercentage, 0);
    return Math.round(totalPercentage / this.accountSummaries.length);
  }

  getCompletedAccountsCount(): number {
    return this.accountSummaries.filter(account => account.completionPercentage === 100).length;
  }

  getReadyAccountsCount(): number {
    return this.accountSummaries.filter(account => account.canSubmit).length;
  }

  onEditAccount(accountId: string) {
    this.editAccount.emit(accountId);
  }

  onSubmitForESign(accountId: string) {
    this.submitForESign.emit(accountId);
  }

  onSubmitAllReady() {
    const readyAccounts = this.accountSummaries.filter(account => account.canSubmit).map(account => account.id);
    this.submitAllReady.emit(readyAccounts);
  }
}