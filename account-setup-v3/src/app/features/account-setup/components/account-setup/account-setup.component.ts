import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

// PrimeNG Imports
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CheckboxModule } from 'primeng/checkbox';
import { CardModule } from 'primeng/card';
import { InputMaskModule } from 'primeng/inputmask';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

// Local Imports
import { FormData } from '../../../../shared/models/types';

interface DropdownOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-account-setup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    CalendarModule,
    DropdownModule,
    InputTextareaModule,
    CheckboxModule,
    CardModule,
    InputMaskModule,
    ButtonModule,
    ToastModule,
    TooltipModule
  ],
  providers: [MessageService],
  template: `
    <div class="account-setup-section">
      <p-toast></p-toast>
      
      <form [formGroup]="accountForm" (ngSubmit)="onSubmit()">
        
        <!-- Account Setup Card (Always First) -->
        <p-card header="Account Setup" class="mb-4">
          <div class="grid">
            <div class="col-12 md:col-6">
              <label for="accountType" class="block text-900 font-medium mb-2">
                Account Type <span class="text-red-500">*</span>
              </label>
              <div *ngIf="isReviewMode" [class.missing-required]="!accountForm.get('accountType')?.value" class="review-field">
                {{getFieldDisplayValue('accountType', accountTypeOptions) || 'Not provided'}}
              </div>
              <p-dropdown *ngIf="!isReviewMode"
                inputId="accountType"
                formControlName="accountType"
                [options]="accountTypeOptions"
                placeholder="Select account type"
                styleClass="w-full"
                (onChange)="onAccountTypeChange($event)"
                [class.ng-invalid]="accountForm.get('accountType')?.invalid && accountForm.get('accountType')?.touched">
              </p-dropdown>
              <small class="p-error" *ngIf="accountForm.get('accountType')?.invalid && accountForm.get('accountType')?.touched">
                Account type is required
              </small>
              <small class="missing-field-warning" *ngIf="isReviewMode && !accountForm.get('accountType')?.value">
                <i class="pi pi-exclamation-triangle"></i> Required field missing
              </small>
            </div>
            
            <div class="col-12 md:col-6">
              <label for="investmentObjective" class="block text-900 font-medium mb-2">
                Investment Objective <span class="text-red-500">*</span>
              </label>
              <p-dropdown
                inputId="investmentObjective"
                formControlName="investmentObjective"
                [options]="investmentObjectiveOptions"
                placeholder="Select investment objective"
                styleClass="w-full"
                [disabled]="isReviewMode"
                [class.ng-invalid]="accountForm.get('investmentObjective')?.invalid && accountForm.get('investmentObjective')?.touched">
              </p-dropdown>
              <small class="p-error" *ngIf="accountForm.get('investmentObjective')?.invalid && accountForm.get('investmentObjective')?.touched">
                Investment objective is required
              </small>
            </div>
            
            <div class="col-12 md:col-6">
              <label for="riskTolerance" class="block text-900 font-medium mb-2">
                Risk Tolerance <span class="text-red-500">*</span>
              </label>
              <p-dropdown
                inputId="riskTolerance"
                formControlName="riskTolerance"
                [options]="riskToleranceOptions"
                placeholder="Select risk tolerance"
                styleClass="w-full"
                [disabled]="isReviewMode"
                [class.ng-invalid]="accountForm.get('riskTolerance')?.invalid && accountForm.get('riskTolerance')?.touched">
              </p-dropdown>
              <small class="p-error" *ngIf="accountForm.get('riskTolerance')?.invalid && accountForm.get('riskTolerance')?.touched">
                Risk tolerance is required
              </small>
            </div>
            
            <div class="col-12 md:col-6">
              <label for="timeHorizon" class="block text-900 font-medium mb-2">
                Time Horizon
              </label>
              <p-dropdown
                inputId="timeHorizon"
                formControlName="timeHorizon"
                [options]="timeHorizonOptions"
                placeholder="Select time horizon"
                styleClass="w-full"
                [disabled]="isReviewMode">
              </p-dropdown>
            </div>
          </div>
        </p-card>

        <!-- Trust Information Card (Only for Trust Accounts) -->
        <p-card header="Trust Information" class="mb-4" *ngIf="isTrustAccount">
          <div class="grid">
            <div class="col-12">
              <label for="trustName" class="block text-900 font-medium mb-2">
                Trust Name <span class="text-red-500">*</span>
              </label>
              <input
                pInputText
                id="trustName"
                formControlName="trustName"
                placeholder="Enter full legal trust name"
                class="w-full"
                [disabled]="isReviewMode"
                [class.ng-invalid]="accountForm.get('trustName')?.invalid && accountForm.get('trustName')?.touched" />
              <small class="p-error" *ngIf="accountForm.get('trustName')?.invalid && accountForm.get('trustName')?.touched">
                Trust name is required
              </small>
            </div>
          </div>
        </p-card>

        <!-- Trustees Card (Only for Trust Accounts) -->
        <p-card header="Trustees" class="mb-4" *ngIf="isTrustAccount">
          <div class="funding-dashboard">
            
            <!-- Add Trustee Button -->
            <div class="funding-buttons-container" *ngIf="!isReviewMode">
              <div class="funding-button-wrapper">
                <div 
                  class="funding-type-button"
                  (click)="handleAddTrustee()">
                  <div class="funding-type-name">Add Trustee <i class="pi pi-plus-circle"></i></div>
                </div>
              </div>
            </div>

            <!-- Trustee Form -->
            <div *ngIf="showTrusteeForm" class="mt-4">
              <p-card header="{{editingTrusteeIndex >= 0 ? 'Edit Trustee' : 'New Trustee'}}" class="mb-4">
                <form [formGroup]="trusteeForm">
                  <div class="grid">
                    <div class="col-12 md:col-6">
                      <label for="trusteeName" class="block text-900 font-medium mb-2">Name <span class="text-red-500">*</span></label>
                      <input
                        pInputText
                        id="trusteeName"
                        formControlName="name"
                        placeholder="Full name"
                        class="w-full" />
                    </div>
                    <div class="col-12 md:col-6">
                      <label for="trusteeRole" class="block text-900 font-medium mb-2">Role <span class="text-red-500">*</span></label>
                      <p-dropdown
                        inputId="trusteeRole"
                        formControlName="role"
                        [options]="trusteeRoleOptions"
                        placeholder="Select role"
                        styleClass="w-full">
                      </p-dropdown>
                    </div>
                    <div class="col-12 md:col-6">
                      <label for="trusteePhone" class="block text-900 font-medium mb-2">Phone <span class="text-red-500">*</span></label>
                      <p-inputMask
                        inputId="trusteePhone"
                        formControlName="phone"
                        mask="(999) 999-9999"
                        placeholder="(XXX) XXX-XXXX"
                        styleClass="w-full">
                      </p-inputMask>
                    </div>
                    <div class="col-12 md:col-6">
                      <label for="trusteeEmail" class="block text-900 font-medium mb-2">Email</label>
                      <input
                        pInputText
                        id="trusteeEmail"
                        type="email"
                        formControlName="email"
                        placeholder="Email address"
                        class="w-full" />
                    </div>
                    <div class="col-12">
                      <label for="trusteeAddress" class="block text-900 font-medium mb-2">Address <span class="text-red-500">*</span></label>
                      <input
                        pInputText
                        id="trusteeAddress"
                        formControlName="address"
                        placeholder="Full address"
                        class="w-full" />
                    </div>
                  </div>
                </form>
              </p-card>
              
              <!-- Form Action Buttons -->
              <div class="flex gap-2 justify-content-end mb-4">
                <p-button 
                  label="Cancel" 
                  severity="secondary" 
                  (onClick)="cancelTrusteeForm()">
                </p-button>
                <p-button 
                  [label]="editingTrusteeIndex >= 0 ? 'Update Trustee' : 'Save Trustee'"
                  (onClick)="saveTrustee()">
                </p-button>
              </div>
            </div>

            <!-- Trustees Grid -->
            <div *ngIf="trustees.length > 0" class="mt-4">
              <h4 class="text-lg font-medium mb-3">Current Trustees</h4>
              <div class="funding-instances-table">
                <div class="grid p-2 font-semibold text-sm surface-border border-bottom-1">
                  <div class="col-3">Name</div>
                  <div class="col-2">Role</div>
                  <div class="col-3">Phone</div>
                  <div class="col-2">Email</div>
                  <div class="col-2" *ngIf="!isReviewMode">Actions</div>
                </div>
                <div 
                  *ngFor="let trustee of trustees; let i = index"
                  class="grid p-2 border-bottom-1 surface-border align-items-center">
                  <div class="col-3">
                    <span class="text-sm font-medium">{{trustee.name}}</span>
                  </div>
                  <div class="col-2">
                    <span class="text-sm">{{trustee.role}}</span>
                  </div>
                  <div class="col-3">
                    <span class="text-sm">{{trustee.phone}}</span>
                  </div>
                  <div class="col-2">
                    <span class="text-sm">{{trustee.email || 'N/A'}}</span>
                  </div>
                  <div class="col-2" *ngIf="!isReviewMode">
                    <div class="flex gap-1">
                      <button 
                        class="action-button edit-button"
                        (click)="editTrustee(i)"
                        pTooltip="Edit"
                        tooltipPosition="top">
                        <i class="pi pi-pencil"></i>
                      </button>
                      <button 
                        class="action-button delete-button"
                        (click)="deleteTrustee(i)"
                        pTooltip="Delete"
                        tooltipPosition="top">
                        <i class="pi pi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Empty State for Trustees -->
            <div *ngIf="trustees.length === 0 && !showTrusteeForm" class="enterprise-empty-state">
              <div class="empty-state-content">
                <div class="empty-state-icon">
                  <i class="pi pi-users"></i>
                </div>
                <h3 class="empty-state-title">No Trustees Added</h3>
                <p class="empty-state-description">
                  Add trustees to manage this trust account
                </p>
                <div class="empty-state-actions">
                  <p-button 
                    label="Add Trustee" 
                    icon="pi pi-plus-circle"
                    styleClass="empty-state-button"
                    (onClick)="handleAddTrustee()">
                  </p-button>
                </div>
              </div>
            </div>

          </div>
        </p-card>

        <!-- Beneficiaries Card (Only for IRA Accounts) -->
        <p-card header="Beneficiaries" class="mb-4" *ngIf="isIraAccount">
          <div class="funding-dashboard">
            
            <!-- Add Beneficiary Button -->
            <div class="funding-buttons-container" *ngIf="!isReviewMode">
              <div class="funding-button-wrapper">
                <div 
                  class="funding-type-button"
                  (click)="handleAddBeneficiary()">
                  <div class="funding-type-name">Add Beneficiary <i class="pi pi-plus-circle"></i></div>
                </div>
              </div>
            </div>

            <!-- Beneficiary Form -->
            <div *ngIf="showBeneficiaryForm" class="mt-4">
              <p-card header="{{editingBeneficiaryIndex >= 0 ? 'Edit Beneficiary' : 'New Beneficiary'}}" class="mb-4">
                <form [formGroup]="beneficiaryForm">
                  <div class="grid">
                    <div class="col-12 md:col-6">
                      <label for="beneficiaryName" class="block text-900 font-medium mb-2">Name <span class="text-red-500">*</span></label>
                      <input
                        pInputText
                        id="beneficiaryName"
                        formControlName="name"
                        placeholder="Full name"
                        class="w-full" />
                    </div>
                    <div class="col-12 md:col-6">
                      <label for="beneficiaryRelationship" class="block text-900 font-medium mb-2">Relationship <span class="text-red-500">*</span></label>
                      <p-dropdown
                        inputId="beneficiaryRelationship"
                        formControlName="relationship"
                        [options]="relationshipOptions"
                        placeholder="Select relationship"
                        styleClass="w-full">
                      </p-dropdown>
                    </div>
                    <div class="col-12 md:col-4">
                      <label for="beneficiaryPercentage" class="block text-900 font-medium mb-2">Percentage <span class="text-red-500">*</span></label>
                      <input
                        pInputText
                        id="beneficiaryPercentage"
                        type="number"
                        formControlName="percentage"
                        placeholder="0"
                        min="1"
                        max="100"
                        class="w-full" />
                    </div>
                    <div class="col-12 md:col-4">
                      <label for="beneficiaryDob" class="block text-900 font-medium mb-2">Date of Birth <span class="text-red-500">*</span></label>
                      <p-calendar
                        inputId="beneficiaryDob"
                        formControlName="dateOfBirth"
                        dateFormat="mm/dd/yy"
                        [showIcon]="true"
[maxDate]="maxDate"
                        placeholder="Select date"
                        styleClass="w-full">
                      </p-calendar>
                    </div>
                    <div class="col-12 md:col-4">
                      <label for="beneficiarySsn" class="block text-900 font-medium mb-2">SSN <span class="text-red-500">*</span></label>
                      <p-inputMask
                        inputId="beneficiarySsn"
                        formControlName="ssn"
                        mask="999-99-9999"
                        placeholder="XXX-XX-XXXX"
                        styleClass="w-full">
                      </p-inputMask>
                    </div>
                    <div class="col-12">
                      <label for="beneficiaryAddress" class="block text-900 font-medium mb-2">Address</label>
                      <input
                        pInputText
                        id="beneficiaryAddress"
                        formControlName="address"
                        placeholder="Full address"
                        class="w-full" />
                    </div>
                  </div>
                </form>
              </p-card>
              
              <!-- Form Action Buttons -->
              <div class="flex gap-2 justify-content-end mb-4">
                <p-button 
                  label="Cancel" 
                  severity="secondary" 
                  (onClick)="cancelBeneficiaryForm()">
                </p-button>
                <p-button 
                  [label]="editingBeneficiaryIndex >= 0 ? 'Update Beneficiary' : 'Save Beneficiary'"
                  (onClick)="saveBeneficiary()">
                </p-button>
              </div>
            </div>

            <!-- Beneficiaries Grid -->
            <div *ngIf="beneficiaries.length > 0" class="mt-4">
              <h4 class="text-lg font-medium mb-3">Current Beneficiaries</h4>
              <div class="grid">
                <div class="col-12">
                  <div class="funding-instances-table">
                    <div class="grid p-2 font-semibold text-sm surface-border border-bottom-1">
                      <div class="col-3">Name</div>
                      <div class="col-3">Relationship</div>
                      <div class="col-2">Percentage</div>
                      <div class="col-2">Date of Birth</div>
                      <div class="col-2" *ngIf="!isReviewMode">Actions</div>
                    </div>
                    <div 
                      *ngFor="let beneficiary of beneficiaries; let i = index"
                      class="grid p-2 border-bottom-1 surface-border align-items-center">
                      <div class="col-3">
                        <span class="text-sm font-medium">{{beneficiary.name || 'Beneficiary ' + (i + 1)}}</span>
                      </div>
                      <div class="col-3">
                        <span class="text-sm">{{beneficiary.relationship || 'Not specified'}}</span>
                      </div>
                      <div class="col-2">
                        <span class="text-sm">{{beneficiary.percentage || 0}}%</span>
                      </div>
                      <div class="col-2">
                        <span class="text-sm">{{(beneficiary.dateOfBirth | date:'shortDate') || 'Not provided'}}</span>
                      </div>
                      <div class="col-2" *ngIf="!isReviewMode">
                        <div class="flex gap-1">
                          <button 
                            class="action-button edit-button"
                            (click)="editBeneficiary(i)"
                            pTooltip="Edit"
                            tooltipPosition="top">
                            <i class="pi pi-pencil"></i>
                          </button>
                          <button 
                            class="action-button delete-button"
                            (click)="deleteBeneficiary(i)"
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
            
            <!-- Empty State for Beneficiaries -->
            <div *ngIf="beneficiaries.length === 0" class="enterprise-empty-state">
              <div class="empty-state-content">
                <div class="empty-state-icon">
                  <i class="pi pi-heart"></i>
                </div>
                <h3 class="empty-state-title">No Beneficiaries Added</h3>
                <p class="empty-state-description">
                  Add beneficiaries for this IRA account
                </p>
                <div class="empty-state-actions" *ngIf="!isReviewMode">
                  <p-button 
                    label="Add Beneficiary" 
                    icon="pi pi-plus-circle"
                    styleClass="empty-state-button"
                    (onClick)="handleAddBeneficiary()">
                  </p-button>
                </div>
              </div>
            </div>

          </div>
        </p-card>

      </form>
    </div>
  `,
  styles: [`
    /* Copy exact styles from funding component */
    .account-setup-section {
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

    .funding-type-button:hover {
      background: #2563eb;
      border-color: #2563eb;
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .funding-instances-table {
      border: 1px solid var(--surface-border);
      border-radius: 6px;
      overflow: hidden;
    }

    .action-button {
      background: none;
      border: none;
      padding: 0.375rem;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s ease;
      color: var(--text-color-secondary);
    }

    .edit-button:hover {
      background: var(--blue-50);
      color: var(--blue-600);
    }

    .delete-button:hover {
      background: var(--red-50);
      color: var(--red-600);
    }

    .enterprise-empty-state {
      text-align: center;
      padding: 3rem 2rem;
      color: var(--text-color-secondary);
    }

    .empty-state-icon {
      font-size: 3rem;
      color: var(--text-color-secondary);
      margin-bottom: 1rem;
    }

    .empty-state-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-color);
      margin-bottom: 0.5rem;
    }

    .empty-state-description {
      font-size: 0.875rem;
      margin-bottom: 1.5rem;
      max-width: 400px;
      margin-left: auto;
      margin-right: auto;
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

    /* Review Mode Styles */
    .review-field {
      padding: 0.75rem;
      background: #f8fafc;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      font-weight: 500;
      color: var(--text-color);
      min-height: 42px;
      display: flex;
      align-items: center;
    }

    .review-field.missing-required {
      background: #fef2f2;
      border-color: #f87171;
      color: #dc2626;
    }

    .missing-field-warning {
      color: #dc2626;
      font-size: 0.75rem;
      font-weight: 500;
      margin-top: 0.25rem;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .missing-field-warning i {
      font-size: 0.875rem;
    }
  `]
})
export class AccountSetupComponent implements OnInit {
  @Input() formData: FormData = {};
  @Input() entityId: string = '';
  @Input() isReviewMode: boolean = false;
  @Output() formDataChange = new EventEmitter<FormData>();

  accountForm!: FormGroup;
  isTrustAccount: boolean = false;
  isIraAccount: boolean = false;
  trustees: any[] = [];
  beneficiaries: any[] = [];
  showTrusteeForm: string | null = null;
  showBeneficiaryForm: string | null = null;
  trusteeForm!: FormGroup;
  beneficiaryForm!: FormGroup;
  editingTrusteeIndex: number = -1;
  editingBeneficiaryIndex: number = -1;
  maxDate: Date = new Date();

  // Dropdown options
  accountTypeOptions: DropdownOption[] = [
    { label: 'Joint Taxable Account', value: 'joint-taxable' },
    { label: 'Individual Taxable Account', value: 'individual-taxable' },
    { label: 'Trust Account', value: 'trust' },
    { label: 'IRA', value: 'ira' },
    { label: 'Roth IRA', value: 'roth-ira' }
  ];

  investmentObjectiveOptions: DropdownOption[] = [
    { label: 'Growth', value: 'growth' },
    { label: 'Income', value: 'income' },
    { label: 'Balanced', value: 'balanced' },
    { label: 'Capital Preservation', value: 'preservation' },
    { label: 'Speculation', value: 'speculation' }
  ];

  riskToleranceOptions: DropdownOption[] = [
    { label: 'Conservative', value: 'conservative' },
    { label: 'Moderate', value: 'moderate' },
    { label: 'Aggressive', value: 'aggressive' },
    { label: 'Very Aggressive', value: 'very-aggressive' }
  ];

  timeHorizonOptions: DropdownOption[] = [
    { label: 'Less than 1 year', value: 'less-1' },
    { label: '1-3 years', value: '1-3' },
    { label: '3-5 years', value: '3-5' },
    { label: '5-10 years', value: '5-10' },
    { label: 'More than 10 years', value: 'more-10' }
  ];

  trusteeRoleOptions: DropdownOption[] = [
    { label: 'Trustee', value: 'trustee' },
    { label: 'Co-Trustee', value: 'co-trustee' },
    { label: 'Successor Trustee', value: 'successor-trustee' }
  ];

  relationshipOptions: DropdownOption[] = [
    { label: 'Spouse', value: 'spouse' },
    { label: 'Child', value: 'child' },
    { label: 'Parent', value: 'parent' },
    { label: 'Sibling', value: 'sibling' },
    { label: 'Other', value: 'other' }
  ];

  constructor(private fb: FormBuilder, private messageService: MessageService) {}

  ngOnInit() {
    this.initializeForm();
    this.loadFormData();
    this.setupFormSubscriptions();
  }

  private initializeForm() {
    this.accountForm = this.fb.group({
      accountType: ['', Validators.required],
      investmentObjective: ['', Validators.required],
      riskTolerance: ['', Validators.required],
      timeHorizon: [''],
      
      // Trust-specific fields
      trustName: ['']
    });

    // Initialize trustee form
    this.trusteeForm = this.fb.group({
      name: ['', Validators.required],
      role: ['', Validators.required],
      phone: ['', Validators.required],
      email: [''],
      address: ['', Validators.required]
    });

    // Initialize beneficiary form
    this.beneficiaryForm = this.fb.group({
      name: ['', Validators.required],
      relationship: ['', Validators.required],
      percentage: [0, [Validators.required, Validators.min(1), Validators.max(100)]],
      dateOfBirth: ['', Validators.required],
      ssn: ['', Validators.required],
      address: ['']
    });
  }

  private loadFormData() {
    if (this.formData && this.formData[this.entityId]) {
      const entityData = this.formData[this.entityId];
      this.accountForm.patchValue(entityData);
      
      // Check account type to show/hide conditional fields
      this.isTrustAccount = entityData.accountType === 'trust';
      this.isIraAccount = entityData.accountType === 'roth-ira' || entityData.accountType === 'ira';
      
      
      // Load trustees and beneficiaries
      this.trustees = entityData['trustees'] || [];
      this.beneficiaries = entityData['beneficiaries'] || [];
      
    }
  }

  private setupFormSubscriptions() {
    this.accountForm.valueChanges.subscribe(() => {
      this.updateFormData();
    });
  }

  onAccountTypeChange(event: any) {
    this.isTrustAccount = event.value === 'trust';
    this.isIraAccount = event.value === 'roth-ira' || event.value === 'ira';
    
  }

  handleAddTrustee() {
    this.showTrusteeForm = 'new';
    this.editingTrusteeIndex = -1;
    this.trusteeForm.reset();
  }

  editTrustee(index: number) {
    if (index >= 0 && index < this.trustees.length) {
      this.showTrusteeForm = 'edit';
      this.editingTrusteeIndex = index;
      this.trusteeForm.patchValue(this.trustees[index]);
    }
  }

  deleteTrustee(index: number) {
    if (index >= 0 && index < this.trustees.length) {
      this.trustees.splice(index, 1);
      this.updateFormData();
      this.messageService.add({
        severity: 'info',
        summary: 'Trustee Removed',
        detail: 'Trustee removed successfully',
        life: 2000
      });
    }
  }

  saveTrustee() {
    if (this.trusteeForm.valid) {
      const trusteeData = this.trusteeForm.value;
      
      if (this.editingTrusteeIndex >= 0) {
        // Update existing trustee
        this.trustees[this.editingTrusteeIndex] = trusteeData;
      } else {
        // Add new trustee
        this.trustees.push(trusteeData);
      }
      
      this.cancelTrusteeForm();
      this.updateFormData();
      
      this.messageService.add({
        severity: 'success',
        summary: this.editingTrusteeIndex >= 0 ? 'Trustee Updated' : 'Trustee Added',
        detail: this.editingTrusteeIndex >= 0 ? 'Trustee updated successfully' : 'New trustee added successfully',
        life: 2000
      });
    }
  }

  cancelTrusteeForm() {
    this.showTrusteeForm = null;
    this.editingTrusteeIndex = -1;
    this.trusteeForm.reset();
  }

  handleAddBeneficiary() {
    this.showBeneficiaryForm = 'new';
    this.editingBeneficiaryIndex = -1;
    this.beneficiaryForm.reset();
  }

  editBeneficiary(index: number) {
    if (index >= 0 && index < this.beneficiaries.length) {
      this.showBeneficiaryForm = 'edit';
      this.editingBeneficiaryIndex = index;
      this.beneficiaryForm.patchValue(this.beneficiaries[index]);
    }
  }

  saveBeneficiary() {
    if (this.beneficiaryForm.valid) {
      const beneficiaryData = this.beneficiaryForm.value;
      
      if (this.editingBeneficiaryIndex >= 0) {
        // Update existing beneficiary
        this.beneficiaries[this.editingBeneficiaryIndex] = beneficiaryData;
      } else {
        // Add new beneficiary
        this.beneficiaries.push(beneficiaryData);
      }
      
      this.cancelBeneficiaryForm();
      this.updateFormData();
      
      this.messageService.add({
        severity: 'success',
        summary: this.editingBeneficiaryIndex >= 0 ? 'Beneficiary Updated' : 'Beneficiary Added',
        detail: this.editingBeneficiaryIndex >= 0 ? 'Beneficiary updated successfully' : 'New beneficiary added successfully',
        life: 2000
      });
    }
  }

  cancelBeneficiaryForm() {
    this.showBeneficiaryForm = null;
    this.editingBeneficiaryIndex = -1;
    this.beneficiaryForm.reset();
  }

  deleteBeneficiary(index: number) {
    if (index >= 0 && index < this.beneficiaries.length) {
      this.beneficiaries.splice(index, 1);
      this.updateFormData();
      this.messageService.add({
        severity: 'info',
        summary: 'Beneficiary Removed',
        detail: 'Beneficiary removed successfully',
        life: 2000
      });
    }
  }

  private updateFormData() {
    const updatedFormData = { ...this.formData };
    if (!updatedFormData[this.entityId]) {
      updatedFormData[this.entityId] = {};
    }
    
    Object.assign(updatedFormData[this.entityId], this.accountForm.value);
    
    // Update trustees and beneficiaries
    updatedFormData[this.entityId]['trustees'] = this.trustees;
    updatedFormData[this.entityId]['beneficiaries'] = this.beneficiaries;
    
    this.formDataChange.emit(updatedFormData);
  }

  getFieldDisplayValue(fieldName: string, options: DropdownOption[]): string {
    const fieldValue = this.accountForm.get(fieldName)?.value;
    if (!fieldValue) return '';
    
    const option = options.find(opt => opt.value === fieldValue);
    return option ? option.label : fieldValue;
  }

  onSubmit() {
    if (this.accountForm.valid) {
      this.updateFormData();
    }
  }
}