"use client"

import type React from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, ExternalLink, Search } from "lucide-react"

export function CertificateViewer() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [certificateId, setCertificateId] = useState("")
  const [displayId, setDisplayId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [certExists, setCertExists] = useState<boolean | null>(null)

  useEffect(() => {
    const qParam = searchParams.get("q")?.trim()
    if (qParam) {
      setCertificateId(qParam)
      setDisplayId(qParam)
      verifyCertificate(qParam)
    }
  }, [searchParams])

  const verifyCertificate = async (id: string) => {
    if (!id.trim()) {
      setCertExists(null)
      return
    }
    setIsLoading(true)
    try {
      const response = await fetch(
        `/noc/Ecertificate/document/${encodeURIComponent(id.trim())}`,
        { method: "HEAD" }
      )
      setCertExists(response.ok)
    } catch {
      setCertExists(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewCertificate = async () => {
    const trimmed = certificateId.trim()
    if (!trimmed) return
    setDisplayId(trimmed)
    router.push(`?q=${encodeURIComponent(trimmed)}`)
    await verifyCertificate(trimmed)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleViewCertificate()
    }
  }

  const documentUrl = displayId
    ? `/noc/Ecertificate/document/${encodeURIComponent(displayId)}`
    : ""

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          NPTEL Certificate Verification
        </h1>
        <p className="text-slate-600">
          Enter your certificate ID to view and verify your course certificate
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-slate-200">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            type="text"
            placeholder="Enter certificate ID (e.g. NPTEL25CS142S959301976)"
            value={certificateId}
            onChange={(e) => setCertificateId(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="flex-1 h-12 text-base placeholder:text-slate-400"
          />
          <Button
            onClick={handleViewCertificate}
            disabled={!certificateId.trim() || isLoading}
            className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Checking...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>View Certificate</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">Verifying certificate...</p>
        </div>
      )}

      {/* Certificate Not Found State */}
      {!isLoading && displayId && certExists === false && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <p
            style={{
              fontFamily: '"Times New Roman", Times, serif',
              fontSize: "16px",
              color: "black",
              textAlign: "center",
              margin: 0,
              padding: "10px 0",
              fontWeight: "normal",
              letterSpacing: "0.3px",
              lineHeight: "1.4",
            }}
          >
            SORRY YOU DON&apos;T HAVE A CERTIFICATE!.PLEASE CONTACT SUPPORT@NPTEL.IITM.AC.IN
          </p>
        </div>
      )}

      {/* Certificate Found Display Section */}
      {!isLoading && displayId && certExists === true && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Verified Certificate
              </span>
              <p className="font-mono text-sm font-medium text-slate-900">
                {displayId}
              </p>
            </div>
            <a
              href={documentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span>Open in New Tab</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <iframe
              key={displayId}
              src={documentUrl}
              title={`Certificate ${displayId}`}
              className="w-full"
              style={{ height: "800px", border: "none" }}
            />
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !displayId && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          Enter a certificate ID above to verify and view the official course certificate.
        </div>
      )}
    </div>
  )
}
