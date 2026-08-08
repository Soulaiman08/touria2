import { prisma } from '@/lib/prisma'

export async function getSiteSettings() {
    const rows = await prisma.siteSetting.findMany()

    const settings: Record<string, string> = {}

    rows.forEach((row) => {
        settings[row.key] = row.value
    })

    return settings
}