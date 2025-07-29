export type Section = 'owner-details' | 'firm-details' | 'account-setup' | 'funding';

export interface FormData {
  [key: string]: any;
}

export interface CompletionStatus {
  members: {
    [memberId: string]: {
      [section: string]: boolean;
    };
  };
  accounts: {
    [accountId: string]: {
      [section: string]: boolean;
    };
  };
}

export interface AccountFormProps {
  section: Section;
  memberId: string;
  accountId: string;
  isReviewMode: boolean;
  formData: FormData;
  setFormData: (data: FormData) => void;
  completionStatus: CompletionStatus;
  setCompletionStatus: (status: CompletionStatus) => void;
}

export interface RequiredFields {
  [section: string]: string[];
}