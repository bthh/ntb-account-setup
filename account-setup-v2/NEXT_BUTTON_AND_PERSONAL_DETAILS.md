# Next Button & Personal Details Implementation

## ✅ Smart Navigation & Terminology Updates

Added intelligent "Next" button navigation and updated terminology from "Owner Details" to "Personal Details" throughout the application.

## Key Features Added

### 1. Next Button with Intelligent Navigation
**Location**: Header area, positioned left of the Edit/Review button

**Smart Navigation Logic**:
- **Within Members**: Personal Details → Firm Details → Next Member
- **Member to Account Transition**: Last member → First account
- **Within Accounts**: Account Setup → Funding → Firm Details → Next Account
- **End of Flow**: Button disables when reaching final section

**Navigation Flow Example**:
1. John Smith Personal Details
2. John Smith Firm Details  
3. Mary Smith Personal Details
4. Mary Smith Firm Details
5. Smith Trust Personal Details
6. Smith Trust Firm Details
7. Joint Account Setup
8. Joint Account Funding
9. Joint Account Firm Details
10. Individual Account Setup
11. Individual Account Funding
12. Individual Account Firm Details
13. Trust Account Setup
14. Trust Account Funding
15. Trust Account Firm Details → **Button Disabled (Complete)**

### 2. Terminology Update: "Personal Details"
**Changed From**: "Owner Details"
**Changed To**: "Personal Details"

**Updated Locations**:
- Sidebar navigation labels
- Form titles and headers
- Review mode section titles
- Code comments and documentation

## Technical Implementation

### Navigation Algorithm
```typescript
const getNextSectionAndEntity = () => {
  const memberOrder = ['john-smith', 'mary-smith', 'smith-trust'];
  const accountOrder = ['joint-account', 'individual-account', 'trust-account'];
  const memberSections = ['owner-details', 'firm-details'];
  const accountSections = ['account-setup', 'funding', 'firm-details'];

  // Logic handles current position and calculates next step
  // Returns null when navigation is complete
};
```

### Button State Management
- **Enabled**: When there's a next section/entity available
- **Disabled**: When user reaches the final section (Trust Account Firm Details)
- **Icon**: `pi pi-arrow-right` for clear directional indication

### Section Change Notifications
The existing notification system automatically shows the updated section:
- **"Section Changed: Mary Smith - Personal Details"**
- **"Section Changed: Joint Account - Account Setup"**

## User Experience Benefits

### Before
- ❌ No guided navigation flow
- ❌ Users had to manually click through sidebar
- ❌ Unclear terminology ("Owner Details")
- ❌ No indication of progress completion

### After
- ✅ One-click navigation through entire flow
- ✅ Logical progression through all members and accounts
- ✅ Clear terminology ("Personal Details")
- ✅ Button disables when complete
- ✅ Maintains existing sidebar navigation as alternative
- ✅ Works in both Edit and Review modes

## Navigation Order Details

### Members (3 total)
1. **John Smith** (Primary Account Holder)
   - Personal Details → Firm Details
2. **Mary Smith** (Joint Account Holder)  
   - Personal Details → Firm Details
3. **Smith Trust** (Trust Entity)
   - Personal Details → Firm Details

### Accounts (3 total)
1. **Joint Account** (John & Mary Smith)
   - Account Setup → Funding → Firm Details
2. **Individual Account** (Mary Smith)
   - Account Setup → Funding → Firm Details  
3. **Trust Account** (Smith Family Trust)
   - Account Setup → Funding → Firm Details

## Technical Benefits

### Code Organization
- **Centralized logic**: Single function handles all navigation decisions
- **Maintainable**: Easy to modify navigation order or add new entities
- **Type safe**: Uses existing Section type definitions
- **Consistent**: Reuses existing `handleSectionChange` functionality

### Performance
- **No state bloat**: Uses existing state management
- **Efficient**: O(1) lookup for current position and next step
- **Clean**: No additional component re-renders needed

### Accessibility
- **Keyboard navigation**: Button works with tab/enter
- **Screen reader friendly**: Clear button labels and state
- **Visual feedback**: Disabled state clearly indicates completion

The Next button provides a streamlined way to complete the entire account setup flow while maintaining the flexibility of manual navigation through the sidebar.