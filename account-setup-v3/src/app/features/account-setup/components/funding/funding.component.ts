import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

// PrimeNG Imports
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

// Local Imports
import { FormData, FundingInstance as SharedFundingInstance } from '../../../../shared/models/types';
import { ExistingInstanceModalComponent, ExistingInstance } from '../../../../shared/components/existing-instance-modal/existing-instance-modal.component';
import { ExistingInstancesService } from '../../../../shared/services/existing-instances.service';

interface DropdownOption {
  label: string;
  value: string;
}

interface FundingInstances {
  acat: SharedFundingInstance[];
  ach: SharedFundingInstance[];
  'initial-ach': SharedFundingInstance[];
  withdrawal: SharedFundingInstance[];
  contribution: SharedFundingInstance[];
}

@Component({
  selector: 'app-funding',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    CalendarModule,
    AutoCompleteModule,
    ButtonModule,
    CardModule,
    ToastModule,
    TooltipModule,
    ExistingInstanceModalComponent
  ],
  providers: [MessageService, ExistingInstancesService],
  template: `
    <div class="funding-section">
      <p-toast></p-toast>
      
      <!-- Edit Mode - Form -->
      <p-card *ngIf="!isReviewMode" header="Funding" class="mb-4">
        <div class="funding-dashboard">
          <div class="flex justify-content-between align-items-center mb-4">
            <h3 class="text-xl font-semibold m-0">Funding Types</h3>
          </div>
          
          <!-- Funding Type Buttons -->
          <div class="funding-buttons-container">
            <div class="funding-button-wrapper">
              <div 
                class="funding-type-button"
                [class.disabled]="fundingInstances.acat.length >= 4"
                (click)="handleFundingTypeClick('acat')">
                <div class="funding-type-name">Add ACAT <i class="pi pi-plus-circle"></i></div>
              </div>
            </div>
            
            <div class="funding-button-wrapper">
              <div 
                class="funding-type-button"
                [class.disabled]="fundingInstances.ach.length >= 4"
                (click)="handleFundingTypeClick('ach')">
                <div class="funding-type-name">Add ACH <i class="pi pi-plus-circle"></i></div>
              </div>
            </div>
            
            <div class="funding-button-wrapper">
              <div 
                class="funding-type-button"
                [class.disabled]="fundingInstances['initial-ach'].length >= 4"
                (click)="handleFundingTypeClick('initial-ach')">
                <div class="funding-type-name">Add Initial ACH <i class="pi pi-plus-circle"></i></div>
              </div>
            </div>
            
            <div class="funding-button-wrapper">
              <div 
                class="funding-type-button"
                [class.disabled]="fundingInstances.withdrawal.length >= 4"
                (click)="handleFundingTypeClick('withdrawal')">
                <div class="funding-type-name">Add Withdrawal <i class="pi pi-plus-circle"></i></div>
              </div>
            </div>
            
            <div class="funding-button-wrapper">
              <div 
                class="funding-type-button"
                [class.disabled]="fundingInstances.contribution.length >= 4"
                (click)="handleFundingTypeClick('contribution')">
                <div class="funding-type-name">Add Contribution <i class="pi pi-plus-circle"></i></div>
              </div>
            </div>
            
            <!-- Add Existing Instance Button -->
            <div class="funding-button-wrapper">
              <div 
                class="funding-type-button existing-instance-button"
                (click)="showExistingInstanceModal()">
                <div class="funding-type-name">Add Existing <i class="pi pi-history"></i></div>
              </div>
            </div>
          </div>
          
          <!-- Dynamic Funding Form -->
          <div *ngIf="showFundingForm" class="mt-4">
            <ng-container [ngSwitch]="showFundingForm">
              
              <!-- ACAT Transfer Form -->
              <p-card *ngSwitchCase="'acat'" header="New ACAT Transfer" class="mb-4">
                <form [formGroup]="fundingForm">
                  <div class="grid">
                    <div class="col-12 md:col-6">
                      <label for="acatName" class="block text-900 font-medium mb-2">Name <span class="text-red-500">*</span></label>
                      <input
                        pInputText
                        id="acatName"
                        formControlName="name"
                        placeholder="Transfer name"
                        class="w-full"
                        [disabled]="isReviewMode" />
                    </div>
                    <div class="col-12 md:col-6">
                      <label for="acatAmount" class="block text-900 font-medium mb-2">Amount <span class="text-red-500">*</span></label>
                      <input
                        pInputText
                        id="acatAmount"
                        formControlName="amount"
                        placeholder="$0.00"
                        class="w-full"
                        (input)="onCurrencyInput($event)"
                        [disabled]="isReviewMode" />
                    </div>
                    <div class="col-12 md:col-6">
                      <label for="fromFirm" class="block text-900 font-medium mb-2">From Firm <span class="text-red-500">*</span></label>
                      <input
                        pInputText
                        id="fromFirm"
                        formControlName="fromFirm"
                        placeholder="Current custodian"
                        class="w-full"
                        [disabled]="isReviewMode" />
                    </div>
                    <div class="col-12 md:col-6">
                      <label for="transferType" class="block text-900 font-medium mb-2">Transfer Type <span class="text-red-500">*</span></label>
                      <p-autoComplete
                        inputId="transferType"
                        formControlName="transferType"
                        [suggestions]="filteredTransferTypeOptions"
                        (completeMethod)="filterTransferTypeOptions($event)"
                        field="label"
                        [dropdown]="true"
                        [forceSelection]="true"
                        placeholder="Select type"
                        styleClass="w-full compact-autocomplete"
                        [disabled]="isReviewMode">
                      </p-autoComplete>
                    </div>
                  </div>
                </form>
              </p-card>
              
              <!-- ACH Transfer Form -->
              <p-card *ngSwitchCase="'ach'" header="New ACH Transfer" class="mb-4">
                <form [formGroup]="fundingForm">
                  <div class="grid">
                    <div class="col-12 md:col-6">
                      <label for="achName" class="block text-900 font-medium mb-2">Name <span class="text-red-500">*</span></label>
                      <input
                        pInputText
                        id="achName"
                        formControlName="name"
                        placeholder="Transfer name"
                        class="w-full"
                        [disabled]="isReviewMode" />
                    </div>
                    <div class="col-12 md:col-6">
                      <label for="achAmount" class="block text-900 font-medium mb-2">Amount <span class="text-red-500">*</span></label>
                      <input
                        pInputText
                        id="achAmount"
                        formControlName="amount"
                        placeholder="$0.00"
                        class="w-full"
                        (input)="onCurrencyInput($event)"
                        [disabled]="isReviewMode" />
                    </div>
                    <div class="col-12 md:col-6">
                      <label for="bankName" class="block text-900 font-medium mb-2">Bank Name <span class="text-red-500">*</span></label>
                      <input
                        pInputText
                        id="bankName"
                        formControlName="bankName"
                        placeholder="Bank name"
                        class="w-full"
                        [disabled]="isReviewMode" />
                    </div>
                    <div class="col-12 md:col-6">
                      <label for="achFrequency" class="block text-900 font-medium mb-2">Frequency</label>
                      <p-autoComplete
                        inputId="achFrequency"
                        formControlName="frequency"
                        [suggestions]="filteredAchFrequencyOptions"
                        (completeMethod)="filterAchFrequencyOptions($event)"
                        field="label"
                        [dropdown]="true"
                        [forceSelection]="true"
                        placeholder="Select frequency"
                        styleClass="w-full compact-autocomplete"
                        [disabled]="isReviewMode">
                      </p-autoComplete>
                    </div>
                  </div>
                </form>
              </p-card>
              
              <!-- Initial ACH Transfer Form -->
              <p-card *ngSwitchCase="'initial-ach'" header="New Initial ACH Transfer" class="mb-4">
                <form [formGroup]="fundingForm">
                  <div class="grid">
                    <div class="col-12 md:col-6">
                      <label for="initialName" class="block text-900 font-medium mb-2">Name <span class="text-red-500">*</span></label>
                      <input
                        pInputText
                        id="initialName"
                        formControlName="name"
                        placeholder="Transfer name"
                        class="w-full"
                        [disabled]="isReviewMode" />
                    </div>
                    <div class="col-12 md:col-6">
                      <label for="initialAmount" class="block text-900 font-medium mb-2">Amount <span class="text-red-500">*</span></label>
                      <input
                        pInputText
                        id="initialAmount"
                        formControlName="amount"
                        placeholder="$0.00"
                        class="w-full"
                        (input)="onCurrencyInput($event)"
                        [disabled]="isReviewMode" />
                    </div>
                    <div class="col-12 md:col-6">
                      <label for="initialBank" class="block text-900 font-medium mb-2">Bank Name <span class="text-red-500">*</span></label>
                      <input
                        pInputText
                        id="initialBank"
                        formControlName="bankName"
                        placeholder="Bank name"
                        class="w-full"
                        [disabled]="isReviewMode" />
                    </div>
                    <div class="col-12 md:col-6">
                      <label for="transferDate" class="block text-900 font-medium mb-2">Transfer Date <span class="text-red-500">*</span></label>
                      <p-calendar
                        inputId="transferDate"
                        formControlName="transferDate"
                        [showIcon]="true"
                        dateFormat="mm/dd/yy"
                        placeholder="Select date"
                        styleClass="w-full compact-autocomplete"
                        [disabled]="isReviewMode">
                      </p-calendar>
                    </div>
                  </div>
                </form>
              </p-card>
              
              <!-- Systematic Withdrawal Form -->
              <p-card *ngSwitchCase="'withdrawal'" header="New Systematic Withdrawal" class="mb-4">
                <form [formGroup]="fundingForm">
                  <div class="grid">
                    <div class="col-12 md:col-6">
                      <label for="withdrawalName" class="block text-900 font-medium mb-2">Name <span class="text-red-500">*</span></label>
                      <input
                        pInputText
                        id="withdrawalName"
                        formControlName="name"
                        placeholder="Withdrawal name"
                        class="w-full"
                        [disabled]="isReviewMode" />
                    </div>
                    <div class="col-12 md:col-6">
                      <label for="withdrawalAmount" class="block text-900 font-medium mb-2">Amount <span class="text-red-500">*</span></label>
                      <input
                        pInputText
                        id="withdrawalAmount"
                        formControlName="amount"
                        placeholder="$0.00"
                        class="w-full"
                        (input)="onCurrencyInput($event)"
                        [disabled]="isReviewMode" />
                    </div>
                    <div class="col-12 md:col-6">
                      <label for="withdrawalFreq" class="block text-900 font-medium mb-2">Frequency <span class="text-red-500">*</span></label>
                      <p-autoComplete
                        inputId="withdrawalFreq"
                        formControlName="frequency"
                        [suggestions]="filteredWithdrawalFrequencyOptions"
                        (completeMethod)="filterWithdrawalFrequencyOptions($event)"
                        field="label"
                        [dropdown]="true"
                        [forceSelection]="true"
                        placeholder="Select frequency"
                        styleClass="w-full compact-autocomplete"
                        [disabled]="isReviewMode">
                      </p-autoComplete>
                    </div>
                    <div class="col-12 md:col-6">
                      <label for="startDate" class="block text-900 font-medium mb-2">Start Date <span class="text-red-500">*</span></label>
                      <p-calendar
                        inputId="startDate"
                        formControlName="startDate"
                        [showIcon]="true"
                        dateFormat="mm/dd/yy"
                        placeholder="Select start date"
                        styleClass="w-full compact-autocomplete"
                        [disabled]="isReviewMode">
                      </p-calendar>
                    </div>
                  </div>
                </form>
              </p-card>
              
              <!-- Systematic Contribution Form -->
              <p-card *ngSwitchCase="'contribution'" header="New Systematic Contribution" class="mb-4">
                <form [formGroup]="fundingForm">
                  <div class="grid">
                    <div class="col-12 md:col-6">
                      <label for="contributionName" class="block text-900 font-medium mb-2">Name <span class="text-red-500">*</span></label>
                      <input
                        pInputText
                        id="contributionName"
                        formControlName="name"
                        placeholder="Contribution name"
                        class="w-full"
                        [disabled]="isReviewMode" />
                    </div>
                    <div class="col-12 md:col-6">
                      <label for="contributionAmount" class="block text-900 font-medium mb-2">Amount <span class="text-red-500">*</span></label>
                      <input
                        pInputText
                        id="contributionAmount"
                        formControlName="amount"
                        placeholder="$0.00"
                        class="w-full"
                        (input)="onCurrencyInput($event)"
                        [disabled]="isReviewMode" />
                    </div>
                    <div class="col-12 md:col-6">
                      <label for="contributionBank" class="block text-900 font-medium mb-2">Bank Name <span class="text-red-500">*</span></label>
                      <input
                        pInputText
                        id="contributionBank"
                        formControlName="bankName"
                        placeholder="Bank name"
                        class="w-full"
                        [disabled]="isReviewMode" />
                    </div>
                    <div class="col-12 md:col-6">
                      <label for="contributionFreq" class="block text-900 font-medium mb-2">Frequency <span class="text-red-500">*</span></label>
                      <p-autoComplete
                        inputId="contributionFreq"
                        formControlName="frequency"
                        [suggestions]="filteredContributionFrequencyOptions"
                        (completeMethod)="filterContributionFrequencyOptions($event)"
                        field="label"
                        [dropdown]="true"
                        [forceSelection]="true"
                        placeholder="Select frequency"
                        styleClass="w-full compact-autocomplete"
                        [disabled]="isReviewMode">
                      </p-autoComplete>
                    </div>
                  </div>
                </form>
              </p-card>
              
            </ng-container>
            
            <!-- Form Action Buttons -->
            <div class="flex gap-2 justify-content-end" *ngIf="!isReviewMode">
              <p-button 
                label="Cancel" 
                severity="secondary" 
                (onClick)="cancelForm()">
              </p-button>
              <p-button 
                [label]="editingInstance ? 'Update Instance' : 'Save Instance'"
                (onClick)="saveInstance()">
              </p-button>
            </div>
          </div>
          
          <!-- Unified Funding Instances Grid -->
          <div *ngIf="getAllFundingInstances().length > 0" class="mt-4">
            <h4 class="text-lg font-medium mb-3">Current Funding Instances</h4>
            <div class="grid">
              <div class="col-12">
                <div class="funding-instances-table">
                  <div class="grid p-2 font-semibold text-sm surface-border border-bottom-1">
                    <div class="col-3">Type</div>
                    <div class="col-3">Name</div>
                    <div class="col-2">Amount</div>
                    <div class="col-2">Frequency</div>
                    <div class="col-2" *ngIf="!isReviewMode">Actions</div>
                  </div>
                  <div 
                    *ngFor="let instance of getAllFundingInstances(); let i = index"
                    class="grid p-2 border-bottom-1 surface-border align-items-center">
                    <div class="col-3">
                      <span class="text-sm font-medium">{{instance.typeName}}</span>
                    </div>
                    <div class="col-3">
                      <span class="text-sm">{{instance.name}}</span>
                    </div>
                    <div class="col-2">
                      <span class="text-sm">{{formatStoredAmount(instance.amount)}}</span>
                    </div>
                    <div class="col-2">
                      <span class="text-sm">{{instance.frequency || 'N/A'}}</span>
                    </div>
                    <div class="col-2" *ngIf="!isReviewMode">
                      <div class="flex gap-1">
                        <button 
                          class="action-button edit-button"
                          (click)="editInstance(instance)"
                          pTooltip="Edit"
                          tooltipPosition="top">
                          <i class="pi pi-pencil"></i>
                        </button>
                        <button 
                          class="action-button delete-button"
                          (click)="deleteInstance(instance)"
                          pTooltip="Delete"
                          tooltipPosition="top">
                          <i class="pi pi-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Professional Empty State -->
          <div *ngIf="getAllFundingInstances().length === 0 && !showFundingForm" class="enterprise-empty-state">
            <div class="empty-state-content">
              <div class="empty-state-icon">
                <i class="pi pi-wallet"></i>
              </div>
              <h3 class="empty-state-title">No Funding Sources Added</h3>
              <p class="empty-state-description">
                Get started by adding your first funding source. You can choose from ACAT transfers, 
                ACH transfers, systematic contributions, and more.
              </p>
              <div class="empty-state-actions" *ngIf="!isReviewMode">
                <p-button 
                  label="Add Funding Source" 
                  icon="pi pi-plus-circle"
                  styleClass="empty-state-button"
                  (onClick)="handleFundingTypeClick('ach')">
                </p-button>
              </div>
            </div>
          </div>
        </div>
      </p-card>

      <!-- Review Mode - Comprehensive Display -->
      <div *ngIf="isReviewMode" class="review-mode-container">
        
        <!-- Funding Section -->
        <div class="review-mode-section">
          <div class="review-mode-section-header">
            <div class="review-mode-section-title">Funding</div>
            <p-button 
              [label]="sectionEditMode['funding'] ? 'Save' : 'Edit'" 
              [icon]="sectionEditMode['funding'] ? 'pi pi-check' : 'pi pi-pencil'" 
              size="small" 
              [severity]="sectionEditMode['funding'] ? 'success' : 'secondary'"
              styleClass="edit-section-button"
              (onClick)="toggleSectionEdit('funding')">
            </p-button>
          </div>
          
          <!-- ACAT Transfers -->
          <div *ngIf="fundingInstances.acat.length > 0" class="review-subsection">
            <div class="review-subsection-title">ACAT Transfers</div>
            <div *ngFor="let acat of fundingInstances.acat; let i = index" class="funding-instance-row">
              <div class="funding-instance-header">ACAT Transfer {{i + 1}}: {{acat.name}}</div>
              <div class="funding-instance-details">
                <div class="funding-detail-item">
                  <span class="funding-detail-label">Amount:</span>
                  <span class="funding-detail-value">{{formatStoredAmount(acat.amount)}}</span>
                </div>
                <div class="funding-detail-item">
                  <span class="funding-detail-label">From Firm:</span>
                  <span class="funding-detail-value">{{acat.fromFirm}}</span>
                </div>
                <div class="funding-detail-item">
                  <span class="funding-detail-label">Transfer Type:</span>
                  <span class="funding-detail-value">{{acat.transferType}}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- ACH Transfers -->
          <div *ngIf="fundingInstances.ach.length > 0" class="review-subsection">
            <div class="review-subsection-title">ACH Transfers</div>
            <div *ngFor="let ach of fundingInstances.ach; let i = index" class="funding-instance-row">
              <div class="funding-instance-header">ACH Transfer {{i + 1}}: {{ach.name}}</div>
              <div class="funding-instance-details">
                <div class="funding-detail-item">
                  <span class="funding-detail-label">Amount:</span>
                  <span class="funding-detail-value">{{formatStoredAmount(ach.amount)}}</span>
                </div>
                <div class="funding-detail-item">
                  <span class="funding-detail-label">Bank:</span>
                  <span class="funding-detail-value">{{ach.bankName}}</span>
                </div>
                <div class="funding-detail-item" *ngIf="ach.frequency">
                  <span class="funding-detail-label">Frequency:</span>
                  <span class="funding-detail-value">{{ach.frequency}}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Initial ACH Transfers -->
          <div *ngIf="fundingInstances['initial-ach'].length > 0" class="review-subsection">
            <div class="review-subsection-title">Initial ACH Transfers</div>
            <div *ngFor="let initialAch of fundingInstances['initial-ach']; let i = index" class="funding-instance-row">
              <div class="funding-instance-header">Initial ACH {{i + 1}}: {{initialAch.name}}</div>
              <div class="funding-instance-details">
                <div class="funding-detail-item">
                  <span class="funding-detail-label">Amount:</span>
                  <span class="funding-detail-value">{{formatStoredAmount(initialAch.amount)}}</span>
                </div>
                <div class="funding-detail-item">
                  <span class="funding-detail-label">Bank:</span>
                  <span class="funding-detail-value">{{initialAch.bankName}}</span>
                </div>
                <div class="funding-detail-item" *ngIf="initialAch.transferDate">
                  <span class="funding-detail-label">Transfer Date:</span>
                  <span class="funding-detail-value">{{initialAch.transferDate | date:'shortDate'}}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Withdrawals -->
          <div *ngIf="fundingInstances.withdrawal.length > 0" class="review-subsection">
            <div class="review-subsection-title">Systematic Withdrawals</div>
            <div *ngFor="let withdrawal of fundingInstances.withdrawal; let i = index" class="funding-instance-row">
              <div class="funding-instance-header">Withdrawal {{i + 1}}: {{withdrawal.name}}</div>
              <div class="funding-instance-details">
                <div class="funding-detail-item">
                  <span class="funding-detail-label">Amount:</span>
                  <span class="funding-detail-value">{{formatStoredAmount(withdrawal.amount)}}</span>
                </div>
                <div class="funding-detail-item">
                  <span class="funding-detail-label">Frequency:</span>
                  <span class="funding-detail-value">{{withdrawal.frequency}}</span>
                </div>
                <div class="funding-detail-item" *ngIf="withdrawal.startDate">
                  <span class="funding-detail-label">Start Date:</span>
                  <span class="funding-detail-value">{{withdrawal.startDate | date:'shortDate'}}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Contributions -->
          <div *ngIf="fundingInstances.contribution.length > 0" class="review-subsection">
            <div class="review-subsection-title">Systematic Contributions</div>
            <div *ngFor="let contribution of fundingInstances.contribution; let i = index" class="funding-instance-row">
              <div class="funding-instance-header">Contribution {{i + 1}}: {{contribution.name}}</div>
              <div class="funding-instance-details">
                <div class="funding-detail-item">
                  <span class="funding-detail-label">Amount:</span>
                  <span class="funding-detail-value">{{formatStoredAmount(contribution.amount)}}</span>
                </div>
                <div class="funding-detail-item">
                  <span class="funding-detail-label">Bank:</span>
                  <span class="funding-detail-value">{{contribution.bankName}}</span>
                </div>
                <div class="funding-detail-item">
                  <span class="funding-detail-label">Frequency:</span>
                  <span class="funding-detail-value">{{contribution.frequency}}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div *ngIf="getAllFundingInstances().length === 0" class="review-mode-grid">
            <div class="review-field-group">
              <div class="review-field-label">Funding Sources</div>
              <div class="review-field-value empty">
                No funding sources added
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Existing Instance Modal -->
    <app-existing-instance-modal
      [(visible)]="showExistingModal"
      [instanceType]="'funding'"
      [instances]="existingInstances"
      [currentRegistration]="getCurrentRegistration()"
      (instanceSelected)="onExistingInstanceSelected($event)"
      (modalClosed)="onExistingModalClosed()">
    </app-existing-instance-modal>
  `,
  styles: [`
    .funding-section {
      padding: 0;
    }

    .p-card {
      margin-bottom: 1.5rem;
    }

    .p-card .p-card-header {
      background: #f8fafc;
      border-bottom: 1px solid #e5e7eb;
      font-weight: 600;
      color: #374151;
    }

    .funding-buttons-container {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      margin-bottom: 1rem;
    }

    .funding-button-wrapper {
      flex: 0 0 auto;
    }

    .funding-type-button {
      background: #3b82f6;
      color: white;
      border: 2px solid #3b82f6;
      border-radius: 6px;
      padding: 0.5rem 1rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s ease;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;
      font-weight: 500;
      min-width: fit-content;
      white-space: nowrap;
    }

    .funding-type-button:hover:not(.disabled) {
      background: #2563eb;
      border-color: #2563eb;
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.25);
    }

    .funding-type-button.disabled {
      background: #9ca3af;
      border-color: #9ca3af;
      color: #f3f4f6;
      cursor: not-allowed;
      opacity: 0.7;
    }

    .funding-type-name {
      font-weight: 500;
      color: white;
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .funding-type-button.disabled .funding-type-name {
      color: #f3f4f6;
    }

    .funding-type-button.existing-instance-button {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      border-color: #f59e0b;
    }

    .funding-type-button.existing-instance-button:hover {
      background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
      border-color: #d97706;
    }

    .funding-instances-table {
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      overflow: hidden;
    }

    .action-button {
      background: none;
      border: none;
      padding: 0.25rem;
      cursor: pointer;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .action-button:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }

    .edit-button {
      color: #6b7280;
    }

    .edit-button:hover {
      color: #374151;
    }

    .delete-button {
      color: #ef4444;
    }

    .delete-button:hover {
      color: #dc2626;
      background-color: rgba(239, 68, 68, 0.05);
    }

    .text-red-500 {
      color: #ef4444;
    }

    .p-error {
      color: #ef4444;
      font-size: 0.875rem;
      margin-top: 0.25rem;
      display: block;
    }

    .ng-invalid.ng-touched {
      border-color: #ef4444 !important;
    }

    /* Review mode styling - clean, flattened display */
    .review-mode-container {
      width: 100%;
      padding: 1rem;
      background: #f8f9fa;
    }
    
    .review-mode-section {
      width: 100%;
      margin-bottom: 2rem;
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    .review-mode-section-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 1rem;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 0.5rem;
    }

    .review-mode-section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .review-mode-section-header .review-mode-section-title {
      margin-bottom: 0;
      border-bottom: none;
      padding-bottom: 0;
    }

    ::ng-deep .edit-section-button .p-button {
      font-size: 0.75rem !important;
      padding: 0.25rem 0.75rem !important;
    }
    
    .review-subsection {
      margin-bottom: 1.5rem;
    }
    
    .review-subsection:last-child {
      margin-bottom: 0;
    }
    
    .review-subsection-title {
      font-size: 1rem;
      font-weight: 600;
      color: #374151;
      margin-bottom: 0.75rem;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 0.25rem;
    }
    
    .review-mode-grid {
      width: 100%;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1rem;
    }
    
    .review-field-group {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    
    .review-field-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    .review-field-value {
      font-size: 1rem;
      color: #111827;
      padding: 0.5rem 0;
      border-bottom: 1px solid #f3f4f6;
    }
    
    .review-field-value.missing {
      color: #dc2626;
      font-style: italic;
    }
    
    .review-field-value.empty {
      color: #9ca3af;
      font-style: italic;
    }

    /* Funding Instance Row Layout */
    .funding-instance-row {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1rem;
      background: white;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .funding-instance-header {
      font-size: 1.1rem;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 0.75rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #f3f4f6;
    }

    .funding-instance-details {
      display: flex;
      flex-wrap: wrap;
      gap: 1.5rem;
    }

    .funding-detail-item {
      display: flex;
      flex-direction: column;
      min-width: 150px;
    }

    .funding-detail-label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #6b7280;
      margin-bottom: 0.25rem;
    }

    .funding-detail-value {
      font-size: 0.875rem;
      color: #1f2937;
      font-weight: 500;
    }
  `]
})
export class FundingComponent implements OnInit, OnChanges {
  @Input() formData: FormData = {};
  @Input() entityId: string = '';
  @Input() isReviewMode: boolean = false;
  @Output() formDataChange = new EventEmitter<FormData>();

  fundingForm!: FormGroup;
  showFundingForm: string | null = null;
  editingInstance: SharedFundingInstance | null = null;

  // Funding instances organized by type
  fundingInstances: FundingInstances = {
    acat: [],
    ach: [],
    'initial-ach': [],
    withdrawal: [],
    contribution: []
  };

  // Existing instance modal properties
  showExistingModal = false;

  // Section edit mode tracking
  sectionEditMode: { [key: string]: boolean } = {
    'funding': false
  };
  existingInstances: ExistingInstance[] = [];

  // Filtered arrays for AutoComplete components
  filteredTransferTypeOptions: DropdownOption[] = [];
  filteredAchFrequencyOptions: DropdownOption[] = [];
  filteredWithdrawalFrequencyOptions: DropdownOption[] = [];
  filteredContributionFrequencyOptions: DropdownOption[] = [];

  // Funding type names
  fundingTypeNames = {
    'acat': 'ACAT Transfers',
    'ach': 'ACH Transfers', 
    'initial-ach': 'Initial ACH Transfers',
    'withdrawal': 'Systematic Withdrawals',
    'contribution': 'Systematic Contributions'
  };

  // Dropdown options exactly matching V2
  transferTypeOptions: DropdownOption[] = [
    { label: 'Full Transfer', value: 'Full Transfer' },
    { label: 'Partial Transfer', value: 'Partial Transfer' }
  ];

  achFrequencyOptions: DropdownOption[] = [
    { label: 'One-time', value: 'One-time' },
    { label: 'Monthly', value: 'Monthly' },
    { label: 'Quarterly', value: 'Quarterly' }
  ];

  withdrawalFrequencyOptions: DropdownOption[] = [
    { label: 'Monthly', value: 'Monthly' },
    { label: 'Quarterly', value: 'Quarterly' },
    { label: 'Semi-Annually', value: 'Semi-Annually' },
    { label: 'Annually', value: 'Annually' }
  ];

  contributionFrequencyOptions: DropdownOption[] = [
    { label: 'Monthly', value: 'Monthly' },
    { label: 'Bi-weekly', value: 'Bi-weekly' },
    { label: 'Weekly', value: 'Weekly' }
  ];

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private existingInstancesService: ExistingInstancesService
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.loadFundingData();
    this.initializeFilteredOptions();
  }

  private initializeFilteredOptions() {
    this.filteredTransferTypeOptions = [...this.transferTypeOptions];
    this.filteredAchFrequencyOptions = [...this.achFrequencyOptions];
    this.filteredWithdrawalFrequencyOptions = [...this.withdrawalFrequencyOptions];
    this.filteredContributionFrequencyOptions = [...this.contributionFrequencyOptions];
  }

  ngOnChanges(changes: SimpleChanges) {
    if ((changes['formData'] || changes['entityId']) && this.fundingForm) {
      this.loadFundingData();
    }
  }

  private initializeForm() {
    this.fundingForm = this.fb.group({
      name: ['', Validators.required],
      amount: ['', Validators.required],
      frequency: [''],
      fromFirm: [''],
      transferType: [''],
      bankName: [''],
      transferDate: [''],
      startDate: ['']
    });
  }

  private loadFundingData() {
    if (this.formData && this.formData[this.entityId] && this.formData[this.entityId].fundingInstances) {
      const savedInstances = this.formData[this.entityId].fundingInstances!;
      this.fundingInstances = {
        acat: savedInstances.acat || [],
        ach: savedInstances.ach || [],
        'initial-ach': savedInstances['initial-ach'] || [],
        withdrawal: savedInstances.withdrawal || [],
        contribution: savedInstances.contribution || []
      };
    }
  }

  private updateFormData() {
    const updatedFormData = { ...this.formData };
    if (!updatedFormData[this.entityId]) {
      updatedFormData[this.entityId] = {};
    }
    
    updatedFormData[this.entityId].fundingInstances = {
      acat: this.fundingInstances.acat,
      ach: this.fundingInstances.ach,
      'initial-ach': this.fundingInstances['initial-ach'],
      withdrawal: this.fundingInstances.withdrawal,
      contribution: this.fundingInstances.contribution
    };
    this.formDataChange.emit(updatedFormData);
  }

  toggleSectionEdit(sectionKey: string) {
    if (this.sectionEditMode[sectionKey]) {
      // Save changes and exit edit mode
      this.updateFormData();
      this.sectionEditMode[sectionKey] = false;
    } else {
      // Enter edit mode
      this.sectionEditMode[sectionKey] = true;
    }
  }

  handleFundingTypeClick(type: string) {
    if (this.isReviewMode) return;
    
    const typeInstances = (this.fundingInstances as any)[type]?.length || 0;
    const totalInstances = this.getTotalFundingInstances();
    
    if (typeInstances >= 4) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Limit Reached',
        detail: `Maximum 4 instances allowed per funding type`,
        life: 3000
      });
      return;
    }
    
    if (totalInstances >= 20) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Limit Reached',
        detail: `Maximum 20 total funding instances allowed`,
        life: 3000
      });
      return;
    }
    
    this.showFundingForm = type;
    this.editingInstance = null;
    this.resetForm(type);
  }

  private resetForm(type: string) {
    // Set appropriate validators based on funding type
    this.fundingForm.reset();
    
    // Reset all validators first
    Object.keys(this.fundingForm.controls).forEach(key => {
      this.fundingForm.get(key)?.clearValidators();
    });
    
    // Set required validators based on type
    this.fundingForm.get('name')?.setValidators([Validators.required]);
    this.fundingForm.get('amount')?.setValidators([Validators.required]);
    
    switch (type) {
      case 'acat':
        this.fundingForm.get('fromFirm')?.setValidators([Validators.required]);
        this.fundingForm.get('transferType')?.setValidators([Validators.required]);
        break;
      case 'ach':
        this.fundingForm.get('bankName')?.setValidators([Validators.required]);
        break;
      case 'initial-ach':
        this.fundingForm.get('bankName')?.setValidators([Validators.required]);
        this.fundingForm.get('transferDate')?.setValidators([Validators.required]);
        break;
      case 'withdrawal':
        this.fundingForm.get('frequency')?.setValidators([Validators.required]);
        this.fundingForm.get('startDate')?.setValidators([Validators.required]);
        break;
      case 'contribution':
        this.fundingForm.get('bankName')?.setValidators([Validators.required]);
        this.fundingForm.get('frequency')?.setValidators([Validators.required]);
        break;
    }
    
    // Update validity for all controls
    Object.keys(this.fundingForm.controls).forEach(key => {
      this.fundingForm.get(key)?.updateValueAndValidity();
    });
  }

  onCurrencyInput(event: any) {
    const value = event.target.value;
    const formatted = this.formatCurrency(value);
    this.fundingForm.patchValue({ amount: formatted });
  }

  private formatCurrency(value: string): string {
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
  }

  private parseCurrencyValue(formattedValue: string): string {
    return formattedValue.replace(/[^0-9.]/g, '');
  }

  formatStoredAmount(amount: string | number): string {
    if (!amount) return 'N/A';
    const numValue = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numValue)) return 'N/A';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: numValue % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2
    }).format(numValue);
  }

  saveInstance() {
    if (!this.fundingForm.valid || !this.showFundingForm) {
      this.messageService.add({
        severity: 'error',
        summary: 'Missing Data',
        detail: 'Please fill in all required fields',
        life: 3000
      });
      return;
    }

    const formValue = this.fundingForm.value;
    const instance: SharedFundingInstance = {
      type: this.showFundingForm as any,
      typeName: (this.fundingTypeNames as any)[this.showFundingForm],
      name: formValue.name,
      amount: this.parseCurrencyValue(formValue.amount),
      frequency: formValue.frequency,
      fromFirm: formValue.fromFirm,
      transferType: formValue.transferType,
      bankName: formValue.bankName,
      transferDate: formValue.transferDate,
      startDate: formValue.startDate
    };

    if (this.editingInstance) {
      // Update existing instance
      const typeInstances = (this.fundingInstances as any)[this.showFundingForm];
      const index = typeInstances.findIndex((inst: SharedFundingInstance) => 
        inst.originalIndex === this.editingInstance!.originalIndex
      );
      if (index !== -1) {
        typeInstances[index] = instance;
      }
      
      this.messageService.add({
        severity: 'success',
        summary: 'Updated',
        detail: `${instance.name} has been updated`,
        life: 3000
      });
    } else {
      // Add new instance
      (this.fundingInstances as any)[this.showFundingForm].push(instance);
      
      this.messageService.add({
        severity: 'success',
        summary: 'Added',
        detail: `${instance.name} has been added`,
        life: 3000
      });
    }

    this.updateFormData();
    this.cancelForm();
  }

  editInstance(instance: SharedFundingInstance) {
    this.editingInstance = instance;
    this.showFundingForm = instance.type;
    this.resetForm(instance.type);
    
    // Populate form with instance data
    this.fundingForm.patchValue({
      name: instance.name,
      amount: this.formatCurrency(instance.amount),
      frequency: instance.frequency,
      fromFirm: instance.fromFirm,
      transferType: instance.transferType,
      bankName: instance.bankName,
      transferDate: instance.transferDate,
      startDate: instance.startDate
    });
  }

  deleteInstance(instance: SharedFundingInstance) {
    const typeInstances = (this.fundingInstances as any)[instance.type];
    const index = typeInstances.findIndex((inst: SharedFundingInstance) => 
      inst.name === instance.name && inst.amount === instance.amount
    );
    
    if (index !== -1) {
      typeInstances.splice(index, 1);
      this.updateFormData();
      
      this.messageService.add({
        severity: 'success',
        summary: 'Deleted',
        detail: `${instance.name} has been removed`,
        life: 3000
      });
    }
  }

  cancelForm() {
    this.showFundingForm = null;
    this.editingInstance = null;
    this.fundingForm.reset();
  }

  getAllFundingInstances(): SharedFundingInstance[] {
    const allInstances: SharedFundingInstance[] = [];
    Object.keys(this.fundingInstances).forEach(type => {
      const instances = (this.fundingInstances as any)[type] || [];
      instances.forEach((instance: SharedFundingInstance, index: number) => {
        allInstances.push({
          ...instance,
          originalIndex: index
        });
      });
    });
    return allInstances;
  }

  getTotalFundingInstances(): number {
    return Object.values(this.fundingInstances).reduce((total, instances) => total + instances.length, 0);
  }

  // Existing instance modal methods
  showExistingInstanceModal() {
    // Collect all existing instances from the form data
    this.existingInstances = this.existingInstancesService.collectExistingInstances(this.formData);
    this.showExistingModal = true;
  }

  onExistingInstanceSelected(instance: ExistingInstance) {
    // Apply the selected instance data to create a new funding instance
    const fundingData = instance.data;
    
    // Determine the funding type based on the instance data
    let fundingType: string = 'acat'; // default
    if (fundingData.bankName || fundingData.routingNumber) {
      fundingType = 'ach';
    } else if (fundingData.institutionName) {
      fundingType = 'acat';
    }

    // Add the funding instance to the appropriate type
    const fundingInstances = this.fundingInstances as any;
    fundingInstances[fundingType].push({
      ...fundingData,
      id: `${fundingType}-${Date.now()}` // Generate unique ID
    });

    this.updateFormData();
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: `Existing funding instance added successfully`
    });
  }

  onExistingModalClosed() {
    this.showExistingModal = false;
  }

  getCurrentRegistration(): string {
    // Map entity IDs to registration names
    const registrationMap: { [key: string]: string } = {
      'john-smith': 'Joint Registration',
      'mary-smith': 'Joint Registration',
      'smith-trust': 'Trust Registration',
      'joint-account': 'Joint Registration',
      'roth-ira-account': 'Roth Registration',
      'trust-account': 'Trust Registration'
    };
    
    return registrationMap[this.entityId] || 'Unknown Registration';
  }

  // Filter methods for AutoComplete components
  filterTransferTypeOptions(event: any) {
    const query = event.query.toLowerCase();
    this.filteredTransferTypeOptions = this.transferTypeOptions.filter(option => 
      option.label.toLowerCase().includes(query)
    );
  }

  filterAchFrequencyOptions(event: any) {
    const query = event.query.toLowerCase();
    this.filteredAchFrequencyOptions = this.achFrequencyOptions.filter(option => 
      option.label.toLowerCase().includes(query)
    );
  }

  filterWithdrawalFrequencyOptions(event: any) {
    const query = event.query.toLowerCase();
    this.filteredWithdrawalFrequencyOptions = this.withdrawalFrequencyOptions.filter(option => 
      option.label.toLowerCase().includes(query)
    );
  }

  filterContributionFrequencyOptions(event: any) {
    const query = event.query.toLowerCase();
    this.filteredContributionFrequencyOptions = this.contributionFrequencyOptions.filter(option => 
      option.label.toLowerCase().includes(query)
    );
  }
}