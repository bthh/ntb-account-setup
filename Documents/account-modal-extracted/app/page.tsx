"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bell, Search, Check, FileText, Users, Download, Mail } from "lucide-react"
import AccountModal from "@/components/account-modal"
import { Sidebar } from "@/components/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PortfolioData {
  totalValue: number
  dayChange: number
  dayChangePercent: number
  totalGainLoss: number
  totalGainLossPercent: number
}

interface Holding {
  id: string
  symbol: string
  name: string
  shares: number
  currentPrice: number
  totalValue: number
  dayChange: number
  dayChangePercent: number
  allocation: number
}

interface Transaction {
  id: string
  type: "buy" | "sell" | "dividend"
  symbol: string
  shares?: number
  price?: number
  amount: number
  date: string
  status: "completed" | "pending" | "failed"
}

interface Account {
  id: string
  name: string
  type: string
  balance: number
  performance: number
  status: "active" | "pending" | "closed"
}

const WizardProgress = () => {
  const steps = [
    { id: 1, title: "Account Info", completed: true, active: false },
    { id: 2, title: "Investor Goals", completed: true, active: false },
    { id: 3, title: "Personal Finances", completed: true, active: false },
    { id: 4, title: "Questionnaires", completed: true, active: false },
    { id: 5, title: "Proposed Accounts", completed: true, active: false },
    { id: 6, title: "Proposal", completed: false, active: true },
  ]

  return (
    <div className="w-full bg-white border-b border-neutral-gray-200 py-8">
      <div className="w-full px-8 sm:px-12 lg:px-16">
        <div className="relative">
          {/* Background connecting line */}
          <div className="absolute top-6 left-6 right-6 h-0.5 bg-neutral-gray-300" style={{ zIndex: 1 }}></div>

          {/* All steps distributed evenly */}
          <div className="flex items-start justify-between relative" style={{ zIndex: 2 }}>
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center relative">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                    step.completed || step.active
                      ? "bg-primary-blue-500 border-primary-blue-500"
                      : "bg-white border-neutral-gray-300"
                  }`}
                >
                  {step.completed ? (
                    <Check className="w-6 h-6 text-white" />
                  ) : step.active ? (
                    <span className="text-sm font-bold text-white">{step.id}</span>
                  ) : (
                    <span className="text-sm font-bold text-neutral-gray-400">{step.id}</span>
                  )}
                </div>
                <div className="mt-3 text-center min-w-[140px]">
                  <p
                    className={`text-sm font-medium leading-tight whitespace-nowrap ${
                      step.completed || step.active ? "text-primary-blue-600" : "text-neutral-gray-500"
                    }`}
                  >
                    {step.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [balanceVisible, setBalanceVisible] = useState(true)
  const [selectedTimeframe, setSelectedTimeframe] = useState("1M")

  // Mock data
  const portfolioData: PortfolioData = {
    totalValue: 127543.89,
    dayChange: 2847.32,
    dayChangePercent: 2.28,
    totalGainLoss: 15234.67,
    totalGainLossPercent: 13.58,
  }

  const holdings: Holding[] = [
    {
      id: "1",
      symbol: "AAPL",
      name: "Apple Inc.",
      shares: 50,
      currentPrice: 178.25,
      totalValue: 8912.5,
      dayChange: 125.5,
      dayChangePercent: 1.43,
      allocation: 7.0,
    },
    {
      id: "2",
      symbol: "MSFT",
      name: "Microsoft Corporation",
      shares: 25,
      currentPrice: 338.11,
      totalValue: 8452.75,
      dayChange: -89.25,
      dayChangePercent: -1.04,
      allocation: 6.6,
    },
    {
      id: "3",
      symbol: "GOOGL",
      name: "Alphabet Inc.",
      shares: 30,
      currentPrice: 125.68,
      totalValue: 3770.4,
      dayChange: 45.6,
      dayChangePercent: 1.22,
      allocation: 3.0,
    },
    {
      id: "4",
      symbol: "TSLA",
      name: "Tesla Inc.",
      shares: 15,
      currentPrice: 248.5,
      totalValue: 3727.5,
      dayChange: -156.75,
      dayChangePercent: -4.03,
      allocation: 2.9,
    },
  ]

  const recentTransactions: Transaction[] = [
    {
      id: "1",
      type: "buy",
      symbol: "AAPL",
      shares: 10,
      price: 178.25,
      amount: 1782.5,
      date: "2024-01-15",
      status: "completed",
    },
    {
      id: "2",
      type: "sell",
      symbol: "MSFT",
      shares: 5,
      price: 338.11,
      amount: 1690.55,
      date: "2024-01-14",
      status: "completed",
    },
    {
      id: "3",
      type: "dividend",
      symbol: "AAPL",
      amount: 24.5,
      date: "2024-01-12",
      status: "completed",
    },
    {
      id: "4",
      type: "buy",
      symbol: "GOOGL",
      shares: 8,
      price: 125.68,
      amount: 1005.44,
      date: "2024-01-10",
      status: "pending",
    },
  ]

  const accounts: Account[] = [
    {
      id: "1",
      name: "Individual Brokerage",
      type: "Taxable",
      balance: 87543.21,
      performance: 12.4,
      status: "active",
    },
    {
      id: "2",
      name: "Roth IRA",
      type: "Retirement",
      balance: 25678.9,
      performance: 15.2,
      status: "active",
    },
    {
      id: "3",
      name: "Traditional 401(k)",
      type: "Retirement",
      balance: 14321.78,
      performance: 8.9,
      status: "active",
    },
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? "+" : ""}${percent.toFixed(2)}%`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-success-green-600 bg-success-green-50"
      case "pending":
        return "text-warning-yellow-600 bg-warning-yellow-50"
      case "failed":
        return "text-error-red-600 bg-error-red-50"
      default:
        return "text-neutral-gray-600 bg-neutral-gray-50"
    }
  }

  return (
    <div className={`flex h-screen bg-neutral-gray-50 ${sidebarCollapsed ? "ml-16" : "ml-64"}`}>
      {/* Sidebar is now fixed positioned */}
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <div
          className="sticky top-0 z-20 bg-white border-b border-neutral-gray-200 h-16 flex items-center"
          style={{ height: "64px" }}
        >
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

        {/* Main Content */}
        <div className="flex-1 bg-neutral-gray-50">
          {/* Wizard Progress - Full Width Below Header */}
          <WizardProgress />

          {/* Content Area - Step 6 Proposal Output */}
          <div className="flex-1 p-8">
            <div className="w-full">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-neutral-gray-600" />
                  <h1 className="text-xl font-semibold text-neutral-gray-900">Build Your Proposal Output:</h1>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    className="border-neutral-gray-300 text-neutral-gray-700 hover:bg-neutral-gray-50 px-4 py-2 rounded-md font-medium bg-transparent"
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Email to Client
                  </Button>
                  <Button
                    variant="outline"
                    className="border-neutral-gray-300 text-neutral-gray-700 hover:bg-neutral-gray-50 px-4 py-2 rounded-md font-medium bg-transparent"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Now
                  </Button>
                  <Button
                    className="bg-primary-blue-500 hover:bg-primary-blue-600 text-white px-4 py-2 rounded-md font-medium shadow-md"
                    onClick={() => {
                      // This will trigger the AccountModal
                      document.querySelector("[data-account-modal-trigger]")?.click()
                    }}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Save and Open Account(s)
                  </Button>
                </div>
              </div>

              {/* Template Selection */}
              <div className="mb-6">
                <div className="mb-2">
                  <span className="text-sm font-medium text-neutral-gray-700">1. Select a template:</span>
                </div>
                <Select defaultValue="new">
                  <SelectTrigger className="w-96 bg-white border-neutral-gray-300">
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New...</SelectItem>
                    <SelectItem value="template1">Template 1</SelectItem>
                    <SelectItem value="template2">Template 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Pages Selection */}
              <div className="mb-4">
                <span className="text-sm font-medium text-neutral-gray-700">
                  2. Select pages to include into output:
                </span>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Left Panel - Available Pages */}
                <div className="xl:col-span-2">
                  <Card className="rounded-md shadow-sm bg-white">
                    <CardContent className="p-0">
                      {/* Header */}
                      <div className="flex items-center justify-between p-4 border-b border-neutral-gray-200 bg-neutral-gray-50">
                        <div className="flex space-x-8">
                          <span className="text-sm font-medium text-neutral-gray-700">Name</span>
                          <span className="text-sm font-medium text-neutral-gray-700">Description</span>
                        </div>
                        <Button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm font-medium">
                          <Check className="mr-1 h-3 w-3" />
                          Select All
                        </Button>
                      </div>

                      {/* Available Items */}
                      <div className="divide-y divide-neutral-gray-200">
                        {[
                          {
                            name: "Copy of About Your Team - RB3",
                            description:
                              "Breakdown of the partners involved in the account (advisor, strategists, custodian)",
                          },
                          {
                            name: "Account Comparison: Equity Sector Analysis - RB3",
                            description: "",
                          },
                          {
                            name: "OAT - Fee Summary",
                            description: "Summary of fees for the proposed investment portfolio",
                          },
                          {
                            name: "Account Comparison: Stress Test Scenarios - RB3",
                            description: "Shows the various stress test scenarios.",
                          },
                          {
                            name: "NICCI Historical Returns - Holdings",
                            description: "Expense Analysis for proposed and existing tickers.",
                          },
                          {
                            name: "Blended Platform Performance Fact Sheet - General",
                            description:
                              "Blended, accumulative performance for each of the models included in the portfolio",
                          },
                        ].map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-4 hover:bg-neutral-gray-50">
                            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4">
                              <div className="text-sm text-neutral-gray-900">{item.name}</div>
                              <div className="text-sm text-neutral-gray-600">{item.description}</div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="ml-4 w-8 h-8 p-0 border-neutral-gray-300 hover:bg-neutral-gray-100 bg-transparent"
                            >
                              <span className="text-lg font-light">+</span>
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Panel - Proposal Output */}
                <div className="xl:col-span-1">
                  <Card className="rounded-md shadow-sm bg-white">
                    <CardHeader className="pb-3 bg-neutral-gray-50 border-b border-neutral-gray-200">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-neutral-gray-700">Proposal Output</CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs px-2 py-1 border-neutral-gray-300 hover:bg-neutral-gray-100 bg-transparent"
                        >
                          Save as Template
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      {[
                        {
                          title: "Risk Assessment",
                          description: "Depiction of where your client falls on the risk spectrum",
                          collapsed: true,
                        },
                        {
                          title: "Strategy Fact Sheet",
                          description: "Strategist-provided model fact sheets",
                          collapsed: true,
                        },
                        {
                          title: "About Your Team",
                          description:
                            "Breakdown of the partners involved in the account (advisor, strategists, custodian)",
                          collapsed: true,
                        },
                        {
                          title: "Fee Summary",
                          description: "Summary of fees for the proposed investment portfolio",
                          collapsed: true,
                        },
                      ].map((item, index) => (
                        <div key={index} className="border border-neutral-gray-200 rounded-md p-3 bg-neutral-gray-50">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-neutral-gray-900">#{item.title}</span>
                                <Button variant="ghost" size="sm" className="w-4 h-4 p-0 hover:bg-neutral-gray-200">
                                  <span className="text-xs">{item.collapsed ? "−" : "+"}</span>
                                </Button>
                              </div>
                              <p className="text-xs text-neutral-gray-600 mt-1">{item.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-8 text-center">
                <div data-account-modal-trigger>
                  <AccountModal />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
