'use client'

import { useEffect, useState } from 'react'

export type SiteSettings = Record<string, string>

let cachedSettings: SiteSettings | null = null
let cachedAt = 0
let inflightRequest: Promise<SiteSettings | null> | null = null
const CACHE_TTL_MS = 60_000

async function loadPublicSettings(): Promise<SiteSettings | null> {
  const now = Date.now()
  if (cachedSettings && now - cachedAt < CACHE_TTL_MS) {
    return cachedSettings
  }

  if (inflightRequest) {
    return inflightRequest
  }

  inflightRequest = fetch('/api/settings')
    .then(async (res) => {
      if (!res.ok) {
        throw new Error(`Settings fetch failed with status ${res.status}`)
      }
      const data = (await res.json()) as { settings?: SiteSettings }
      if (data?.settings && typeof data.settings === 'object') {
        cachedSettings = data.settings
        cachedAt = Date.now()
        return data.settings
      }
      return null
    })
    .catch(() => cachedSettings)
    .finally(() => {
      inflightRequest = null
    })

  return inflightRequest
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(() => cachedSettings)
  const [loading, setLoading] = useState<boolean>(() => cachedSettings === null)

  useEffect(() => {
    let active = true
    loadPublicSettings().then((result) => {
      if (!active) return
      if (result) {
        setSettings(result)
      }
      setLoading(false)
    })

    return () => {
      active = false
    }
  }, [])

  return { settings, loading }
}
