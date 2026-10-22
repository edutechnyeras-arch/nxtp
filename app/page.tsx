import { Suspense } from "react"
import { CertificateViewer } from "@/components/certificate-viewer"

export const metadata = {
  title: "NPTEL Certificate Verification",
  description: "Verify and view your NPTEL certificate",
}

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 py-10">
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-pulse text-slate-500">Loading certificate viewer...</div>
          </div>
        }
      >
        <CertificateViewer />
      </Suspense>
    </main>
  )
}
