"use client"

import type React from "react"

import { useSearchParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"

export function CertificateViewer() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [certificateId, setCertificateId] = useState("")
  const [displayId, setDisplayId] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const qParam = searchParams.get("q")
    if (qParam) {
      setCertificateId(qParam)
      setDisplayId(qParam)
    }
  }, [searchParams])

  const handleViewCertificate = () => {
    if (!certificateId.trim()) {
      return
    }
    setIsLoading(true)
    setDisplayId(certificateId)
    router.push(`?q=${encodeURIComponent(certificateId)}`)
    // Reset loading after URL change
    setTimeout(() => setIsLoading(false), 500)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleViewCertificate()
    }
  }

  const iframeUrl = displayId ? `https://archive.nptel.ac.in/noc/Ecertificate/?q=${encodeURIComponent(displayId)}` : ""

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-2 text-balance">NPTEL Certificate Verification</h1>
        <p className="text-slate-600 text-lg">Enter your certificate ID to view and verify your certificate</p>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-slate-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            type="text"
            placeholder="Enter certificate ID"
            value={certificateId}
            onChange={(e) => setCertificateId(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="flex-1 h-12 text-base placeholder:text-slate-400"
          />
          <Button
            onClick={handleViewCertificate}
            disabled={!certificateId.trim() || isLoading}
            className="h-12 px-8 whitespace-nowrap bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading
              </>
            ) : (
              "View Certificate"
            )}
          </Button>
        </div>
      </div>

      {/* Certificate Display Section */}
      {displayId && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center h-96 bg-gradient-to-br from-slate-50 to-slate-100">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
                <p className="text-slate-600 font-medium">Loading certificate...</p>
              </div>
            </div>
          )}

          {/* Certificate iframe */}
          <iframe
            key={displayId}
            src={iframeUrl}
            title="NPTEL Certificate"
            className="w-full rounded-xl"
            style={{ height: "800px", border: "none" }}
            onLoad={() => setIsLoading(false)}
            loading="lazy"
          />
        </div>
      )}

      {/* Empty State Message */}
      {!displayId && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
            <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-slate-600 text-lg">Enter a certificate ID above to view your NPTEL certificate</p>
        </div>
      )}
    </div>
  )
}
