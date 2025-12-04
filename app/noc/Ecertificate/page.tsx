"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense, useEffect } from "react"

const ALLOWED_CERT_ID = "NPTEL24HS159S95080071904328829"

function CertificateButton() {
  const searchParams = useSearchParams()
  const certificateId = searchParams.get("q")?.trim() || ""

  useEffect(() => {
    if (certificateId && certificateId !== ALLOWED_CERT_ID) {
      window.location.href = "https://archive.nptel.ac.in"
    }
  }, [certificateId])

  const certificateUrl = `/content/noc/NOC24/SEM2/Ecertificates/109/noc24-hs159/Course/${encodeURIComponent(
    certificateId,
  )}.pdf`

  return (
    <main className="min-h-screen flex items-center justify-center bg-white">
      <div>
        <Link
          href={certificateUrl}
          prefetch={false}
          target="_blank"
          className="inline-block px-6 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
        >
          Course Certificate
        </Link>
      </div>
    </main>
  )
}

export default function EcertificatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-pulse">Loading certificate...</div>
      </div>
    }>
      <CertificateButton />
    </Suspense>
  )
}
