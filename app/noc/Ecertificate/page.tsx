"use client"

import { useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"

function CertificateViewer() {
  const searchParams = useSearchParams()
  const certificateId = searchParams.get("q")?.trim() || ""
  const [isValidId, setIsValidId] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkCertificate = async () => {
      if (!certificateId) {
        setIsValidId(false)
        setIsLoading(false)
        return
      }

      try {
        // Issue a lightweight HEAD request to verify certificate existence without transferring body bytes
        const response = await fetch(
          `/noc/Ecertificate/document/${encodeURIComponent(certificateId)}`,
          { method: "HEAD" }
        )
        if (response.ok) {
          setIsValidId(true)
        } else {
          setIsValidId(false)
        }
      } catch (err) {
        console.error("Error checking certificate:", err)
        setIsValidId(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkCertificate()
  }, [certificateId])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-pulse">Loading certificate...</div>
      </div>
    )
  }

  if (!isValidId && !isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <p
          style={{
            fontFamily: '"Times New Roman", Times, serif',
            fontSize: "16px",
            color: "black",
            textAlign: "center",
            margin: 0,
            padding: "20px 0",
            fontWeight: "normal",
            letterSpacing: "0.3px",
            lineHeight: "1.4",
          }}
        >
          SORRY YOU DON'T HAVE A CERTIFICATE!.PLEASE CONTACT SUPPORT@NPTEL.IITM.AC.IN
        </p>
      </div>
    )
  }

  const documentUrl = `/noc/Ecertificate/document/${encodeURIComponent(certificateId)}`

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <a
        href={documentUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="px-8 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
      >
        Course Certificate
      </a>
    </div>
  )
}

export default function EcertificatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="animate-pulse">Loading certificate...</div>
        </div>
      }
    >
      <CertificateViewer />
    </Suspense>
  )
}
