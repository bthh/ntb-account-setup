import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// PrimeNG Imports
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputMaskModule } from 'primeng/inputmask';

// Local Imports
import { FormData, CompletionStatus, Section } from '../../../../shared/models/types';
import { OwnerDetailsComponent } from '../owner-details/owner-details.component';
import { FirmDetailsComponent } from '../firm-details/firm-details.component';
import { AccountSetupComponent } from '../account-setup/account-setup.component';
import { FundingComponent } from '../funding/funding.component';

@Component({
  selector: 'app-account-form',
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
    ButtonModule,
    CardModule,
    InputMaskModule,
    OwnerDetailsComponent,
    FirmDetailsComponent,
    AccountSetupComponent,
    FundingComponent
  ],
  template: `
    <div class="account-form">
      <div class="p-4">
        <h2>{{getSectionTitle()}}</h2>
        
        <!-- Owner Details Section -->
        <app-owner-details
          *ngIf="section === 'owner-details'"
          [formData]="formData"
          [entityId]="getCurrentEntityId()"
          [isReviewMode]="isReviewMode"
          (formDataChange)="onFormDataUpdate($event)">
        </app-owner-details>
        
        <!-- Firm Details Section -->
        <app-firm-details
          *ngIf="section === 'firm-details'"
          [formData]="formData"
          [entityId]="getCurrentEntityId()"
          [isReviewMode]="isReviewMode"
          [isMemberEntity]="!!memberId"
          (formDataChange)="onFormDataUpdate($event)">
        </app-firm-details>
        
        <!-- Account Setup Section -->
        <app-account-setup
          *ngIf="section === 'account-setup'"
          [formData]="formData"
          [entityId]="getCurrentEntityId()"
          [isReviewMode]="isReviewMode"
          (formDataChange)="onFormDataUpdate($event)">
        </app-account-setup>
        
        <!-- Funding Section -->
        <app-funding
          *ngIf="section === 'funding'"
          [formData]="formData"
          [entityId]="getCurrentEntityId()"
          [isReviewMode]="isReviewMode"
          (formDataChange)="onFormDataUpdate($event)">
        </app-funding>
      </div>
    </div>
  `,
  styles: [`
    .account-form {
      height: 100%;
      overflow-y: auto;
      padding-bottom: 2rem;
    }
  `]
})
export class AccountFormComponent {
  @Input() section: Section = 'owner-details';
  @Input() memberId: string = '';
  @Input() accountId: string = '';
  @Input() isReviewMode: boolean = false;
  @Input() formData: FormData = {};
  @Input() completionStatus: CompletionStatus = { members: {}, accounts: {} };
  @Input() canGoPrevious: boolean = false;
  @Input() canGoNext: boolean = false;

  @Output() formDataChange = new EventEmitter<FormData>();
  @Output() completionStatusChange = new EventEmitter<CompletionStatus>();
  @Output() previous = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();

  constructor() {}

  getSectionTitle(): string {
    const titles: {[key: string]: string} = {
      'owner-details': 'Personal Details',
      'firm-details': 'Firm Details',
      'account-setup': 'Account Setup',
      'funding': 'Funding'
    };
    return titles[this.section] || 'Form Section';
  }

  onPrevious() {
    this.previous.emit();
  }

  onNext() {
    this.next.emit();
  }

  getCurrentEntityId(): string {
    return this.memberId || this.accountId;
  }

  onFormDataUpdate(updatedFormData: FormData) {
    this.formDataChange.emit(updatedFormData);
  }

}