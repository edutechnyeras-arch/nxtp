import { NextRequest, NextResponse } from "next/server"
import { Readable } from "stream"
import fs from "fs"
import { getCertificateInfo, isValidCertificateId } from "@/lib/certificates"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"

export const dynamic = "force-dynamic"

function getNotFoundResponse() {
  return new Response("Certificate Not Found", {
    status: 404,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  })
}

function getRateLimitedResponse(reset: number, limit: number, remaining: number) {
  return new Response("Too Many Requests", {
    status: 429,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Retry-After": String(reset),
      "X-RateLimit-Limit": String(limit),
      "X-RateLimit-Remaining": String(remaining),
      "X-RateLimit-Reset": String(reset),
    },
  })
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const ip = getClientIp(request)
  const rateLimitResult = checkRateLimit(ip, 60, 60 * 1000)

  if (!rateLimitResult.success) {
    return getRateLimitedResponse(
      rateLimitResult.reset,
      rateLimitResult.limit,
      rateLimitResult.remaining
    )
  }

  const { id } = await context.params

  if (!id || !isValidCertificateId(id)) {
    return getNotFoundResponse()
  }

  const certInfo = getCertificateInfo(id)
  if (!certInfo) {
    return getNotFoundResponse()
  }

  const fileSize = certInfo.size
  const rangeHeader = request.headers.get("range")

  // Handle HTTP Range Requests
  if (rangeHeader) {
    const match = rangeHeader.match(/^bytes=(\d*)-(\d*)$/)
    if (match) {
      const rawStart = match[1]
      const rawEnd = match[2]

      let start = rawStart ? parseInt(rawStart, 10) : 0
      let end = rawEnd ? parseInt(rawEnd, 10) : fileSize - 1

      // Invalid range requested
      if (isNaN(start) || start >= fileSize || (rawStart && rawEnd && start > end)) {
        return new Response(null, {
          status: 416,
          headers: {
            "Content-Range": `bytes */${fileSize}`,
          },
        })
      }

      if (end >= fileSize) {
        end = fileSize - 1
      }

      const chunkSize = end - start + 1
      const nodeStream = fs.createReadStream(certInfo.filePath, { start, end })
      const webStream = Readable.toWeb(nodeStream) as unknown as BodyInit

      return new Response(webStream, {
        status: 206,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="${certInfo.id}.pdf"`,
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": String(chunkSize),
          "Cache-Control": "private, max-age=3600",
          "X-RateLimit-Limit": String(rateLimitResult.limit),
          "X-RateLimit-Remaining": String(rateLimitResult.remaining),
        },
      })
    }
  }

  // Handle full file streaming (200 OK)
  const nodeStream = fs.createReadStream(certInfo.filePath)
  const webStream = Readable.toWeb(nodeStream) as unknown as BodyInit

  return new Response(webStream, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${certInfo.id}.pdf"`,
      "Accept-Ranges": "bytes",
      "Content-Length": String(fileSize),
      "Cache-Control": "private, max-age=3600",
      "X-RateLimit-Limit": String(rateLimitResult.limit),
      "X-RateLimit-Remaining": String(rateLimitResult.remaining),
    },
  })
}

export async function HEAD(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const ip = getClientIp(request)
  const rateLimitResult = checkRateLimit(ip, 60, 60 * 1000)

  if (!rateLimitResult.success) {
    return getRateLimitedResponse(
      rateLimitResult.reset,
      rateLimitResult.limit,
      rateLimitResult.remaining
    )
  }

  const { id } = await context.params

  if (!id || !isValidCertificateId(id)) {
    return getNotFoundResponse()
  }

  const certInfo = getCertificateInfo(id)
  if (!certInfo) {
    return getNotFoundResponse()
  }

  return new Response(null, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${certInfo.id}.pdf"`,
      "Accept-Ranges": "bytes",
      "Content-Length": String(certInfo.size),
      "Cache-Control": "private, max-age=3600",
      "X-RateLimit-Limit": String(rateLimitResult.limit),
      "X-RateLimit-Remaining": String(rateLimitResult.remaining),
    },
  })
}
