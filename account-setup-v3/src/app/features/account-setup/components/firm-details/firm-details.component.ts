import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

// PrimeNG Imports
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CardModule } from 'primeng/card';

// Local Imports
import { FormData } from '../../../../shared/models/types';

interface DropdownOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-firm-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    DropdownModule,
    InputTextareaModule,
    RadioButtonModule,
    CardModule
  ],
  template: `
    <div class="firm-details-section">
      <form [formGroup]="firmForm" (ngSubmit)="onSubmit()">
        
        <!-- Member Firm Details -->
        <div *ngIf="isMemberEntity">
          
          <!-- Net Worth Assessment Card -->
          <p-card class="mb-4">
            <div class="grid">
              <div class="col-12 md:col-6">
                <label for="totalNetWorth" class="block text-900 font-medium mb-2">
                  Total Net Worth <span class="text-red-500">*</span>
                </label>
                <p-dropdown
                  inputId="totalNetWorth"
                  formControlName="totalNetWorth"
                  [options]="totalNetWorthOptions"
                  placeholder="Select total net worth"
                  styleClass="w-full"
                  [disabled]="isReviewMode"
                  [class.ng-invalid]="firmForm.get('totalNetWorth')?.invalid && firmForm.get('totalNetWorth')?.touched">
                </p-dropdown>
                <small class="p-error" *ngIf="firmForm.get('totalNetWorth')?.invalid && firmForm.get('totalNetWorth')?.touched">
                  Total net worth is required
                </small>
              </div>
              
              <div class="col-12 md:col-6">
                <label for="liquidNetWorth" class="block text-900 font-medium mb-2">
                  Liquid Net Worth <span class="text-red-500">*</span>
                </label>
                <p-dropdown
                  inputId="liquidNetWorth"
                  formControlName="liquidNetWorth"
                  [options]="liquidNetWorthOptions"
                  placeholder="Select liquid net worth"
                  styleClass="w-full"
                  [disabled]="isReviewMode"
                  [class.ng-invalid]="firmForm.get('liquidNetWorth')?.invalid && firmForm.get('liquidNetWorth')?.touched">
                </p-dropdown>
                <small class="p-error" *ngIf="firmForm.get('liquidNetWorth')?.invalid && firmForm.get('liquidNetWorth')?.touched">
                  Liquid net worth is required
                </small>
              </div>
              
              <div class="col-12 md:col-6">
                <label for="averageAnnualIncome" class="block text-900 font-medium mb-2">
                  Average Annual Income (Last 3 Years) <span class="text-red-500">*</span>
                </label>
                <p-dropdown
                  inputId="averageAnnualIncome"
                  formControlName="averageAnnualIncome"
                  [options]="averageIncomeOptions"
                  placeholder="Select average annual income"
                  styleClass="w-full"
                  [disabled]="isReviewMode"
                  [class.ng-invalid]="firmForm.get('averageAnnualIncome')?.invalid && firmForm.get('averageAnnualIncome')?.touched">
                </p-dropdown>
                <small class="p-error" *ngIf="firmForm.get('averageAnnualIncome')?.invalid && firmForm.get('averageAnnualIncome')?.touched">
                  Average annual income is required
                </small>
              </div>
              
              <div class="col-12 md:col-6">
                <label for="incomeSource" class="block text-900 font-medium mb-2">
                  Primary Source of Income <span class="text-red-500">*</span>
                </label>
                <p-dropdown
                  inputId="incomeSource"
                  formControlName="incomeSource"
                  [options]="incomeSourceOptions"
                  placeholder="Select primary income source"
                  styleClass="w-full"
                  [disabled]="isReviewMode"
                  [class.ng-invalid]="firmForm.get('incomeSource')?.invalid && firmForm.get('incomeSource')?.touched">
                </p-dropdown>
                <small class="p-error" *ngIf="firmForm.get('incomeSource')?.invalid && firmForm.get('incomeSource')?.touched">
                  Primary income source is required
                </small>
              </div>
            </div>
          </p-card>

          <!-- Investment Experience Card -->
          <p-card class="mb-4">
            <div class="grid">
              <div class="col-12 md:col-6">
                <label for="investmentExperience" class="block text-900 font-medium mb-2">
                  Overall Investment Experience <span class="text-red-500">*</span>
                </label>
                <p-dropdown
                  inputId="investmentExperience"
                  formControlName="investmentExperience"
                  [options]="investmentExperienceOptions"
                  placeholder="Select investment experience"
                  styleClass="w-full"
                  [disabled]="isReviewMode"
                  [class.ng-invalid]="firmForm.get('investmentExperience')?.invalid && firmForm.get('investmentExperience')?.touched">
                </p-dropdown>
                <small class="p-error" *ngIf="firmForm.get('investmentExperience')?.invalid && firmForm.get('investmentExperience')?.touched">
                  Overall investment experience is required
                </small>
              </div>
              
              <div class="col-12 md:col-6">
                <label for="stocksExperience" class="block text-900 font-medium mb-2">
                  Stocks Experience <span class="text-red-500">*</span>
                </label>
                <p-dropdown
                  inputId="stocksExperience"
                  formControlName="stocksExperience"
                  [options]="experienceOptions"
                  placeholder="Select stocks experience"
                  styleClass="w-full"
                  [disabled]="isReviewMode"
                  [class.ng-invalid]="firmForm.get('stocksExperience')?.invalid && firmForm.get('stocksExperience')?.touched">
                </p-dropdown>
                <small class="p-error" *ngIf="firmForm.get('stocksExperience')?.invalid && firmForm.get('stocksExperience')?.touched">
                  Stocks experience is required
                </small>
              </div>
              
              <div class="col-12 md:col-6">
                <label for="bondsExperience" class="block text-900 font-medium mb-2">
                  Bonds Experience <span class="text-red-500">*</span>
                </label>
                <p-dropdown
                  inputId="bondsExperience"
                  formControlName="bondsExperience"
                  [options]="experienceOptions"
                  placeholder="Select bonds experience"
                  styleClass="w-full"
                  [disabled]="isReviewMode"
                  [class.ng-invalid]="firmForm.get('bondsExperience')?.invalid && firmForm.get('bondsExperience')?.touched">
                </p-dropdown>
                <small class="p-error" *ngIf="firmForm.get('bondsExperience')?.invalid && firmForm.get('bondsExperience')?.touched">
                  Bonds experience is required
                </small>
              </div>
              
              <div class="col-12 md:col-6">
                <label for="optionsExperience" class="block text-900 font-medium mb-2">
                  Options/Derivatives Experience <span class="text-red-500">*</span>
                </label>
                <p-dropdown
                  inputId="optionsExperience"
                  formControlName="optionsExperience"
                  [options]="experienceOptions"
                  placeholder="Select options experience"
                  styleClass="w-full"
                  [disabled]="isReviewMode"
                  [class.ng-invalid]="firmForm.get('optionsExperience')?.invalid && firmForm.get('optionsExperience')?.touched">
                </p-dropdown>
                <small class="p-error" *ngIf="firmForm.get('optionsExperience')?.invalid && firmForm.get('optionsExperience')?.touched">
                  Options/derivatives experience is required
                </small>
              </div>
            </div>
          </p-card>

          <!-- Liquidity Needs Card -->
          <p-card class="mb-4">
            <div class="grid">
              <div class="col-12">
                <label for="liquidityNeeds" class="block text-900 font-medium mb-2">
                  How much of your portfolio do you need to access within 2 years? <span class="text-red-500">*</span>
                </label>
                <p-dropdown
                  inputId="liquidityNeeds"
                  formControlName="liquidityNeeds"
                  [options]="liquidityNeedsOptions"
                  placeholder="Select liquidity needs"
                  styleClass="w-full"
                  [disabled]="isReviewMode"
                  [class.ng-invalid]="firmForm.get('liquidityNeeds')?.invalid && firmForm.get('liquidityNeeds')?.touched">
                </p-dropdown>
                <small class="p-error" *ngIf="firmForm.get('liquidityNeeds')?.invalid && firmForm.get('liquidityNeeds')?.touched">
                  Portfolio liquidity needs are required
                </small>
              </div>
              
              <div class="col-12">
                <label for="emergencyFund" class="block text-900 font-medium mb-2">
                  Do you have an emergency fund outside of this account? <span class="text-red-500">*</span>
                </label>
                <p-dropdown
                  inputId="emergencyFund"
                  formControlName="emergencyFund"
                  [options]="emergencyFundOptions"
                  placeholder="Select emergency fund status"
                  styleClass="w-full"
                  [disabled]="isReviewMode"
                  [class.ng-invalid]="firmForm.get('emergencyFund')?.invalid && firmForm.get('emergencyFund')?.touched">
                </p-dropdown>
                <small class="p-error" *ngIf="firmForm.get('emergencyFund')?.invalid && firmForm.get('emergencyFund')?.touched">
                  Emergency fund status is required
                </small>
              </div>
              
              <div class="col-12">
                <label for="liquidityPurpose" class="block text-900 font-medium mb-2">
                  If you need liquidity, what would be the primary purpose?
                </label>
                <textarea
                  pInputTextarea
                  id="liquidityPurpose"
                  formControlName="liquidityPurpose"
                  rows="2"
                  placeholder="e.g., home purchase, education, medical expenses, etc."
                  class="w-full"
                  [disabled]="isReviewMode">
                </textarea>
              </div>
            </div>
          </p-card>

          <!-- Market Conditions Card -->
          <p-card class="mb-4">
            <div class="grid">
              <div class="col-12">
                <label class="block text-900 font-medium mb-3">
                  If your investment portfolio declined by 10% in one month, you would: <span class="text-red-500">*</span>
                </label>
                
                <div class="field-radiobutton mb-3">
                  <p-radioButton
                    inputId="scenario1_sell-all"
                    name="scenario1"
                    value="sell-all"
                    formControlName="scenario1"
                    [disabled]="isReviewMode">
                  </p-radioButton>
                  <label for="scenario1_sell-all" class="ml-2">
                    Sell all investments immediately
                  </label>
                </div>
                
                <div class="field-radiobutton mb-3">
                  <p-radioButton
                    inputId="scenario1_sell-some"
                    name="scenario1"
                    value="sell-some"
                    formControlName="scenario1"
                    [disabled]="isReviewMode">
                  </p-radioButton>
                  <label for="scenario1_sell-some" class="ml-2">
                    Sell some investments to reduce risk
                  </label>
                </div>
                
                <div class="field-radiobutton mb-3">
                  <p-radioButton
                    inputId="scenario1_hold"
                    name="scenario1"
                    value="hold"
                    formControlName="scenario1"
                    [disabled]="isReviewMode">
                  </p-radioButton>
                  <label for="scenario1_hold" class="ml-2">
                    Hold your investments and wait for recovery
                  </label>
                </div>
                
                <div class="field-radiobutton mb-3">
                  <p-radioButton
                    inputId="scenario1_buy-more"
                    name="scenario1"
                    value="buy-more"
                    formControlName="scenario1"
                    [disabled]="isReviewMode">
                  </p-radioButton>
                  <label for="scenario1_buy-more" class="ml-2">
                    Buy more investments at lower prices
                  </label>
                </div>
                
                <small class="p-error" *ngIf="firmForm.get('scenario1')?.invalid && firmForm.get('scenario1')?.touched">
                  Market decline response is required
                </small>
              </div>
            </div>
          </p-card>
        </div>

        <!-- Account Firm Details -->
        <div *ngIf="!isMemberEntity">
          
          <!-- Account Firm Details Card -->
          <p-card class="mb-4">
            <div class="grid">
              <div class="col-12">
                <label for="investmentObjectives" class="block text-900 font-medium mb-2">
                  Investment Objectives <span class="text-red-500">*</span>
                </label>
                <textarea
                  pInputTextarea
                  id="investmentObjectives"
                  formControlName="investmentObjectives"
                  rows="4"
                  placeholder="Describe the investment objectives for this account..."
                  class="w-full"
                  [disabled]="isReviewMode"
                  [class.ng-invalid]="firmForm.get('investmentObjectives')?.invalid && firmForm.get('investmentObjectives')?.touched">
                </textarea>
                <small class="p-error" *ngIf="firmForm.get('investmentObjectives')?.invalid && firmForm.get('investmentObjectives')?.touched">
                  Investment objectives are required
                </small>
              </div>
              
              <div class="col-12">
                <label for="recommendations" class="block text-900 font-medium mb-2">
                  Recommendations <span class="text-red-500">*</span>
                </label>
                <textarea
                  pInputTextarea
                  id="recommendations"
                  formControlName="recommendations"
                  rows="4"
                  placeholder="Provide investment recommendations for this account..."
                  class="w-full"
                  [disabled]="isReviewMode"
                  [class.ng-invalid]="firmForm.get('recommendations')?.invalid && firmForm.get('recommendations')?.touched">
                </textarea>
                <small class="p-error" *ngIf="firmForm.get('recommendations')?.invalid && firmForm.get('recommendations')?.touched">
                  Recommendations are required
                </small>
              </div>
              
              <div class="col-12">
                <label for="alternativeSuggestions" class="block text-900 font-medium mb-2">
                  Alternative Suggestions <span class="text-red-500">*</span>
                </label>
                <textarea
                  pInputTextarea
                  id="alternativeSuggestions"
                  formControlName="alternativeSuggestions"
                  rows="4"
                  placeholder="Suggest alternative investment options for this account..."
                  class="w-full"
                  [disabled]="isReviewMode"
                  [class.ng-invalid]="firmForm.get('alternativeSuggestions')?.invalid && firmForm.get('alternativeSuggestions')?.touched">
                </textarea>
                <small class="p-error" *ngIf="firmForm.get('alternativeSuggestions')?.invalid && firmForm.get('alternativeSuggestions')?.touched">
                  Alternative suggestions are required
                </small>
              </div>
            </div>
          </p-card>
        </div>

      </form>
    </div>
  `,
  styles: [`
    .firm-details-section {
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

    .field-radiobutton {
      display: flex;
      align-items: center;
      margin-bottom: 1rem;
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

    .text-red-500 {
      color: #ef4444;
    }
  `]
})
export class FirmDetailsComponent implements OnInit {
  @Input() formData: FormData = {};
  @Input() entityId: string = '';
  @Input() isReviewMode: boolean = false;
  @Input() isMemberEntity: boolean = true; // Determines which form to show
  @Output() formDataChange = new EventEmitter<FormData>();

  firmForm!: FormGroup;

  // Dropdown options exactly matching V2 specification
  totalNetWorthOptions: DropdownOption[] = [
    { label: 'Under $250,000', value: 'under-250k' },
    { label: '$250,000 - $500,000', value: '250k-500k' },
    { label: '$500,000 - $1,000,000', value: '500k-1m' },
    { label: '$1,000,000 - $5,000,000', value: '1m-5m' },
    { label: 'Over $5,000,000', value: 'over-5m' }
  ];

  liquidNetWorthOptions: DropdownOption[] = [
    { label: 'Under $100,000', value: 'under-100k' },
    { label: '$100,000 - $250,000', value: '100k-250k' },
    { label: '$250,000 - $500,000', value: '250k-500k' },
    { label: '$500,000 - $1,000,000', value: '500k-1m' },
    { label: 'Over $1,000,000', value: 'over-1m' }
  ];

  averageIncomeOptions: DropdownOption[] = [
    { label: 'Under $75,000', value: 'under-75k' },
    { label: '$75,000 - $150,000', value: '75k-150k' },
    { label: '$150,000 - $300,000', value: '150k-300k' },
    { label: '$300,000 - $500,000', value: '300k-500k' },
    { label: 'Over $500,000', value: 'over-500k' }
  ];

  incomeSourceOptions: DropdownOption[] = [
    { label: 'Employment/Salary', value: 'employment' },
    { label: 'Business Ownership', value: 'business' },
    { label: 'Investment Income', value: 'investments' },
    { label: 'Retirement/Pension', value: 'retirement' },
    { label: 'Other', value: 'other' }
  ];

  investmentExperienceOptions: DropdownOption[] = [
    { label: 'No Experience', value: 'none' },
    { label: 'Limited (1-3 years)', value: 'limited' },
    { label: 'Moderate (3-10 years)', value: 'moderate' },
    { label: 'Extensive (10+ years)', value: 'extensive' },
    { label: 'Professional', value: 'professional' }
  ];

  experienceOptions: DropdownOption[] = [
    { label: 'None', value: 'none' },
    { label: 'Limited', value: 'limited' },
    { label: 'Moderate', value: 'moderate' },
    { label: 'Extensive', value: 'extensive' }
  ];

  liquidityNeedsOptions: DropdownOption[] = [
    { label: 'None (0%)', value: 'none' },
    { label: 'Low (1-10%)', value: 'low' },
    { label: 'Moderate (11-25%)', value: 'moderate' },
    { label: 'High (26-50%)', value: 'high' },
    { label: 'Very High (50%+)', value: 'very-high' }
  ];

  emergencyFundOptions: DropdownOption[] = [
    { label: 'Yes, 6+ months expenses', value: 'yes' },
    { label: 'Yes, 3-6 months expenses', value: 'partial' },
    { label: 'Yes, less than 3 months', value: 'minimal' },
    { label: 'No emergency fund', value: 'no' }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.initializeForm();
    this.loadFormData();
    this.setupFormSubscriptions();
  }

  private initializeForm() {
    if (this.isMemberEntity) {
      // Member firm details form
      this.firmForm = this.fb.group({
        totalNetWorth: ['', Validators.required],
        liquidNetWorth: ['', Validators.required],
        averageAnnualIncome: ['', Validators.required],
        incomeSource: ['', Validators.required],
        investmentExperience: ['', Validators.required],
        stocksExperience: ['', Validators.required],
        bondsExperience: ['', Validators.required],
        optionsExperience: ['', Validators.required],
        liquidityNeeds: ['', Validators.required],
        emergencyFund: ['', Validators.required],
        liquidityPurpose: [''],
        scenario1: ['', Validators.required]
      });
    } else {
      // Account firm details form
      this.firmForm = this.fb.group({
        investmentObjectives: ['', Validators.required],
        recommendations: ['', Validators.required],
        alternativeSuggestions: ['', Validators.required]
      });
    }
  }

  private loadFormData() {
    if (this.formData && this.formData[this.entityId]) {
      const entityData = this.formData[this.entityId];
      this.firmForm.patchValue(entityData);
    }
  }

  private setupFormSubscriptions() {
    this.firmForm.valueChanges.subscribe(() => {
      this.updateFormData();
    });
  }

  private updateFormData() {
    const updatedFormData = { ...this.formData };
    if (!updatedFormData[this.entityId]) {
      updatedFormData[this.entityId] = {};
    }
    
    Object.assign(updatedFormData[this.entityId], this.firmForm.value);
    this.formDataChange.emit(updatedFormData);
  }

  onSubmit() {
    if (this.firmForm.valid) {
      this.updateFormData();
    }
  }
}