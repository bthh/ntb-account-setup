"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import {
  ArrowLeft,
  ArrowRight,
  Zap,
  FileText,
  User,
  Users,
  TriangleAlert,
  CheckCircle,
  Folder,
  Bell,
  Search,
  Edit,
  Eye,
} from "lucide-react"
import Link from "next/link"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sidebar } from "@/components/sidebar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface BankingInfo {
  id: string
  bankName: string
  accountNumber: string
  routingNumber: string
  accountHolderName: string
  bankAccountType: string
}

interface FundingInfo {
  id: string
  fundingMethod: string
  wireTransferBankName?: string
  wireTransferAccountNumber?: string
  wireTransferRoutingNumber?: string
  wireTransferSwiftBic?: string
  wireTransferBankAddress?: string
}

// Add new interface for Registration
interface Registration {
  id: string
  name: string
  type: "individual" | "joint" | "trust"
  ownerIds: string[] // All contacts associated with this registration (can be primary, secondary, or trustees)
  trusteeIds?: string[] // For trust registrations
  accountIds: string[]
}

// Update the `AccountType` interface to use `ownerIds` as an array
interface AccountType {
  id: string
  type: string
  subtype: string
  initialDeposit: string
  accountName: string
  description: string
  minimumDeposit: string
  features: string[]
  ownerIds?: string[] // Changed from ownerId to ownerIds (array of strings)
  investmentAmount: string
  sampleCustodian: string
  bankingInfo: BankingInfo[]
  fundingInfo: FundingInfo[]
}

interface ContactOwner {
  id: string
  firstName: string
  middleInitial?: string
  lastName: string
  dateOfBirth: string
  socialSecurityNumber: string
  primaryPhone: string
  secondaryPhone?: string
  emailAddress: string
  homeAddress: string
  mailingAddress?: string
  citizenshipType: string
  identificationAttachment?: string
  employmentStatus: string
  publicCompanyAffiliation: boolean
  brokerDealerAffiliation: boolean
  annualIncomeRange: string
  netWorthRange: string
  sourceOfFunds: string
  ongoingSourceOfFunds: string
  trustedContactFirstName?: string
  trustedContactMiddleInitial?: string
  trustedContactLastName?: string
  trustedContactSuffix?: string
  trustedContactTelephone?: string
  trustedContactMobile?: string
  trustedContactEmail?: string
  trustedContactMailingAddress?: string
  trustedContactRelationship?: string
}

const contactFieldLabels: { [key: string]: string } = {
  firstName: "First Name",
  middleInitial: "Middle Initial",
  lastName: "Last Name",
  dateOfBirth: "Date of Birth",
  socialSecurityNumber: "Social Security Number",
  primaryPhone: "Primary Phone",
  secondaryPhone: "Secondary Phone",
  emailAddress: "Email Address",
  homeAddress: "Home Address",
  mailingAddress: "Mailing Address",
  citizenshipType: "Citizenship Type",
  identificationAttachment: "Identification Attachment",
  employmentStatus: "Employment Status",
  publicCompanyAffiliation: "Public Company Affiliation",
  brokerDealerAffiliation: "Broker-Dealer Affiliation",
  annualIncomeRange: "Annual Income Range",
  netWorthRange: "Approximate Net Worth Range",
  sourceOfFunds: "Source of Funds",
  ongoingSourceOfFunds: "Ongoing Source of Funds",
  trustedContactFirstName: "Trusted Contact First Name",
  trustedContactMiddleInitial: "Trusted Contact Middle Initial",
  trustedContactLastName: "Trusted Contact Last Name",
  trustedContactSuffix: "Trusted Contact Suffix",
  trustedContactTelephone: "Trusted Contact Telephone Number",
  trustedContactMobile: "Trusted Contact Mobile Number",
  trustedContactEmail: "Trusted Contact Email Address",
  trustedContactMailingAddress: "Trusted Contact Mailing Address",
  trustedContactRelationship: "Trusted Contact Relationship to Owner",
}

// Update the `accountFieldLabels` to reflect the change from `ownerId` to `ownerIds`
const accountFieldLabels: { [key: string]: string } = {
  accountName: "Account Name", // Keep existing field above ownerIds
  type: "Account Type",
  subtype: "Account Subtype",
  initialDeposit: "Initial Deposit",
  description: "Description",
  minimumDeposit: "Minimum Deposit Required",
  primaryOwnerId: "Primary Owner", // New label for primary owner
  secondaryOwnerId: "Secondary Owner", // New label for secondary owner
  investmentAmount: "Investment Amount",
  sampleCustodian: "Sample Custodian",
  bankingInfo: "Banking Information",
  fundingInfo: "Funding Information",
}

const bankingInfoFieldLabels: { [key: string]: string } = {
  bankName: "Bank Name",
  accountNumber: "Account Number",
  routingNumber: "Routing Number",
  accountHolderName: "Account Holder Name",
  bankAccountType: "Bank Account Type",
}

const fundingInfoFieldLabels: { [key: string]: string } = {
  fundingMethod: "Funding Method",
  wireTransferBankName: "Bank Name",
  wireTransferAccountNumber: "Account Number",
  routingNumber: "Routing Number",
  wireTransferSwiftBic: "SWIFT/BIC",
  wireTransferBankAddress: "Bank Address",
}

const formatCurrency = (value: string): string => {
  const num = Number.parseFloat(value)
  if (isNaN(num)) {
    return ""
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}

const parseCurrencyInput = (input: string): string => {
  const parts = input.split(".")
  let cleaned = parts[0].replace(/[^\d]/g, "")
  if (parts.length > 1) {
    cleaned += "." + parts.slice(1).join("").replace(/[^\d]/g, "")
  }
  return cleaned
}

export default function AccountSetup() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isInitialDepositFocused, setIsInitialDepositFocused] = useState(false)
  const [isMinimumDepositFocused, setIsMinimumDepositFocused] = useState(false)
  const [isInvestmentAmountFocused, setIsInvestmentAmountFocused] = useState(false)
  const [selectedContact, setSelectedContact] = useState<string>("1") // Default to first contact
  const [selectedAccount, setSelectedAccount] = useState<string>("") // No account selected initially
  const [selectedRegistrationId, setSelectedRegistrationId] = useState<string | null>(null)
  const [householdTitle, setHouseholdTitle] = useState<string>("The Smith Family")
  const [accordionValue, setAccordionValue] = useState<string[]>([])
  const [showSummary, setShowSummary] = useState(false)

  const [previewContactId, setPreviewContactId] = useState<string | null>(null)
  const [previewAccountId, setPreviewAccountId] = useState<string | null>(null)

  const [contacts, setContacts] = useState<ContactOwner[]>([
    {
      id: "1",
      firstName: "John",
      middleInitial: "A",
      lastName: "Smith",
      dateOfBirth: "1980-01-01",
      socialSecurityNumber: "123-45-6789", // Ensure valid SSN format
      primaryPhone: "(555) 123-4567",
      secondaryPhone: "(555) 987-6543",
      emailAddress: "john.a.smith@email.com",
      homeAddress: "123 Main St, Anytown, CA 91234",
      mailingAddress: "PO Box 456, Anytown, CA 91234",
      citizenshipType: "US Citizen",
      identificationAttachment: "passport.jpg",
      employmentStatus: "Employed",
      publicCompanyAffiliation: false,
      brokerDealerAffiliation: false,
      annualIncomeRange: "100k-250k", // Ensure these are filled
      netWorthRange: "500k-1m", // Ensure these are filled
      sourceOfFunds: "Employment Income", // Ensure these are filled
      ongoingSourceOfFunds: "Employment Income", // Ensure these are filled
      trustedContactFirstName: "",
      trustedContactMiddleInitial: "",
      trustedContactLastName: "",
      trustedContactSuffix: "",
      trustedContactTelephone: "",
      trustedContactMobile: "",
      trustedContactEmail: "",
      trustedContactMailingAddress: "",
      trustedContactRelationship: "",
    },
    {
      id: "2",
      firstName: "Mary", // Updated to "Jane"
      middleInitial: "B",
      lastName: "Smith",
      dateOfBirth: "1985-02-02",
      socialSecurityNumber: "987-65-4321", // Fixed invalid format for demonstration
      primaryPhone: "(555) 222-3333",
      secondaryPhone: "(555) 444-5555",
      emailAddress: "jane.b.doe@email.com", // Fixed invalid format for demonstration
      homeAddress: "456 Oak Ave, Anytown, CA 91234", // Fixed invalid for demonstration
      mailingAddress: "789 Oak St, Anytown, CA 91234",
      citizenshipType: "US Citizen", // Fixed invalid for demonstration
      identificationAttachment: "drivers_license.pdf",
      employmentStatus: "Employed",
      publicCompanyAffiliation: true,
      brokerDealerAffiliation: true,
      annualIncomeRange: "50k-100k", // Fixed invalid for demonstration
      netWorthRange: "100k-500k",
      sourceOfFunds: "Employment Income",
      ongoingSourceOfFunds: "Employment Income", // Fixed invalid for demonstration
      trustedContactFirstName: "",
      trustedContactMiddleInitial: "",
      trustedContactLastName: "",
      trustedContactSuffix: "",
      trustedContactTelephone: "",
      trustedContactMobile: "",
      trustedContactEmail: "",
      trustedContactMailingAddress: "",
      trustedContactRelationship: "",
    },
    {
      id: "3",
      firstName: "Smith Family",
      lastName: "Trust",
      dateOfBirth: "", // Not applicable for a trust entity
      socialSecurityNumber: "", // Not applicable for a trust entity
      primaryPhone: "(555) 777-8888",
      emailAddress: "trust@email.com",
      homeAddress: "789 Trust Rd, Anytown, CA 91234",
      citizenshipType: "US Entity", // Or appropriate for a trust
      employmentStatus: "N/A",
      publicCompanyAffiliation: false,
      brokerDealerAffiliation: false,
      annualIncomeRange: "N/A",
      netWorthRange: "N/A",
      sourceOfFunds: "N/A",
      ongoingSourceOfFunds: "N/A",
    },
  ])

  // Update the initial `accounts` state to include a new "Joint" account and use `ownerIds` for all accounts
  const [accounts, setAccounts] = useState<AccountType[]>([
    {
      id: "1",
      type: "investment",
      subtype: "brokerage",
      initialDeposit: "1000",
      accountName: "John Smith - 401(A)",
      description: "A standard brokerage account for trading stocks and ETFs.",
      minimumDeposit: "0",
      features: ["Stock Trading", "ETF Trading", "Options Trading"],
      ownerIds: ["1"], // Changed to ownerIds array
      investmentAmount: "10000",
      sampleCustodian: "Fidelity",
      bankingInfo: [
        {
          id: "bank1-acc1",
          bankName: "Bank of America",
          accountNumber: "1234567890",
          routingNumber: "012345678",
          accountHolderName: "John Smith",
          bankAccountType: "checking",
        },
      ],
      fundingInfo: [
        {
          id: "fund1-acc1",
          fundingMethod: "wire",
          wireTransferBankName: "Bank of America",
          wireTransferAccountNumber: "1234567890",
          wireTransferRoutingNumber: "012345678",
          wireTransferSwiftBic: "BOFAUS3N",
          wireTransferBankAddress: "100 Main St, Anytown, CA 91234",
        },
      ],
    },
    {
      id: "2",
      type: "retirement",
      subtype: "roth-ira",
      initialDeposit: "500",
      accountName: "Mary Smith - Roth IRA",
      description: "A Roth IRA for retirement savings with tax-free growth.",
      minimumDeposit: "0",
      features: ["Tax-Free Growth", "Retirement Savings"],
      ownerIds: ["2"], // Changed to ownerIds array
      investmentAmount: "5000",
      sampleCustodian: "Vanguard",
      bankingInfo: [
        {
          id: "bank1-acc2",
          bankName: "Chase Bank",
          accountNumber: "0987654321",
          routingNumber: "876543210",
          accountHolderName: "Jane Doe",
          bankAccountType: "savings",
        },
      ],
      fundingInfo: [
        {
          id: "fund1-acc2",
          fundingMethod: "ach",
          wireTransferBankName: "",
          wireTransferAccountNumber: "",
          wireTransferRoutingNumber: "",
          wireTransferSwiftBic: "",
          wireTransferBankAddress: "",
        },
      ],
    },
    {
      id: "3", // New joint account
      type: "joint",
      subtype: "joint-brokerage",
      initialDeposit: "2500",
      accountName: "John & Mary Smith - Joint", // Renamed from "John & Jane - Joint Brokerage"
      description: "A joint brokerage account for shared investments.",
      minimumDeposit: "500",
      features: ["Joint Ownership", "Shared Investments", "Flexible Access"],
      ownerIds: ["1", "2"], // Owned by both John and Jane
      investmentAmount: "25000",
      sampleCustodian: "Schwab",
      bankingInfo: [
        {
          id: "bank1-acc3",
          bankName: "Wells Fargo",
          accountNumber: "1122334455",
          routingNumber: "123456789",
          accountHolderName: "John & Jane Smith-Doe",
          bankAccountType: "checking",
        },
      ],
      fundingInfo: [
        {
          id: "fund1-acc3",
          fundingMethod: "ach",
          wireTransferBankName: "",
          wireTransferAccountNumber: "",
          wireTransferRoutingNumber: "",
          wireTransferSwiftBic: "",
          wireTransferBankAddress: "",
        },
      ],
    },
    {
      id: "4", // New trust account
      type: "investment",
      subtype: "managed",
      initialDeposit: "10000",
      accountName: "Trust Investment Account",
      description: "An investment account for the Smith Family Revocable Trust.",
      minimumDeposit: "1000",
      features: ["Managed Portfolio", "Estate Planning"],
      ownerIds: ["3"], // Owned by the Smith Family Trust contact
      investmentAmount: "100000",
      sampleCustodian: "TrustCo",
      bankingInfo: [
        {
          id: "bank1-acc4",
          bankName: "Trust Bank",
          accountNumber: "9988776655",
          routingNumber: "987654321",
          accountHolderName: "Smith Family Revocable Trust",
          bankAccountType: "checking",
        },
      ],
      fundingInfo: [
        {
          id: "fund1-acc4",
          fundingMethod: "wire",
          wireTransferBankName: "Trust Bank",
          wireTransferAccountNumber: "9988776655",
          wireTransferRoutingNumber: "987654321",
          wireTransferSwiftBic: "TRUSTUS3N",
          wireTransferBankAddress: "789 Trust Rd, Anytown, CA 91234",
        },
      ],
    },
  ])

  const [registrations, setRegistrations] = useState<Registration[]>([
    {
      id: "reg-1",
      name: "John & Mary Smith JTWROS",
      type: "joint",
      ownerIds: ["1", "2"],
      accountIds: ["3"],
    },
    {
      id: "reg-3",
      name: "Mary Smith (Individual)",
      type: "individual",
      ownerIds: ["2"],
      accountIds: ["2"],
    },
    {
      id: "reg-4",
      name: "Smith Family Revocable Trust",
      type: "trust",
      ownerIds: ["3"], // The trust entity itself is the 'owner' in the account
      trusteeIds: ["1", "2"], // John and Mary are trustees
      accountIds: ["4"],
    },
  ])

  const [contactErrors, setContactErrors] = useState<{ [key: string]: string }>({})
  const [accountErrors, setAccountErrors] = useState<{ [key: string]: string }>({})
  const [bankingInfoErrors, setBankingInfoErrors] = useState<{
    [accountId: string]: { [bankId: string]: { [key: string]: string } }
  }>({})
  const [fundingInfoErrors, setFundingInfoErrors] = useState<{
    [accountId: string]: { [fundingId: string]: { [key: string]: string } }
  }>({})

  const selectedContactData = contacts.find((contact) => contact.id === selectedContact)
  const selectedAccountData = accounts.find((account) => account.id === selectedAccount)

  useEffect(() => {
    if (selectedContactData && !selectedAccount) {
      setContactErrors(validateContact(selectedContactData))
    } else {
      setContactErrors({}) // Clear contact errors if an account is selected
    }
  }, [selectedContact, selectedAccount, contacts])

  useEffect(() => {
    if (selectedAccountData) {
      const accErrors = validateAccount(selectedAccountData)
      setAccountErrors(accErrors)
      const bankErrors = validateAllBankingInfoForAccount(selectedAccountData)
      setBankingInfoErrors((prev) => ({ ...prev, [selectedAccountData.id]: bankErrors }))
      const fundErrors = validateAllFundingInfoForAccount(selectedAccountData)
      setFundingInfoErrors((prev) => ({ ...prev, [selectedAccountData.id]: fundErrors }))
    } else {
      setAccountErrors({}) // Clear account errors if no account is selected
      setBankingInfoErrors({})
      setFundingInfoErrors({})
    }
  }, [selectedAccount, accounts])

  useEffect(() => {
    const newAccordionValue: string[] = []

    // If a contact is selected and no account is active, expand the household section
    if (selectedContactData && !selectedAccountData && !showSummary) {
      newAccordionValue.push("smith-family-household")
    }

    // If an account is selected, expand the corresponding registration section
    if (selectedAccountData && selectedRegistrationId && !showSummary) {
      newAccordionValue.push(selectedRegistrationId)
    }

    setAccordionValue(newAccordionValue)
  }, [selectedContact, selectedAccount, selectedRegistrationId, selectedContactData, selectedAccountData, showSummary])

  const validateContact = (contact: ContactOwner) => {
    const errors: { [key: string]: string } = {}
    if (!contact.firstName.trim()) errors.firstName = "is required."
    if (!contact.lastName.trim()) errors.lastName = "is required."
    if (!contact.dateOfBirth.trim()) errors.dateOfBirth = "is required."
    if (!contact.socialSecurityNumber.trim()) {
      errors.socialSecurityNumber = "is required."
    } else if (!/^\d{3}-\d{2}-\d{4}$/.test(contact.socialSecurityNumber)) {
      errors.socialSecurityNumber = "has an invalid format (e.g., XXX-XX-XXXX)."
    }
    if (!contact.primaryPhone.trim()) errors.primaryPhone = "is required."
    if (!contact.emailAddress.trim()) {
      errors.emailAddress = "is required."
    } else if (!/\S+@\S+\.\S+/.test(contact.emailAddress)) {
      errors.emailAddress = "has an invalid format."
    }
    if (!contact.homeAddress.trim()) errors.homeAddress = "is required."
    if (!contact.citizenshipType.trim()) errors.citizenshipType = "is required."
    if (!contact.employmentStatus.trim()) errors.employmentStatus = "is required."
    if (!contact.annualIncomeRange.trim()) errors.annualIncomeRange = "is required."
    if (!contact.netWorthRange.trim()) errors.netWorthRange = "is required."
    if (!contact.sourceOfFunds.trim()) errors.sourceOfFunds = "is required."
    if (!contact.ongoingSourceOfFunds.trim()) errors.ongoingSourceOfFunds = "is required."
    return errors
  }

  const validateBankingInfo = (banking: BankingInfo) => {
    const errors: { [key: string]: string } = {}
    if (!banking.bankName.trim()) errors.bankName = "is required."
    if (!banking.accountNumber.trim()) {
      errors.accountNumber = "is required."
    } else if (!/^\d+$/.test(banking.accountNumber)) {
      errors.accountNumber = "must contain only digits."
    }
    if (!banking.routingNumber.trim()) {
      errors.routingNumber = "is required."
    } else if (!/^\d{9}$/.test(banking.routingNumber)) {
      errors.routingNumber = "must be 9 digits."
    }
    if (!banking.accountHolderName.trim()) errors.accountHolderName = "is required."
    if (!banking.bankAccountType.trim()) errors.bankAccountType = "is required."
    return errors
  }

  const validateAllBankingInfoForAccount = (account: AccountType) => {
    const allBankingErrors: { [bankId: string]: { [key: string]: string } } = {}
    account.bankingInfo.forEach((banking) => {
      const errors = validateBankingInfo(banking)
      if (Object.keys(errors).length > 0) {
        allBankingErrors[banking.id] = errors
      }
    })
    return allBankingErrors
  }

  const validateFundingInfo = (funding: FundingInfo) => {
    const errors: { [key: string]: string } = {}
    if (!funding.fundingMethod.trim()) errors.fundingMethod = "is required."
    if (funding.fundingMethod === "wire") {
      if (!funding.wireTransferBankName?.trim()) errors.wireTransferBankName = "is required for wire transfers."
      if (!funding.wireTransferAccountNumber?.trim())
        errors.wireTransferAccountNumber = "is required for wire transfers."
      if (!funding.wireTransferRoutingNumber?.trim())
        errors.wireTransferRoutingNumber = "is required for wire transfers."
      else if (!/^\d{9}$/.test(funding.wireTransferRoutingNumber)) {
        errors.wireTransferRoutingNumber = "must be 9 digits for wire transfers."
      }
      if (!funding.wireTransferSwiftBic?.trim()) errors.wireTransferSwiftBic = "is required for wire transfers."
      if (!funding.wireTransferBankAddress?.trim()) errors.wireTransferBankAddress = "is required for wire transfers."
    }
    return errors
  }

  const validateAllFundingInfoForAccount = (account: AccountType) => {
    const allFundingErrors: { [fundingId: string]: { [key: string]: string } } = {}
    account.fundingInfo.forEach((funding) => {
      const errors = validateFundingInfo(funding)
      if (Object.keys(errors).length > 0) {
        allFundingErrors[funding.id] = errors
      }
    })
    return allFundingErrors
  }

  // Update `validateAccount` to check `ownerIds` array
  const validateAccount = (account: AccountType) => {
    const errors: { [key: string]: string } = {}
    if (!account.accountName.trim()) errors.accountName = "is required."
    if (!account.type.trim()) errors.type = "is required."
    if (!account.subtype.trim()) errors.subtype = "is required."
    const initialDeposit = Number.parseFloat(account.initialDeposit)
    if (isNaN(initialDeposit) || initialDeposit <= 0) {
      errors.initialDeposit = "must be a positive number."
    }
    if (!account.description.trim()) errors.description = "is required."
    const minimumDeposit = Number.parseFloat(account.minimumDeposit)
    if (isNaN(minimumDeposit) || minimumDeposit < 0) {
      errors.minimumDeposit = "must be a non-negative number."
    }
    if (!account.ownerIds || account.ownerIds.length === 0) errors.ownerIds = "at least one owner is required." // Updated validation
    if (!account.investmentAmount.trim()) errors.investmentAmount = "is required."
    if (!account.sampleCustodian.trim()) errors.sampleCustodian = "is required."

    if (account.bankingInfo.length === 0) {
      errors.bankingInfo = "At least one banking information entry is required."
    } else {
      const allBankingErrors = validateAllBankingInfoForAccount(account)
      if (Object.keys(allBankingErrors).length > 0) {
        errors.bankingInfo = "Some banking information entries have errors."
      }
    }

    if (account.fundingInfo.length === 0) {
      errors.fundingInfo = "At least one funding information entry is required."
    } else {
      const allFundingErrors = validateAllFundingInfoForAccount(account)
      if (Object.keys(allFundingErrors).length > 0) {
        errors.fundingInfo = "Some funding information entries have errors."
      }
    }

    return errors
  }

  // Update `updateAccount` to handle `ownerIds` as an array
  const updateAccount = (
    id: string,
    field: keyof AccountType,
    value: string | string[] | BankingInfo[] | FundingInfo[], // `string[]` is now explicitly supported for ownerIds
  ) => {
    setAccounts((prevAccounts) => {
      const updatedAccounts = prevAccounts.map((account) => {
        if (account.id === id) {
          const newAccount = { ...account, [field]: value } as AccountType
          const fieldErrors = validateAccount(newAccount)
          return newAccount
        }
        return account
      })
      return updatedAccounts
    })
  }

  const addBankingInfo = (accountId: string) => {
    setAccounts((prevAccounts) => {
      const updatedAccounts = prevAccounts.map((account) => {
        if (account.id === accountId) {
          const newBankingEntry: BankingInfo = {
            id: `bank-${Date.now()}`,
            bankName: "",
            accountNumber: "",
            routingNumber: "",
            accountHolderName: "",
            bankAccountType: "",
          }
          return { ...account, bankingInfo: [...account.bankingInfo, newBankingEntry] }
        }
        return account
      })
      return updatedAccounts
    })
  }

  const removeBankingInfo = (accountId: string, bankingId: string) => {
    setAccounts((prevAccounts) => {
      const updatedAccounts = prevAccounts.map((account) => {
        if (account.id === accountId) {
          const filteredBankingInfo = account.bankingInfo.filter((banking) => banking.id !== bankingId)
          setBankingInfoErrors((prev) => {
            const newErrors = { ...prev }
            if (newErrors[accountId]) {
              delete newErrors[accountId][bankingId]
              if (Object.keys(newErrors[accountId]).length === 0) {
                delete newErrors[accountId]
              }
            }
            return newErrors
          })
          return { ...account, bankingInfo: filteredBankingInfo }
        }
        return account
      })
      return updatedAccounts
    })
  }

  const updateFundingInfo = (accountId: string, fundingId: string, field: keyof FundingInfo, value: string) => {
    setAccounts((prevAccounts) => {
      const updatedAccounts = prevAccounts.map((account) => {
        if (account.id === accountId) {
          const updatedFundingInfo = account.fundingInfo.map((funding) => {
            if (funding.id === fundingId) {
              const newFunding = { ...funding, [field]: value }
              setFundingInfoErrors((prev) => ({
                ...prev,
                [accountId]: {
                  ...(prev[accountId] || {}),
                  [fundingId]: validateFundingInfo(newFunding),
                },
              }))
              return newFunding
            }
            return funding
          })
          return { ...account, fundingInfo: updatedFundingInfo }
        }
        return account
      })
      return updatedAccounts
    })
  }

  const addFundingInfo = (accountId: string) => {
    setAccounts((prevAccounts) => {
      const updatedAccounts = prevAccounts.map((account) => {
        if (account.id === accountId) {
          const newFundingEntry: FundingInfo = {
            id: `fund-${Date.now()}`,
            fundingMethod: "",
            wireTransferBankName: "",
            wireTransferAccountNumber: "",
            wireTransferRoutingNumber: "",
            wireTransferSwiftBic: "",
            wireTransferBankAddress: "",
          }
          return { ...account, fundingInfo: [...account.fundingInfo, newFundingEntry] }
        }
        return account
      })
      return updatedAccounts
    })
  }

  const removeFundingInfo = (accountId: string, fundingId: string) => {
    setAccounts((prevAccounts) => {
      const updatedAccounts = prevAccounts.map((account) => {
        if (account.id === accountId) {
          const filteredFundingInfo = account.fundingInfo.filter((funding) => funding.id !== fundingId)
          setFundingInfoErrors((prev) => {
            const newErrors = { ...prev }
            if (newErrors[accountId]) {
              delete newErrors[accountId][fundingId]
              if (Object.keys(newErrors[accountId]).length === 0) {
                delete newErrors[accountId]
              }
            }
            return newErrors
          })
          return { ...account, fundingInfo: filteredFundingInfo }
        }
        return account
      })
      return updatedAccounts
    })
  }

  const updateContact = (id: string, field: keyof ContactOwner, value: string | boolean) => {
    setContacts((prevContacts) => {
      const updatedContacts = prevContacts.map((contact) => {
        if (contact.id === id) {
          const newContact = { ...contact, [field]: value }
          const fieldErrors = validateContact(newContact)
          return newContact
        }
        return contact
      })
      return updatedContacts
    })
  }

  const areAllContactsValid = () => {
    return contacts.every((contact) => Object.keys(validateContact(contact)).length === 0)
  }

  const areAllAccountsValid = () => {
    return accounts.every((account) => {
      const accErrors = validateAccount(account)
      const bankErrors = validateAllBankingInfoForAccount(account)
      const fundErrors = validateAllFundingInfoForAccount(account)
      return (
        Object.keys(accErrors).length === 0 &&
        Object.keys(bankErrors).length === 0 &&
        Object.keys(fundErrors).length === 0
      )
    })
  }

  const handleSelectContact = (contactId: string, registrationId: string) => {
    setSelectedContact(contactId)
    setSelectedAccount("") // Clear selected account when a contact is selected
    setSelectedRegistrationId(registrationId) // Set selected registration
    setShowSummary(false)
  }

  const handleSelectAccount = (accountId: string, primaryOwnerId: string, registrationId: string) => {
    setSelectedAccount(accountId)
    setSelectedContact(primaryOwnerId) // Set selected contact to the account's primary owner
    setSelectedRegistrationId(registrationId) // Set selected registration
    setShowSummary(false)
  }

  // Update `addNewAccount` to initialize `ownerIds` as an array
  const addNewAccount = () => {
    const newAccountId = `account-${Date.now()}`
    const newAccount: AccountType = {
      id: newAccountId,
      type: "",
      subtype: "",
      initialDeposit: "",
      accountName: "",
      description: "",
      minimumDeposit: "",
      features: [],
      ownerIds: selectedContact ? [selectedContact] : [], // Initialize ownerIds as an array
      investmentAmount: "",
      sampleCustodian: "",
      bankingInfo: [],
      fundingInfo: [],
    }
    setAccounts((prev) => [...prev, newAccount])
    setSelectedAccount(newAccountId)
    setSelectedRegistrationId(null) // Clear selected registration when adding a new account
    setShowSummary(false)
    if (!selectedContact && contacts.length > 0) {
      setSelectedContact(contacts[0].id)
    }
  }

  const addNewContact = () => {
    const newContactId = `contact-${Date.now()}`
    const newContact: ContactOwner = {
      id: newContactId,
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      socialSecurityNumber: "",
      primaryPhone: "",
      emailAddress: "",
      homeAddress: "",
      citizenshipType: "",
      employmentStatus: "",
      publicCompanyAffiliation: false,
      brokerDealerAffiliation: false,
      annualIncomeRange: "",
      netWorthRange: "",
      sourceOfFunds: "",
      ongoingSourceOfFunds: "",
    }
    setContacts((prev) => [...prev, newContact])
    setSelectedContact(newContactId)
    setSelectedAccount("")
    setSelectedRegistrationId(null) // Clear selected registration when adding a new contact
    setShowSummary(false)
  }

  // Function to get the label for a given account subtype
  const getSubtypeLabel = (type: string, subtype: string): string => {
    const subtypeOptions = getSubtypeOptions(type)
    const subtypeOption = subtypeOptions.find((option) => option.value === subtype)
    return subtypeOption ? subtypeOption.label : "N/A"
  }

  const getAccountIcon = (type: string) => {
    return <FileText className="h-4 w-4 text-neutral-gray-500" />
  }

  const getOwnerNamesByIds = (ownerIds: string[] | undefined): string => {
    if (!ownerIds || ownerIds.length === 0) {
      return "No Owners"
    }

    const ownerNames = ownerIds.map((ownerId) => {
      const owner = contacts.find((contact) => contact.id === ownerId)
      return owner ? `${owner.firstName} ${owner.lastName}` : "Unknown Owner"
    })

    return ownerNames.join(", ")
  }

  const getNextItem = () => {
    // If we're viewing a contact (not an account)
    if (selectedContactData && !selectedAccountData && !showSummary) {
      const currentContactIndex = contacts.findIndex((c) => c.id === selectedContact)

      // If there's a next contact, go to it
      if (currentContactIndex < contacts.length - 1) {
        return {
          type: "contact",
          id: contacts[currentContactIndex + 1].id,
          registrationId: null,
        }
      }

      // Otherwise, go to the first account in the first registration
      if (registrations.length > 0 && registrations[0].accountIds.length > 0) {
        const firstAccount = accounts.find((a) => a.id === registrations[0].accountIds[0])
        if (firstAccount) {
          return {
            type: "account",
            id: firstAccount.id,
            primaryOwnerId: firstAccount.ownerIds?.[0] || "",
            registrationId: registrations[0].id,
          }
        }
      }
    }

    // If we're viewing an account
    if (selectedAccountData && selectedRegistrationId && !showSummary) {
      const currentRegistration = registrations.find((r) => r.id === selectedRegistrationId)
      if (currentRegistration) {
        const currentAccountIndex = currentRegistration.accountIds.findIndex((id) => id === selectedAccount)

        // If there's a next account in this registration
        if (currentAccountIndex < currentRegistration.accountIds.length - 1) {
          const nextAccountId = currentRegistration.accountIds[currentAccountIndex + 1]
          const nextAccount = accounts.find((a) => a.id === nextAccountId)
          if (nextAccount) {
            return {
              type: "account",
              id: nextAccount.id,
              primaryOwnerId: nextAccount.ownerIds?.[0] || "",
              registrationId: selectedRegistrationId,
            }
          }
        }

        // Otherwise, go to the first account of the next registration
        const currentRegIndex = registrations.findIndex((r) => r.id === selectedRegistrationId)
        if (currentRegIndex < registrations.length - 1) {
          const nextRegistration = registrations[currentRegIndex + 1]
          if (nextRegistration.accountIds.length > 0) {
            const nextAccount = accounts.find((a) => a.id === nextRegistration.accountIds[0])
            if (nextAccount) {
              return {
                type: "account",
                id: nextAccount.id,
                primaryOwnerId: nextAccount.ownerIds?.[0] || "",
                registrationId: nextRegistration.id,
              }
            }
          }
        }

        // If we're at the last account, go to summary
        if (
          currentRegIndex === registrations.length - 1 &&
          currentAccountIndex === currentRegistration.accountIds.length - 1
        ) {
          return {
            type: "summary",
          }
        }
      }
    }

    return null
  }

  const getPreviousItem = () => {
    // If we're viewing the summary, go back to the last account
    if (showSummary) {
      const lastRegistration = registrations[registrations.length - 1]
      if (lastRegistration && lastRegistration.accountIds.length > 0) {
        const lastAccountId = lastRegistration.accountIds[lastRegistration.accountIds.length - 1]
        const lastAccount = accounts.find((a) => a.id === lastAccountId)
        if (lastAccount) {
          return {
            type: "account",
            id: lastAccount.id,
            primaryOwnerId: lastAccount.ownerIds?.[0] || "",
            registrationId: lastRegistration.id,
          }
        }
      }
    }

    // If we're viewing a contact (not an account)
    if (selectedContactData && !selectedAccountData && !showSummary) {
      const currentContactIndex = contacts.findIndex((c) => c.id === selectedContact)

      // If there's a previous contact, go to it
      if (currentContactIndex > 0) {
        return {
          type: "contact",
          id: contacts[currentContactIndex - 1].id,
          registrationId: null,
        }
      }

      // If we're at the first contact, there's no previous item
      return null
    }

    // If we're viewing an account
    if (selectedAccountData && selectedRegistrationId && !showSummary) {
      const currentRegistration = registrations.find((r) => r.id === selectedRegistrationId)
      if (currentRegistration) {
        const currentAccountIndex = currentRegistration.accountIds.findIndex((id) => id === selectedAccount)

        // If there's a previous account in this registration
        if (currentAccountIndex > 0) {
          const prevAccountId = currentRegistration.accountIds[currentAccountIndex - 1]
          const prevAccount = accounts.find((a) => a.id === prevAccountId)
          if (prevAccount) {
            return {
              type: "account",
              id: prevAccount.id,
              primaryOwnerId: prevAccount.ownerIds?.[0] || "",
              registrationId: selectedRegistrationId,
            }
          }
        }

        // Otherwise, go to the last account of the previous registration
        const currentRegIndex = registrations.findIndex((r) => r.id === selectedRegistrationId)
        if (currentRegIndex > 0) {
          const prevRegistration = registrations[currentRegIndex - 1]
          if (prevRegistration.accountIds.length > 0) {
            const lastAccountId = prevRegistration.accountIds[prevRegistration.accountIds.length - 1]
            const prevAccount = accounts.find((a) => a.id === lastAccountId)
            if (prevAccount) {
              return {
                type: "account",
                id: prevAccount.id,
                primaryOwnerId: prevAccount.ownerIds?.[0] || "",
                registrationId: prevRegistration.id,
              }
            }
          }
        }

        // If we're at the first account of the first registration, go to the last contact
        if (currentRegIndex === 0 && currentAccountIndex === 0) {
          if (contacts.length > 0) {
            return {
              type: "contact",
              id: contacts[contacts.length - 1].id,
              registrationId: null,
            }
          }
        }
      }
    }

    return null
  }

  const handlePrevious = () => {
    const prevItem = getPreviousItem()
    if (prevItem) {
      if (prevItem.type === "contact") {
        setSelectedContact(prevItem.id)
        setSelectedAccount("")
        setSelectedRegistrationId(null)
        setShowSummary(false)
      } else if (prevItem.type === "account") {
        handleSelectAccount(prevItem.id, prevItem.primaryOwnerId, prevItem.registrationId)
      }
      // Scroll to top of page
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handleNext = () => {
    const nextItem = getNextItem()
    if (nextItem) {
      if (nextItem.type === "contact") {
        setSelectedContact(nextItem.id)
        setSelectedAccount("")
        setSelectedRegistrationId(null)
        setShowSummary(false)
      } else if (nextItem.type === "account") {
        handleSelectAccount(nextItem.id, nextItem.primaryOwnerId, nextItem.registrationId)
      } else if (nextItem.type === "summary") {
        setShowSummary(true)
        setSelectedContact("")
        setSelectedAccount("")
        setSelectedRegistrationId(null)
      }
      // Scroll to top of page
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const isLastItem = () => {
    return getNextItem() === null
  }

  const isFirstItem = () => {
    return getPreviousItem() === null
  }

  const handleEditContact = (contactId: string) => {
    setSelectedContact(contactId)
    setSelectedAccount("")
    setSelectedRegistrationId(null)
    setShowSummary(false)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleEditAccount = (accountId: string) => {
    const account = accounts.find((a) => a.id === accountId)
    if (account) {
      const registration = registrations.find((r) => r.accountIds.includes(accountId))
      if (registration) {
        handleSelectAccount(accountId, account.ownerIds?.[0] || "", registration.id)
      }
    }
  }

  return (
    <div
      className={`flex min-h-screen bg-neutral-gray-50 font-sans antialiased ${sidebarCollapsed ? "ml-16" : "ml-64"}`}
    >
      {/* Sidebar is now fixed positioned */}
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <div className="sticky top-0 z-20 bg-white border-b border-neutral-gray-200 h-16 flex items-center">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1 max-w-md">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search Clients"
                    className="pl-10 pr-4 py-2 w-full border-neutral-gray-300 rounded-md focus:border-primary-blue-500 focus:ring-primary-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" className="text-neutral-gray-600 hover:text-neutral-gray-900">
                  <Bell className="h-5 w-5" />
                </Button>
                <div className="flex items-center space-x-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="https://github.com/shadcn.png" alt="John Doe" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-neutral-gray-900">John Doe</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Header */}
        <div className="sticky top-16 z-10 bg-white border-b border-neutral-gray-200">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-primary-blue-600" />
                <h1 className="text-lg sm:text-xl font-semibold text-neutral-gray-900">New Account(s) Setup</h1>
                <Badge className="text-xs bg-primary-blue-100 text-primary-blue-800 hover:bg-primary-blue-100">
                  Beta
                </Badge>
              </div>
              <div className="flex space-x-2">
                <Link href="/">
                  <Button
                    variant="outline"
                    className="rounded-[4px] bg-white border-neutral-gray-300 text-neutral-gray-700 hover:bg-neutral-gray-100 shadow-sm"
                  >
                    Cancel
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="rounded-[4px] bg-white border-neutral-gray-300 text-neutral-gray-700 hover:bg-neutral-gray-100 shadow-sm"
                  onClick={() => {
                    console.log("Saving as Draft")
                  }}
                >
                  Save as Draft
                </Button>
                <Button
                  variant="default"
                  className="rounded-[4px] bg-primary-blue-500 hover:bg-primary-blue-600 text-white shadow-md"
                  onClick={() => {
                    console.log("Proceeding to Signature")
                  }}
                >
                  Proceed to Signature
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="space-y-6">
            {Object.keys(contactErrors).length > 0 && !selectedAccountData && !showSummary && (
              <Alert
                variant="destructive"
                className="mb-4 rounded-[4px] border-brand-orange-300 bg-brand-orange-50 text-brand-orange-900"
              >
                <TriangleAlert className="h-4 w-4" />
                <AlertTitle>Validation Error (Owner)</AlertTitle>
                <AlertDescription>
                  Please correct the following fields for the selected owner:
                  <ul className="list-disc pl-5 mt-2">
                    {Object.entries(contactErrors).map(([key, message]) => (
                      <li key={key}>
                        <span className="font-medium">{contactFieldLabels[key] || key}:</span> {message}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {Object.keys(accountErrors).length > 0 && selectedAccountData && !showSummary && (
              <Alert
                variant="destructive"
                className="mb-4 rounded-[4px] border-brand-orange-300 bg-brand-orange-50 text-brand-orange-900"
              >
                <TriangleAlert className="h-4 w-4" />
                <AlertTitle>Validation Error (Account)</AlertTitle>
                <AlertDescription>
                  Please correct the following fields for the selected account:
                  <ul className="list-disc pl-5 mt-2">
                    {Object.entries(accountErrors).map(([key, message]) => (
                      <li key={key}>
                        <span className="font-medium">{accountFieldLabels[key] || key}:</span> {message}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Keep all the existing sidebar and main content exactly as is */}
              <div className="lg:col-span-1">
                <Card className="rounded-[4px] sticky top-32 shadow-sm bg-white">
                  <CardContent className="space-y-2 pt-4">
                    <div className="mb-2">
                      <h3 className="text-xs font-semibold text-neutral-gray-500 uppercase tracking-wide px-3 pb-1">
                        Household
                      </h3>
                    </div>
                    <Accordion
                      type="multiple"
                      value={accordionValue}
                      onValueChange={setAccordionValue}
                      className="w-full"
                    >
                      <AccordionItem value="smith-family-household" className="border-b-0">
                        <AccordionTrigger className="py-2 px-3 rounded-[4px] font-semibold text-neutral-gray-800 hover:no-underline hover:bg-neutral-gray-100 data-[state=open]:bg-neutral-gray-100 text-left">
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4 text-neutral-gray-500" />
                              <div>
                                <p className="font-medium text-sm">Smith Family Household</p>
                                <p className="text-xs text-neutral-gray-500 font-normal text-left">
                                  {contacts.length} Contacts
                                </p>
                              </div>
                            </div>
                            {!accordionValue.includes("smith-family-household") &&
                              contacts.some((contact) => Object.keys(validateContact(contact)).length > 0) && (
                                <TriangleAlert className="h-4 w-4 text-red-500 ml-2" />
                              )}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-2 pb-0">
                          <div className="ml-4 border-l border-neutral-gray-200 pl-2 space-y-1">
                            {contacts.map((contact) => (
                              <div
                                key={contact.id}
                                className={`p-1 rounded-[4px] cursor-pointer transition-colors border ${
                                  selectedContact === contact.id &&
                                  !selectedAccount &&
                                  !selectedRegistrationId &&
                                  !showSummary
                                    ? "bg-primary-blue-50 border-primary-blue-200 text-primary-blue-800"
                                    : "bg-neutral-gray-50 border-transparent hover:bg-neutral-gray-100 text-neutral-gray-700"
                                }`}
                                onClick={() => {
                                  setSelectedContact(contact.id)
                                  setSelectedAccount("")
                                  setSelectedRegistrationId(null)
                                  setShowSummary(false)
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <User className="h-4 w-4 text-neutral-gray-500" />
                                    <div>
                                      <p className="font-medium text-xs">
                                        {contact.firstName} {contact.lastName}
                                      </p>
                                    </div>
                                  </div>
                                  {Object.keys(validateContact(contact)).length > 0 ? (
                                    <TriangleAlert className="h-4 w-4 text-red-500 ml-auto" />
                                  ) : (
                                    <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>

                      <div className="mb-2 mt-4">
                        <h3 className="text-xs font-semibold text-neutral-gray-500 uppercase tracking-wide px-3 pb-1">
                          Accounts
                        </h3>
                      </div>

                      {registrations.map((registration) => (
                        <AccordionItem key={registration.id} value={registration.id} className="border-b-0">
                          <AccordionTrigger className="py-2 px-3 rounded-[4px] font-semibold text-neutral-gray-800 hover:no-underline hover:bg-neutral-gray-100 data-[state=open]:bg-neutral-gray-100 text-left">
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center space-x-2">
                                <Folder className="h-4 w-4 text-neutral-gray-500" />
                                <div>
                                  <p className="font-medium text-sm">{registration.name}</p>
                                  <p className="text-xs text-neutral-gray-500 font-normal text-left">
                                    {registration.accountIds.length} account(s)
                                  </p>
                                </div>
                              </div>
                              {!accordionValue.includes(registration.id) &&
                                registration.accountIds.some((accountId) => {
                                  const account = accounts.find((a) => a.id === accountId)
                                  return account && Object.keys(validateAccount(account)).length > 0
                                }) && <TriangleAlert className="h-4 w-4 text-red-500 ml-2" />}
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pt-2 pb-0">
                            <div className="ml-4 border-l border-neutral-gray-200 pl-2 space-y-1">
                              <p className="text-xs font-semibold text-neutral-gray-600 mb-1">Accounts:</p>
                              {registration.accountIds.map((accountId) => {
                                const account = accounts.find((a) => a.id === accountId)
                                if (!account) return null
                                const primaryOwnerId = account.ownerIds?.[0] || ""
                                return (
                                  <div
                                    key={account.id}
                                    className={`p-1 rounded-[4px] cursor-pointer transition-colors border ${
                                      selectedAccount === account.id &&
                                      selectedRegistrationId === registration.id &&
                                      !showSummary
                                        ? "bg-primary-blue-50 border-primary-blue-200 text-primary-blue-800"
                                        : "bg-neutral-gray-50 border-transparent hover:bg-neutral-gray-100 text-neutral-gray-700"
                                    }`}
                                    onClick={() => handleSelectAccount(account.id, primaryOwnerId, registration.id)}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-2">
                                        {getAccountIcon(account.type)}
                                        <div>
                                          <p className="font-medium text-xs">{account.accountName}</p>
                                          <p className="text-xs text-neutral-gray-500 text-left">
                                            Owners: {getOwnerNamesByIds(account.ownerIds)}
                                          </p>
                                        </div>
                                      </div>
                                      {Object.keys(validateAccount(account)).length > 0 ? (
                                        <TriangleAlert className="h-4 w-4 text-red-500 ml-auto" />
                                      ) : (
                                        <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>

                    {/* Summary Section */}
                    <div className="mb-2 mt-4">
                      <h3 className="text-xs font-semibold text-neutral-gray-500 uppercase tracking-wide px-3 pb-1">
                        Review
                      </h3>
                    </div>
                    <div
                      className={`p-2 rounded-[4px] cursor-pointer transition-colors border ${
                        showSummary
                          ? "bg-primary-blue-50 border-primary-blue-200 text-primary-blue-800"
                          : "bg-neutral-gray-50 border-transparent hover:bg-neutral-gray-100 text-neutral-gray-700"
                      }`}
                      onClick={() => {
                        setShowSummary(true)
                        setSelectedContact("")
                        setSelectedAccount("")
                        setSelectedRegistrationId(null)
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <Eye className="h-4 w-4 text-neutral-gray-500" />
                        <div>
                          <p className="font-medium text-sm">Summary & Review</p>
                          <p className="text-xs text-neutral-gray-500 font-normal text-left">Review all information</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-3">
                {/* Summary View */}
                {showSummary && (
                  <div className="space-y-6">
                    <Card className="rounded-[4px] shadow-sm bg-white">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center space-x-2 text-lg text-neutral-gray-800">
                          <Eye className="h-5 w-5 text-primary-blue-600" />
                          <span>Account Setup Summary</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Household Summary */}
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-neutral-gray-800">Household Information</h3>
                            <Badge variant="outline" className="text-xs">
                              {contacts.length} Contact{contacts.length !== 1 ? "s" : ""}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {contacts.map((contact) => {
                              const contactValidationErrors = validateContact(contact)
                              const hasErrors = Object.keys(contactValidationErrors).length > 0
                              return (
                                <Card key={contact.id} className="rounded-[4px] shadow-sm bg-neutral-gray-50">
                                  <CardContent className="p-4">
                                    <div className="flex items-center justify-between mb-3">
                                      <div className="flex items-center space-x-2">
                                        <User className="h-4 w-4 text-neutral-gray-500" />
                                        <h4 className="font-medium text-sm">
                                          {contact.firstName} {contact.lastName}
                                        </h4>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        {hasErrors ? (
                                          <TriangleAlert className="h-4 w-4 text-red-500" />
                                        ) : (
                                          <CheckCircle className="h-4 w-4 text-green-500" />
                                        )}
                                        <Dialog
                                          open={previewContactId === contact.id}
                                          onOpenChange={(open) => setPreviewContactId(open ? contact.id : null)}
                                        >
                                          <DialogTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                              <Eye className="h-3 w-3" />
                                            </Button>
                                          </DialogTrigger>
                                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                            <DialogHeader>
                                              <DialogTitle className="flex items-center space-x-2">
                                                <User className="h-5 w-5 text-primary-blue-600" />
                                                <span>
                                                  Contact Details: {contact.firstName} {contact.lastName}
                                                </span>
                                              </DialogTitle>
                                              <DialogDescription>
                                                Complete information for this contact
                                              </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-6 mt-4">
                                              {/* Personal Information */}
                                              <div>
                                                <h3 className="text-lg font-semibold text-neutral-gray-800 mb-4">
                                                  Personal Information
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                  <div>
                                                    <span className="font-medium text-neutral-gray-700">
                                                      Full Name:
                                                    </span>
                                                    <p className="text-neutral-gray-600">
                                                      {contact.firstName}{" "}
                                                      {contact.middleInitial ? `${contact.middleInitial}. ` : ""}
                                                      {contact.lastName}
                                                    </p>
                                                  </div>
                                                  <div>
                                                    <span className="font-medium text-neutral-gray-700">
                                                      Date of Birth:
                                                    </span>
                                                    <p className="text-neutral-gray-600">
                                                      {contact.dateOfBirth || "Not provided"}
                                                    </p>
                                                  </div>
                                                  <div>
                                                    <span className="font-medium text-neutral-gray-700">
                                                      Social Security Number:
                                                    </span>
                                                    <p className="text-neutral-gray-600">
                                                      {contact.socialSecurityNumber ? "***-**-****" : "Not provided"}
                                                    </p>
                                                  </div>
                                                  <div>
                                                    <span className="font-medium text-neutral-gray-700">
                                                      Citizenship:
                                                    </span>
                                                    <p className="text-neutral-gray-600">
                                                      {contact.citizenshipType || "Not provided"}
                                                    </p>
                                                  </div>
                                                </div>
                                              </div>

                                              {/* Contact Information */}
                                              <div>
                                                <h3 className="text-lg font-semibold text-neutral-gray-800 mb-4">
                                                  Contact Information
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                  <div>
                                                    <span className="font-medium text-neutral-gray-700">Email:</span>
                                                    <p className="text-neutral-gray-600">
                                                      {contact.emailAddress || "Not provided"}
                                                    </p>
                                                  </div>
                                                  <div>
                                                    <span className="font-medium text-neutral-gray-700">
                                                      Primary Phone:
                                                    </span>
                                                    <p className="text-neutral-gray-600">
                                                      {contact.primaryPhone || "Not provided"}
                                                    </p>
                                                  </div>
                                                  <div>
                                                    <span className="font-medium text-neutral-gray-700">
                                                      Secondary Phone:
                                                    </span>
                                                    <p className="text-neutral-gray-600">
                                                      {contact.secondaryPhone || "Not provided"}
                                                    </p>
                                                  </div>
                                                  <div>
                                                    <span className="font-medium text-neutral-gray-700">
                                                      Identification:
                                                    </span>
                                                    <p className="text-neutral-gray-600">
                                                      {contact.identificationAttachment || "Not provided"}
                                                    </p>
                                                  </div>
                                                </div>
                                                <div className="mt-4">
                                                  <div>
                                                    <span className="font-medium text-neutral-gray-700">
                                                      Home Address:
                                                    </span>
                                                    <p className="text-neutral-gray-600">
                                                      {contact.homeAddress || "Not provided"}
                                                    </p>
                                                  </div>
                                                  {contact.mailingAddress && (
                                                    <div className="mt-2">
                                                      <span className="font-medium text-neutral-gray-700">
                                                        Mailing Address:
                                                      </span>
                                                      <p className="text-neutral-gray-600">{contact.mailingAddress}</p>
                                                    </div>
                                                  )}
                                                </div>
                                              </div>

                                              {/* Employment & Financial Information */}
                                              <div>
                                                <h3 className="text-lg font-semibold text-neutral-gray-800 mb-4">
                                                  Employment & Financial Information
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                  <div>
                                                    <span className="font-medium text-neutral-gray-700">
                                                      Employment Status:
                                                    </span>
                                                    <p className="text-neutral-gray-600">
                                                      {contact.employmentStatus || "Not provided"}
                                                    </p>
                                                  </div>
                                                  <div>
                                                    <span className="font-medium text-neutral-gray-700">
                                                      Annual Income Range:
                                                    </span>
                                                    <p className="text-neutral-gray-600">
                                                      {contact.annualIncomeRange || "Not provided"}
                                                    </p>
                                                  </div>
                                                  <div>
                                                    <span className="font-medium text-neutral-gray-700">
                                                      Net Worth Range:
                                                    </span>
                                                    <p className="text-neutral-gray-600">
                                                      {contact.netWorthRange || "Not provided"}
                                                    </p>
                                                  </div>
                                                  <div>
                                                    <span className="font-medium text-neutral-gray-700">
                                                      Source of Funds:
                                                    </span>
                                                    <p className="text-neutral-gray-600">
                                                      {contact.sourceOfFunds || "Not provided"}
                                                    </p>
                                                  </div>
                                                  <div>
                                                    <span className="font-medium text-neutral-gray-700">
                                                      Ongoing Source of Funds:
                                                    </span>
                                                    <p className="text-neutral-gray-600">
                                                      {contact.ongoingSourceOfFunds || "Not provided"}
                                                    </p>
                                                  </div>
                                                </div>
                                                <div className="mt-4 space-y-2">
                                                  <div className="flex items-center space-x-2">
                                                    <Checkbox checked={contact.publicCompanyAffiliation} disabled />
                                                    <span className="text-sm text-neutral-gray-700">
                                                      Public Company Affiliation
                                                    </span>
                                                  </div>
                                                  <div className="flex items-center space-x-2">
                                                    <Checkbox checked={contact.brokerDealerAffiliation} disabled />
                                                    <span className="text-sm text-neutral-gray-700">
                                                      Broker-Dealer Affiliation
                                                    </span>
                                                  </div>
                                                </div>
                                              </div>

                                              {/* Trusted Contact Information */}
                                              {(contact.trustedContactFirstName ||
                                                contact.trustedContactLastName ||
                                                contact.trustedContactEmail) && (
                                                <div>
                                                  <h3 className="text-lg font-semibold text-neutral-gray-800 mb-4">
                                                    Trusted Contact Information
                                                  </h3>
                                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                      <span className="font-medium text-neutral-gray-700">Name:</span>
                                                      <p className="text-neutral-gray-600">
                                                        {contact.trustedContactFirstName}{" "}
                                                        {contact.trustedContactMiddleInitial
                                                          ? `${contact.trustedContactMiddleInitial}. `
                                                          : ""}
                                                        {contact.trustedContactLastName} {contact.trustedContactSuffix}
                                                      </p>
                                                    </div>
                                                    <div>
                                                      <span className="font-medium text-neutral-gray-700">
                                                        Relationship:
                                                      </span>
                                                      <p className="text-neutral-gray-600">
                                                        {contact.trustedContactRelationship || "Not specified"}
                                                      </p>
                                                    </div>
                                                    <div>
                                                      <span className="font-medium text-neutral-gray-700">Email:</span>
                                                      <p className="text-neutral-gray-600">
                                                        {contact.trustedContactEmail || "Not provided"}
                                                      </p>
                                                    </div>
                                                    <div>
                                                      <span className="font-medium text-neutral-gray-700">Phone:</span>
                                                      <p className="text-neutral-gray-600">
                                                        {contact.trustedContactTelephone ||
                                                          contact.trustedContactMobile ||
                                                          "Not provided"}
                                                      </p>
                                                    </div>
                                                  </div>
                                                  {contact.trustedContactMailingAddress && (
                                                    <div className="mt-4">
                                                      <span className="font-medium text-neutral-gray-700">
                                                        Address:
                                                      </span>
                                                      <p className="text-neutral-gray-600">
                                                        {contact.trustedContactMailingAddress}
                                                      </p>
                                                    </div>
                                                  )}
                                                </div>
                                              )}
                                            </div>
                                          </DialogContent>
                                        </Dialog>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleEditContact(contact.id)}
                                          className="h-6 w-6 p-0"
                                        >
                                          <Edit className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                    <div className="space-y-2 text-xs text-neutral-gray-600">
                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <span className="font-medium">Email:</span>{" "}
                                          {contact.emailAddress || "Not provided"}
                                        </div>
                                        <div>
                                          <span className="font-medium">Phone:</span>{" "}
                                          {contact.primaryPhone || "Not provided"}
                                        </div>
                                        <div>
                                          <span className="font-medium">DOB:</span>{" "}
                                          {contact.dateOfBirth || "Not provided"}
                                        </div>
                                        <div>
                                          <span className="font-medium">SSN:</span>{" "}
                                          {contact.socialSecurityNumber ? "***-**-****" : "Not provided"}
                                        </div>
                                      </div>
                                      <div>
                                        <span className="font-medium">Address:</span>{" "}
                                        {contact.homeAddress || "Not provided"}
                                      </div>
                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <span className="font-medium">Employment:</span>{" "}
                                          {contact.employmentStatus || "Not provided"}
                                        </div>
                                        <div>
                                          <span className="font-medium">Citizenship:</span>{" "}
                                          {contact.citizenshipType || "Not provided"}
                                        </div>
                                      </div>
                                    </div>
                                    {hasErrors && (
                                      <div className="mt-3 p-2 bg-red-50 rounded border border-red-200">
                                        <p className="text-xs text-red-600 font-medium">Validation Issues:</p>
                                        <ul className="text-xs text-red-600 mt-1 space-y-1">
                                          {Object.entries(contactValidationErrors)
                                            .slice(0, 3)
                                            .map(([field, error]) => (
                                              <li key={field}>
                                                • {contactFieldLabels[field] || field}: {error}
                                              </li>
                                            ))}
                                          {Object.keys(contactValidationErrors).length > 3 && (
                                            <li>• And {Object.keys(contactValidationErrors).length - 3} more...</li>
                                          )}
                                        </ul>
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              )
                            })}
                          </div>
                        </div>

                        {/* Accounts Summary */}
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-neutral-gray-800">Account Information</h3>
                            <Badge variant="outline" className="text-xs">
                              {accounts.length} Account{accounts.length !== 1 ? "s" : ""}
                            </Badge>
                          </div>
                          <div className="space-y-4">
                            {registrations.map((registration) => (
                              <div key={registration.id}>
                                <h4 className="font-medium text-sm text-neutral-gray-700 mb-3 flex items-center space-x-2">
                                  <Folder className="h-4 w-4 text-neutral-gray-500" />
                                  <span>{registration.name}</span>
                                </h4>
                                <div className="grid grid-cols-1 gap-4">
                                  {registration.accountIds.map((accountId) => {
                                    const account = accounts.find((a) => a.id === accountId)
                                    if (!account) return null
                                    const accountValidationErrors = validateAccount(account)
                                    const bankingErrors = validateAllBankingInfoForAccount(account)
                                    const fundingErrors = validateAllFundingInfoForAccount(account)
                                    const hasErrors =
                                      Object.keys(accountValidationErrors).length > 0 ||
                                      Object.keys(bankingErrors).length > 0 ||
                                      Object.keys(fundingErrors).length > 0
                                    return (
                                      <Card
                                        key={account.id}
                                        className="rounded-[4px] shadow-sm bg-neutral-gray-50 ml-6"
                                      >
                                        <CardContent className="p-4">
                                          <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center space-x-2">
                                              {getAccountIcon(account.type)}
                                              <h5 className="font-medium text-sm">{account.accountName}</h5>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                              {hasErrors ? (
                                                <TriangleAlert className="h-4 w-4 text-red-500" />
                                              ) : (
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                              )}
                                              <Dialog
                                                open={previewAccountId === account.id}
                                                onOpenChange={(open) => setPreviewAccountId(open ? account.id : null)}
                                              >
                                                <DialogTrigger asChild>
                                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                                    <Eye className="h-3 w-3" />
                                                  </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                                  <DialogHeader>
                                                    <DialogTitle className="flex items-center space-x-2">
                                                      {getAccountIcon(account.type)}
                                                      <span>Account Details: {account.accountName}</span>
                                                    </DialogTitle>
                                                    <DialogDescription>
                                                      Complete information for this account
                                                    </DialogDescription>
                                                  </DialogHeader>
                                                  <div className="space-y-6 mt-4">
                                                    {/* Account Information */}
                                                    <div>
                                                      <h3 className="text-lg font-semibold text-neutral-gray-800 mb-4">
                                                        Account Information
                                                      </h3>
                                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                        <div>
                                                          <span className="font-medium text-neutral-gray-700">
                                                            Account Name:
                                                          </span>
                                                          <p className="text-neutral-gray-600">{account.accountName}</p>
                                                        </div>
                                                        <div>
                                                          <span className="font-medium text-neutral-gray-700">
                                                            Account Type:
                                                          </span>
                                                          <p className="text-neutral-gray-600">
                                                            {getSubtypeLabel(account.type, account.subtype)}
                                                          </p>
                                                        </div>
                                                        <div>
                                                          <span className="font-medium text-neutral-gray-700">
                                                            Custodian:
                                                          </span>
                                                          <p className="text-neutral-gray-600">
                                                            {account.sampleCustodian}
                                                          </p>
                                                        </div>
                                                        <div>
                                                          <span className="font-medium text-neutral-gray-700">
                                                            Owners:
                                                          </span>
                                                          <p className="text-neutral-gray-600">
                                                            {getOwnerNamesByIds(account.ownerIds)}
                                                          </p>
                                                        </div>
                                                        <div>
                                                          <span className="font-medium text-neutral-gray-700">
                                                            Initial Deposit:
                                                          </span>
                                                          <p className="text-neutral-gray-600">
                                                            {formatCurrency(account.initialDeposit)}
                                                          </p>
                                                        </div>
                                                        <div>
                                                          <span className="font-medium text-neutral-gray-700">
                                                            Investment Amount:
                                                          </span>
                                                          <p className="text-neutral-gray-600">
                                                            {formatCurrency(account.investmentAmount)}
                                                          </p>
                                                        </div>
                                                        <div>
                                                          <span className="font-medium text-neutral-gray-700">
                                                            Minimum Deposit:
                                                          </span>
                                                          <p className="text-neutral-gray-600">
                                                            {formatCurrency(account.minimumDeposit)}
                                                          </p>
                                                        </div>
                                                      </div>
                                                      <div className="mt-4">
                                                        <span className="font-medium text-neutral-gray-700">
                                                          Description:
                                                        </span>
                                                        <p className="text-neutral-gray-600 mt-1">
                                                          {account.description}
                                                        </p>
                                                      </div>
                                                      {account.features.length > 0 && (
                                                        <div className="mt-4">
                                                          <span className="font-medium text-neutral-gray-700">
                                                            Features:
                                                          </span>
                                                          <div className="flex flex-wrap gap-2 mt-2">
                                                            {account.features.map((feature, index) => (
                                                              <Badge key={index} variant="outline" className="text-xs">
                                                                {feature}
                                                              </Badge>
                                                            ))}
                                                          </div>
                                                        </div>
                                                      )}
                                                    </div>

                                                    {/* Banking Information */}
                                                    <div>
                                                      <h3 className="text-lg font-semibold text-neutral-gray-800 mb-4">
                                                        Banking Information
                                                      </h3>
                                                      {account.bankingInfo.length > 0 ? (
                                                        <div className="space-y-4">
                                                          {account.bankingInfo.map((banking, index) => (
                                                            <Card
                                                              key={banking.id}
                                                              className="rounded-[4px] shadow-sm bg-white"
                                                            >
                                                              <CardContent className="p-4">
                                                                <h4 className="font-medium text-sm text-neutral-gray-800 mb-3">
                                                                  Banking Entry #{index + 1}
                                                                </h4>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                                  <div>
                                                                    <span className="font-medium text-neutral-gray-700">
                                                                      Bank Name:
                                                                    </span>
                                                                    <p className="text-neutral-gray-600">
                                                                      {banking.bankName || "Not provided"}
                                                                    </p>
                                                                  </div>
                                                                  <div>
                                                                    <span className="font-medium text-neutral-gray-700">
                                                                      Account Type:
                                                                    </span>
                                                                    <p className="text-neutral-gray-600">
                                                                      {banking.bankAccountType || "Not provided"}
                                                                    </p>
                                                                  </div>
                                                                  <div>
                                                                    <span className="font-medium text-neutral-gray-700">
                                                                      Account Number:
                                                                    </span>
                                                                    <p className="text-neutral-gray-600">
                                                                      {banking.accountNumber
                                                                        ? `****${banking.accountNumber.slice(-4)}`
                                                                        : "Not provided"}
                                                                    </p>
                                                                  </div>
                                                                  <div>
                                                                    <span className="font-medium text-neutral-gray-700">
                                                                      Routing Number:
                                                                    </span>
                                                                    <p className="text-neutral-gray-600">
                                                                      {banking.routingNumber || "Not provided"}
                                                                    </p>
                                                                  </div>
                                                                  <div>
                                                                    <span className="font-medium text-neutral-gray-700">
                                                                      Account Holder:
                                                                    </span>
                                                                    <p className="text-neutral-gray-600">
                                                                      {banking.accountHolderName || "Not provided"}
                                                                    </p>
                                                                  </div>
                                                                </div>
                                                              </CardContent>
                                                            </Card>
                                                          ))}
                                                        </div>
                                                      ) : (
                                                        <p className="text-neutral-gray-500 text-sm">
                                                          No banking information provided
                                                        </p>
                                                      )}
                                                    </div>

                                                    {/* Funding Information */}
                                                    <div>
                                                      <h3 className="text-lg font-semibold text-neutral-gray-800 mb-4">
                                                        Funding Information
                                                      </h3>
                                                      {account.fundingInfo.length > 0 ? (
                                                        <div className="space-y-4">
                                                          {account.fundingInfo.map((funding, index) => (
                                                            <Card
                                                              key={funding.id}
                                                              className="rounded-[4px] shadow-sm bg-white"
                                                            >
                                                              <CardContent className="p-4">
                                                                <h4 className="font-medium text-sm text-neutral-gray-800 mb-3">
                                                                  Funding Entry #{index + 1}
                                                                </h4>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                                  <div>
                                                                    <span className="font-medium text-neutral-gray-700">
                                                                      Funding Method:
                                                                    </span>
                                                                    <p className="text-neutral-gray-600">
                                                                      {funding.fundingMethod || "Not provided"}
                                                                    </p>
                                                                  </div>
                                                                  {funding.fundingMethod === "wire" && (
                                                                    <>
                                                                      <div>
                                                                        <span className="font-medium text-neutral-gray-700">
                                                                          Wire Bank Name:
                                                                        </span>
                                                                        <p className="text-neutral-gray-600">
                                                                          {funding.wireTransferBankName ||
                                                                            "Not provided"}
                                                                        </p>
                                                                      </div>
                                                                      <div>
                                                                        <span className="font-medium text-neutral-gray-700">
                                                                          Wire Account Number:
                                                                        </span>
                                                                        <p className="text-neutral-gray-600">
                                                                          {funding.wireTransferAccountNumber
                                                                            ? `****${funding.wireTransferAccountNumber.slice(-4)}`
                                                                            : "Not provided"}
                                                                        </p>
                                                                      </div>
                                                                      <div>
                                                                        <span className="font-medium text-neutral-gray-700">
                                                                          Wire Routing Number:
                                                                        </span>
                                                                        <p className="text-neutral-gray-600">
                                                                          {funding.wireTransferRoutingNumber ||
                                                                            "Not provided"}
                                                                        </p>
                                                                      </div>
                                                                      <div>
                                                                        <span className="font-medium text-neutral-gray-700">
                                                                          SWIFT/BIC:
                                                                        </span>
                                                                        <p className="text-neutral-gray-600">
                                                                          {funding.wireTransferSwiftBic ||
                                                                            "Not provided"}
                                                                        </p>
                                                                      </div>
                                                                      <div className="md:col-span-2">
                                                                        <span className="font-medium text-neutral-gray-700">
                                                                          Bank Address:
                                                                        </span>
                                                                        <p className="text-neutral-gray-600">
                                                                          {funding.wireTransferBankAddress ||
                                                                            "Not provided"}
                                                                        </p>
                                                                      </div>
                                                                    </>
                                                                  )}
                                                                </div>
                                                              </CardContent>
                                                            </Card>
                                                          ))}
                                                        </div>
                                                      ) : (
                                                        <p className="text-neutral-gray-500 text-sm">
                                                          No funding information provided
                                                        </p>
                                                      )}
                                                    </div>
                                                  </div>
                                                </DialogContent>
                                              </Dialog>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEditAccount(account.id)}
                                                className="h-6 w-6 p-0"
                                              >
                                                <Edit className="h-3 w-3" />
                                              </Button>
                                            </div>
                                          </div>
                                          <div className="space-y-2 text-xs text-neutral-gray-600">
                                            <div className="grid grid-cols-2 gap-2">
                                              <div>
                                                <span className="font-medium">Type:</span>{" "}
                                                {getSubtypeLabel(account.type, account.subtype)}
                                              </div>
                                              <div>
                                                <span className="font-medium">Custodian:</span>{" "}
                                                {account.sampleCustodian || "Not specified"}
                                              </div>
                                              <div>
                                                <span className="font-medium">Initial Deposit:</span>{" "}
                                                {formatCurrency(account.initialDeposit)}
                                              </div>
                                              <div>
                                                <span className="font-medium">Investment Amount:</span>{" "}
                                                {formatCurrency(account.investmentAmount)}
                                              </div>
                                            </div>
                                            <div>
                                              <span className="font-medium">Owners:</span>{" "}
                                              {getOwnerNamesByIds(account.ownerIds)}
                                            </div>
                                            <div>
                                              <span className="font-medium">Description:</span>{" "}
                                              {account.description || "Not provided"}
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                              <div>
                                                <span className="font-medium">Banking Info:</span>{" "}
                                                {account.bankingInfo.length} entr
                                                {account.bankingInfo.length !== 1 ? "ies" : "y"}
                                              </div>
                                              <div>
                                                <span className="font-medium">Funding Info:</span>{" "}
                                                {account.fundingInfo.length} entr
                                                {account.fundingInfo.length !== 1 ? "ies" : "y"}
                                              </div>
                                            </div>
                                          </div>
                                          {hasErrors && (
                                            <div className="mt-3 p-2 bg-red-50 rounded border border-red-200">
                                              <p className="text-xs text-red-600 font-medium">Validation Issues:</p>
                                              <ul className="text-xs text-red-600 mt-1 space-y-1">
                                                {Object.entries(accountValidationErrors)
                                                  .slice(0, 2)
                                                  .map(([field, error]) => (
                                                    <li key={field}>
                                                      • {accountFieldLabels[field] || field}: {error}
                                                    </li>
                                                  ))}
                                                {Object.keys(bankingErrors).length > 0 && (
                                                  <li>• Banking information has errors</li>
                                                )}
                                                {Object.keys(fundingErrors).length > 0 && (
                                                  <li>• Funding information has errors</li>
                                                )}
                                              </ul>
                                            </div>
                                          )}
                                        </CardContent>
                                      </Card>
                                    )
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Overall Status */}
                        <div className="border-t border-neutral-gray-200 pt-6">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-neutral-gray-800">Overall Status</h3>
                            <div className="flex items-center space-x-2">
                              {areAllContactsValid() && areAllAccountsValid() ? (
                                <>
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                  <span className="text-sm font-medium text-green-600">Ready for Signature</span>
                                </>
                              ) : (
                                <>
                                  <TriangleAlert className="h-5 w-5 text-red-500" />
                                  <span className="text-sm font-medium text-red-600">Issues Need Resolution</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="mt-4 grid grid-cols-2 gap-4">
                            <div className="p-3 bg-neutral-gray-50 rounded-[4px]">
                              <div className="flex items-center space-x-2 mb-2">
                                <Users className="h-4 w-4 text-neutral-gray-500" />
                                <span className="text-sm font-medium">Contacts</span>
                              </div>
                              <div className="text-xs text-neutral-gray-600">
                                {contacts.filter((c) => Object.keys(validateContact(c)).length === 0).length} of{" "}
                                {contacts.length} valid
                              </div>
                            </div>
                            <div className="p-3 bg-neutral-gray-50 rounded-[4px]">
                              <div className="flex items-center space-x-2 mb-2">
                                <FileText className="h-4 w-4 text-neutral-gray-500" />
                                <span className="text-sm font-medium">Accounts</span>
                              </div>
                              <div className="text-xs text-neutral-gray-600">
                                {
                                  accounts.filter(
                                    (a) =>
                                      Object.keys(validateAccount(a)).length === 0 &&
                                      Object.keys(validateAllBankingInfoForAccount(a)).length === 0 &&
                                      Object.keys(validateAllFundingInfoForAccount(a)).length === 0,
                                  ).length
                                }{" "}
                                of {accounts.length} valid
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Keep all existing contact and account forms exactly as they are */}
                {selectedContactData && !selectedAccountData && !showSummary && (
                  <Card className="rounded-[4px] shadow-sm bg-white">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center space-x-2 text-lg text-neutral-gray-800">
                          <User className="h-5 w-5 text-primary-blue-600" />
                          <span>
                            Account Owner Details: {selectedContactData.firstName} {selectedContactData.lastName}
                          </span>
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName" className="text-neutral-gray-700">
                            First Name
                          </Label>
                          <Input
                            id="firstName"
                            value={selectedContactData.firstName}
                            onChange={(e) => updateContact(selectedContactData.id, "firstName", e.target.value)}
                            className={`rounded-[4px] border ${contactErrors.firstName ? "border-red-500" : "border-neutral-gray-300"} bg-white px-3 py-2 text-sm text-neutral-gray-800 placeholder:text-neutral-gray-400 shadow-sm focus:border-primary-blue-500 focus:ring-primary-blue-500`}
                            aria-invalid={!!contactErrors.firstName}
                            aria-describedby="firstName-error"
                          />
                          {contactErrors.firstName && (
                            <p id="firstName-error" className="text-red-500 text-xs mt-1">
                              {contactErrors.firstName}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="middleInitial" className="text-neutral-gray-700">
                            Middle Initial
                          </Label>
                          <Input
                            id="middleInitial"
                            value={selectedContactData.middleInitial || ""}
                            onChange={(e) => updateContact(selectedContactData.id, "middleInitial", e.target.value)}
                            className={`rounded-[4px] border border-neutral-gray-300 bg-white px-3 py-2 text-sm text-neutral-gray-800 placeholder:text-neutral-gray-400 shadow-sm focus:border-primary-blue-500 focus:ring-primary-blue-500`}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName" className="text-neutral-gray-700">
                            Last Name
                          </Label>
                          <Input
                            id="lastName"
                            value={selectedContactData.lastName}
                            onChange={(e) => updateContact(selectedContactData.id, "lastName", e.target.value)}
                            className={`rounded-[4px] border ${contactErrors.lastName ? "border-red-500" : "border-neutral-gray-300"} bg-white px-3 py-2 text-sm text-neutral-gray-800 placeholder:text-neutral-gray-400 shadow-sm focus:border-primary-blue-500 focus:ring-primary-blue-500`}
                            aria-invalid={!!contactErrors.lastName}
                            aria-describedby="lastName-error"
                          />
                          {contactErrors.lastName && (
                            <p id="lastName-error" className="text-red-500 text-xs mt-1">
                              {contactErrors.lastName}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="dateOfBirth" className="text-neutral-gray-700">
                            Date of Birth
                          </Label>
                          <Input
                            id="dateOfBirth"
                            type="date"
                            value={selectedContactData.dateOfBirth}
                            onChange={(e) => updateContact(selectedContactData.id, "dateOfBirth", e.target.value)}
                            className={`rounded-[4px] border ${contactErrors.dateOfBirth ? "border-red-500" : "border-neutral-gray-300"} bg-white px-3 py-2 text-sm text-neutral-gray-800 placeholder:text-neutral-gray-400 shadow-sm focus:border-primary-blue-500 focus:ring-primary-blue-500`}
                            aria-invalid={!!contactErrors.dateOfBirth}
                            aria-describedby="dateOfBirth-error"
                          />
                          {contactErrors.dateOfBirth && (
                            <p id="dateOfBirth-error" className="text-red-500 text-xs mt-1">
                              {contactErrors.dateOfBirth}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="socialSecurityNumber" className="text-neutral-gray-700">
                            Social Security Number
                          </Label>
                          <Input
                            id="socialSecurityNumber"
                            type="text"
                            value={selectedContactData.socialSecurityNumber}
                            onChange={(e) =>
                              updateContact(selectedContactData.id, "socialSecurityNumber", e.target.value)
                            }
                            className={`rounded-[4px] border ${contactErrors.socialSecurityNumber ? "border-red-500" : "border-neutral-gray-300"} bg-white px-3 py-2 text-sm text-neutral-gray-800 placeholder:text-neutral-gray-400 shadow-sm focus:border-primary-blue-500 focus:ring-primary-blue-500`}
                            placeholder="***-**-****"
                            aria-invalid={!!contactErrors.socialSecurityNumber}
                            aria-describedby="socialSecurityNumber-error"
                          />
                          {contactErrors.socialSecurityNumber && (
                            <p id="socialSecurityNumber-error" className="text-red-500 text-xs mt-1">
                              {contactErrors.socialSecurityNumber}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="primaryPhone" className="text-neutral-gray-700">
                            Primary Phone
                          </Label>
                          <Input
                            id="primaryPhone"
                            type="tel"
                            value={selectedContactData.primaryPhone}
                            onChange={(e) => updateContact(selectedContactData.id, "primaryPhone", e.target.value)}
                            className={`rounded-[4px] border ${contactErrors.primaryPhone ? "border-red-500" : "border-neutral-gray-300"} bg-white px-3 py-2 text-sm text-neutral-gray-800 placeholder:text-neutral-gray-400 shadow-sm focus:border-primary-blue-500 focus:ring-primary-blue-500`}
                            aria-invalid={!!contactErrors.primaryPhone}
                            aria-describedby="primaryPhone-error"
                          />
                          {contactErrors.primaryPhone && (
                            <p id="primaryPhone-error" className="text-red-500 text-xs mt-1">
                              {contactErrors.primaryPhone}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="secondaryPhone" className="text-neutral-gray-700">
                            Secondary Phone
                          </Label>
                          <Input
                            id="secondaryPhone"
                            type="tel"
                            value={selectedContactData.secondaryPhone || ""}
                            onChange={(e) => updateContact(selectedContactData.id, "secondaryPhone", e.target.value)}
                            className="rounded-[4px] border border-neutral-gray-300 bg-white px-3 py-2 text-sm text-neutral-gray-800 placeholder:text-neutral-gray-400 shadow-sm focus:border-primary-blue-500 focus:ring-primary-blue-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="emailAddress" className="text-neutral-gray-700">
                          Email Address
                        </Label>
                        <Input
                          id="emailAddress"
                          type="email"
                          value={selectedContactData.emailAddress}
                          onChange={(e) => updateContact(selectedContactData.id, "emailAddress", e.target.value)}
                          className={`rounded-[4px] border ${contactErrors.emailAddress ? "border-red-500" : "border-neutral-gray-300"} bg-white px-3 py-2 text-sm text-neutral-gray-800 placeholder:text-neutral-gray-400 shadow-sm focus:border-primary-blue-500 focus:ring-primary-blue-500`}
                          aria-invalid={!!contactErrors.emailAddress}
                          aria-describedby="emailAddress-error"
                        />
                        {contactErrors.emailAddress && (
                          <p id="emailAddress-error" className="text-red-500 text-xs mt-1">
                            {contactErrors.emailAddress}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="homeAddress" className="text-neutral-gray-700">
                          Home Address
                        </Label>
                        <Textarea
                          id="homeAddress"
                          value={selectedContactData.homeAddress}
                          onChange={(e) => updateContact(selectedContactData.id, "homeAddress", e.target.value)}
                          className={`rounded-[4px] border ${contactErrors.homeAddress ? "border-red-500" : "border-neutral-gray-300"} bg-white px-3 py-2 text-sm text-neutral-gray-800 placeholder:text-neutral-gray-400 shadow-sm focus:border-primary-blue-500 focus:ring-primary-blue-500`}
                          placeholder="Full address"
                          aria-invalid={!!contactErrors.homeAddress}
                          aria-describedby="homeAddress-error"
                        />
                        {contactErrors.homeAddress && (
                          <p id="homeAddress-error" className="text-red-500 text-xs mt-1">
                            {contactErrors.homeAddress}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="mailingAddress" className="text-neutral-gray-700">
                          Mailing Address
                        </Label>
                        <Textarea
                          id="mailingAddress"
                          value={selectedContactData.mailingAddress || ""}
                          onChange={(e) => updateContact(selectedContactData.id, "mailingAddress", e.target.value)}
                          className="rounded-[4px] border border-neutral-gray-300 bg-white px-3 py-2 text-sm text-neutral-gray-800 placeholder:text-neutral-gray-400 shadow-sm focus:border-primary-blue-500 focus:ring-primary-blue-500"
                          placeholder="Full address (if different from home)"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="citizenshipType" className="text-neutral-gray-700">
                          Citizenship Type
                        </Label>
                        <Select
                          value={selectedContactData.citizenshipType}
                          onValueChange={(value) => updateContact(selectedContactData.id, "citizenshipType", value)}
                        >
                          <SelectTrigger
                            className={`rounded-[4px] border ${contactErrors.citizenshipType ? "border-red-500" : "border-neutral-gray-300"} bg-white px-3 py-2 text-sm text-neutral-gray-800 shadow-sm focus:border-primary-blue-500 focus:ring-primary-blue-500`}
                            aria-invalid={!!contactErrors.citizenshipType}
                            aria-describedby="citizenshipType-error"
                          >
                            <SelectValue placeholder="Select citizenship" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-neutral-gray-200">
                            <SelectItem value="US Citizen">US Citizen</SelectItem>
                            <SelectItem value="Permanent Resident">Permanent Resident</SelectItem>
                            <SelectItem value="Non-Resident Alien">Non-Resident Alien</SelectItem>
                            <SelectItem value="Dual Citizen">Dual Citizen</SelectItem>
                          </SelectContent>
                        </Select>
                        {contactErrors.citizenshipType && (
                          <p id="citizenshipType-error" className="text-red-500 text-xs mt-1">
                            {contactErrors.citizenshipType}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="identificationAttachment" className="text-neutral-gray-700">
                          Upload Identification Attachment
                        </Label>
                        <Input
                          id="identificationAttachment"
                          type="file"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const filename = e.target.files[0].name
                              updateContact(selectedContactData.id, "identificationAttachment", filename)
                            }
                          }}
                          className="rounded-[4px] border border-neutral-gray-300 bg-white px-3 py-2 text-sm text-neutral-gray-800 placeholder:text-neutral-gray-400 shadow-sm focus:border-primary-blue-500 focus:ring-primary-blue-500"
                        />
                        {selectedContactData.identificationAttachment && (
                          <p className="text-neutral-gray-600 text-xs mt-1">
                            Attached file: {selectedContactData.identificationAttachment}
                          </p>
                        )}
                      </div>

                      <div className="border-t border-neutral-gray-200 pt-4 mt-4"></div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-neutral-gray-800">Employment Information</h3>
                        <div className="space-y-2">
                          <Label htmlFor="employmentStatus" className="text-neutral-gray-700">
                            Employment Status
                          </Label>
                          <Select
                            value={selectedContactData.employmentStatus}
                            onValueChange={(value) => updateContact(selectedContactData.id, "employmentStatus", value)}
                          >
                            <SelectTrigger
                              className={`rounded-[4px] border ${contactErrors.employmentStatus ? "border-red-500" : "border-neutral-gray-300"} bg-white px-3 py-2 text-sm text-neutral-gray-800 shadow-sm focus:border-primary-blue-500 focus:ring-primary-blue-500`}
                              aria-invalid={!!contactErrors.employmentStatus}
                              aria-describedby="employmentStatus-error"
                            >
                              <SelectValue placeholder="Select employment status" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-neutral-gray-200">
                              <SelectItem value="Employed">Employed</SelectItem>
                              <SelectItem value="Self-Employed">Self-Employed</SelectItem>
                              <SelectItem value="Unemployed">Unemployed</SelectItem>
                              <SelectItem value="Retired">Retired</SelectItem>
                              <SelectItem value="Student">Student</SelectItem>
                            </SelectContent>
                          </Select>
                          {contactErrors.employmentStatus && (
                            <p id="employmentStatus-error" className="text-red-500 text-xs mt-1">
                              {contactErrors.employmentStatus}
                            </p>
                          )}
                        </div>

                        <div className="flex items-start space-x-2">
                          <Checkbox
                            id="publicCompanyAffiliation"
                            checked={selectedContactData.publicCompanyAffiliation}
                            onCheckedChange={(checked) =>
                              updateContact(selectedContactData.id, "publicCompanyAffiliation", checked as boolean)
                            }
                            className="mt-1"
                          />
                          <Label
                            htmlFor="publicCompanyAffiliation"
                            className="text-sm font-normal text-neutral-gray-700 leading-relaxed"
                          >
                            Are you or your spouse, any member of your immediate family, including parents, in-laws,
                            siblings, and dependents a member of the board of directors, a 10% shareholder, or a
                            policy-making officer of a publicly traded company?*
                          </Label>
                        </div>

                        <div className="flex items-start space-x-2">
                          <Checkbox
                            id="brokerDealerAffiliation"
                            checked={selectedContactData.brokerDealerAffiliation}
                            onCheckedChange={(checked) =>
                              updateContact(selectedContactData.id, "brokerDealerAffiliation", checked as boolean)
                            }
                            className="mt-1"
                          />
                          <Label
                            htmlFor="brokerDealerAffiliation"
                            className="text-sm font-normal text-neutral-gray-700 leading-relaxed"
                          >
                            Are you or your spouse, any member of your immediate family, including parents, in-laws,
                            siblings, and dependents licensed, employed by, or associated with, a broker-dealer firm, a
                            financial services regulator, securities exchange, or member of a securities exchange? *
                          </Label>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="annualIncomeRange" className="text-neutral-gray-700">
                            Annual Income Range
                          </Label>
                          <Select
                            value={selectedContactData.annualIncomeRange}
                            onValueChange={(value) => updateContact(selectedContactData.id, "annualIncomeRange", value)}
                          >
                            <SelectTrigger
                              className={`rounded-[4px] border ${contactErrors.annualIncomeRange ? "border-red-500" : "border-neutral-gray-300"} bg-white px-3 py-2 text-sm text-neutral-gray-800 shadow-sm focus:border-primary-blue-500 focus:ring-primary-blue-500`}
                              aria-invalid={!!contactErrors.annualIncomeRange}
                              aria-describedby="annualIncomeRange-error"
                            >
                              <SelectValue placeholder="Select income range" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-neutral-gray-200">
                              <SelectItem value="0-25k">0-25k</SelectItem>
                              <SelectItem value="25k-50k">25k-50k</SelectItem>
                              <SelectItem value="50k-100k">50k-100k</SelectItem>
                              <SelectItem value="100k-250k">100k-250k</SelectItem>
                              <SelectItem value="250k+">250k+</SelectItem>
                            </SelectContent>
                          </Select>
                          {contactErrors.annualIncomeRange && (
                            <p id="annualIncomeRange-error" className="text-red-500 text-xs mt-1">
                              {contactErrors.annualIncomeRange}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="netWorthRange" className="text-neutral-gray-700">
                            Approximate Net Worth Range
                          </Label>
                          <Select
                            value={selectedContactData.netWorthRange}
                            onValueChange={(value) => updateContact(selectedContactData.id, "netWorthRange", value)}
                          >
                            <SelectTrigger
                              className={`rounded-[4px] border ${contactErrors.netWorthRange ? "border-red-500" : "border-neutral-gray-300"} bg-white px-3 py-2 text-sm text-neutral-gray-800 shadow-sm focus:border-primary-blue-500 focus:ring-primary-blue-500`}
                              aria-invalid={!!contactErrors.netWorthRange}
                              aria-describedby="netWorthRange-error"
                            >
                              <SelectValue placeholder="Select net worth range" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-neutral-gray-200">
                              <SelectItem value="0-100k">0-100k</SelectItem>
                              <SelectItem value="100k-500k">100k-500k</SelectItem>
                              <SelectItem value="500k-1m">500k-1m</SelectItem>
                              <SelectItem value="1m-5m">1m-5m</SelectItem>
                              <SelectItem value="5m+">5m+</SelectItem>
                            </SelectContent>
                          </Select>
                          {contactErrors.netWorthRange && (
                            <p id="netWorthRange-error" className="text-red-500 text-xs mt-1">
                              {contactErrors.netWorthRange}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="sourceOfFunds" className="text-neutral-gray-700">
                            Source of Funds
                          </Label>
                          <Input
                            id="sourceOfFunds"
                            type="text"
                            value={selectedContactData.sourceOfFunds}
                            onChange={(e) => updateContact(selectedContactData.id, "sourceOfFunds", e.target.value)}
                            className={`rounded-[4px] border ${contactErrors.sourceOfFunds ? "border-red-500" : "border-neutral-gray-300"} bg-white px-3 py-2 text-sm text-neutral-gray-800 placeholder:text-neutral-gray-400 shadow-sm focus:border-primary-blue-500 focus:ring-primary-blue-500`}
                            aria-invalid={!!contactErrors.sourceOfFunds}
                            aria-describedby="sourceOfFunds-error"
                          />
                          {contactErrors.sourceOfFunds && (
                            <p id="sourceOfFunds-error" className="text-red-500 text-xs mt-1">
                              {contactErrors.sourceOfFunds}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="ongoingSourceOfFunds" className="text-neutral-gray-700">
                            Ongoing Source of Funds
                          </Label>
                          <Input
                            id="ongoingSourceOfFunds"
                            type="text"
                            value={selectedContactData.ongoingSourceOfFunds}
                            onChange={(e) =>
                              updateContact(selectedContactData.id, "ongoingSourceOfFunds", e.target.value)
                            }
                            className={`rounded-[4px] border ${contactErrors.ongoingSourceOfFunds ? "border-red-500" : "border-neutral-gray-300"} bg-white px-3 py-2 text-sm text-neutral-gray-800 placeholder:text-neutral-gray-400 shadow-sm focus:border-primary-blue-500 focus:ring-primary-blue-500`}
                            aria-invalid={!!contactErrors.ongoingSourceOfFunds}
                            aria-describedby="ongoingSourceOfFunds-error"
                          />
                          {contactErrors.ongoingSourceOfFunds && (
                            <p id="ongoingSourceOfFunds-error" className="text-red-500 text-xs mt-1">
                              {contactErrors.ongoingSourceOfFunds}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="border-t border-neutral-gray-200 pt-4 mt-4"></div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-neutral-gray-800">Trusted Contact Information</h3>
                        <p className="text-sm text-neutral-gray-600">
                          Provide details for a trusted contact who can be reached in case we are unable to contact you.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="trustedContactFirstName" className="text-neutral-gray-700">
                              First Name
                            </Label>
                            <Input
                              id="trustedContactFirstName"
                              type="text"
                              value={selectedContactData.trustedContactFirstName || ""}
                              onChange={(e) =>
                                updateContact(selectedContactData.id, "trustedContactFirstName", e.target.value)
                              }
                              className="rounded-[4px] border border-neutral-gray-300 bg-white px-3 py-2 text-sm text-neutral-gray-800 placeholder:text-neutral-gray-400 shadow-sm focus:border-primary-blue-500 focus:ring-primary-blue-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="trustedContactMiddleInitial" className="text-neutral-gray-700">
                              Middle Initial
                            </Label>
                            <Input
                              id="trustedContactMiddleInitial"
                              type="text"
                              value={selectedContactData.trustedContactMiddleInitial || ""}
                              onChange={(e) =>
                                updateContact(selectedContactData.id, "trustedContactMiddleInitial", e.target.value)
                              }
                              className="rounded-[4px] border border-neutral-gray-300 bg-white px-3 py-2 text-sm text-neutral-gray-800 placeholder:text-neutral-gray-400 shadow-sm focus:border-primary-blue-500 focus:ring-primary-blue-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="trustedContactLastName" className="text-neutral-gray-700">
                              Last Name
                            </Label>
                            <Input
                              id="trustedContactLastName"
                              type="text"
                              value={selectedContactData.trustedContactLastName || ""}
                              onChange={(e) =>
                                updateContact(selectedContactData.id, "trustedContactLastName", e.target.value)
                              }
                              className="rounded-[4px] border border-neutral-gray-300 bg-white px-3 py-2 text-sm text-neutral-gray-800 placeholder:text-neutral-gray-400 shadow-sm focus:border-primary-blue-500 focus:ring-primary-blue-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="trustedContactSuffix" className="text-neutral-gray-700">
                              Suffix
                            </Label>
                            <Input
                              id="trustedContactSuffix"
                              type="text"
                              value={selectedContactData.trustedContactSuffix || ""}
                              onChange={(e) =>
                                updateContact(selectedContactData.id, "trustedContactSuffix", e.target.value)
                              }
                              className="rounded-[4px] border border-neutral-gray-300 bg-white px-3 py-2 text-sm text-neutral-gray-800 placeholder:text-neutral-gray-400 shadow-sm focus:border-primary-blue-500 focus:ring-primary-blue-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="trustedContactTelephone" className="text-neutral-gray-700">
                              Telephone Number
                            </Label>
                            <Input
                              id="trustedContactTelephone"
                              type="tel"
                              value={selectedContactData.trustedContactTelephone || ""}
                              onChange={(e) =>
                                updateContact(selectedContactData.id, "trustedContactTelephone", e.target.value)
                              }
                              className="rounded-[4px] border border-neutral-gray-300 bg-white px-3 py-2 text-sm text-neutral-gray-800 placeholder:text-neutral-gray-400 shadow-sm focus:border-primary-blue-500 focus:ring-primary-blue-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="trustedContactMobile" className="text-neutral-gray-700">
                              Mobile Number
                            </Label>
                            <Input
                              id="trustedContactMobile"
                              type="tel"
                              value={selectedContactData.trustedContactMobile || ""}
                              onChange={(e) =>
                                updateContact(selectedContactData.id, "trustedContactMobile", e.target.value)
                              }
                              className="rounded-[4px] border border-neutral-gray-300 bg-white px-3 py-2 text-sm text-neutral-gray-800 placeholder:text-neutral-gray-400 shadow-sm focus:border-primary-blue-500 focus:ring-primary-blue-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="trustedContactEmail" className="text-neutral-gray-700">
                              Email Address
                            </Label>
                            <Input
                              id="trustedContactEmail"
                              type="email"
                              value={selectedContactData.trustedContactEmail || ""}
                              onChange={(e) =>
                                updateContact(selectedContactData.id, "trustedContactEmail", e.target.value)
                              }
                              className="rounded-[4px] border border-neutral-gray-300 bg-white px-3 py-2 text-sm text-neutral-gray-800 placeholder:text-neutral-gray-400 shadow-sm focus:border-primary-blue-500 focus:ring-primary-blue-500"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="trustedContactMailingAddress" className="text-neutral-gray-700">
                            Mailing Address
                          </Label>
                          <Textarea
                            id="trustedContactMailingAddress"
                            value={selectedContactData.trustedContactMailingAddress || ""}
                            onChange={(e) =>
                              updateContact(selectedContactData.id, "trustedContactMailingAddress", e.target.value)
                            }
                            className="rounded-[4px] border border-neutral-gray-300 bg-white px-3 py-2 text-sm text-neutral-gray-800 placeholder:text-neutral-gray-400 shadow-sm focus:border-primary-blue-500 focus:ring-primary-blue-500"
                            placeholder="Full address"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="trustedContactRelationship" className="text-neutral-gray-700">
                            Relationship to Owner
                          </Label>
                          <Input
                            id="trustedContactRelationship"
                            type="text"
                            value={selectedContactData.trustedContactRelationship || ""}
                            onChange={(e) =>
                              updateContact(selectedContactData.id, "trustedContactRelationship", e.target.value)
                            }
                            className="rounded-[4px] border border-neutral-gray-300 bg-white px-3 py-2 text-sm text-neutral-gray-800 placeholder:text-neutral-gray-400 shadow-sm focus:border-primary-blue-500 focus:ring-primary-blue-500"
                            placeholder="e.g., Friend, Family Member"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {selectedAccountData && !showSummary && (
                  <Card className="rounded-[4px] shadow-sm bg-white">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center space-x-2 text-lg text-neutral-gray-800">
                          {getAccountIcon(selectedAccountData.type)}
                          <span>Account Details: {selectedAccountData.accountName}</span>
                        </CardTitle>
                      </div>
                    </CardHeader>

                    {/* Quick Actions - moved here */}
                    <div className="px-6 pb-4 border-b border-neutral-gray-200">
                      <div className="flex flex-wrap gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addBankingInfo(selectedAccountData.id)}
                          className="rounded-[4px] bg-white border-neutral-gray-300 text-neutral-gray-700 hover:bg-neutral-gray-100 shadow-sm"
                        >
                          Add Banking Information
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addFundingInfo(selectedAccountData.id)}
                          className="rounded-[4px] bg-white border-neutral-gray-300 text-neutral-gray-700 hover:bg-neutral-gray-100 shadow-sm"
                        >
                          Add Funding
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            console.log("Add Withdrawal functionality")
                            // TODO: Implement add withdrawal functionality
                          }}
                          className="rounded-[4px] bg-white border-neutral-gray-300 text-neutral-gray-700 hover:bg-neutral-gray-100 shadow-sm"
                        >
                          Add a Withdrawal
                        </Button>
                      </div>
                    </div>

                    <CardContent className="space-y-4">
                      {/* Rest of the existing CardContent remains the same */}
                      <div className="space-y-2">
                        <Label htmlFor="accountName" className="text-neutral-gray-700">
                          Account Name
                        </Label>
                        <Input
                          id="accountName"
                          value={selectedAccountData.accountName}
                          onChange={(e) => updateAccount(selectedAccountData.id, "accountName", e.target.value)}
                          className={`rounded-[4px] border ${accountErrors.accountName ? "border-red-500" : "border-neutral-gray-300"} bg-white px-3 py-2 text-sm text-neutral-gray-800 placeholder:text-neutral-gray-400 shadow-sm focus:border-primary-blue-500 focus:ring-primary-blue-500`}
                          aria-invalid={!!accountErrors.accountName}
                          aria-describedby="accountName-error"
                        />
                        {accountErrors.accountName && (
                          <p id="accountName-error" className="text-red-500 text-xs mt-1">
                            {accountErrors.accountName}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="accountType" className="text-neutral-gray-700">
                            Account Type
                          </Label>
                          <Select
                            value={selectedAccountData.type}
                            onChange={(value) => {
                              updateAccount(selectedAccountData.id, "type", value)
                              updateAccount(selectedAccountData.id, "subtype", "") // Reset subtype when type changes
                            }}
                          >
                            <SelectTrigger
                              className={`rounded-[4px] border ${accountErrors.type ? "border-red-500" : "border-neutral-gray-300"} bg-white px-3 py-2 text-sm text-neutral-gray-800 shadow-sm focus:border-primary-blue-500 focus:ring-primary-blue-500`}
                              aria-invalid={!!accountErrors.type}
                              aria-describedby="accountType-error"
                            >
                              <SelectValue placeholder="Select account type" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-neutral-gray-200">
                              <SelectItem value="investment">Investment</SelectItem>
                              <SelectItem value="retirement">Retirement</SelectItem>
                              <SelectItem value="joint">Joint</SelectItem>
                            </SelectContent>
                          </Select>
                          {accountErrors.type && (
                            <p id="accountType-error" className="text-red-500 text-xs mt-1">
                              {accountErrors.type}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="accountSubtype" className="text-neutral-gray-700">
                            Account Subtype
                          </Label>
                          <Select
                            value={selectedAccountData.subtype}
                            onChange={(value) => updateAccount(selectedAccountData.id, "subtype", value)}
                            disabled={!selectedAccountData.type}
                          >
                            <SelectTrigger
                              className={`rounded-[4px] border ${accountErrors.subtype ? "border-red-500" : "border-neutral-gray-300"} bg-white px-3 py-2 text-sm text-neutral-gray-800 shadow-sm focus:border-primary-blue-500 focus:ring-primary-blue-500`}
                              aria-invalid={!!accountErrors.subtype}
                              aria-describedby="accountSubtype-error"
                            >
                              <SelectValue placeholder="Select account subtype" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-neutral-gray-200">
                              {getSubtypeOptions(selectedAccountData.type).map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {accountErrors.subtype && (
                            <p id="accountSubtype-error" className="text-red-500 text-xs mt-1">
                              {accountErrors.subtype}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-neutral-gray-700">
                          Description
                        </Label>
                        <Textarea
                          id="description"
                          value={selectedAccountData.description}
                          onChange={(e) => updateAccount(selectedAccountData.id, "description", e.target.value)}
                          className={`rounded-[4px] border ${accountErrors.description ? "border-red-500" : "border-neutral-gray-300"} bg-white px-3 py-2 text-sm text-neutral-gray-800 placeholder:text-neutral-gray-400 shadow-sm focus:border-primary-blue-500 focus:ring-primary-blue-500`}
                          placeholder="Account description"
                          aria-invalid={!!accountErrors.description}
                          aria-describedby="description-error"
                        />
                        {accountErrors.description && (
                          <p id="description-error" className="text-red-500 text-xs mt-1">
                            {accountErrors.description}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="initialDeposit" className="text-neutral-gray-700">
                            Initial Deposit
                          </Label>
                          <Input
                            id="initialDeposit"
                            type="text"
                            value={
                              isInitialDepositFocused
                                ? selectedAccountData.initialDeposit
                                : formatCurrency(selectedAccountData.initialDeposit)
                            }
                            onChange={(e) => {
                              const cleanedValue = parseCurrencyInput(e.target.value)
                              updateAccount(selectedAccountData.id, "initialDeposit", cleanedValue)
                            }}
                            onFocus={() => setIsInitialDepositFocused(true)}
                            onBlur={() => setIsInitialDepositFocused(false)}
                            className={`rounded-[4px] border ${accountErrors.initialDeposit ? "border-red-500" : "border-neutral-gray-300"} bg-white px-3 py-2 text-sm text-neutral-gray-800 placeholder:text-neutral-gray-400 shadow-sm focus:border-primary-blue-500 focus:ring-primary-blue-500`}
                            aria-invalid={!!accountErrors.initialDeposit}
                            aria-describedby="initialDeposit-error"
                          />
                          {accountErrors.initialDeposit && (
                            <p id="initialDeposit-error" className="text-red-500 text-xs mt-1">
                              {accountErrors.initialDeposit}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="minimumDeposit" className="text-neutral-gray-700">
                            Minimum Deposit Required
                          </Label>
                          <Input
                            id="minimumDeposit"
                            type="text"
                            value={
                              isMinimumDepositFocused
                                ? selectedAccountData.minimumDeposit
                                : formatCurrency(selectedAccountData.minimumDeposit)
                            }
                            onChange={(e) => {
                              const cleanedValue = parseCurrencyInput(e.target.value)
                              updateAccount(selectedAccountData.id, "minimumDeposit", cleanedValue)
                            }}
                            onFocus={() => setIsMinimumDepositFocused(true)}
                            onBlur={() => setIsMinimumDepositFocused(false)}
                            className={`rounded-[4px] border ${accountErrors.minimumDeposit ? "border-red-500" : "border-neutral-gray-300"} bg-white px-3 py-2 text-sm text-neutral-gray-800 placeholder:text-neutral-gray-400 shadow-sm focus:border-primary-blue-500 focus:ring-primary-blue-500`}
                            aria-invalid={!!accountErrors.minimumDeposit}
                            aria-describedby="minimumDeposit-error"
                          />
                          {accountErrors.minimumDeposit && (
                            <p id="minimumDeposit-error" className="text-red-500 text-xs mt-1">
                              {accountErrors.minimumDeposit}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="investmentAmount" className="text-neutral-gray-700">
                            Investment Amount
                          </Label>
                          <Input
                            id="investmentAmount"
                            type="text"
                            value={
                              isInvestmentAmountFocused
                                ? selectedAccountData.investmentAmount
                                : formatCurrency(selectedAccountData.investmentAmount)
                            }
                            onChange={(e) => {
                              const cleanedValue = parseCurrencyInput(e.target.value)
                              updateAccount(selectedAccountData.id, "investmentAmount", cleanedValue)
                            }}
                            onFocus={() => setIsInvestmentAmountFocused(true)}
                            onBlur={() => setIsInvestmentAmountFocused(false)}
                            className={`rounded-[4px] border ${accountErrors.investmentAmount ? "border-red-500" : "border-neutral-gray-300"} bg-white px-3 py-2 text-sm text-neutral-gray-800 placeholder:text-neutral-gray-400 shadow-sm focus:border-primary-blue-500 focus:ring-primary-blue-500`}
                            aria-invalid={!!accountErrors.investmentAmount}
                            aria-describedby="investmentAmount-error"
                          />
                          {accountErrors.investmentAmount && (
                            <p id="investmentAmount-error" className="text-red-500 text-xs mt-1">
                              {accountErrors.investmentAmount}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="sampleCustodian" className="text-neutral-gray-700">
                            Sample Custodian
                          </Label>
                          <Select
                            value={selectedAccountData.sampleCustodian}
                            onChange={(value) => updateAccount(selectedAccountData.id, "sampleCustodian", value)}
                          >
                            <SelectTrigger
                              className={`rounded-[4px] border ${accountErrors.sampleCustodian ? "border-red-500" : "border-neutral-gray-300"} bg-white px-3 py-2 text-sm text-neutral-gray-800 shadow-sm focus:border-primary-blue-500 focus:ring-primary-blue-500`}
                              aria-invalid={!!accountErrors.sampleCustodian}
                              aria-describedby="sampleCustodian-error"
                            >
                              <SelectValue placeholder="Select custodian" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-neutral-gray-200">
                              <SelectItem value="Fidelity">Fidelity</SelectItem>
                              <SelectItem value="Vanguard">Vanguard</SelectItem>
                              <SelectItem value="Schwab">Schwab</SelectItem>
                              <SelectItem value="TrustCo">TrustCo</SelectItem>
                            </SelectContent>
                          </Select>
                          {accountErrors.sampleCustodian && (
                            <p id="sampleCustodian-error" className="text-red-500 text-xs mt-1">
                              {accountErrors.sampleCustodian}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-neutral-gray-700">Account Owners</Label>
                        <div className="space-y-2">
                          {contacts.map((contact) => (
                            <div key={contact.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`owner-${contact.id}`}
                                checked={selectedAccountData.ownerIds?.includes(contact.id) || false}
                                onCheckedChange={(checked) => {
                                  const currentOwners = selectedAccountData.ownerIds || []
                                  let newOwners: string[]

                                  if (checked) {
                                    newOwners = [...currentOwners, contact.id]
                                  } else {
                                    newOwners = currentOwners.filter((id) => id !== contact.id)
                                  }

                                  updateAccount(selectedAccountData.id, "ownerIds", newOwners)
                                }}
                              />
                              <Label htmlFor={`owner-${contact.id}`} className="text-sm text-neutral-gray-700">
                                {contact.firstName} {contact.lastName}
                              </Label>
                            </div>
                          ))}
                        </div>
                        {accountErrors.ownerIds && (
                          <p className="text-red-500 text-xs mt-1">{accountErrors.ownerIds}</p>
                        )}
                      </div>

                      <div className="border-t border-neutral-gray-200 pt-4 mt-4"></div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-neutral-gray-800">Banking Information</h3>
                        <div className="flex items-center justify-between">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addBankingInfo(selectedAccountData.id)}
                            className="rounded-[4px] bg-white border-neutral-gray-300 text-neutral-gray-700 hover:bg-neutral-gray-100"
                          >
                            Add Banking Info
                          </Button>
                        </div>

                        {selectedAccountData.bankingInfo.map((banking, index) => (
                          <Card key={banking.id} className="rounded-[4px] shadow-sm bg-neutral-gray-50">
                            <CardContent className="p-4 space-y-4">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium text-neutral-gray-800">
                                  Banking Entry #{index + 1}
                                </h4>
                                {selectedAccountData.bankingInfo.length > 1 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeBankingInfo(selectedAccountData.id, banking.id)}
                                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                  >
                                    Remove
                                  </Button>
                                )}
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label className="text-neutral-gray-700">Bank Name</Label>
                                  <Input
                                    value={banking.bankName}
                                    onChange={(e) => {
                                      const updatedBanking = selectedAccountData.bankingInfo.map((b) =>
                                        b.id === banking.id ? { ...b, bankName: e.target.value } : b,
                                      )
                                      updateAccount(selectedAccountData.id, "bankingInfo", updatedBanking)
                                    }}
                                    className={`rounded-[4px] border ${bankingInfoErrors[selectedAccountData.id]?.[banking.id]?.bankName ? "border-red-500" : "border-neutral-gray-300"} bg-white px-3 py-2 text-sm text-neutral-gray-800 placeholder:text-neutral-gray-400 shadow-sm focus:border-primary-blue-500 focus:ring-primary-blue-500`}
                                  />
                                  {bankingInfoErrors[selectedAccountData.id]?.[banking.id]?.bankName && (
                                    <p className="text-red-500 text-xs mt-1">
                                      {bankingInfoErrors[selectedAccountData.id][banking.id].bankName}
                                    </p>
                                  )}
                                </div>

                                <div className="space-y-2">
                                  <Label className="text-neutral-gray-700">Account Number</Label>
                                  <Input
                                    value={banking.accountNumber}
                                    onChange={(e) => {
                                      const updatedBanking = selectedAccountData.bankingInfo.map((b) =>
                                        b.id === banking.id ? { ...b, accountNumber: e.target.value } : b,
                                      )
                                      updateAccount(selectedAccountData.id, "bankingInfo", updatedBanking)
                                    }}
                                    className={`rounded-[4px] border ${bankingInfoErrors[selectedAccountData.id]?.[banking.id]?.accountNumber ? "border-red-500" : "border-neutral-gray-300"} bg-white px-3 py-2 text-sm text-neutral-gray-800 placeholder:text-neutral-gray-400 shadow-sm focus:border-primary-blue-500 focus:ring-primary-blue-500`}
                                  />
                                  {bankingInfoErrors[selectedAccountData.id]?.[banking.id]?.accountNumber && (
                                    <p className="text-red-500 text-xs mt-1">
                                      {bankingInfoErrors[selectedAccountData.id][banking.id].accountNumber}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label className="text-neutral-gray-700">Routing Number</Label>
                                  <Input
                                    value={banking.routingNumber}
                                    onChange={(e) => {
                                      const updatedBanking = selectedAccountData.bankingInfo.map((b) =>
                                        b.id === banking.id ? { ...b, routingNumber: e.target.value } : b,
                                      )
                                      updateAccount(selectedAccountData.id, "bankingInfo", updatedBanking)
                                    }}
                                    className={`rounded-[4px] border ${bankingInfoErrors[selectedAccountData.id]?.[banking.id]?.routingNumber ? "border-red-500" : "border-neutral-gray-300"} bg-white px-3 py-2 text-sm text-neutral-gray-800 placeholder:text-neutral-gray-400 shadow-sm focus:border-primary-blue-500 focus:ring-primary-blue-500`}
                                  />
                                  {bankingInfoErrors[selectedAccountData.id]?.[banking.id]?.routingNumber && (
                                    <p className="text-red-500 text-xs mt-1">
                                      {bankingInfoErrors[selectedAccountData.id][banking.id].routingNumber}
                                    </p>
                                  )}
                                </div>

                                <div className="space-y-2">
                                  <Label className="text-neutral-gray-700">Account Holder Name</Label>
                                  <Input
                                    value={banking.accountHolderName}
                                    onChange={(e) => {
                                      const updatedBanking = selectedAccountData.bankingInfo.map((b) =>
                                        b.id === banking.id ? { ...b, accountHolderName: e.target.value } : b,
                                      )
                                      updateAccount(selectedAccountData.id, "bankingInfo", updatedBanking)
                                    }}
                                    className={`rounded-[4px] border ${bankingInfoErrors[selectedAccountData.id]?.[banking.id]?.accountHolderName ? "border-red-500" : "border-neutral-gray-300"} bg-white px-3 py-2 text-sm text-neutral-gray-800 placeholder:text-neutral-gray-400 shadow-sm focus:border-primary-blue-500 focus:ring-primary-blue-500`}
                                  />
                                  {bankingInfoErrors[selectedAccountData.id]?.[banking.id]?.accountHolderName && (
                                    <p className="text-red-500 text-xs mt-1">
                                      {bankingInfoErrors[selectedAccountData.id][banking.id].accountHolderName}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label className="text-neutral-gray-700">Bank Account Type</Label>
                                <Select
                                  value={banking.bankAccountType}
                                  onValueChange={(value) => {
                                    const updatedBanking = selectedAccountData.bankingInfo.map((b) =>
                                      b.id === banking.id ? { ...b, bankAccountType: value } : b,
                                    )
                                    updateAccount(selectedAccountData.id, "bankingInfo", updatedBanking)
                                  }}
                                >
                                  <SelectTrigger
                                    className={`rounded-[4px] border ${bankingInfoErrors[selectedAccountData.id]?.[banking.id]?.bankAccountType ? "border-red-500" : "border-neutral-gray-300"} bg-white px-3 py-2 text-sm text-neutral-gray-800 shadow-sm focus:border-primary-blue-500 focus:ring-primary-blue-500`}
                                  >
                                    <SelectValue placeholder="Select account type" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white border-neutral-gray-200">
                                    <SelectItem value="checking">Checking</SelectItem>
                                    <SelectItem value="savings">Savings</SelectItem>
                                  </SelectContent>
                                </Select>
                                {bankingInfoErrors[selectedAccountData.id]?.[banking.id]?.bankAccountType && (
                                  <p className="text-red-500 text-xs mt-1">
                                    {bankingInfoErrors[selectedAccountData.id][banking.id].bankAccountType}
                                  </p>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      <div className="border-t border-neutral-gray-200 pt-4 mt-4"></div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-neutral-gray-800">Funding Information</h3>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addFundingInfo(selectedAccountData.id)}
                            className="rounded-[4px] bg-white border-neutral-gray-300 text-neutral-gray-700 hover:bg-neutral-gray-100"
                          >
                            Add Funding Info
                          </Button>
                        </div>

                        {selectedAccountData.fundingInfo.map((funding, index) => (
                          <Card key={funding.id} className="rounded-[4px] shadow-sm bg-neutral-gray-50">
                            <CardContent className="p-4 space-y-4">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium text-neutral-gray-800">
                                  Funding Entry #{index + 1}
                                </h4>
                                {selectedAccountData.fundingInfo.length > 1 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFundingInfo(selectedAccountData.id, funding.id)}
                                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                  >
                                    Remove
                                  </Button>
                                )}
                              </div>

                              <div className="space-y-2">
                                <Label className="text-neutral-gray-700">Funding Method</Label>
                                <Select
                                  value={funding.fundingMethod}
                                  onValueChange={(value) =>
                                    updateFundingInfo(selectedAccountData.id, funding.id, "fundingMethod", value)
                                  }
                                >
                                  <SelectTrigger
                                    className={`rounded-[4px] border ${fundingInfoErrors[selectedAccountData.id]?.[funding.id]?.fundingMethod ? "border-red-500" : "border-neutral-gray-300"} bg-white px-3 py-2 text-sm text-neutral-gray-800 shadow-sm focus:border-primary-blue-500 focus:ring-primary-blue-500`}
                                  >
                                    <SelectValue placeholder="Select funding method" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white border-neutral-gray-200">
                                    <SelectItem value="ach">ACH Transfer</SelectItem>
                                    <SelectItem value="wire">Wire Transfer</SelectItem>
                                    <SelectItem value="check">Check</SelectItem>
                                  </SelectContent>
                                </Select>
                                {fundingInfoErrors[selectedAccountData.id]?.[funding.id]?.fundingMethod && (
                                  <p className="text-red-500 text-xs mt-1">
                                    {fundingInfoErrors[selectedAccountData.id][funding.id].fundingMethod}
                                  </p>
                                )}
                              </div>

                              {funding.fundingMethod === "wire" && (
                                <div className="space-y-4 border-t border-neutral-gray-200 pt-4">
                                  <h5 className="text-sm font-medium text-neutral-gray-800">Wire Transfer Details</h5>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label className="text-neutral-gray-700">Bank Name</Label>
                                      <Input
                                        value={funding.wireTransferBankName || ""}
                                        onChange={(e) =>
                                          updateFundingInfo(
                                            selectedAccountData.id,
                                            funding.id,
                                            "wireTransferBankName",
                                            e.target.value,
                                          )
                                        }
                                        className={`rounded-[4px] border ${fundingInfoErrors[selectedAccountData.id]?.[funding.id]?.wireTransferBankName ? "border-red-500" : "border-neutral-gray-300"} bg-white px-3 py-2 text-sm text-neutral-gray-800 placeholder:text-neutral-gray-400 shadow-sm focus:border-primary-blue-500 focus:ring-primary-blue-500`}
                                      />
                                      {fundingInfoErrors[selectedAccountData.id]?.[funding.id]
                                        ?.wireTransferBankName && (
                                        <p className="text-red-500 text-xs mt-1">
                                          {fundingInfoErrors[selectedAccountData.id][funding.id].wireTransferBankName}
                                        </p>
                                      )}
                                    </div>

                                    <div className="space-y-2">
                                      <Label className="text-neutral-gray-700">Account Number</Label>
                                      <Input
                                        value={funding.wireTransferAccountNumber || ""}
                                        onChange={(e) =>
                                          updateFundingInfo(
                                            selectedAccountData.id,
                                            funding.id,
                                            "wireTransferAccountNumber",
                                            e.target.value,
                                          )
                                        }
                                        className={`rounded-[4px] border ${fundingInfoErrors[selectedAccountData.id]?.[funding.id]?.wireTransferAccountNumber ? "border-red-500" : "border-neutral-gray-300"} bg-white px-3 py-2 text-sm text-neutral-gray-800 placeholder:text-neutral-gray-400 shadow-sm focus:border-primary-blue-500 focus:ring-primary-blue-500`}
                                      />
                                      {fundingInfoErrors[selectedAccountData.id]?.[funding.id]
                                        ?.wireTransferAccountNumber && (
                                        <p className="text-red-500 text-xs mt-1">
                                          {
                                            fundingInfoErrors[selectedAccountData.id][funding.id]
                                              .wireTransferAccountNumber
                                          }
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label className="text-neutral-gray-700">Routing Number</Label>
                                      <Input
                                        value={funding.wireTransferRoutingNumber || ""}
                                        onChange={(e) =>
                                          updateFundingInfo(
                                            selectedAccountData.id,
                                            funding.id,
                                            "wireTransferRoutingNumber",
                                            e.target.value,
                                          )
                                        }
                                        className={`rounded-[4px] border ${fundingInfoErrors[selectedAccountData.id]?.[funding.id]?.wireTransferRoutingNumber ? "border-red-500" : "border-neutral-gray-300"} bg-white px-3 py-2 text-sm text-neutral-gray-800 placeholder:text-neutral-gray-400 shadow-sm focus:border-primary-blue-500 focus:ring-primary-blue-500`}
                                      />
                                      {fundingInfoErrors[selectedAccountData.id]?.[funding.id]
                                        ?.wireTransferRoutingNumber && (
                                        <p className="text-red-500 text-xs mt-1">
                                          {
                                            fundingInfoErrors[selectedAccountData.id][funding.id]
                                              .wireTransferRoutingNumber
                                          }
                                        </p>
                                      )}
                                    </div>

                                    <div className="space-y-2">
                                      <Label className="text-neutral-gray-700">SWIFT/BIC</Label>
                                      <Input
                                        value={funding.wireTransferSwiftBic || ""}
                                        onChange={(e) =>
                                          updateFundingInfo(
                                            selectedAccountData.id,
                                            funding.id,
                                            "wireTransferSwiftBic",
                                            e.target.value,
                                          )
                                        }
                                        className={`rounded-[4px] border ${fundingInfoErrors[selectedAccountData.id]?.[funding.id]?.wireTransferSwiftBic ? "border-red-500" : "border-neutral-gray-300"} bg-white px-3 py-2 text-sm text-neutral-gray-800 placeholder:text-neutral-gray-400 shadow-sm focus:border-primary-blue-500 focus:ring-primary-blue-500`}
                                      />
                                      {fundingInfoErrors[selectedAccountData.id]?.[funding.id]
                                        ?.wireTransferSwiftBic && (
                                        <p className="text-red-500 text-xs mt-1">
                                          {fundingInfoErrors[selectedAccountData.id][funding.id].wireTransferSwiftBic}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <Label className="text-neutral-gray-700">Bank Address</Label>
                                    <Textarea
                                      value={funding.wireTransferBankAddress || ""}
                                      onChange={(e) =>
                                        updateFundingInfo(
                                          selectedAccountData.id,
                                          funding.id,
                                          "wireTransferBankAddress",
                                          e.target.value,
                                        )
                                      }
                                      className={`rounded-[4px] border ${fundingInfoErrors[selectedAccountData.id]?.[funding.id]?.wireTransferBankAddress ? "border-red-500" : "border-neutral-gray-300"} bg-white px-3 py-2 text-sm text-neutral-gray-800 placeholder:text-neutral-gray-400 shadow-sm focus:border-primary-blue-500 focus:ring-primary-blue-500`}
                                      placeholder="Full bank address"
                                    />
                                    {fundingInfoErrors[selectedAccountData.id]?.[funding.id]
                                      ?.wireTransferBankAddress && (
                                      <p className="text-red-500 text-xs mt-1">
                                        {fundingInfoErrors[selectedAccountData.id][funding.id].wireTransferBankAddress}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            <div className="flex justify-between mt-4">
              <div className="flex space-x-2">
                {!isFirstItem() && (
                  <Button
                    variant="outline"
                    className="rounded-[4px] bg-white border-neutral-gray-300 text-neutral-gray-700 hover:bg-neutral-gray-100 shadow-sm"
                    onClick={handlePrevious}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>
                )}
              </div>
              <div className="flex space-x-2">
                {!isLastItem() && (
                  <Button
                    variant="default"
                    className="rounded-[4px] bg-primary-blue-500 hover:bg-primary-blue-600 text-white shadow-md"
                    onClick={handleNext}
                  >
                    {showSummary ? "Proceed to Signature" : "Next"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
                {isLastItem() && (
                  <Button
                    variant="default"
                    className="rounded-[4px] bg-primary-blue-500 hover:bg-primary-blue-600 text-white shadow-md"
                    onClick={() => {
                      console.log("Proceeding to Signature")
                    }}
                  >
                    Proceed to Signature
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const getSubtypeOptions = (type: string) => {
  switch (type) {
    case "investment":
      return [
        { value: "brokerage", label: "Brokerage Account" },
        { value: "managed", label: "Managed Account" },
      ]
    case "retirement":
      return [
        { value: "roth-ira", label: "Roth IRA" },
        { value: "traditional-ira", label: "Traditional IRA" },
        { value: "401k", label: "401(k)" },
      ]
    case "joint":
      return [
        { value: "joint-brokerage", label: "Joint Brokerage Account" },
        { value: "joint-savings", label: "Joint Savings Account" },
      ]
    default:
      return []
  }
}
