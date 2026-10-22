import fs from "fs"
import path from "path"

const CERTIFICATES_DIR = path.join(process.cwd(), "data", "certificates")
const CERTIFICATE_ID_PATTERN = /^NPTEL[0-9A-Z]{5,30}$/i

export interface CertificateInfo {
  id: string
  filePath: string
  size: number
  mtime: Date
}

/**
 * Validates the syntax of a Certificate ID.
 * NPTEL certificate IDs generally start with 'NPTEL' followed by alphanumeric characters.
 */
export function isValidCertificateId(id: string): boolean {
  if (!id || typeof id !== "string") {
    return false
  }
  return CERTIFICATE_ID_PATTERN.test(id.trim())
}

/**
 * Safely resolves the file path for a given certificate ID.
 * Ensures the resolved path stays inside CERTIFICATES_DIR to prevent path traversal attacks.
 */
export function getCertificateInfo(id: string): CertificateInfo | null {
  if (!isValidCertificateId(id)) {
    return null
  }

  const sanitizedId = id.trim()
  const fileName = `${sanitizedId}.pdf`
  let resolvedPath = path.resolve(CERTIFICATES_DIR, fileName)

  // Ensure resolved path is strictly within CERTIFICATES_DIR
  const normalizedCertDir = path.normalize(CERTIFICATES_DIR) + path.sep
  if (!resolvedPath.startsWith(normalizedCertDir) && resolvedPath !== CERTIFICATES_DIR) {
    return null
  }

  try {
    if (!fs.existsSync(resolvedPath)) {
      // Case-insensitive fallback for Linux/Vercel serverless environment
      if (fs.existsSync(CERTIFICATES_DIR)) {
        const files = fs.readdirSync(CERTIFICATES_DIR)
        const match = files.find(
          (f) => f.toLowerCase() === fileName.toLowerCase()
        )
        if (match) {
          resolvedPath = path.resolve(CERTIFICATES_DIR, match)
        } else {
          return null
        }
      } else {
        return null
      }
    }

    const stats = fs.statSync(resolvedPath)
    if (!stats.isFile()) {
      return null
    }

    return {
      id: sanitizedId,
      filePath: resolvedPath,
      size: stats.size,
      mtime: stats.mtime,
    }
  } catch (error) {
    console.error(`Error resolving certificate for ID ${sanitizedId}:`, error)
    return null
  }
}
