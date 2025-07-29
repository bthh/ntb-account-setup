// Account Setup Form JavaScript
let isReviewMode = false;
let currentSection = null;
let currentData = null;

// Completion status tracking
let completionStatus = {
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
        'individual-account': {
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

// Define required fields for each screen/section
const requiredFields = {
    'owner-details': [
        'firstName', 'lastName', 'dateOfBirth', 'ssn', 
        'phoneHome', 'email', 'homeAddress', 'citizenship'
    ],
    'firm-details': [
        'employmentStatus', 'annualIncome', 'netWorth', 'fundsSource'
    ],
    'account-setup': [
        'accountType', 'investmentObjective', 'riskTolerance'
    ],
    'funding': [
        'initialDeposit', 'fundingMethod', 'bankAccount'
    ]
};

document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    setupFileUpload();
    setupFormValidation();
    setupFormSaving();
    setupNavigationSidebar();
    setupReviewToggle();
    initializeCompletionStatus();
});

// Completion Status Functions
function checkSectionCompletion(sectionName) {
    const fields = requiredFields[sectionName];
    if (!fields) return false;
    
    return fields.every(fieldName => {
        const field = document.getElementById(fieldName) || document.querySelector(`[name="${fieldName}"]`);
        if (!field) return false;
        
        if (field.type === 'checkbox' || field.type === 'radio') {
            return field.checked;
        } else if (field.tagName === 'SELECT') {
            return field.value && field.value !== '';
        } else {
            return field.value && field.value.trim() !== '';
        }
    });
}

function updateCompletionStatus(type, id, section, isComplete) {
    if (type === 'member') {
        completionStatus.members[id][section] = isComplete;
    } else if (type === 'account') {
        completionStatus.accounts[id][section] = isComplete;
    }
    
    updateVisualCompletionStatus();
    updateParentCompletionStatus();
}

function checkAndUpdateSectionStatus(sectionName) {
    const isComplete = checkSectionCompletion(sectionName);
    
    // Update status for all relevant members/accounts that have this section
    Object.keys(completionStatus.members).forEach(memberId => {
        if (completionStatus.members[memberId].hasOwnProperty(sectionName)) {
            updateCompletionStatus('member', memberId, sectionName, isComplete);
        }
    });
    
    Object.keys(completionStatus.accounts).forEach(accountId => {
        if (completionStatus.accounts[accountId].hasOwnProperty(sectionName)) {
            updateCompletionStatus('account', accountId, sectionName, isComplete);
        }
    });
}

function updateVisualCompletionStatus() {
    // Update member completion status
    Object.keys(completionStatus.members).forEach(memberId => {
        Object.keys(completionStatus.members[memberId]).forEach(section => {
            const isComplete = completionStatus.members[memberId][section];
            const detailItem = document.querySelector(`[data-member="${memberId}"] + .member-details [data-section="${section}"] .completion-status`);
            if (detailItem) {
                detailItem.className = `completion-status ${isComplete ? 'complete' : 'incomplete'}`;
            }
        });
    });
    
    // Update account completion status
    Object.keys(completionStatus.accounts).forEach(accountId => {
        Object.keys(completionStatus.accounts[accountId]).forEach(section => {
            const isComplete = completionStatus.accounts[accountId][section];
            const detailItem = document.querySelector(`[data-account="${accountId}"] + .account-details [data-section="${section}"] .completion-status`);
            if (detailItem) {
                detailItem.className = `completion-status ${isComplete ? 'complete' : 'incomplete'}`;
            }
        });
    });
}

function updateParentCompletionStatus() {
    // Update member parent status
    Object.keys(completionStatus.members).forEach(memberId => {
        const memberSections = completionStatus.members[memberId];
        const allComplete = Object.values(memberSections).every(status => status === true);
        
        const memberHeader = document.querySelector(`[data-member="${memberId}"] .completion-status`);
        if (memberHeader) {
            memberHeader.className = `completion-status ${allComplete ? 'complete' : 'incomplete'}`;
        }
    });
    
    // Update account parent status
    Object.keys(completionStatus.accounts).forEach(accountId => {
        const accountSections = completionStatus.accounts[accountId];
        const allComplete = Object.values(accountSections).every(status => status === true);
        
        const accountHeader = document.querySelector(`[data-account="${accountId}"] .completion-status`);
        if (accountHeader) {
            accountHeader.className = `completion-status ${allComplete ? 'complete' : 'incomplete'}`;
        }
    });
}

function initializeCompletionStatus() {
    // Initialize all visual indicators
    updateVisualCompletionStatus();
    updateParentCompletionStatus();
    
    // For demo purposes, mark some sections as complete to show the functionality
    updateCompletionStatus('member', 'john-smith', 'owner-details', true);
    updateCompletionStatus('member', 'john-smith', 'firm-details', true);
    updateCompletionStatus('account', 'joint-account', 'account-setup', true);
    updateCompletionStatus('account', 'joint-account', 'funding', true);
    
    // This will make John Smith fully complete (both owner-details and firm-details)
    // and Joint Account 2/3 complete (missing firm-details)
}

function checkSectionCompletion(type, id, section) {
    // Basic completion check - you can enhance this with more sophisticated validation
    if (type === 'member' && section === 'owner-details') {
        const firstName = document.getElementById('firstName')?.value;
        const lastName = document.getElementById('lastName')?.value;
        const email = document.getElementById('email')?.value;
        const dateOfBirth = document.getElementById('dateOfBirth')?.value;
        
        return firstName && lastName && email && dateOfBirth;
    }
    
    if (type === 'member' && section === 'firm-details') {
        // Check if firm details form is filled
        // This is a simplified check - you can add more fields
        return false; // Default to incomplete for now
    }
    
    if (type === 'account') {
        // Account sections completion logic
        // This would check specific form fields for each account section
        return false; // Default to incomplete for now
    }
    
    return false;
}

// Update completion status when form data changes
function checkAndUpdateCurrentSectionCompletion() {
    if (currentSection) {
        let type, id, section;
        
        if (currentSection.includes('member-')) {
            type = 'member';
            const parts = currentSection.split('-');
            id = parts[1] + '-' + parts[2];
            section = currentSection.substring(currentSection.lastIndexOf('-') + 1);
            if (currentSection.includes('owner-details')) section = 'owner-details';
            if (currentSection.includes('firm-details')) section = 'firm-details';
        } else if (currentSection.includes('account-')) {
            type = 'account';
            const parts = currentSection.split('-');
            id = parts[1] + '-' + parts[2];
            section = currentSection.substring(currentSection.lastIndexOf('-') + 1);
            if (currentSection.includes('account-setup')) section = 'account-setup';
            if (currentSection.includes('firm-details')) section = 'firm-details';
        }
        
        if (type && id && section) {
            const isComplete = checkSectionCompletion(type, id, section);
            updateCompletionStatus(type, id, section, isComplete);
        }
    }
}

function initializeForm() {
    // Auto-format phone numbers
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', formatPhoneNumber);
        input.addEventListener('input', checkAndUpdateCurrentSectionCompletion);
    });

    // Auto-format SSN
    const ssnInput = document.getElementById('ssn');
    if (ssnInput) {
        ssnInput.addEventListener('input', formatSSN);
        ssnInput.addEventListener('input', checkAndUpdateCurrentSectionCompletion);
    }
    
    // Add completion checking to all form inputs
    const allInputs = document.querySelectorAll('input, select, textarea');
    allInputs.forEach(input => {
        input.addEventListener('input', checkAndUpdateCurrentSectionCompletion);
        input.addEventListener('change', checkAndUpdateCurrentSectionCompletion);
    });

    // Handle mailing address checkbox (if same as home)
    const homeAddress = document.getElementById('homeAddress');
    const mailingAddress = document.getElementById('mailingAddress');
    
    if (homeAddress && mailingAddress) {
        homeAddress.addEventListener('input', function() {
            if (mailingAddress.value === 'Same as home address' || mailingAddress.value === '') {
                mailingAddress.value = 'Same as home address';
            }
        });
    }
}

function formatPhoneNumber(event) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length >= 6) {
        value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
    } else if (value.length >= 3) {
        value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
    }
    event.target.value = value;
}

function formatSSN(event) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length >= 5) {
        value = `***-**-${value.slice(-4)}`;
    } else {
        value = '***-**-****';
    }
    event.target.value = value;
}

function setupFileUpload() {
    const uploadArea = document.querySelector('.upload-area');
    const uploadBtn = document.querySelector('.upload-btn');
    const fileNameSpan = document.querySelector('.file-name');

    if (!uploadArea || !uploadBtn) return;

    // Create hidden file input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*,.pdf';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);

    // Handle file upload button click
    uploadBtn.addEventListener('click', function(e) {
        e.preventDefault();
        fileInput.click();
    });

    // Handle drag and drop
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.style.borderColor = '#3b82f6';
        uploadArea.style.background = '#f0f9ff';
    });

    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        uploadArea.style.borderColor = '#d1d5db';
        uploadArea.style.background = '#f9fafb';
    });

    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.style.borderColor = '#d1d5db';
        uploadArea.style.background = '#f9fafb';
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileUpload(files[0]);
        }
    });

    // Handle file selection
    fileInput.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
        }
    });

    function handleFileUpload(file) {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            alert('File size must be less than 10MB');
            return;
        }

        if (!file.type.match(/^image\/|^application\/pdf/)) {
            alert('Please upload an image or PDF file');
            return;
        }

        fileNameSpan.textContent = file.name;
        
        // Show success feedback
        const uploadIcon = document.querySelector('.upload-icon');
        const originalContent = uploadIcon.textContent;
        uploadIcon.textContent = '✅';
        setTimeout(() => {
            uploadIcon.textContent = originalContent;
        }, 2000);
    }
}

function setupFormValidation() {
    const form = document.querySelector('.account-form');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            // Simulate form submission
            showSubmissionFeedback();
        }
    });

    // Real-time validation
    const requiredInputs = form.querySelectorAll('input[required], select[required]');
    requiredInputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
}

function validateForm() {
    let isValid = true;
    const requiredFields = [
        'firstName', 'lastName', 'dateOfBirth', 'email', 
        'homeAddress', 'citizenship', 'employmentStatus'
    ];

    requiredFields.forEach(fieldName => {
        const field = document.getElementById(fieldName);
        if (field && !field.value.trim()) {
            showFieldError(field, 'This field is required');
            isValid = false;
        }
    });

    // Validate email format
    const email = document.getElementById('email');
    if (email && email.value && !isValidEmail(email.value)) {
        showFieldError(email, 'Please enter a valid email address');
        isValid = false;
    }

    // Validate age (must be 18+)
    const dob = document.getElementById('dateOfBirth');
    if (dob && dob.value) {
        const age = calculateAge(new Date(dob.value));
        if (age < 18) {
            showFieldError(dob, 'You must be at least 18 years old');
            isValid = false;
        }
    }

    return isValid;
}

function validateField(event) {
    const field = event.target;
    clearFieldError(field);

    if (field.hasAttribute('required') && !field.value.trim()) {
        showFieldError(field, 'This field is required');
        return false;
    }

    if (field.type === 'email' && field.value && !isValidEmail(field.value)) {
        showFieldError(field, 'Please enter a valid email address');
        return false;
    }

    return true;
}

function showFieldError(field, message) {
    clearFieldError(field);
    
    field.style.borderColor = '#ef4444';
    field.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.style.color = '#ef4444';
    errorDiv.style.fontSize = '0.75rem';
    errorDiv.style.marginTop = '4px';
    errorDiv.textContent = message;
    
    field.parentNode.appendChild(errorDiv);
}

function clearFieldError(field) {
    field.style.borderColor = '#d1d5db';
    field.style.boxShadow = '';
    
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function calculateAge(birthDate) {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age;
}

function setupReviewToggle() {
    const reviewToggleBtn = document.getElementById('reviewToggleBtn');
    const mainContent = document.querySelector('.main-content');
    
    if (!reviewToggleBtn) return;
    
    reviewToggleBtn.addEventListener('click', function() {
        if (isReviewMode) {
            // Switch to Edit mode
            isReviewMode = false;
            reviewToggleBtn.textContent = 'Review';
            reviewToggleBtn.classList.remove('edit-mode');
            mainContent.classList.remove('review-mode');
            
            // Restore the current form
            if (currentSection && currentData) {
                restoreCurrentForm();
            }
        } else {
            // Switch to Review mode
            isReviewMode = true;
            reviewToggleBtn.textContent = 'Edit';
            reviewToggleBtn.classList.add('edit-mode');
            mainContent.classList.add('review-mode');
            
            // Convert current form to review mode
            convertToReviewMode();
        }
    });
}

function convertToReviewMode() {
    const form = document.querySelector('.account-form');
    if (!form) return;
    
    // If no current section is set, default to John Smith's owner details
    if (!currentSection || !currentData) {
        currentSection = 'member-john-smith-owner-details';
        currentData = getMemberData('john-smith');
    }
    
    // Create flattened review display based on current section
    if (currentSection && currentData) {
        const reviewHTML = createReviewHTML();
        
        if (reviewHTML) {
            form.innerHTML = reviewHTML;
        } else {
            // Fallback if reviewHTML is empty
            form.innerHTML = `
                <div class="review-header">
                    <h2>Review Mode</h2>
                </div>
                <div class="review-content">
                    <div class="review-section">
                        <h3>No Data Available</h3>
                        <div class="review-grid">
                            <div class="review-item">
                                <div class="review-item-label">Status</div>
                                <div class="review-item-value empty">No data to review</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    } else {
        // If no current section, show a default message
        form.innerHTML = `
            <div class="review-header">
                <h2>Review Mode</h2>
            </div>
            <div class="review-content">
                <div class="review-section">
                    <h3>No Section Selected</h3>
                    <div class="review-grid">
                        <div class="review-item">
                            <div class="review-item-label">Status</div>
                            <div class="review-item-value empty">Please select a section from the sidebar to review</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

function createReviewHTML() {
    if (!currentSection || !currentData) {
        return '';
    }
    
    if (currentSection.includes('member-')) {
        // Format: member-john-smith-owner-details
        // Extract everything after "member-"
        const afterMember = currentSection.substring('member-'.length);
        
        // Find the last occurrence of a known section type
        let memberId, sectionType;
        if (afterMember.endsWith('-owner-details')) {
            memberId = afterMember.substring(0, afterMember.length - '-owner-details'.length);
            sectionType = 'owner-details';
        } else if (afterMember.endsWith('-firm-details')) {
            memberId = afterMember.substring(0, afterMember.length - '-firm-details'.length);
            sectionType = 'firm-details';
        } else {
            return '';
        }
        
        if (sectionType === 'owner-details') {
            return createOwnerDetailsReview(currentData);
        } else if (sectionType === 'firm-details') {
            return createOwnerFirmDetailsReview(currentData);
        }
    } else if (currentSection.includes('account-')) {
        // Format: account-joint-account-account-setup or account-individual-account-funding
        const afterAccount = currentSection.substring('account-'.length);
        
        // Find the last occurrence of a known section type
        let accountId, sectionType;
        if (afterAccount.endsWith('-account-setup')) {
            accountId = afterAccount.substring(0, afterAccount.length - '-account-setup'.length);
            sectionType = 'account-setup';
        } else if (afterAccount.endsWith('-funding')) {
            accountId = afterAccount.substring(0, afterAccount.length - '-funding'.length);
            sectionType = 'funding';
        } else if (afterAccount.endsWith('-firm-details')) {
            accountId = afterAccount.substring(0, afterAccount.length - '-firm-details'.length);
            sectionType = 'firm-details';
        } else {
            return '';
        }
        
        if (sectionType === 'account-setup') {
            return createAccountSetupReview(currentData);
        } else if (sectionType === 'funding') {
            return createFundingReview(currentData);
        } else if (sectionType === 'firm-details') {
            return createAccountFirmDetailsReview(currentData);
        }
    }
    
    return '';
}

function createOwnerDetailsReview(memberData) {
    // Get current form values if they exist
    const firstName = document.getElementById('firstName')?.value || memberData.firstName;
    const middleInitial = document.getElementById('middleInitial')?.value || memberData.middleInitial;
    const lastName = document.getElementById('lastName')?.value || memberData.lastName;
    const dateOfBirth = document.getElementById('dateOfBirth')?.value || memberData.dateOfBirth;
    const email = document.getElementById('email')?.value || memberData.email;
    const phoneHome = document.getElementById('phoneHome')?.value || memberData.phoneHome;
    const phoneMobile = document.getElementById('phoneMobile')?.value || memberData.phoneMobile;
    const homeAddress = document.getElementById('homeAddress')?.value || memberData.homeAddress;
    const mailingAddress = document.getElementById('mailingAddress')?.value || memberData.mailingAddress;
    const citizenship = document.getElementById('citizenship')?.value || memberData.citizenship || 'us-citizen';
    
    return `
        <div class="review-header">
            <h2>${memberData.name} - Owner Details</h2>
        </div>
        <div class="review-content">
            <div class="review-section">
                <h3>Personal Information</h3>
                <div class="review-grid">
                    <div class="review-item">
                        <div class="review-item-label">Full Name</div>
                        <div class="review-item-value">${firstName} ${middleInitial} ${lastName}</div>
                    </div>
                    <div class="review-item">
                        <div class="review-item-label">Date of Birth</div>
                        <div class="review-item-value">${dateOfBirth}</div>
                    </div>
                    <div class="review-item">
                        <div class="review-item-label">Email Address</div>
                        <div class="review-item-value">${email}</div>
                    </div>
                    <div class="review-item">
                        <div class="review-item-label">Phone Numbers</div>
                        <div class="review-item-value">Home: ${phoneHome}<br>Mobile: ${phoneMobile}</div>
                    </div>
                </div>
            </div>
            <div class="review-section">
                <h3>Address Information</h3>
                <div class="review-grid">
                    <div class="review-item">
                        <div class="review-item-label">Home Address</div>
                        <div class="review-item-value">${homeAddress}</div>
                    </div>
                    <div class="review-item">
                        <div class="review-item-label">Mailing Address</div>
                        <div class="review-item-value">${mailingAddress}</div>
                    </div>
                    <div class="review-item">
                        <div class="review-item-label">Citizenship</div>
                        <div class="review-item-value">${citizenship === 'us-citizen' ? 'US Citizen' : citizenship === 'permanent-resident' ? 'Permanent Resident' : 'Non-Resident Alien'}</div>
                    </div>
                </div>
            </div>
            
            <div class="review-section">
                <h3>Identification</h3>
                <div class="review-grid">
                    <div class="review-item">
                        <div class="review-item-label">Document</div>
                        <div class="review-item-value">passport.jpg (uploaded)</div>
                    </div>
                </div>
            </div>
            
            <div class="review-section">
                <h3>Employment & Financial</h3>
                <div class="review-grid">
                    <div class="review-item">
                        <div class="review-item-label">Employment Status</div>
                        <div class="review-item-value">${memberData.employmentStatus === 'employed' ? 'Employed' : 'Other'}</div>
                    </div>
                    <div class="review-item">
                        <div class="review-item-label">Employer</div>
                        <div class="review-item-value">${memberData.name.includes('Trust') ? 'N/A' : 'Smith & Associates'}</div>
                    </div>
                    <div class="review-item">
                        <div class="review-item-label">Job Title</div>
                        <div class="review-item-value">${memberData.name.includes('Trust') ? 'N/A' : 'Senior Manager'}</div>
                    </div>
                    <div class="review-item">
                        <div class="review-item-label">Annual Income</div>
                        <div class="review-item-value">${getIncomeDisplay(memberData.annualIncome)}</div>
                    </div>
                    <div class="review-item">
                        <div class="review-item-label">Net Worth Range</div>
                        <div class="review-item-value">$500,000 - $1,000,000</div>
                    </div>
                    <div class="review-item">
                        <div class="review-item-label">Source of Funds</div>
                        <div class="review-item-value">Employment income and investment returns</div>
                    </div>
                </div>
            </div>
            
            <div class="review-section">
                <h3>Disclosures</h3>
                <div class="review-list">
                    <div class="review-list-item">✓ No financial services firm affiliation</div>
                    <div class="review-list-item">✓ Not a professional financial advisor</div>
                    <div class="review-list-item">✓ Not a publicly traded company insider</div>
                </div>
            </div>
            
            <div class="review-section">
                <h3>Trusted Contact</h3>
                <div class="review-grid">
                    <div class="review-item">
                        <div class="review-item-label">Status</div>
                        <div class="review-item-value empty">Not provided</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function createOwnerFirmDetailsReview(memberData) {
    return `
        <div class="review-header">
            <h2>${memberData.name} - Firm Details</h2>
        </div>
        <div class="review-content">
            <div class="review-section">
                <h3>Financial Profile</h3>
                <div class="review-grid">
                    <div class="review-item">
                        <div class="review-item-label">Total Net Worth</div>
                        <div class="review-item-value">$500,000 - $1,000,000</div>
                    </div>
                    <div class="review-item">
                        <div class="review-item-label">Liquid Net Worth</div>
                        <div class="review-item-value">$100,000 - $250,000</div>
                    </div>
                    <div class="review-item">
                        <div class="review-item-label">Average Annual Income</div>
                        <div class="review-item-value">$75,000 - $150,000</div>
                    </div>
                    <div class="review-item">
                        <div class="review-item-label">Primary Income Source</div>
                        <div class="review-item-value">Employment/Salary</div>
                    </div>
                </div>
            </div>
            
            <div class="review-section">
                <h3>Investment Experience</h3>
                <div class="review-grid">
                    <div class="review-item">
                        <div class="review-item-label">Overall Experience</div>
                        <div class="review-item-value">Moderate (3-10 years)</div>
                    </div>
                    <div class="review-item">
                        <div class="review-item-label">Stocks</div>
                        <div class="review-item-value">Moderate</div>
                    </div>
                    <div class="review-item">
                        <div class="review-item-label">Bonds</div>
                        <div class="review-item-value">Limited</div>
                    </div>
                    <div class="review-item">
                        <div class="review-item-label">Options/Derivatives</div>
                        <div class="review-item-value">None</div>
                    </div>
                </div>
            </div>
            
            <div class="review-section">
                <h3>Liquidity Needs</h3>
                <div class="review-grid">
                    <div class="review-item">
                        <div class="review-item-label">2-Year Access Need</div>
                        <div class="review-item-value">Low (1-10%)</div>
                    </div>
                    <div class="review-item">
                        <div class="review-item-label">Emergency Fund</div>
                        <div class="review-item-value">Yes, 6+ months expenses</div>
                    </div>
                    <div class="review-item">
                        <div class="review-item-label">Purpose</div>
                        <div class="review-item-value">Unexpected expenses or opportunities</div>
                    </div>
                </div>
            </div>
            
            <div class="review-section">
                <h3>Market Comfort Level</h3>
                <div class="review-scenarios">
                    <div class="review-scenario">
                        <h4>10% portfolio decline response:</h4>
                        <div class="review-scenario-answer">Hold investments and wait for recovery</div>
                    </div>
                    <div class="review-scenario">
                        <h4>Prolonged market downturn preference:</h4>
                        <div class="review-scenario-answer">Maintain current investment strategy</div>
                    </div>
                    <div class="review-scenario">
                        <h4>Volatility tolerance:</h4>
                        <div class="review-scenario-answer">Moderate - Accept significant fluctuations for higher returns</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function createAccountSetupReview(accountData) {
    return `
        <div class="review-header">
            <h2>${accountData.name} - Account Setup</h2>
        </div>
        <div class="review-content">
            <div class="review-section">
                <h3>Account Configuration</h3>
                <div class="review-grid">
                    <div class="review-item">
                        <div class="review-item-label">Account Type</div>
                        <div class="review-item-value">${accountData.accountType}</div>
                    </div>
                    <div class="review-item">
                        <div class="review-item-label">Account Owners</div>
                        <div class="review-item-value">${accountData.owners}</div>
                    </div>
                    <div class="review-item">
                        <div class="review-item-label">Investment Objective</div>
                        <div class="review-item-value">${accountData.investmentObjective}</div>
                    </div>
                    <div class="review-item">
                        <div class="review-item-label">Risk Tolerance</div>
                        <div class="review-item-value">${accountData.riskTolerance}</div>
                    </div>
                </div>
            </div>
            
            <div class="review-section">
                <h3>Trading Permissions</h3>
                <div class="review-list">
                    <div class="review-list-item">✓ Stocks</div>
                    <div class="review-list-item">✓ Bonds</div>
                    <div class="review-list-item">✓ Mutual Funds</div>
                    <div class="review-list-item">✓ ETFs</div>
                </div>
            </div>
            
            <div class="review-section">
                <h3>Dividend Settings</h3>
                <div class="review-grid">
                    <div class="review-item">
                        <div class="review-item-label">Dividend Reinvestment</div>
                        <div class="review-item-value">Automatic Reinvestment</div>
                    </div>
                </div>
            </div>
            
            <div class="review-section">
                <h3>Account Purpose</h3>
                <div class="review-grid">
                    <div class="review-item">
                        <div class="review-item-label">Purpose</div>
                        <div class="review-item-value">${accountData.accountType.includes('Trust') ? 'Estate planning and wealth preservation for family trust beneficiaries' : 'Long-term investment growth and financial planning'}</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function createFundingReview(accountData) {
    const totalInstances = getTotalFundingInstances();
    const fundingTypeNames = {
        'acat': 'ACAT Transfers',
        'ach': 'ACH Transfers',
        'initial-ach': 'Initial ACH Transfers',
        'withdrawal': 'Systematic Withdrawals',
        'contribution': 'Systematic Contributions'
    };
    
    return `
        <div class="review-header">
            <h2>${accountData.name} - Funding</h2>
        </div>
        <div class="review-content">
            <div class="review-section">
                <h3>Funding Summary</h3>
                <div class="review-grid">
                    <div class="review-item">
                        <div class="review-item-label">Total Funding Instances</div>
                        <div class="review-item-value">${totalInstances} of 20 maximum</div>
                    </div>
                    <div class="review-item">
                        <div class="review-item-label">Funding Types Configured</div>
                        <div class="review-item-value">${Object.keys(fundingInstances).filter(type => fundingInstances[type].length > 0).length} of 5 types</div>
                    </div>
                </div>
            </div>
            
            ${Object.keys(fundingInstances).map(type => {
                const instances = fundingInstances[type];
                if (instances.length === 0) return '';
                
                return `
                    <div class="review-section">
                        <h3>${fundingTypeNames[type]} (${instances.length})</h3>
                        <div class="review-list">
                            ${instances.map(instance => `
                                <div class="review-list-item">
                                    <strong>${instance.name}</strong><br>
                                    <small>${instance.details}</small>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }).join('')}
            
            ${totalInstances === 0 ? `
                <div class="review-section">
                    <h3>No Funding Configured</h3>
                    <div class="review-grid">
                        <div class="review-item">
                            <div class="review-item-label">Status</div>
                            <div class="review-item-value empty">No funding instances have been configured yet</div>
                        </div>
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

function createAccountFirmDetailsReview(accountData) {
    return `
        <div class="review-header">
            <h2>${accountData.name} - Firm Details</h2>
        </div>
        <div class="review-content">
            <div class="review-section">
                <h3>Investment Rationale</h3>
                <div class="review-grid">
                    <div class="review-item">
                        <div class="review-item-label">Investment Objective Reason</div>
                        <div class="review-item-value">${accountData.investmentObjective === 'Growth' ? 'Long-term wealth accumulation is the primary goal for this account, with a time horizon exceeding 10 years allowing for higher risk tolerance.' : accountData.investmentObjective === 'Income' ? 'Current income generation is prioritized to support ongoing financial needs while preserving capital.' : 'Balanced approach combining growth potential with income generation to meet diverse financial objectives.'}</div>
                    </div>
                    <div class="review-item">
                        <div class="review-item-label">Time Horizon</div>
                        <div class="review-item-value">${accountData.investmentObjective === 'Growth' ? 'Very long-term (15+ years)' : 'Medium-term (3-7 years)'}</div>
                    </div>
                    <div class="review-item">
                        <div class="review-item-label">Review Frequency</div>
                        <div class="review-item-value">Quarterly</div>
                    </div>
                </div>
            </div>
            
            <div class="review-section">
                <h3>Asset Allocation Strategy</h3>
                <div class="review-grid">
                    <div class="review-item">
                        <div class="review-item-label">Target Equity</div>
                        <div class="review-item-value">${accountData.investmentObjective === 'Growth' ? '80%' : accountData.investmentObjective === 'Income' ? '40%' : '60%'}</div>
                    </div>
                    <div class="review-item">
                        <div class="review-item-label">Target Fixed Income</div>
                        <div class="review-item-value">${accountData.investmentObjective === 'Growth' ? '15%' : accountData.investmentObjective === 'Income' ? '50%' : '30%'}</div>
                    </div>
                    <div class="review-item">
                        <div class="review-item-label">Target Cash</div>
                        <div class="review-item-value">${accountData.investmentObjective === 'Growth' ? '5%' : '10%'}</div>
                    </div>
                    <div class="review-item">
                        <div class="review-item-label">Allocation Strategy</div>
                        <div class="review-item-value">Goals-based allocation strategy</div>
                    </div>
                </div>
            </div>
            
            <div class="review-section">
                <h3>Alternative Investment Decisions</h3>
                <div class="review-scenarios">
                    <div class="review-scenario">
                        <h4>REITs:</h4>
                        <div class="review-scenario-answer">Considered but excluded due to existing real estate exposure</div>
                    </div>
                    <div class="review-scenario">
                        <h4>Commodities:</h4>
                        <div class="review-scenario-answer">Not suitable due to high volatility and lack of income generation</div>
                    </div>
                    <div class="review-scenario">
                        <h4>International Markets:</h4>
                        <div class="review-scenario-answer">Developed markets included for diversification benefits</div>
                    </div>
                </div>
            </div>
            
            <div class="review-section">
                <h3>Overall Strategy</h3>
                <div class="review-grid">
                    <div class="review-item">
                        <div class="review-item-label">Approach</div>
                        <div class="review-item-value">Focus on traditional asset classes with limited alternatives, aligning with client experience and preference for liquid, transparent investments</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getIncomeDisplay(incomeRange) {
    const incomeMap = {
        'under-50k': 'Under $50,000',
        '50k-100k': '$50,000 - $100,000',
        '100k-250k': '$100,000 - $250,000',
        '250k-500k': '$250,000 - $500,000',
        'over-500k': 'Over $500,000'
    };
    return incomeMap[incomeRange] || incomeRange;
}


function restoreCurrentForm() {
    const form = document.querySelector('.account-form');
    if (!form) return;
    
    // Restore the original form HTML structure
    form.innerHTML = `
        <section class="form-section">
            <h3>Account Owner Details</h3>
            <div class="form-grid">
                <div class="form-group">
                    <label for="firstName">First Name</label>
                    <input type="text" id="firstName" name="firstName" value="John">
                </div>
                <div class="form-group">
                    <label for="middleInitial">Middle Initial</label>
                    <input type="text" id="middleInitial" name="middleInitial" value="A">
                </div>
                <div class="form-group">
                    <label for="lastName">Last Name</label>
                    <input type="text" id="lastName" name="lastName" value="Smith">
                </div>
                <div class="form-group">
                    <label for="dateOfBirth">Date of Birth</label>
                    <input type="date" id="dateOfBirth" name="dateOfBirth" value="1985-06-15">
                </div>
                <div class="form-group">
                    <label for="ssn">Social Security Number</label>
                    <input type="text" id="ssn" name="ssn" placeholder="***-**-****">
                </div>
                <div class="form-group">
                    <label for="phoneHome">Phone (Home)</label>
                    <input type="tel" id="phoneHome" name="phoneHome" value="(555) 123-4567">
                </div>
                <div class="form-group">
                    <label for="phoneMobile">Phone (Mobile)</label>
                    <input type="tel" id="phoneMobile" name="phoneMobile" value="(555) 987-6543">
                </div>
                <div class="form-group">
                    <label for="email">Email Address</label>
                    <input type="email" id="email" name="email" value="john.smith@example.com">
                </div>
            </div>
        </section>

        <section class="form-section">
            <h3>Address Information</h3>
            <div class="form-grid">
                <div class="form-group full-width">
                    <label for="homeAddress">Home Address</label>
                    <input type="text" id="homeAddress" name="homeAddress" value="123 Main Street, Anytown, ST 12345">
                </div>
                <div class="form-group full-width">
                    <label for="mailingAddress">Mailing Address</label>
                    <input type="text" id="mailingAddress" name="mailingAddress" value="Same as home address">
                </div>
                <div class="form-group">
                    <label for="citizenship">Citizenship Type</label>
                    <select id="citizenship" name="citizenship">
                        <option value="us-citizen">US Citizen</option>
                        <option value="permanent-resident">Permanent Resident</option>
                        <option value="non-resident">Non-Resident Alien</option>
                    </select>
                </div>
            </div>
        </section>

        <section class="form-section">
            <h3>Identification</h3>
            <div class="file-upload">
                <div class="upload-area">
                    <div class="upload-icon">📄</div>
                    <div class="upload-info">
                        <span class="file-name">passport.jpg</span>
                        <button type="button" class="upload-btn">Change File</button>
                    </div>
                </div>
            </div>
        </section>

        <section class="form-section">
            <h3>Employment Information</h3>
            <div class="form-grid">
                <div class="form-group">
                    <label for="employmentStatus">Employment Status</label>
                    <select id="employmentStatus" name="employmentStatus">
                        <option value="employed">Employed</option>
                        <option value="self-employed">Self-Employed</option>
                        <option value="retired">Retired</option>
                        <option value="unemployed">Unemployed</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="annualIncome">Annual Income Range</label>
                    <select id="annualIncome" name="annualIncome">
                        <option value="under-50k">Under $50,000</option>
                        <option value="50k-100k">$50,000 - $100,000</option>
                        <option value="100k-250k">$100,000 - $250,000</option>
                        <option value="250k-500k">$250,000 - $500,000</option>
                        <option value="over-500k">Over $500,000</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="netWorth">Net Worth Range</label>
                    <select id="netWorth" name="netWorth">
                        <option value="under-100k">Under $100,000</option>
                        <option value="100k-500k">$100,000 - $500,000</option>
                        <option value="500k-1m">$500,000 - $1,000,000</option>
                        <option value="1m-5m">$1,000,000 - $5,000,000</option>
                        <option value="over-5m">Over $5,000,000</option>
                    </select>
                </div>
                <div class="form-group full-width">
                    <label for="fundsSource">Source of Funds</label>
                    <textarea id="fundsSource" name="fundsSource" rows="3" placeholder="Please describe the source of funds for this account..."></textarea>
                </div>
            </div>
            
            <div class="disclosure-questions">
                <h4>Disclosure Questions</h4>
                <div class="question-group">
                    <label class="checkbox-label">
                        <input type="checkbox" name="disclosures" value="affiliated">
                        I am affiliated with a financial services firm
                    </label>
                </div>
                <div class="question-group">
                    <label class="checkbox-label">
                        <input type="checkbox" name="disclosures" value="professional">
                        I am a professional financial advisor
                    </label>
                </div>
            </div>
        </section>

        <section class="form-section">
            <h3>Trusted Contact Information</h3>
            <p class="section-description">Add an emergency contact who can be reached if we're unable to contact you.</p>
            <div class="form-grid">
                <div class="form-group">
                    <label for="trustedName">Contact Name</label>
                    <input type="text" id="trustedName" name="trustedName" placeholder="Full name">
                </div>
                <div class="form-group">
                    <label for="trustedPhone">Contact Phone</label>
                    <input type="tel" id="trustedPhone" name="trustedPhone" placeholder="Phone number">
                </div>
                <div class="form-group">
                    <label for="trustedEmail">Contact Email</label>
                    <input type="email" id="trustedEmail" name="trustedEmail" placeholder="Email address">
                </div>
                <div class="form-group">
                    <label for="trustedRelationship">Relationship</label>
                    <select id="trustedRelationship" name="trustedRelationship">
                        <option value="">Select relationship</option>
                        <option value="spouse">Spouse</option>
                        <option value="parent">Parent</option>
                        <option value="child">Child</option>
                        <option value="sibling">Sibling</option>
                        <option value="friend">Friend</option>
                        <option value="other">Other</option>
                    </select>
                </div>
            </div>
        </section>

        <div class="form-actions">
            <button type="button" class="btn-secondary">Save</button>
            <button type="submit" class="btn-primary">Continue to Review</button>
        </div>
    `;
    
    // Re-initialize form functionality
    initializeForm();
    setupFileUpload();
    
    // If we have current section data, populate the form accordingly
    if (currentSection && currentData) {
        // Re-populate the current form based on stored section and data
        if (currentSection.includes('member-')) {
            const memberId = currentSection.split('-')[1] + '-' + currentSection.split('-')[2];
            const sectionType = currentSection.split('-')[currentSection.split('-').length - 1];
            updateFormContent(memberId, sectionType);
        } else if (currentSection.includes('account-')) {
            const accountId = currentSection.split('-')[1] + '-' + currentSection.split('-')[2];
            const sectionType = currentSection.split('-')[currentSection.split('-').length - 1];
            updateAccountFormContent(accountId, sectionType);
        }
    } else {
        // Default to John Smith Owner Details if no current section
        const johnSmithHeader = document.querySelector('[data-member="john-smith"]');
        if (johnSmithHeader) {
            johnSmithHeader.classList.add('expanded');
            johnSmithHeader.nextElementSibling.classList.add('expanded');
            const ownerDetailsItem = johnSmithHeader.nextElementSibling.querySelector('[data-section="owner-details"]');
            if (ownerDetailsItem) {
                ownerDetailsItem.classList.add('active');
                updateFormContent('john-smith', 'owner-details');
            }
        }
    }
}

function setupFormSaving() {
    const saveButton = document.querySelector('.btn-secondary');
    
    if (saveButton) {
        saveButton.addEventListener('click', function(e) {
            e.preventDefault();
            saveFormData();
            showSaveConfirmation();
        });
    }

    // Auto-save functionality with status updates
    let saveTimeout;
    const inputs = document.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(saveFormData, 2000); // Auto-save after 2 seconds of inactivity
        });
        
        // Also trigger immediate status check for better UX
        input.addEventListener('change', function() {
            setTimeout(() => {
                if (currentSection) {
                    checkAndUpdateSectionStatus(currentSection);
                } else {
                    // Check all sections if no specific section is active
                    Object.keys(requiredFields).forEach(section => {
                        checkAndUpdateSectionStatus(section);
                    });
                }
            }, 100);
        });
    });
}

function saveFormData() {
    const formData = new FormData(document.querySelector('.account-form'));
    const data = {};
    
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    // Save to localStorage (in a real app, this would be an API call)
    localStorage.setItem('accountSetupData', JSON.stringify(data));
    
    // Show auto-save indicator
    showAutoSaveIndicator();
    
    // Check and update completion status for current section
    if (currentSection) {
        checkAndUpdateSectionStatus(currentSection);
    } else {
        // If no specific section, check all sections
        Object.keys(requiredFields).forEach(section => {
            checkAndUpdateSectionStatus(section);
        });
    }
}

function showAutoSaveIndicator() {
    // Create or show auto-save indicator
    let indicator = document.getElementById('autoSaveIndicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'autoSaveIndicator';
        indicator.className = 'auto-save-indicator';
        indicator.innerHTML = '✓ Auto-saved';
        document.body.appendChild(indicator);
    }
    
    // Show indicator
    indicator.style.display = 'block';
    indicator.classList.add('show');
    
    // Hide after 2 seconds
    setTimeout(() => {
        indicator.classList.remove('show');
        setTimeout(() => {
            indicator.style.display = 'none';
        }, 300);
    }, 2000);
}

function loadFormData() {
    const savedData = localStorage.getItem('accountSetupData');
    if (!savedData) return;
    
    const data = JSON.parse(savedData);
    
    Object.keys(data).forEach(key => {
        const field = document.getElementById(key) || document.querySelector(`[name="${key}"]`);
        if (field) {
            field.value = data[key];
        }
    });
}

function showSaveConfirmation() {
    // Create and show a temporary success message
    const message = document.createElement('div');
    message.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 1000;
        font-size: 0.875rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    `;
    message.textContent = 'Draft saved successfully!';
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.remove();
    }, 3000);
}


function submitForm() {
    if (validateForm()) {
        // Form submitted successfully
        console.log('Form validated and ready for submission');
    }
}

// Load saved data when page loads
window.addEventListener('load', loadFormData);

function setupNavigationSidebar() {
    // Handle member header clicks for expand/collapse
    const memberHeaders = document.querySelectorAll('.member-header');
    
    memberHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const memberDetails = this.nextElementSibling;
            const isExpanded = this.classList.contains('expanded');
            
            // Close all other expanded members and accounts
            closeAllExpandedSections();
            
            // Toggle current member
            if (!isExpanded) {
                this.classList.add('expanded');
                memberDetails.classList.add('expanded');
            }
        });
    });

    // Handle account header clicks for expand/collapse
    const accountHeaders = document.querySelectorAll('.account-header');
    
    accountHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const accountDetails = this.nextElementSibling;
            const isExpanded = this.classList.contains('expanded');
            
            // Close all other expanded members and accounts
            closeAllExpandedSections();
            
            // Toggle current account
            if (!isExpanded) {
                this.classList.add('expanded');
                accountDetails.classList.add('expanded');
            }
        });
    });
    
    // Handle detail item clicks (Owner Details, Firm Details, Account Setup, Funding)
    const detailItems = document.querySelectorAll('.detail-item');
    
    detailItems.forEach(item => {
        item.addEventListener('click', function() {
            const parentItem = this.closest('.member-item') || this.closest('.account-item');
            const section = this.getAttribute('data-section');
            
            // Remove active class from ALL detail items
            document.querySelectorAll('.detail-item').forEach(detailItem => {
                detailItem.classList.remove('active');
            });
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Determine if this is a member or account section
            if (parentItem.classList.contains('member-item')) {
                const memberHeader = parentItem.querySelector('.member-header');
                const memberId = memberHeader.getAttribute('data-member');
                currentSection = `member-${memberId}-${section}`;
                currentData = getMemberData(memberId);
                updateFormContent(memberId, section);
            } else if (parentItem.classList.contains('account-item')) {
                const accountHeader = parentItem.querySelector('.account-header');
                const accountId = accountHeader.getAttribute('data-account');
                currentSection = `account-${accountId}-${section}`;
                currentData = getAccountData(accountId);
                updateAccountFormContent(accountId, section);
            }
        });
    });
    
    // Auto-expand John Smith by default and show his Owner Details
    const johnSmithHeader = document.querySelector('[data-member="john-smith"]');
    if (johnSmithHeader) {
        johnSmithHeader.classList.add('expanded');
        johnSmithHeader.nextElementSibling.classList.add('expanded');
        
        // Set initial current section and activate the owner details item
        const ownerDetailsItem = johnSmithHeader.nextElementSibling.querySelector('[data-section="owner-details"]');
        if (ownerDetailsItem) {
            ownerDetailsItem.classList.add('active');
        }
        
        currentSection = 'member-john-smith-owner-details';
        currentData = getMemberData('john-smith');
        
        // Debug log
        console.log('Initial setup:', { currentSection, currentData });
    }
}

function closeAllExpandedSections() {
    // Close all member sections
    document.querySelectorAll('.member-header').forEach(header => {
        header.classList.remove('expanded');
        header.nextElementSibling.classList.remove('expanded');
    });
    
    // Close all account sections
    document.querySelectorAll('.account-header').forEach(header => {
        header.classList.remove('expanded');
        header.nextElementSibling.classList.remove('expanded');
    });
    
    // Clean up any expanded forms/content when collapsing sections
    cleanupAccountSectionContent();
}

function updateFormContent(memberId, section) {
    const memberData = getMemberData(memberId);
    if (!memberData) return;
    
    // Check if we're in review mode and should stay in review mode
    if (isReviewMode) {
        // Stay in review mode - just convert to review for the new section
        const mainContent = document.querySelector('.main-content');
        if (mainContent && !mainContent.classList.contains('review-mode')) {
            mainContent.classList.add('review-mode');
        }
        convertToReviewMode();
    } else {
        // Clean up any existing expanded forms/content that shouldn't persist
        cleanupAccountSectionContent();
        
        // Normal edit mode behavior
        const formTitle = document.querySelector('.form-section h3');
        if (!formTitle) return;
        
        // Update form title based on selection
        if (section === 'owner-details') {
            formTitle.textContent = `${memberData.name} - Owner Details`;
            populateOwnerDetails(memberData);
        } else if (section === 'firm-details') {
            formTitle.textContent = `${memberData.name} - Firm Details`;
            populateFirmDetails(memberData);
        }
    }
    
    // Show visual feedback
    showSectionChangeNotification(memberData.name, section);
    
    // Check completion status for the new section after a brief delay to allow form to populate
    setTimeout(checkAndUpdateCurrentSectionCompletion, 100);
}

function getMemberData(memberId) {
    const memberDataMap = {
        'john-smith': {
            name: 'John Smith',
            firstName: 'John',
            middleInitial: 'A',
            lastName: 'Smith',
            dateOfBirth: '1985-06-15',
            email: 'john.smith@example.com',
            phoneHome: '(555) 123-4567',
            phoneMobile: '(555) 987-6543',
            homeAddress: '123 Main Street, Anytown, ST 12345',
            employmentStatus: 'employed',
            annualIncome: '100k-250k'
        },
        'mary-smith': {
            name: 'Mary Smith',
            firstName: 'Mary',
            middleInitial: 'L',
            lastName: 'Smith',
            dateOfBirth: '1987-08-22',
            email: 'mary.smith@example.com',
            phoneHome: '(555) 123-4567',
            phoneMobile: '(555) 987-6544',
            homeAddress: '123 Main Street, Anytown, ST 12345',
            employmentStatus: 'employed',
            annualIncome: '50k-100k'
        },
        'smith-trust': {
            name: 'Smith Family Trust',
            firstName: 'Smith Family',
            middleInitial: '',
            lastName: 'Trust',
            dateOfBirth: '2020-01-01',
            email: 'trust@smithfamily.com',
            phoneHome: '(555) 123-4567',
            phoneMobile: '(555) 123-4567',
            homeAddress: '123 Main Street, Anytown, ST 12345',
            employmentStatus: 'trust',
            annualIncome: 'over-500k'
        }
    };
    
    return memberDataMap[memberId];
}

function populateOwnerDetails(memberData) {
    const form = document.querySelector('.account-form');
    const ownerDetailsHTML = `
        <section class="form-section">
            <h3>${memberData.name} - Owner Details</h3>
            <div class="form-grid">
                <div class="form-group">
                    <label for="firstName">First Name</label>
                    <input type="text" id="firstName" name="firstName" value="${memberData.firstName}">
                </div>
                <div class="form-group">
                    <label for="middleInitial">Middle Initial</label>
                    <input type="text" id="middleInitial" name="middleInitial" value="${memberData.middleInitial}">
                </div>
                <div class="form-group">
                    <label for="lastName">Last Name</label>
                    <input type="text" id="lastName" name="lastName" value="${memberData.lastName}">
                </div>
                <div class="form-group">
                    <label for="dateOfBirth">Date of Birth</label>
                    <input type="date" id="dateOfBirth" name="dateOfBirth" value="${memberData.dateOfBirth}">
                </div>
                <div class="form-group">
                    <label for="ssn">Social Security Number</label>
                    <input type="text" id="ssn" name="ssn" placeholder="***-**-****">
                </div>
                <div class="form-group">
                    <label for="phoneHome">Phone (Home)</label>
                    <input type="tel" id="phoneHome" name="phoneHome" value="${memberData.phoneHome}">
                </div>
                <div class="form-group">
                    <label for="phoneMobile">Phone (Mobile)</label>
                    <input type="tel" id="phoneMobile" name="phoneMobile" value="${memberData.phoneMobile}">
                </div>
                <div class="form-group">
                    <label for="email">Email Address</label>
                    <input type="email" id="email" name="email" value="${memberData.email}">
                </div>
                <div class="form-group full-width">
                    <label for="homeAddress">Home Address</label>
                    <input type="text" id="homeAddress" name="homeAddress" value="${memberData.homeAddress}">
                </div>
                <div class="form-group full-width">
                    <label for="mailingAddress">Mailing Address</label>
                    <input type="text" id="mailingAddress" name="mailingAddress" value="Same as home address">
                </div>
                <div class="form-group">
                    <label for="citizenship">Citizenship Type</label>
                    <select id="citizenship" name="citizenship">
                        <option value="us-citizen" selected>US Citizen</option>
                        <option value="permanent-resident">Permanent Resident</option>
                        <option value="non-resident">Non-Resident Alien</option>
                    </select>
                </div>
            </div>
        </section>

        <section class="form-section">
            <h3>Identification</h3>
            <div class="file-upload">
                <div class="upload-area">
                    <div class="upload-icon">📄</div>
                    <div class="upload-info">
                        <span class="file-name">passport.jpg</span>
                        <button type="button" class="upload-btn">Change File</button>
                    </div>
                </div>
            </div>
        </section>

        <section class="form-section">
            <h3>Employment Information</h3>
            <div class="form-grid">
                <div class="form-group">
                    <label for="employmentStatus">Employment Status</label>
                    <select id="employmentStatus" name="employmentStatus">
                        <option value="employed" ${memberData.employmentStatus === 'employed' ? 'selected' : ''}>Employed</option>
                        <option value="self-employed">Self-Employed</option>
                        <option value="retired">Retired</option>
                        <option value="unemployed">Unemployed</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="employer">Employer Name</label>
                    <input type="text" id="employer" name="employer" value="${memberData.name.includes('Trust') ? 'N/A' : 'Smith & Associates'}">
                </div>
                <div class="form-group">
                    <label for="jobTitle">Job Title</label>
                    <input type="text" id="jobTitle" name="jobTitle" value="${memberData.name.includes('Trust') ? 'N/A' : 'Senior Manager'}">
                </div>
                <div class="form-group">
                    <label for="annualIncome">Annual Income Range</label>
                    <select id="annualIncome" name="annualIncome">
                        <option value="under-50k">Under $50,000</option>
                        <option value="50k-100k" ${memberData.annualIncome === '50k-100k' ? 'selected' : ''}>$50,000 - $100,000</option>
                        <option value="100k-250k" ${memberData.annualIncome === '100k-250k' ? 'selected' : ''}>$100,000 - $250,000</option>
                        <option value="250k-500k">$250,000 - $500,000</option>
                        <option value="over-500k" ${memberData.annualIncome === 'over-500k' ? 'selected' : ''}>Over $500,000</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="netWorth">Net Worth Range</label>
                    <select id="netWorth" name="netWorth">
                        <option value="under-100k">Under $100,000</option>
                        <option value="100k-500k">$100,000 - $500,000</option>
                        <option value="500k-1m" selected>$500,000 - $1,000,000</option>
                        <option value="1m-5m">$1,000,000 - $5,000,000</option>
                        <option value="over-5m">Over $5,000,000</option>
                    </select>
                </div>
                <div class="form-group full-width">
                    <label for="fundsSource">Source of Funds</label>
                    <textarea id="fundsSource" name="fundsSource" rows="3" placeholder="Please describe the source of funds for this account...">Employment income and investment returns</textarea>
                </div>
            </div>
            
            <div class="disclosure-questions">
                <h4>Disclosure Questions</h4>
                <div class="question-group">
                    <label class="checkbox-label">
                        <input type="checkbox" name="disclosures" value="affiliated">
                        I am affiliated with a financial services firm
                    </label>
                </div>
                <div class="question-group">
                    <label class="checkbox-label">
                        <input type="checkbox" name="disclosures" value="professional">
                        I am a professional financial advisor
                    </label>
                </div>
                <div class="question-group">
                    <label class="checkbox-label">
                        <input type="checkbox" name="disclosures" value="insider">
                        I am an insider of a publicly traded company
                    </label>
                </div>
            </div>
        </section>

        <section class="form-section">
            <h3>Trusted Contact Information</h3>
            <p class="section-description">Add an emergency contact who can be reached if we're unable to contact you.</p>
            <div class="form-grid">
                <div class="form-group">
                    <label for="trustedName">Contact Name</label>
                    <input type="text" id="trustedName" name="trustedName" placeholder="Full name">
                </div>
                <div class="form-group">
                    <label for="trustedPhone">Contact Phone</label>
                    <input type="tel" id="trustedPhone" name="trustedPhone" placeholder="Phone number">
                </div>
                <div class="form-group">
                    <label for="trustedEmail">Contact Email</label>
                    <input type="email" id="trustedEmail" name="trustedEmail" placeholder="Email address">
                </div>
                <div class="form-group">
                    <label for="trustedRelationship">Relationship</label>
                    <select id="trustedRelationship" name="trustedRelationship">
                        <option value="">Select relationship</option>
                        <option value="spouse">Spouse</option>
                        <option value="parent">Parent</option>
                        <option value="child">Child</option>
                        <option value="sibling">Sibling</option>
                        <option value="friend">Friend</option>
                        <option value="other">Other</option>
                    </select>
                </div>
            </div>
        </section>

        <div class="form-actions">
            <button type="button" class="btn-secondary">Save</button>
            <button type="submit" class="btn-primary">Continue to Review</button>
        </div>
    `;
    
    form.innerHTML = ownerDetailsHTML;
    setupFormSaving();
}

function populateFirmDetails(memberData) {
    const form = document.querySelector('.account-form');
    const firmDetailsHTML = `
        <section class="form-section">
            <h3>${memberData.name} - Firm Details</h3>
            <p class="section-description">Financial and investment profile information for suitability assessment.</p>
        </section>

        <section class="form-section">
            <h3>Net Worth Assessment</h3>
            <div class="form-grid">
                <div class="form-group">
                    <label for="totalNetWorth">Total Net Worth</label>
                    <select id="totalNetWorth" name="totalNetWorth">
                        <option value="under-250k">Under $250,000</option>
                        <option value="250k-500k">$250,000 - $500,000</option>
                        <option value="500k-1m" selected>$500,000 - $1,000,000</option>
                        <option value="1m-5m">$1,000,000 - $5,000,000</option>
                        <option value="over-5m">Over $5,000,000</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="liquidNetWorth">Liquid Net Worth</label>
                    <select id="liquidNetWorth" name="liquidNetWorth">
                        <option value="under-100k">Under $100,000</option>
                        <option value="100k-250k" selected>$100,000 - $250,000</option>
                        <option value="250k-500k">$250,000 - $500,000</option>
                        <option value="500k-1m">$500,000 - $1,000,000</option>
                        <option value="over-1m">Over $1,000,000</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="averageAnnualIncome">Average Annual Income (Last 3 Years)</label>
                    <select id="averageAnnualIncome" name="averageAnnualIncome">
                        <option value="under-75k">Under $75,000</option>
                        <option value="75k-150k" selected>$75,000 - $150,000</option>
                        <option value="150k-300k">$150,000 - $300,000</option>
                        <option value="300k-500k">$300,000 - $500,000</option>
                        <option value="over-500k">Over $500,000</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="incomeSource">Primary Source of Income</label>
                    <select id="incomeSource" name="incomeSource">
                        <option value="employment" selected>Employment/Salary</option>
                        <option value="business">Business Ownership</option>
                        <option value="investments">Investment Income</option>
                        <option value="retirement">Retirement/Pension</option>
                        <option value="other">Other</option>
                    </select>
                </div>
            </div>
        </section>

        <section class="form-section">
            <h3>Investment Experience</h3>
            <div class="form-grid">
                <div class="form-group">
                    <label for="investmentExperience">Overall Investment Experience</label>
                    <select id="investmentExperience" name="investmentExperience">
                        <option value="none">No Experience</option>
                        <option value="limited">Limited (1-3 years)</option>
                        <option value="moderate" selected>Moderate (3-10 years)</option>
                        <option value="extensive">Extensive (10+ years)</option>
                        <option value="professional">Professional</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="stocksExperience">Stocks Experience</label>
                    <select id="stocksExperience" name="stocksExperience">
                        <option value="none">None</option>
                        <option value="limited">Limited</option>
                        <option value="moderate" selected>Moderate</option>
                        <option value="extensive">Extensive</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="bondsExperience">Bonds Experience</label>
                    <select id="bondsExperience" name="bondsExperience">
                        <option value="none">None</option>
                        <option value="limited" selected>Limited</option>
                        <option value="moderate">Moderate</option>
                        <option value="extensive">Extensive</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="optionsExperience">Options/Derivatives Experience</label>
                    <select id="optionsExperience" name="optionsExperience">
                        <option value="none" selected>None</option>
                        <option value="limited">Limited</option>
                        <option value="moderate">Moderate</option>
                        <option value="extensive">Extensive</option>
                    </select>
                </div>
            </div>
        </section>

        <section class="form-section">
            <h3>Liquidity Needs</h3>
            <div class="form-grid">
                <div class="form-group">
                    <label for="liquidityNeeds">How much of your portfolio do you need to access within 2 years?</label>
                    <select id="liquidityNeeds" name="liquidityNeeds">
                        <option value="none">None (0%)</option>
                        <option value="low" selected>Low (1-10%)</option>
                        <option value="moderate">Moderate (11-25%)</option>
                        <option value="high">High (26-50%)</option>
                        <option value="very-high">Very High (50%+)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="emergencyFund">Do you have an emergency fund outside of this account?</label>
                    <select id="emergencyFund" name="emergencyFund">
                        <option value="yes" selected>Yes, 6+ months expenses</option>
                        <option value="partial">Yes, 3-6 months expenses</option>
                        <option value="minimal">Yes, less than 3 months</option>
                        <option value="no">No emergency fund</option>
                    </select>
                </div>
                <div class="form-group full-width">
                    <label for="liquidityPurpose">If you need liquidity, what would be the primary purpose?</label>
                    <textarea id="liquidityPurpose" name="liquidityPurpose" rows="2" placeholder="e.g., home purchase, education, medical expenses, etc.">Unexpected expenses or opportunities</textarea>
                </div>
            </div>
        </section>

        <section class="form-section">
            <h3>Market Conditions Comfort Level</h3>
            <div class="market-scenarios">
                <div class="scenario-group">
                    <h4>If your investment portfolio declined by 10% in one month, you would:</h4>
                    <div class="scenario-options">
                        <label class="checkbox-label">
                            <input type="radio" name="scenario1" value="sell-all">
                            Sell all investments immediately
                        </label>
                        <label class="checkbox-label">
                            <input type="radio" name="scenario1" value="sell-some">
                            Sell some investments to reduce risk
                        </label>
                        <label class="checkbox-label">
                            <input type="radio" name="scenario1" value="hold" checked>
                            Hold your investments and wait for recovery
                        </label>
                        <label class="checkbox-label">
                            <input type="radio" name="scenario1" value="buy-more">
                            Buy more investments at lower prices
                        </label>
                    </div>
                </div>

                <div class="scenario-group">
                    <h4>During a prolonged market downturn (6+ months), you would prefer to:</h4>
                    <div class="scenario-options">
                        <label class="checkbox-label">
                            <input type="radio" name="scenario2" value="conservative">
                            Move to very conservative investments
                        </label>
                        <label class="checkbox-label">
                            <input type="radio" name="scenario2" value="reduce-risk">
                            Reduce risk but stay invested
                        </label>
                        <label class="checkbox-label">
                            <input type="radio" name="scenario2" value="maintain" checked>
                            Maintain current investment strategy
                        </label>
                        <label class="checkbox-label">
                            <input type="radio" name="scenario2" value="opportunistic">
                            Take advantage of opportunities to invest more
                        </label>
                    </div>
                </div>

                <div class="scenario-group">
                    <h4>What is your tolerance for investment volatility?</h4>
                    <div class="scenario-options">
                        <label class="checkbox-label">
                            <input type="radio" name="volatility" value="very-low">
                            Very Low - Prefer stable, predictable returns
                        </label>
                        <label class="checkbox-label">
                            <input type="radio" name="volatility" value="low">
                            Low - Some fluctuation acceptable for modest growth
                        </label>
                        <label class="checkbox-label">
                            <input type="radio" name="volatility" value="moderate" checked>
                            Moderate - Accept significant fluctuations for higher returns
                        </label>
                        <label class="checkbox-label">
                            <input type="radio" name="volatility" value="high">
                            High - Comfortable with large swings for maximum growth
                        </label>
                    </div>
                </div>
            </div>
        </section>

        <div class="form-actions">
            <button type="button" class="btn-secondary">Save</button>
            <button type="submit" class="btn-primary">Continue to Review</button>
        </div>
    `;
    
    form.innerHTML = firmDetailsHTML;
    setupFormSaving();
}

function updateAccountFormContent(accountId, section) {
    const accountData = getAccountData(accountId);
    
    if (!accountData) return;
    
    // Check if we're in review mode and should stay in review mode
    if (isReviewMode) {
        // Stay in review mode - just convert to review for the new section
        const mainContent = document.querySelector('.main-content');
        if (mainContent && !mainContent.classList.contains('review-mode')) {
            mainContent.classList.add('review-mode');
        }
        convertToReviewMode();
    } else {
        // Clean up any existing expanded forms/content that shouldn't persist
        cleanupAccountSectionContent();
        
        // Normal edit mode behavior
        if (section === 'account-setup') {
            populateAccountSetupForm(accountData);
        } else if (section === 'funding') {
            populateFundingForm(accountData);
        } else if (section === 'firm-details') {
            populateAccountFirmDetailsForm(accountData);
        }
    }
    
    // Show visual feedback
    showSectionChangeNotification(accountData.name, section);
    
    // Check completion status for the new section after a brief delay to allow form to populate
    setTimeout(checkAndUpdateCurrentSectionCompletion, 100);
}

function getAccountData(accountId) {
    const accountDataMap = {
        'joint-account': {
            name: 'Joint Account',
            accountType: 'Joint Taxable Account',
            owners: 'John & Mary Smith',
            initialDeposit: '$50,000',
            investmentObjective: 'Growth',
            riskTolerance: 'Moderate'
        },
        'individual-account': {
            name: 'Individual Account',
            accountType: 'Individual Taxable Account',
            owners: 'Mary Smith',
            initialDeposit: '$25,000',
            investmentObjective: 'Income',
            riskTolerance: 'Conservative'
        },
        'trust-account': {
            name: 'Family Trust Account',
            accountType: 'Trust Account',
            owners: 'Smith Family Trust',
            initialDeposit: '$100,000',
            investmentObjective: 'Balanced Growth',
            riskTolerance: 'Moderate-Aggressive'
        }
    };
    
    return accountDataMap[accountId];
}

function populateAccountSetupForm(accountData) {
    const form = document.querySelector('.account-form');
    const accountSetupHTML = `
        <section class="form-section">
            <h3>${accountData.name} - Account Setup</h3>
            <div class="form-grid">
                <div class="form-group">
                    <label for="accountType">Account Type</label>
                    <select id="accountType" name="accountType">
                        <option value="joint-taxable" ${accountData.accountType.includes('Joint') ? 'selected' : ''}>Joint Taxable Account</option>
                        <option value="individual-taxable" ${accountData.accountType.includes('Individual') ? 'selected' : ''}>Individual Taxable Account</option>
                        <option value="trust" ${accountData.accountType.includes('Trust') ? 'selected' : ''}>Trust Account</option>
                        <option value="ira">IRA Account</option>
                        <option value="roth-ira">Roth IRA Account</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="accountOwners">Account Owners</label>
                    <input type="text" id="accountOwners" name="accountOwners" value="${accountData.owners}" readonly>
                </div>
                <div class="form-group">
                    <label for="investmentObjective">Investment Objective</label>
                    <select id="investmentObjective" name="investmentObjective">
                        <option value="growth" ${accountData.investmentObjective === 'Growth' ? 'selected' : ''}>Growth</option>
                        <option value="income" ${accountData.investmentObjective === 'Income' ? 'selected' : ''}>Income</option>
                        <option value="balanced" ${accountData.investmentObjective.includes('Balanced') ? 'selected' : ''}>Balanced Growth</option>
                        <option value="capital-preservation">Capital Preservation</option>
                        <option value="speculation">Speculation</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="riskTolerance">Risk Tolerance</label>
                    <select id="riskTolerance" name="riskTolerance">
                        <option value="conservative" ${accountData.riskTolerance === 'Conservative' ? 'selected' : ''}>Conservative</option>
                        <option value="moderate" ${accountData.riskTolerance === 'Moderate' ? 'selected' : ''}>Moderate</option>
                        <option value="moderate-aggressive" ${accountData.riskTolerance === 'Moderate-Aggressive' ? 'selected' : ''}>Moderate-Aggressive</option>
                        <option value="aggressive">Aggressive</option>
                        <option value="very-aggressive">Very Aggressive</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="tradingPermissions">Trading Permissions</label>
                    <select id="tradingPermissions" name="tradingPermissions" multiple>
                        <option value="stocks" selected>Stocks</option>
                        <option value="bonds" selected>Bonds</option>
                        <option value="mutual-funds" selected>Mutual Funds</option>
                        <option value="etfs" selected>ETFs</option>
                        <option value="options">Options</option>
                        <option value="margin">Margin Trading</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="dividendReinvestment">Dividend Reinvestment</label>
                    <select id="dividendReinvestment" name="dividendReinvestment">
                        <option value="automatic" selected>Automatic Reinvestment</option>
                        <option value="cash">Pay to Cash</option>
                        <option value="selective">Selective Reinvestment</option>
                    </select>
                </div>
                <div class="form-group full-width">
                    <label for="accountPurpose">Account Purpose</label>
                    <textarea id="accountPurpose" name="accountPurpose" rows="3" placeholder="Describe the primary purpose of this account...">${accountData.accountType.includes('Trust') ? 'Estate planning and wealth preservation for family trust beneficiaries' : 'Long-term investment growth and financial planning'}</textarea>
                </div>
            </div>
        </section>
        <div class="form-actions">
            <button type="button" class="btn-secondary">Save</button>
            <button type="submit" class="btn-primary">Continue to Review</button>
        </div>
    `;
    
    form.innerHTML = accountSetupHTML;
    setupFormSaving();
}

// Global funding instances storage
let fundingInstances = {
    'acat': [],
    'ach': [],
    'initial-ach': [],
    'withdrawal': [],
    'contribution': []
};

function populateFundingForm(accountData) {
    const form = document.querySelector('.account-form');
    const fundingHTML = createFundingDashboard(accountData);
    form.innerHTML = fundingHTML;
    setupFundingDashboard();
}

function createFundingDashboard(accountData) {
    return `
        <section class="form-section">
            <h3>${accountData.name} - Funding</h3>
            <div class="funding-dashboard">
                <div class="funding-types-header">
                    <h3>Funding Types</h3>
                    <div class="funding-limit-info">
                        Max: 4 per type, 20 total
                    </div>
                </div>
                
                <div class="funding-types-grid">
                    <div class="funding-type-button" data-type="acat">
                        <div class="funding-type-icon">📈</div>
                        <div class="funding-type-name">ACAT</div>
                        <div class="funding-type-count">${fundingInstances.acat.length}/4</div>
                        ${fundingInstances.acat.length >= 4 ? '<div class="funding-type-limit">!</div>' : ''}
                    </div>
                    <div class="funding-type-button" data-type="ach">
                        <div class="funding-type-icon">🏦</div>
                        <div class="funding-type-name">ACH</div>
                        <div class="funding-type-count">${fundingInstances.ach.length}/4</div>
                        ${fundingInstances.ach.length >= 4 ? '<div class="funding-type-limit">!</div>' : ''}
                    </div>
                    <div class="funding-type-button" data-type="initial-ach">
                        <div class="funding-type-icon">🚀</div>
                        <div class="funding-type-name">Initial ACH</div>
                        <div class="funding-type-count">${fundingInstances['initial-ach'].length}/4</div>
                        ${fundingInstances['initial-ach'].length >= 4 ? '<div class="funding-type-limit">!</div>' : ''}
                    </div>
                    <div class="funding-type-button" data-type="withdrawal">
                        <div class="funding-type-icon">💸</div>
                        <div class="funding-type-name">Systematic Withdrawal</div>
                        <div class="funding-type-count">${fundingInstances.withdrawal.length}/4</div>
                        ${fundingInstances.withdrawal.length >= 4 ? '<div class="funding-type-limit">!</div>' : ''}
                    </div>
                    <div class="funding-type-button" data-type="contribution">
                        <div class="funding-type-icon">💰</div>
                        <div class="funding-type-name">Systematic Contribution</div>
                        <div class="funding-type-count">${fundingInstances.contribution.length}/4</div>
                        ${fundingInstances.contribution.length >= 4 ? '<div class="funding-type-limit">!</div>' : ''}
                    </div>
                </div>
                
                <div class="funding-instances">
                    ${createFundingInstancesSections()}
                </div>
            </div>
        </section>
    `;
}

function createFundingInstancesSections() {
    const sections = [];
    const fundingTypeNames = {
        'acat': 'ACAT Transfers',
        'ach': 'ACH Transfers',
        'initial-ach': 'Initial ACH Transfers',
        'withdrawal': 'Systematic Withdrawals',
        'contribution': 'Systematic Contributions'
    };
    
    Object.keys(fundingInstances).forEach(type => {
        const instances = fundingInstances[type];
        if (instances.length > 0) {
            sections.push(`
                <div class="funding-type-section" data-type="${type}">
                    <div class="funding-type-section-header">
                        <div class="funding-type-section-title">
                            ${fundingTypeNames[type]}
                        </div>
                        <div class="funding-type-section-count">
                            ${instances.length} instance${instances.length !== 1 ? 's' : ''}
                        </div>
                    </div>
                    <div class="funding-instances-list">
                        ${instances.map((instance, index) => createFundingInstanceHTML(instance, type, index)).join('')}
                    </div>
                </div>
            `);
        }
    });
    
    return sections.join('');
}

function createFundingInstanceHTML(instance, type, index) {
    return `
        <div class="funding-instance" data-type="${type}" data-index="${index}">
            <div class="funding-instance-info">
                <div class="funding-instance-name">${instance.name}</div>
                <div class="funding-instance-details">${instance.details}</div>
            </div>
            <div class="funding-instance-actions">
                <button class="funding-instance-btn edit" onclick="editFundingInstance('${type}', ${index})">Edit</button>
                <button class="funding-instance-btn delete" onclick="deleteFundingInstance('${type}', ${index})">Delete</button>
            </div>
        </div>
    `;
}

function setupFundingDashboard() {
    const fundingButtons = document.querySelectorAll('.funding-type-button');
    
    fundingButtons.forEach(button => {
        button.addEventListener('click', function() {
            const type = this.getAttribute('data-type');
            const totalInstances = getTotalFundingInstances();
            const typeInstances = fundingInstances[type].length;
            
            // Check limits
            if (typeInstances >= 4) {
                alert(`Maximum of 4 ${type.toUpperCase()} instances allowed.`);
                return;
            }
            
            if (totalInstances >= 20) {
                alert('Maximum of 20 total funding instances allowed.');
                return;
            }
            
            openFundingTypeForm(type);
        });
    });
    
    updateFundingButtonStates();
}

function updateFundingButtonStates() {
    const fundingButtons = document.querySelectorAll('.funding-type-button');
    const totalInstances = getTotalFundingInstances();
    
    fundingButtons.forEach(button => {
        const type = button.getAttribute('data-type');
        const typeInstances = fundingInstances[type].length;
        
        if (typeInstances >= 4 || totalInstances >= 20) {
            button.classList.add('disabled');
        } else {
            button.classList.remove('disabled');
        }
    });
}

function getTotalFundingInstances() {
    return Object.values(fundingInstances).reduce((total, instances) => total + instances.length, 0);
}

function openFundingTypeForm(type, editIndex = null) {
    const form = document.querySelector('.account-form');
    const existingForm = document.querySelector('.funding-form-container');
    
    if (existingForm) {
        existingForm.remove();
    }
    
    const formHTML = createFundingTypeForm(type, editIndex);
    form.insertAdjacentHTML('afterend', formHTML);
    setupFundingTypeFormEvents(type, editIndex);
}

function createFundingTypeForm(type, editIndex) {
    const isEdit = editIndex !== null;
    const instance = isEdit ? fundingInstances[type][editIndex] : null;
    
    const typeNames = {
        'acat': 'ACAT Transfer',
        'ach': 'ACH Transfer',
        'initial-ach': 'Initial ACH Transfer',
        'withdrawal': 'Systematic Withdrawal',
        'contribution': 'Systematic Contribution'
    };
    
    return `
        <div class="funding-form-container">
            <div class="funding-form-header">
                <h3>${isEdit ? 'Edit' : 'New'} ${typeNames[type]}</h3>
                <button class="funding-form-close" onclick="closeFundingForm()">×</button>
            </div>
            <div class="funding-form-content">
                ${getFundingFormFields(type, instance)}
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="closeFundingForm()">Cancel</button>
                    <button type="button" class="btn-primary" onclick="saveFundingInstance('${type}', ${editIndex})">
                        ${isEdit ? 'Update' : 'Save'} ${typeNames[type]}
                    </button>
                </div>
            </div>
        </div>
    `;
}

function getFundingFormFields(type, instance) {
    const baseFields = `
        <div class="form-grid">
            <div class="form-group">
                <label for="instanceName">Instance Name</label>
                <input type="text" id="instanceName" name="instanceName" value="${instance?.name || ''}" placeholder="Enter a name for this instance">
            </div>
        </div>
    `;
    
    switch(type) {
        case 'acat':
            return baseFields + `
                <div class="form-grid">
                    <div class="form-group">
                        <label for="fromFirm">From Firm</label>
                        <input type="text" id="fromFirm" name="fromFirm" value="${instance?.fromFirm || ''}" placeholder="Current custodian firm">
                    </div>
                    <div class="form-group">
                        <label for="accountNumber">Account Number</label>
                        <input type="text" id="accountNumber" name="accountNumber" value="${instance?.accountNumber || ''}" placeholder="Account number at current firm">
                    </div>
                    <div class="form-group">
                        <label for="transferType">Transfer Type</label>
                        <select id="transferType" name="transferType">
                            <option value="full" ${instance?.transferType === 'full' ? 'selected' : ''}>Full Transfer</option>
                            <option value="partial" ${instance?.transferType === 'partial' ? 'selected' : ''}>Partial Transfer</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="estimatedValue">Estimated Value</label>
                        <input type="text" id="estimatedValue" name="estimatedValue" value="${instance?.estimatedValue || ''}" placeholder="$0.00">
                    </div>
                </div>
            `;
            
        case 'ach':
            return baseFields + `
                <div class="form-grid">
                    <div class="form-group">
                        <label for="bankName">Bank Name</label>
                        <input type="text" id="bankName" name="bankName" value="${instance?.bankName || ''}" placeholder="Enter bank name">
                    </div>
                    <div class="form-group">
                        <label for="routingNumber">Routing Number</label>
                        <input type="text" id="routingNumber" name="routingNumber" value="${instance?.routingNumber || ''}" placeholder="9-digit routing number">
                    </div>
                    <div class="form-group">
                        <label for="accountNumber">Account Number</label>
                        <input type="text" id="accountNumber" name="accountNumber" value="${instance?.accountNumber || ''}" placeholder="Bank account number">
                    </div>
                    <div class="form-group">
                        <label for="transferAmount">Transfer Amount</label>
                        <input type="text" id="transferAmount" name="transferAmount" value="${instance?.transferAmount || ''}" placeholder="$0.00">
                    </div>
                </div>
            `;
            
        case 'initial-ach':
            return baseFields + `
                <div class="form-grid">
                    <div class="form-group">
                        <label for="bankName">Bank Name</label>
                        <input type="text" id="bankName" name="bankName" value="${instance?.bankName || ''}" placeholder="Enter bank name">
                    </div>
                    <div class="form-group">
                        <label for="routingNumber">Routing Number</label>
                        <input type="text" id="routingNumber" name="routingNumber" value="${instance?.routingNumber || ''}" placeholder="9-digit routing number">
                    </div>
                    <div class="form-group">
                        <label for="accountNumber">Account Number</label>
                        <input type="text" id="accountNumber" name="accountNumber" value="${instance?.accountNumber || ''}" placeholder="Bank account number">
                    </div>
                    <div class="form-group">
                        <label for="initialAmount">Initial Deposit Amount</label>
                        <input type="text" id="initialAmount" name="initialAmount" value="${instance?.initialAmount || ''}" placeholder="$0.00">
                    </div>
                    <div class="form-group">
                        <label for="transferDate">Transfer Date</label>
                        <input type="date" id="transferDate" name="transferDate" value="${instance?.transferDate || ''}">
                    </div>
                </div>
            `;
            
        case 'withdrawal':
            return baseFields + `
                <div class="form-grid">
                    <div class="form-group">
                        <label for="frequency">Withdrawal Frequency</label>
                        <select id="frequency" name="frequency">
                            <option value="monthly" ${instance?.frequency === 'monthly' ? 'selected' : ''}>Monthly</option>
                            <option value="quarterly" ${instance?.frequency === 'quarterly' ? 'selected' : ''}>Quarterly</option>
                            <option value="semi-annual" ${instance?.frequency === 'semi-annual' ? 'selected' : ''}>Semi-Annual</option>
                            <option value="annual" ${instance?.frequency === 'annual' ? 'selected' : ''}>Annual</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="withdrawalAmount">Withdrawal Amount</label>
                        <input type="text" id="withdrawalAmount" name="withdrawalAmount" value="${instance?.withdrawalAmount || ''}" placeholder="$0.00">
                    </div>
                    <div class="form-group">
                        <label for="startDate">Start Date</label>
                        <input type="date" id="startDate" name="startDate" value="${instance?.startDate || ''}">
                    </div>
                    <div class="form-group">
                        <label for="endDate">End Date (Optional)</label>
                        <input type="date" id="endDate" name="endDate" value="${instance?.endDate || ''}">
                    </div>
                </div>
            `;
            
        case 'contribution':
            return baseFields + `
                <div class="form-grid">
                    <div class="form-group">
                        <label for="frequency">Contribution Frequency</label>
                        <select id="frequency" name="frequency">
                            <option value="weekly" ${instance?.frequency === 'weekly' ? 'selected' : ''}>Weekly</option>
                            <option value="bi-weekly" ${instance?.frequency === 'bi-weekly' ? 'selected' : ''}>Bi-Weekly</option>
                            <option value="monthly" ${instance?.frequency === 'monthly' ? 'selected' : ''}>Monthly</option>
                            <option value="quarterly" ${instance?.frequency === 'quarterly' ? 'selected' : ''}>Quarterly</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="contributionAmount">Contribution Amount</label>
                        <input type="text" id="contributionAmount" name="contributionAmount" value="${instance?.contributionAmount || ''}" placeholder="$0.00">
                    </div>
                    <div class="form-group">
                        <label for="bankName">Bank Name</label>
                        <input type="text" id="bankName" name="bankName" value="${instance?.bankName || ''}" placeholder="Enter bank name">
                    </div>
                    <div class="form-group">
                        <label for="routingNumber">Routing Number</label>
                        <input type="text" id="routingNumber" name="routingNumber" value="${instance?.routingNumber || ''}" placeholder="9-digit routing number">
                    </div>
                    <div class="form-group">
                        <label for="accountNumber">Account Number</label>
                        <input type="text" id="accountNumber" name="accountNumber" value="${instance?.accountNumber || ''}" placeholder="Bank account number">
                    </div>
                    <div class="form-group">
                        <label for="startDate">Start Date</label>
                        <input type="date" id="startDate" name="startDate" value="${instance?.startDate || ''}">
                    </div>
                </div>
            `;
    }
}

function setupFundingTypeFormEvents(type, editIndex) {
    // Add any specific form event handlers here if needed
}

function saveFundingInstance(type, editIndex) {
    const formContainer = document.querySelector('.funding-form-container');
    const formData = new FormData();
    
    // Collect form data
    const inputs = formContainer.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        formData.append(input.name, input.value);
    });
    
    // Validate required fields
    const instanceName = formData.get('instanceName');
    if (!instanceName.trim()) {
        alert('Please enter an instance name.');
        return;
    }
    
    // Create instance object
    const instance = {
        name: instanceName,
        details: createInstanceDetails(type, formData),
        type: type,
        created: new Date().toISOString()
    };
    
    // Add all form data to instance
    for (let [key, value] of formData.entries()) {
        instance[key] = value;
    }
    
    // Save or update instance
    if (editIndex !== null) {
        fundingInstances[type][editIndex] = instance;
    } else {
        fundingInstances[type].push(instance);
    }
    
    // Refresh dashboard
    refreshFundingDashboard();
    closeFundingForm();
}

function createInstanceDetails(type, formData) {
    switch(type) {
        case 'acat':
            return `${formData.get('fromFirm')} • ${formData.get('transferType')} • ${formData.get('estimatedValue')}`;
        case 'ach':
            return `${formData.get('bankName')} • ${formData.get('transferAmount')}`;
        case 'initial-ach':
            return `${formData.get('bankName')} • ${formData.get('initialAmount')} • ${formData.get('transferDate')}`;
        case 'withdrawal':
            return `${formData.get('frequency')} • ${formData.get('withdrawalAmount')} • Start: ${formData.get('startDate')}`;
        case 'contribution':
            return `${formData.get('frequency')} • ${formData.get('contributionAmount')} • ${formData.get('bankName')}`;
        default:
            return 'Details not available';
    }
}

function editFundingInstance(type, index) {
    openFundingTypeForm(type, index);
}

function deleteFundingInstance(type, index) {
    if (confirm('Are you sure you want to delete this funding instance?')) {
        fundingInstances[type].splice(index, 1);
        refreshFundingDashboard();
    }
}

function closeFundingForm() {
    const formContainer = document.querySelector('.funding-form-container');
    if (formContainer) {
        formContainer.remove();
    }
}

function cleanupAccountSectionContent() {
    // Close any expanded funding forms (ACAT, ACH, etc.)
    const fundingFormContainer = document.querySelector('.funding-form-container');
    if (fundingFormContainer) {
        fundingFormContainer.remove();
    }
    
    // Remove any other modal or overlay content that shouldn't persist
    const allFormContainers = document.querySelectorAll('[class*="form-container"]');
    allFormContainers.forEach(container => {
        // Only remove containers that are dynamically added (not the main account-form)
        if (!container.closest('.main-content') && container.classList.contains('funding-form-container')) {
            container.remove();
        }
    });
    
    // Close any other expanded content that should only be visible in specific sections
    // This ensures a clean slate when switching between account tabs
}

function refreshFundingDashboard() {
    const accountData = currentData; // Use current account data
    const form = document.querySelector('.account-form');
    form.innerHTML = createFundingDashboard(accountData);
    setupFundingDashboard();
}

function populateAccountFirmDetailsForm(accountData) {
    const form = document.querySelector('.account-form');
    const accountFirmDetailsHTML = `
        <section class="form-section">
            <h3>${accountData.name} - Firm Details</h3>
            <p class="section-description">Investment selection rationale and alternative investment considerations for ${accountData.accountType}.</p>
        </section>

        <section class="form-section">
            <h3>Investment Selection Rationale</h3>
            <div class="form-grid">
                <div class="form-group full-width">
                    <label for="investmentObjectiveReason">Why was this investment objective (${accountData.investmentObjective}) chosen for this account?</label>
                    <textarea id="investmentObjectiveReason" name="investmentObjectiveReason" rows="3" placeholder="Explain the reasoning behind the selected investment objective...">${accountData.investmentObjective === 'Growth' ? 'Long-term wealth accumulation is the primary goal for this account, with a time horizon exceeding 10 years allowing for higher risk tolerance.' : accountData.investmentObjective === 'Income' ? 'Current income generation is prioritized to support ongoing financial needs while preserving capital.' : 'Balanced approach combining growth potential with income generation to meet diverse financial objectives.'}</textarea>
                </div>
                <div class="form-group full-width">
                    <label for="riskToleranceJustification">What factors support the selected risk tolerance (${accountData.riskTolerance}) for this account?</label>
                    <textarea id="riskToleranceJustification" name="riskToleranceJustification" rows="3" placeholder="Describe the client factors that justify this risk level...">${accountData.riskTolerance === 'Conservative' ? 'Client prioritizes capital preservation with stable income needs. Limited investment experience and shorter time horizon support lower risk approach.' : accountData.riskTolerance === 'Moderate' ? 'Client has adequate emergency reserves, stable income, and medium-term time horizon. Some volatility is acceptable for higher returns.' : 'Client has strong financial foundation, extensive investment experience, and long-term outlook allowing for higher volatility in pursuit of superior returns.'}</textarea>
                </div>
                <div class="form-group">
                    <label for="timeHorizon">Investment Time Horizon</label>
                    <select id="timeHorizon" name="timeHorizon">
                        <option value="short">Short-term (1-3 years)</option>
                        <option value="medium" ${accountData.riskTolerance === 'Moderate' ? 'selected' : ''}>Medium-term (3-7 years)</option>
                        <option value="long" ${accountData.riskTolerance === 'Moderate-Aggressive' ? 'selected' : ''}>Long-term (7-15 years)</option>
                        <option value="very-long" ${accountData.investmentObjective === 'Growth' ? 'selected' : ''}>Very long-term (15+ years)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="reviewFrequency">Portfolio Review Frequency</label>
                    <select id="reviewFrequency" name="reviewFrequency">
                        <option value="monthly">Monthly</option>
                        <option value="quarterly" selected>Quarterly</option>
                        <option value="semi-annual">Semi-annually</option>
                        <option value="annual">Annually</option>
                    </select>
                </div>
            </div>
        </section>

        <section class="form-section">
            <h3>Asset Allocation Strategy</h3>
            <div class="form-grid">
                <div class="form-group">
                    <label for="equityAllocation">Target Equity Allocation (%)</label>
                    <input type="number" id="equityAllocation" name="equityAllocation" min="0" max="100" value="${accountData.investmentObjective === 'Growth' ? '80' : accountData.investmentObjective === 'Income' ? '40' : '60'}" placeholder="0-100">
                </div>
                <div class="form-group">
                    <label for="fixedIncomeAllocation">Target Fixed Income Allocation (%)</label>
                    <input type="number" id="fixedIncomeAllocation" name="fixedIncomeAllocation" min="0" max="100" value="${accountData.investmentObjective === 'Growth' ? '15' : accountData.investmentObjective === 'Income' ? '50' : '30'}" placeholder="0-100">
                </div>
                <div class="form-group">
                    <label for="cashAllocation">Target Cash Allocation (%)</label>
                    <input type="number" id="cashAllocation" name="cashAllocation" min="0" max="100" value="${accountData.investmentObjective === 'Growth' ? '5' : accountData.investmentObjective === 'Income' ? '10' : '10'}" placeholder="0-100">
                </div>
                <div class="form-group">
                    <label for="allocationRationale">Asset Allocation Rationale</label>
                    <select id="allocationRationale" name="allocationRationale">
                        <option value="age-based" ${accountData.investmentObjective === 'Income' ? 'selected' : ''}>Age-based allocation strategy</option>
                        <option value="goals-based" selected>Goals-based allocation strategy</option>
                        <option value="risk-parity">Risk parity approach</option>
                        <option value="strategic">Strategic long-term allocation</option>
                        <option value="tactical">Tactical allocation with adjustments</option>
                    </select>
                </div>
                <div class="form-group full-width">
                    <label for="rebalancingStrategy">Rebalancing Strategy</label>
                    <textarea id="rebalancingStrategy" name="rebalancingStrategy" rows="2" placeholder="Describe the rebalancing approach and triggers...">Portfolio will be rebalanced quarterly or when any asset class deviates more than 5% from target allocation, prioritizing tax efficiency and transaction costs.</textarea>
                </div>
            </div>
        </section>

        <section class="form-section">
            <h3>Alternative Investment Considerations</h3>
            <div class="alternative-investments">
                <div class="investment-category">
                    <h4>Real Estate Investment Trusts (REITs)</h4>
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="reitsConsidered">Were REITs considered for this account?</label>
                            <select id="reitsConsidered" name="reitsConsidered">
                                <option value="yes" selected>Yes, considered</option>
                                <option value="no">No, not considered</option>
                                <option value="included">Yes, included in allocation</option>
                            </select>
                        </div>
                        <div class="form-group full-width">
                            <label for="reitsRationale">REITS Decision Rationale</label>
                            <textarea id="reitsRationale" name="reitsRationale" rows="2" placeholder="Explain why REITs were or were not included...">REITs provide diversification benefits and inflation protection but were excluded due to client's existing real estate exposure through primary residence and rental properties.</textarea>
                        </div>
                    </div>
                </div>

                <div class="investment-category">
                    <h4>Commodities</h4>
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="commoditiesConsidered">Were commodities considered for this account?</label>
                            <select id="commoditiesConsidered" name="commoditiesConsidered">
                                <option value="yes">Yes, considered</option>
                                <option value="no" selected>No, not suitable</option>
                                <option value="included">Yes, included in allocation</option>
                            </select>
                        </div>
                        <div class="form-group full-width">
                            <label for="commoditiesRationale">Commodities Decision Rationale</label>
                            <textarea id="commoditiesRationale" name="commoditiesRationale" rows="2" placeholder="Explain the commodities investment decision...">Commodities were not included due to their high volatility and lack of income generation, which doesn't align with the client's current objectives and risk tolerance.</textarea>
                        </div>
                    </div>
                </div>

                <div class="investment-category">
                    <h4>International/Emerging Markets</h4>
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="internationalExposure">International Market Exposure</label>
                            <select id="internationalExposure" name="internationalExposure">
                                <option value="none">No international exposure</option>
                                <option value="developed" selected>Developed markets only</option>
                                <option value="mixed">Developed and emerging markets</option>
                                <option value="emerging">Emerging markets focus</option>
                            </select>
                        </div>
                        <div class="form-group full-width">
                            <label for="internationalRationale">International Exposure Rationale</label>
                            <textarea id="internationalRationale" name="internationalRationale" rows="2" placeholder="Explain the international investment approach...">Developed international markets provide diversification benefits with lower volatility than emerging markets. Allocation provides global exposure while managing currency and political risks.</textarea>
                        </div>
                    </div>
                </div>

                <div class="investment-category">
                    <h4>Alternative Investment Summary</h4>
                    <div class="form-grid">
                        <div class="form-group full-width">
                            <label for="alternativesSummary">Overall Alternative Investment Strategy</label>
                            <textarea id="alternativesSummary" name="alternativesSummary" rows="3" placeholder="Summarize the overall approach to alternative investments for this account...">The investment strategy focuses on traditional asset classes (stocks, bonds, cash) with limited alternative investments. This approach aligns with the client's experience level, risk tolerance, and preference for liquid, transparent investments with lower fees.</textarea>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <div class="form-actions">
            <button type="button" class="btn-secondary">Save</button>
            <button type="submit" class="btn-primary">Continue to Review</button>
        </div>
    `;
    
    form.innerHTML = accountFirmDetailsHTML;
    setupFormSaving();
}

function showSectionChangeNotification(itemName, section) {
    // Create notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: #3b82f6;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 1000;
        font-size: 0.875rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    let sectionName;
    switch(section) {
        case 'owner-details':
            sectionName = 'Owner Details';
            break;
        case 'firm-details':
            sectionName = 'Firm Details';
            break;
        case 'account-setup':
            sectionName = 'Account Setup';
            break;
        case 'funding':
            sectionName = 'Funding';
            break;
        default:
            sectionName = section;
    }
    
    notification.textContent = `Now viewing ${itemName} - ${sectionName}`;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Animate out and remove
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}