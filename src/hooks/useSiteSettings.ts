'use client'

import { useEffect, useState } from 'react'

export function useSiteSettings() {
    const [settings, setSettings] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/admin/settings')
            .then((res) => res.json())
            .then((data) => {
                setSettings(data.settings)
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    return { settings, loading }
}