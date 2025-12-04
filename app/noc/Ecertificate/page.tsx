"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"

// Base path where certificates are stored
const CERTIFICATE_BASE_PATH = "/content/noc/NOC24/SEM2/Ecertificates/109/noc24-hs159/Course"

function CertificateViewer() {
  const searchParams = useSearchParams()
  const certificateId = searchParams.get("q")?.trim() || ""
  const [isValidId, setIsValidId] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkCertificate = async () => {
      if (!certificateId) {
        setIsValidId(false)
        setIsLoading(false)
        return
      }

      try {
        // Try to fetch the certificate to check if it exists
        const response = await fetch(`${CERTIFICATE_BASE_PATH}/${encodeURIComponent(certificateId)}.pdf`)
        if (response.ok) {
          setIsValidId(true)
          setError(null)
        } else if (response.status === 404) {
          setIsValidId(false)
          setError('CERTIFICATE_NOT_FOUND')
        } else {
          setIsValidId(false)
          setError('ERROR_FETCHING')
        }
      } catch (err) {
        console.error('Error checking certificate:', err)
        setIsValidId(false)
        setError('ERROR_FETCHING')
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
            fontSize: '16px',
            color: 'black',
            textAlign: 'center',
            margin: 0,
            padding: '20px 0',
            fontWeight: 'normal',
            letterSpacing: '0.3px',
            lineHeight: '1.4'
          }}
        >
          SORRY YOU DON'T HAVE A CERTIFICATE!.PLEASE CONTACT SUPPORT@NPTEL.IITM.AC.IN
        </p>
      </div>
    )
  }

  const certificateUrl = `${CERTIFICATE_BASE_PATH}/${encodeURIComponent(certificateId)}.pdf`

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <a
        href={certificateUrl}
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
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-pulse">Loading certificate...</div>
      </div>
    }>
      <CertificateViewer />
    </Suspense>
  )
}
