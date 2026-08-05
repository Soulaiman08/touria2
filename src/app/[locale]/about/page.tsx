import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import { siteConfig } from '@/config/site'

interface AboutPageProps {
  params: Promise<{ locale: string }>
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'about' })

  const isRTL = locale === 'ar'

  return (
    <div className="container-brand py-12 space-y-16" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* ── Intro Section ────────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-6">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[rgba(196,98,45,0.08)] text-[#C4622D]">
            {locale === 'ar' ? 'من نحن' : 'Qui sommes-nous'}
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-[#3D1F0A] dark:text-[#F2E4CE]">
            {t('title')}
          </h1>
          <p className="text-sm sm:text-base leading-relaxed text-[#7a6034] dark:text-[#c4a47a]">
            {t('story')}
          </p>
        </div>

        {/* Brand visual banner */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full border-4 border-[#b8965a] p-4 bg-white dark:bg-[#2a1508] shadow-2xl">
            <div className="relative w-full h-full rounded-full overflow-hidden">
              <Image
                src="/images/brand/logo-full.png"
                alt={siteConfig.name}
                fill
                className="object-cover scale-110"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Mission & Vision Tiles ───────────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Mission */}
        <div className="p-8 rounded-3xl border space-y-4" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
          <h2 className="text-2xl font-bold flex items-center gap-2 text-[#3D1F0A] dark:text-[#F2E4CE]">
            <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-[rgba(196,98,45,0.06)] text-[#C4622D]">
              🎯
            </span>
            {t('mission')}
          </h2>
          <p className="text-sm leading-relaxed text-[#7a6034] dark:text-[#c4a47a]">
            {t('missionText')}
          </p>
        </div>

        {/* Vision */}
        <div className="p-8 rounded-3xl border space-y-4" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
          <h2 className="text-2xl font-bold flex items-center gap-2 text-[#3D1F0A] dark:text-[#F2E4CE]">
            <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-[rgba(196,98,45,0.06)] text-[#C4622D]">
              👁️
            </span>
            {t('vision')}
          </h2>
          <p className="text-sm leading-relaxed text-[#7a6034] dark:text-[#c4a47a]">
            {t('visionText')}
          </p>
        </div>
      </section>
    </div>
  )
}
