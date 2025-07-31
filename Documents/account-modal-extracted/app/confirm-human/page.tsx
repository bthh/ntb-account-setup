"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRight } from "lucide-react"

export default function ConfirmHumanPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4 font-sans antialiased">
      <div className="text-center max-w-md space-y-6">
        <h1 className="text-4xl font-semibold text-brand-orange-700">Let's confirm you are human</h1>
        <p className="text-neutral-gray-600 text-base leading-relaxed">
          Complete the security check before continuing. This step verifies that you are not a bot, which helps to
          protect your account and prevent spam.
        </p>
        <Button className="bg-brand-orange-500 hover:bg-brand-orange-600 text-white px-8 py-3 rounded-md font-medium text-lg shadow-md">
          Begin <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
        <div className="pt-8">
          <Select defaultValue="english">
            <SelectTrigger className="w-[180px] rounded-md border-neutral-gray-300 text-neutral-gray-700 focus:border-primary-blue-500 focus:ring-primary-blue-500">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent className="bg-white border-neutral-gray-200">
              <SelectItem value="english">English</SelectItem>
              <SelectItem value="spanish">Spanish</SelectItem>
              <SelectItem value="french">French</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
