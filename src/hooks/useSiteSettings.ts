'use client'

import { useEffect, useState } from 'react'

type SiteSettings = Record<string, string>

export function useSiteSettings() {
    const [settings, setSettings] = useState<SiteSettings | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/settings')
            .then((res) => res.json())
            .then((data) => {
                setSettings(data.settings)
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    return { settings, loading }
}
