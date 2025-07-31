import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

// PrimeNG Imports
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

// Local Imports
import { FormData, FundingInstance as SharedFundingInstance } from '../../../../shared/models/types';

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
    DropdownModule,
    ButtonModule,
    CardModule,
    ToastModule,
    TooltipModule
  ],
  providers: [MessageService],
  template: `
    <div class="funding-section">
      <p-toast></p-toast>
      
      <p-card header="Funding" class="mb-4">
        <div class="funding-dashboard">
          <div class="flex justify-content-between align-items-center mb-4">
            <h3 class="text-xl font-semibold m-0">Funding Types</h3>
          </div>
          
          <!-- Funding Type Buttons -->
          <div class="funding-buttons-container" *ngIf="!isReviewMode">
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
                      <p-dropdown
                        inputId="transferType"
                        formControlName="transferType"
                        [options]="transferTypeOptions"
                        placeholder="Select type"
                        styleClass="w-full"
                        [disabled]="isReviewMode">
                      </p-dropdown>
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
                      <p-dropdown
                        inputId="achFrequency"
                        formControlName="frequency"
                        [options]="achFrequencyOptions"
                        placeholder="Select frequency"
                        styleClass="w-full"
                        [disabled]="isReviewMode">
                      </p-dropdown>
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
                        styleClass="w-full"
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
                      <p-dropdown
                        inputId="withdrawalFreq"
                        formControlName="frequency"
                        [options]="withdrawalFrequencyOptions"
                        placeholder="Select frequency"
                        styleClass="w-full"
                        [disabled]="isReviewMode">
                      </p-dropdown>
                    </div>
                    <div class="col-12 md:col-6">
                      <label for="startDate" class="block text-900 font-medium mb-2">Start Date <span class="text-red-500">*</span></label>
                      <p-calendar
                        inputId="startDate"
                        formControlName="startDate"
                        [showIcon]="true"
                        dateFormat="mm/dd/yy"
                        placeholder="Select start date"
                        styleClass="w-full"
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
                      <p-dropdown
                        inputId="contributionFreq"
                        formControlName="frequency"
                        [options]="contributionFrequencyOptions"
                        placeholder="Select frequency"
                        styleClass="w-full"
                        [disabled]="isReviewMode">
                      </p-dropdown>
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
    </div>
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
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.loadFundingData();
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
}