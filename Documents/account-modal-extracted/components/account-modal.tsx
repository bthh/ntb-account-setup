"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Users, Shield, Zap, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

export default function AccountModal() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleLegacyChoice = () => {
    console.log("User selected legacy account opening")
    // Add your legacy account opening logic here
    setOpen(false)
  }

  const handleBetaChoice = () => {
    console.log("User selected beta account opening")
    // Navigate to Account Setup page
    router.push("/account-setup")
    setOpen(false)
  }

  const openModal = () => {
    setOpen(true)
  }

  // Expose the openModal function globally
  useEffect(() => {
    const trigger = document.querySelector("[data-account-modal-trigger]")
    if (trigger) {
      trigger.addEventListener("click", openModal)
      return () => trigger.removeEventListener("click", openModal)
    }
  }, [])

  return (
    <>
      <Button onClick={openModal}>Open Account Modal</Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md antialiased shadow-lg bg-white p-6 rounded-lg">
          <DialogHeader className="text-center space-y-3">
            <DialogTitle className="text-2xl font-semibold antialiased text-neutral-gray-900">
              Choose Your Account Opening Experience
            </DialogTitle>
            <DialogDescription className="text-base text-neutral-gray-600">
              Select how you'd like to open your new account. You can use our trusted legacy process or try our new
              streamlined beta experience.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-6">
            {/* Legacy Option */}
            <div className="border border-neutral-gray-200 rounded-lg p-4 hover:bg-neutral-gray-50 transition-colors shadow-sm">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <Shield className="h-5 w-5 text-primary-blue-600" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium antialiased text-neutral-gray-800">Legacy Interface</h3>
                    <Badge variant="secondary" className="text-xs bg-neutral-gray-100 text-neutral-gray-700">
                      Trusted
                    </Badge>
                  </div>
                  <p className="text-sm text-neutral-gray-600">
                    Use our established account opening process with familiar steps and comprehensive verification.
                  </p>
                  <Button
                    onClick={handleLegacyChoice}
                    variant="outline"
                    className="w-full mt-3 bg-white border-neutral-gray-300 text-neutral-gray-700 hover:bg-neutral-gray-100 rounded-[4px]"
                  >
                    Continue with Legacy
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Beta Option */}
            <div className="border border-neutral-gray-200 rounded-lg p-4 hover:bg-neutral-gray-50 transition-colors shadow-sm">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <Zap className="h-5 w-5 text-primary-blue-600" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium antialiased text-neutral-gray-800">Beta Experience</h3>
                    <Badge className="text-xs bg-primary-blue-100 text-primary-blue-800 hover:bg-primary-blue-100">
                      New
                    </Badge>
                  </div>
                  <p className="text-sm text-neutral-gray-600">
                    Try our new streamlined process with enhanced user experience and faster completion times.
                  </p>
                  <Button
                    onClick={handleBetaChoice}
                    className="w-full mt-3 bg-primary-blue-500 hover:bg-primary-blue-600 text-white font-medium uppercase tracking-wide rounded-[4px] shadow-md"
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Try Beta Experience
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
