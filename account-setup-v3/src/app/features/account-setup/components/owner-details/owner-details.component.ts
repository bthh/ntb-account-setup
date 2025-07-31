import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

// PrimeNG Imports
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CheckboxModule } from 'primeng/checkbox';
import { FileUploadModule } from 'primeng/fileupload';
import { CardModule } from 'primeng/card';
import { InputMaskModule } from 'primeng/inputmask';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';

// Local Imports
import { FormData } from '../../../../shared/models/types';

interface DropdownOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-owner-details',
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
    FileUploadModule,
    CardModule,
    InputMaskModule,
    RadioButtonModule,
    ButtonModule,
    DividerModule
  ],
  template: `
    <div class="owner-details-section">
      <form [formGroup]="ownerForm" (ngSubmit)="onSubmit()">
        
        <!-- Personal Information Card -->
        <p-card header="Personal Information" class="mb-4">
          <div class="grid">
            <div class="col-12 md:col-4">
              <label for="firstName" class="block text-900 font-medium mb-2">
                First Name <span class="text-red-500">*</span>
              </label>
              <input
                pInputText
                id="firstName"
                formControlName="firstName"
                placeholder="First name"
                class="w-full"
                [disabled]="isReviewMode"
                [class.ng-invalid]="ownerForm.get('firstName')?.invalid && ownerForm.get('firstName')?.touched" />
              <small class="p-error" *ngIf="ownerForm.get('firstName')?.invalid && ownerForm.get('firstName')?.touched">
                First name is required (minimum 2 characters)
              </small>
            </div>
            
            <div class="col-12 md:col-4">
              <label for="middleInitial" class="block text-900 font-medium mb-2">
                Middle Initial
              </label>
              <input
                pInputText
                id="middleInitial"
                formControlName="middleInitial"
                placeholder="Middle initial"
                class="w-full"
                [disabled]="isReviewMode" />
            </div>
            
            <div class="col-12 md:col-4">
              <label for="lastName" class="block text-900 font-medium mb-2">
                Last Name <span class="text-red-500">*</span>
              </label>
              <input
                pInputText
                id="lastName"
                formControlName="lastName"
                placeholder="Last name"
                class="w-full"
                [disabled]="isReviewMode"
                [class.ng-invalid]="ownerForm.get('lastName')?.invalid && ownerForm.get('lastName')?.touched" />
              <small class="p-error" *ngIf="ownerForm.get('lastName')?.invalid && ownerForm.get('lastName')?.touched">
                Last name is required (minimum 2 characters)
              </small>
            </div>
            
            <div class="col-12 md:col-6">
              <label for="dateOfBirth" class="block text-900 font-medium mb-2">
                Date of Birth <span class="text-red-500">*</span>
              </label>
              <p-calendar
                inputId="dateOfBirth"
                formControlName="dateOfBirth"
                [showIcon]="true"
                dateFormat="mm/dd/yy"
                placeholder="mm/dd/yyyy"
                styleClass="w-full"
                [disabled]="isReviewMode"
                [maxDate]="maxDate"
                [class.ng-invalid]="ownerForm.get('dateOfBirth')?.invalid && ownerForm.get('dateOfBirth')?.touched">
              </p-calendar>
              <small class="p-error" *ngIf="ownerForm.get('dateOfBirth')?.invalid && ownerForm.get('dateOfBirth')?.touched">
                <span *ngIf="ownerForm.get('dateOfBirth')?.errors?.['required']">Date of birth is required</span>
                <span *ngIf="ownerForm.get('dateOfBirth')?.errors?.['futureDate']">Date of birth cannot be in the future</span>
                <span *ngIf="ownerForm.get('dateOfBirth')?.errors?.['minimumAge']">Account holder must be at least 18 years old</span>
              </small>
            </div>
            
            <div class="col-12 md:col-6">
              <label for="ssn" class="block text-900 font-medium mb-2">
                Social Security Number <span class="text-red-500">*</span>
              </label>
              <p-inputMask
                inputId="ssn"
                formControlName="ssn"
                mask="999-99-9999"
                placeholder="***-**-****"
                styleClass="w-full"
                [disabled]="isReviewMode"
                [class.ng-invalid]="ownerForm.get('ssn')?.invalid && ownerForm.get('ssn')?.touched">
              </p-inputMask>
              <small class="p-error" *ngIf="ownerForm.get('ssn')?.invalid && ownerForm.get('ssn')?.touched">
                Please enter SSN in format: XXX-XX-XXXX
              </small>
            </div>
            
            <div class="col-12 md:col-6">
              <label for="phoneHome" class="block text-900 font-medium mb-2">
                Phone (Home) <span class="text-red-500">*</span>
              </label>
              <p-inputMask
                inputId="phoneHome"
                formControlName="phoneHome"
                mask="(999) 999-9999"
                placeholder="(XXX) XXX-XXXX"
                styleClass="w-full"
                [disabled]="isReviewMode"
                [class.ng-invalid]="ownerForm.get('phoneHome')?.invalid && ownerForm.get('phoneHome')?.touched">
              </p-inputMask>
              <small class="p-error" *ngIf="ownerForm.get('phoneHome')?.invalid && ownerForm.get('phoneHome')?.touched">
                Please enter phone number in format: (XXX) XXX-XXXX
              </small>
            </div>
            
            <div class="col-12 md:col-6">
              <label for="phoneMobile" class="block text-900 font-medium mb-2">
                Phone (Mobile)
              </label>
              <p-inputMask
                inputId="phoneMobile"
                formControlName="phoneMobile"
                mask="(999) 999-9999"
                placeholder="(XXX) XXX-XXXX"
                styleClass="w-full"
                [disabled]="isReviewMode">
              </p-inputMask>
              <small class="text-orange-500 text-xs">
                Recommended for account notifications
              </small>
            </div>
            
            <div class="col-12">
              <label for="email" class="block text-900 font-medium mb-2">
                Email Address <span class="text-red-500">*</span>
              </label>
              <input
                pInputText
                id="email"
                type="email"
                formControlName="email"
                placeholder="Email address"
                class="w-full"
                [disabled]="isReviewMode"
                [class.ng-invalid]="ownerForm.get('email')?.invalid && ownerForm.get('email')?.touched" />
              <small class="p-error" *ngIf="ownerForm.get('email')?.invalid && ownerForm.get('email')?.touched">
                Please enter a valid email address
              </small>
            </div>
          </div>
        </p-card>

        <!-- Address Information Card -->
        <p-card header="Address Information" class="mb-4">
          <div class="grid">
            <div class="col-12">
              <label for="homeAddress" class="block text-900 font-medium mb-2">
                Home Address <span class="text-red-500">*</span>
              </label>
              <input
                pInputText
                id="homeAddress"
                formControlName="homeAddress"
                placeholder="Full home address"
                class="w-full"
                [disabled]="isReviewMode"
                [class.ng-invalid]="ownerForm.get('homeAddress')?.invalid && ownerForm.get('homeAddress')?.touched" />
              <small class="p-error" *ngIf="ownerForm.get('homeAddress')?.invalid && ownerForm.get('homeAddress')?.touched">
                Home address is required (minimum 10 characters)
              </small>
            </div>
            
            <div class="col-12">
              <label for="mailingAddress" class="block text-900 font-medium mb-2">
                Mailing Address
              </label>
              <input
                pInputText
                id="mailingAddress"
                formControlName="mailingAddress"
                placeholder="Full mailing address"
                class="w-full"
                [disabled]="isReviewMode" />
              <small class="text-orange-500 text-xs">
                Consider specifying if different from home address
              </small>
            </div>
            
            <div class="col-12 md:col-6">
              <label for="citizenship" class="block text-900 font-medium mb-2">
                Citizenship Type <span class="text-red-500">*</span>
              </label>
              <p-dropdown
                inputId="citizenship"
                formControlName="citizenship"
                [options]="citizenshipOptions"
                placeholder="Select citizenship type"
                styleClass="w-full"
                [disabled]="isReviewMode"
                [class.ng-invalid]="ownerForm.get('citizenship')?.invalid && ownerForm.get('citizenship')?.touched">
              </p-dropdown>
              <small class="p-error" *ngIf="ownerForm.get('citizenship')?.invalid && ownerForm.get('citizenship')?.touched">
                Citizenship type is required
              </small>
            </div>
          </div>
        </p-card>

        <!-- Identification Card -->
        <p-card header="Identification" class="mb-4">
          <div class="grid">
            <div class="col-12">
              <label class="block text-900 font-medium mb-2">
                Upload ID Document
              </label>
              <p-fileUpload
                mode="basic"
                accept="image/*,.pdf"
                [disabled]="isReviewMode"
                chooseLabel="Choose Document">
              </p-fileUpload>
            </div>
          </div>
        </p-card>

        <!-- Employment Information Card -->
        <p-card header="Employment Information" class="mb-4">
          <div class="grid">
            <div class="col-12 md:col-6">
              <label for="employmentStatus" class="block text-900 font-medium mb-2">
                Employment Status <span class="text-red-500">*</span>
              </label>
              <p-dropdown
                inputId="employmentStatus"
                formControlName="employmentStatus"
                [options]="employmentOptions"
                placeholder="Select employment status"
                styleClass="w-full"
                [disabled]="isReviewMode"
                [class.ng-invalid]="ownerForm.get('employmentStatus')?.invalid && ownerForm.get('employmentStatus')?.touched">
              </p-dropdown>
              <small class="p-error" *ngIf="ownerForm.get('employmentStatus')?.invalid && ownerForm.get('employmentStatus')?.touched">
                Employment status is required
              </small>
            </div>
            
            <div class="col-12 md:col-6">
              <label for="annualIncome" class="block text-900 font-medium mb-2">
                Annual Income Range <span class="text-red-500">*</span>
              </label>
              <p-dropdown
                inputId="annualIncome"
                formControlName="annualIncome"
                [options]="incomeOptions"
                placeholder="Select income range"
                styleClass="w-full"
                [disabled]="isReviewMode"
                [class.ng-invalid]="ownerForm.get('annualIncome')?.invalid && ownerForm.get('annualIncome')?.touched">
              </p-dropdown>
              <small class="p-error" *ngIf="ownerForm.get('annualIncome')?.invalid && ownerForm.get('annualIncome')?.touched">
                Annual income is required
              </small>
            </div>
            
            <div class="col-12 md:col-6">
              <label for="netWorth" class="block text-900 font-medium mb-2">
                Net Worth Range <span class="text-red-500">*</span>
              </label>
              <p-dropdown
                inputId="netWorth"
                formControlName="netWorth"
                [options]="netWorthOptions"
                placeholder="Select net worth range"
                styleClass="w-full"
                [disabled]="isReviewMode"
                [class.ng-invalid]="ownerForm.get('netWorth')?.invalid && ownerForm.get('netWorth')?.touched">
              </p-dropdown>
              <small class="p-error" *ngIf="ownerForm.get('netWorth')?.invalid && ownerForm.get('netWorth')?.touched">
                Net worth range is required
              </small>
            </div>
            
            <div class="col-12">
              <label for="fundsSource" class="block text-900 font-medium mb-2">
                Source of Funds <span class="text-red-500">*</span>
              </label>
              <textarea
                pInputTextarea
                id="fundsSource"
                formControlName="fundsSource"
                rows="3"
                placeholder="Please describe the source of funds for this account..."
                class="w-full"
                [disabled]="isReviewMode"
                [class.ng-invalid]="ownerForm.get('fundsSource')?.invalid && ownerForm.get('fundsSource')?.touched">
              </textarea>
              <small class="p-error" *ngIf="ownerForm.get('fundsSource')?.invalid && ownerForm.get('fundsSource')?.touched">
                Source of funds is required
              </small>
            </div>
          </div>
        </p-card>

        <!-- Disclosure Questions Card -->
        <p-card header="Disclosure Questions" class="mb-4">
          <div class="grid">
            <div class="col-12">
              <div class="field-checkbox">
                <p-checkbox
                  inputId="affiliatedFirm"
                  formControlName="affiliatedFirm"
                  [binary]="true"
                  [disabled]="isReviewMode">
                </p-checkbox>
                <label for="affiliatedFirm" class="ml-2">
                  I am affiliated with a financial services firm
                </label>
              </div>
            </div>
            
            <div class="col-12">
              <div class="field-checkbox">
                <p-checkbox
                  inputId="professionalAdvisor"
                  formControlName="professionalAdvisor"
                  [binary]="true"
                  [disabled]="isReviewMode">
                </p-checkbox>
                <label for="professionalAdvisor" class="ml-2">
                  I am a professional financial advisor
                </label>
              </div>
            </div>
          </div>
        </p-card>

        <!-- Trusted Contact Information Card -->
        <p-card header="Trusted Contact Information" class="mb-4">
          <div class="grid">
            <div class="col-12 md:col-6">
              <label for="trustedName" class="block text-900 font-medium mb-2">
                Contact Name
              </label>
              <input
                pInputText
                id="trustedName"
                formControlName="trustedName"
                placeholder="Full name"
                class="w-full"
                [disabled]="isReviewMode" />
            </div>
            
            <div class="col-12 md:col-6">
              <label for="trustedPhone" class="block text-900 font-medium mb-2">
                Contact Phone
              </label>
              <p-inputMask
                inputId="trustedPhone"
                formControlName="trustedPhone"
                mask="(999) 999-9999"
                placeholder="Phone number"
                styleClass="w-full"
                [disabled]="isReviewMode">
              </p-inputMask>
            </div>
            
            <div class="col-12 md:col-6">
              <label for="trustedEmail" class="block text-900 font-medium mb-2">
                Contact Email
              </label>
              <input
                pInputText
                id="trustedEmail"
                type="email"
                formControlName="trustedEmail"
                placeholder="Email address"
                class="w-full"
                [disabled]="isReviewMode" />
            </div>
            
            <div class="col-12 md:col-6">
              <label for="trustedRelationship" class="block text-900 font-medium mb-2">
                Relationship
              </label>
              <p-dropdown
                inputId="trustedRelationship"
                formControlName="trustedRelationship"
                [options]="relationshipOptions"
                placeholder="Select relationship"
                styleClass="w-full"
                [disabled]="isReviewMode">
              </p-dropdown>
            </div>
          </div>
        </p-card>

      </form>
    </div>
  `,
  styles: [`
    .owner-details-section {
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

    .field-checkbox {
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

    .text-orange-500 {
      color: #f97316;
    }

    .text-xs {
      font-size: 0.75rem;
    }
  `]
})
export class OwnerDetailsComponent implements OnInit, OnChanges {
  @Input() formData: FormData = {};
  @Input() entityId: string = '';
  @Input() isReviewMode: boolean = false;
  @Output() formDataChange = new EventEmitter<FormData>();

  ownerForm!: FormGroup;
  maxDate: Date = new Date();

  // Dropdown options exactly matching V2
  citizenshipOptions: DropdownOption[] = [
    { label: 'US Citizen', value: 'us-citizen' },
    { label: 'Permanent Resident', value: 'permanent-resident' },
    { label: 'Non-Resident Alien', value: 'non-resident' }
  ];

  employmentOptions: DropdownOption[] = [
    { label: 'Employed', value: 'employed' },
    { label: 'Self-Employed', value: 'self-employed' },
    { label: 'Retired', value: 'retired' },
    { label: 'Unemployed', value: 'unemployed' }
  ];

  incomeOptions: DropdownOption[] = [
    { label: 'Under $50,000', value: 'under-50k' },
    { label: '$50,000 - $100,000', value: '50k-100k' },
    { label: '$100,000 - $250,000', value: '100k-250k' },
    { label: '$250,000 - $500,000', value: '250k-500k' },
    { label: 'Over $500,000', value: 'over-500k' }
  ];

  netWorthOptions: DropdownOption[] = [
    { label: 'Under $100,000', value: 'under-100k' },
    { label: '$100,000 - $500,000', value: '100k-500k' },
    { label: '$500,000 - $1,000,000', value: '500k-1m' },
    { label: '$1,000,000 - $5,000,000', value: '1m-5m' },
    { label: 'Over $5,000,000', value: 'over-5m' }
  ];

  relationshipOptions: DropdownOption[] = [
    { label: 'Spouse', value: 'spouse' },
    { label: 'Parent', value: 'parent' },
    { label: 'Child', value: 'child' },
    { label: 'Sibling', value: 'sibling' },
    { label: 'Friend', value: 'friend' },
    { label: 'Other', value: 'other' }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.initializeForm();
    this.loadFormData();
    this.setupFormSubscriptions();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['formData'] || changes['entityId']) {
      if (this.ownerForm) {
        this.loadFormData();
      }
    }
  }

  private initializeForm() {
    this.ownerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      middleInitial: [''],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      dateOfBirth: ['', [Validators.required, this.futureDateValidator, this.minimumAgeValidator]],
      ssn: ['', [Validators.required, this.ssnValidator]],
      phoneHome: ['', [Validators.required, this.phoneValidator]],
      phoneMobile: [''],
      email: ['', [Validators.required, Validators.email]],
      homeAddress: ['', [Validators.required, Validators.minLength(10)]],
      mailingAddress: [''],
      citizenship: ['', Validators.required],
      employmentStatus: ['', Validators.required],
      annualIncome: ['', Validators.required],
      netWorth: ['', Validators.required],
      fundsSource: ['', Validators.required],
      affiliatedFirm: [false],
      professionalAdvisor: [false],
      trustedName: [''],
      trustedPhone: [''],
      trustedEmail: [''],
      trustedRelationship: ['']
    });
  }

  private loadFormData() {
    if (this.formData && this.formData[this.entityId]) {
      const entityData = this.formData[this.entityId];
      this.ownerForm.patchValue(entityData);
    }
  }

  private setupFormSubscriptions() {
    this.ownerForm.valueChanges.subscribe(() => {
      this.updateFormData();
    });
  }

  private updateFormData() {
    const updatedFormData = { ...this.formData };
    if (!updatedFormData[this.entityId]) {
      updatedFormData[this.entityId] = {};
    }
    
    Object.assign(updatedFormData[this.entityId], this.ownerForm.value);
    this.formDataChange.emit(updatedFormData);
  }

  // Custom validators matching V2 exactly
  private futureDateValidator(control: any) {
    if (!control.value) return null;
    const selectedDate = new Date(control.value);
    const today = new Date();
    return selectedDate > today ? { futureDate: true } : null;
  }

  private minimumAgeValidator(control: any) {
    if (!control.value) return null;
    const selectedDate = new Date(control.value);
    const today = new Date();
    const age = today.getFullYear() - selectedDate.getFullYear();
    const monthDiff = today.getMonth() - selectedDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < selectedDate.getDate())) {
      return age < 18 ? { minimumAge: true } : null;
    }
    
    return age < 18 ? { minimumAge: true } : null;
  }

  private ssnValidator(control: any) {
    if (!control.value) return null;
    const ssnRegex = /^\d{3}-\d{2}-\d{4}$/;
    return ssnRegex.test(control.value) ? null : { invalidSsn: true };
  }

  private phoneValidator(control: any) {
    if (!control.value) return null;
    const phoneRegex = /^\(\d{3}\)\s\d{3}-\d{4}$/;
    return phoneRegex.test(control.value) ? null : { invalidPhone: true };
  }

  onSubmit() {
    if (this.ownerForm.valid) {
      this.updateFormData();
    }
  }
}