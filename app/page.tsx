import { redirect } from "next/navigation"

export const metadata = {
  title: "NPTEL Certificate Verification",
  description: "Verify and view your NPTEL certificate",
}

export default function Home() {
  redirect("https://archive.nptel.ac.in")
}
