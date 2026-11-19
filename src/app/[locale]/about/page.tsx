import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import Link from 'next/link'
import { Sparkles, Target, Eye, ShieldCheck, HeartHandshake, ShoppingBag } from 'lucide-react'
import { siteConfig } from '@/config/site'
import { BackButton } from '@/components/shared/PageNavigation'

interface AboutPageProps {
  params: Promise<{ locale: string }>
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'about' })
  const isRTL = locale === 'ar'

  const pillars = [
    {
      icon: Sparkles,
      title: isRTL ? 'صنع يدوي أصيل' : locale === 'fr' ? 'Fait main authentique' : 'Authentic Handmade',
      desc: isRTL
        ? 'خياطة وتطريز مغربي تقليدي متوارث بعناية فائقة وإتقان لا يضاهى بأيدي أمهر الحرفيين.'
        : locale === 'fr'
          ? 'Couture et broderie traditionnelles marocaines transmises avec passion et minutie.'
          : 'Traditional Moroccan stitching and embroidery crafted with generational mastery.',
    },
    {
      icon: ShieldCheck,
      title: isRTL ? 'أجود الخامات الفاخرة' : locale === 'fr' ? 'Matières nobles' : 'Finest Fabrics',
      desc: isRTL
        ? 'أقمشة ملكية مختارة بدقة لنمنحكِ الراحة المطلقة والأناقة المستدامة في كل مناسبة.'
        : locale === 'fr'
          ? 'Sélection rigoureuse des plus beaux tissus pour un confort et une tenue d\'exception.'
          : 'Meticulously chosen luxury fabrics ensuring unmatched comfort and lasting beauty.',
    },
    {
      icon: HeartHandshake,
      title: isRTL ? 'فخر التراث المغربي' : locale === 'fr' ? 'Héritage marocain' : 'Moroccan Heritage',
      desc: isRTL
        ? 'تصاميم تحتفي بالهوية والأصالة مع لمسات عصرية تناسب كل الأذواق والمناسبات.'
        : locale === 'fr'
          ? 'Des créations qui célèbrent l\'identité marocaine avec une touche contemporaine.'
          : 'Creations celebrating authentic Moroccan identity with a contemporary touch.',
    },
  ]

  return (
    <div
      className="container-brand page-shell !pt-4 sm:!pt-6 flex flex-col gap-7 sm:gap-10"
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ maxWidth: '72.5rem' }}
    >
      {/* ── Back Navigation ───────────────────────────────────────── */}
      <div>
        <BackButton
          href={`/${locale}`}
          locale={locale}
          label={isRTL ? 'العودة للرئيسية' : locale === 'fr' ? 'Retour à l\'accueil' : 'Back to Home'}
        />
      </div>

      {/* ── 1. Hero Story Section (Moroccan Arch) ─────────────────── */}
      <section className="relative">
        <div className="grid grid-cols-1 min-[340px]:grid-cols-12 items-center gap-x-3 gap-y-5 min-[340px]:gap-x-4 sm:gap-6 lg:gap-12">
          {/* Story Text */}
          <div className="min-[340px]:col-span-7 flex flex-col items-center min-[340px]:items-start text-center min-[340px]:text-start min-w-0">
            <p className="text-[0.625rem] sm:text-xs font-bold uppercase tracking-[0.08em] sm:tracking-widest text-[var(--accent)] mb-1.5 sm:mb-2 max-w-full truncate">
              {isRTL ? 'أناقة مغربية أصيلة' : locale === 'fr' ? 'Élégance marocaine authentique' : 'Authentic Moroccan Elegance'}
            </p>

            <h1
              className="font-extrabold tracking-tight leading-[1.15] max-w-xl text-[var(--text-primary)] mb-2 sm:mb-3 text-balance text-[clamp(1.15rem,4.6vw,1.65rem)] sm:text-[clamp(1.75rem,3.4vw,3rem)]"
              style={{
                fontFamily: isRTL ? 'var(--font-arabic)' : 'var(--font-display)',
              }}
            >
              {t('title')}
            </h1>

            {/* Subtle Moroccan Hairline */}
            <div className="flex items-center justify-center min-[340px]:justify-start gap-2 sm:gap-2.5 mb-2.5 sm:mb-4" aria-hidden="true">
              <span className="h-[1px] w-6 sm:w-10 bg-[var(--gold)] opacity-60" />
              <span className="w-1.5 h-1.5 rotate-45 bg-[var(--gold)]" />
              <span className="h-[1px] w-6 sm:w-10 bg-[var(--gold)] opacity-60" />
            </div>

            <p className="text-[0.6875rem] sm:text-sm lg:text-base max-w-xl leading-[1.5] sm:leading-relaxed text-[var(--text-muted)] mb-3.5 sm:mb-6">
              {t('story')}
            </p>

            <Link
              href={`/${locale}/products`}
              className="btn btn-primary btn-round !min-h-[2.125rem] sm:!min-h-[2.75rem] !px-3.5 sm:!px-6 text-[0.6875rem] sm:text-sm whitespace-nowrap"
            >
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="font-semibold">
                {isRTL ? 'اكتشفي المجموعة' : locale === 'fr' ? 'Découvrir la collection' : 'Explore Collection'}
              </span>
            </Link>
          </div>

          {/* Architectural Moroccan Arch Showcase */}
          <div className="min-[340px]:col-span-5 flex flex-col items-center min-[340px]:items-end justify-center ps-1 sm:ps-0">
            <div className="relative w-full max-w-[11.5rem] min-[340px]:max-w-[10.5rem] sm:max-w-[14.5rem] md:max-w-[16.5rem] lg:max-w-[19.375rem] aspect-[4/5] rounded-t-[999px] rounded-b-xl sm:rounded-b-2xl overflow-hidden border border-[var(--gold-ring)] bg-[var(--bg-subtle)] p-1.5 sm:p-2.5 shadow-[var(--shadow-md)]">
              <div className="relative w-full h-full rounded-t-[999px] rounded-b-lg sm:rounded-b-xl overflow-hidden border border-[var(--border)] bg-[var(--card-bg)]">
                <Image
                  src="/images/brand/logo-full.png"
                  alt={siteConfig.name}
                  fill
                  priority
                  sizes="(max-width: 640px) 170px, (max-width: 1024px) 265px, 310px"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Brand Pillars Section ──────────────────────────────── */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-6">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon
            return (
              <div
                key={idx}
                className="rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-4 sm:p-6 flex flex-col items-center text-center gap-2.5 sm:gap-3 transition-colors hover:border-[var(--accent-ring)]"
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[var(--accent-light)] border border-[var(--accent-ring)] text-[var(--accent)] flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h2 className="text-sm sm:text-base font-extrabold text-[var(--text-primary)] m-0">
                  {pillar.title}
                </h2>
                <p className="text-xs sm:text-sm leading-relaxed text-[var(--text-muted)] m-0">
                  {pillar.desc}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── 3. Mission & Vision ───────────────────────────────────── */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-6">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-4 sm:p-7 flex flex-col gap-2.5 sm:gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[var(--accent-light)] border border-[var(--accent-ring)] text-[var(--accent)] flex items-center justify-center flex-shrink-0">
                <Target className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-[var(--text-primary)] m-0">
                {t('mission')}
              </h2>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-[var(--text-muted)] m-0">
              {t('missionText')}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-4 sm:p-7 flex flex-col gap-2.5 sm:gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[var(--accent-light)] border border-[var(--accent-ring)] text-[var(--accent)] flex items-center justify-center flex-shrink-0">
                <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-[var(--text-primary)] m-0">
                {t('vision')}
              </h2>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-[var(--text-muted)] m-0">
              {t('visionText')}
            </p>
          </div>
        </div>
      </section>

      {/* ── 4. Call to Action Banner ──────────────────────────────── */}
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-5 sm:p-9 text-center flex flex-col items-center gap-3 sm:gap-3.5">
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--gold)] m-0">
          {isRTL ? 'تشكيلة حصرية' : locale === 'fr' ? 'Collection exclusive' : 'Exclusive Collection'}
        </p>

        <h2
          className="text-lg sm:text-2xl font-extrabold text-[var(--text-primary)] m-0 text-balance"
          style={{ fontFamily: isRTL ? 'var(--font-arabic)' : 'var(--font-display)' }}
        >
          {isRTL ? 'اكتشفي تشكيلة الجلابيات والنقابات الآن' : locale === 'fr' ? 'Découvrez notre collection exclusive' : 'Explore Our Exclusive Collection'}
        </h2>

        <p className="text-xs sm:text-sm max-w-lg text-[var(--text-muted)] leading-relaxed m-0">
          {isRTL
            ? 'تصاميم راقية مصممة بأيدي أمهر الحرفيين المغاربة لتليق بإطلالتكِ وتبرز أناقتكِ في كل مناسبة.'
            : locale === 'fr'
              ? 'Des créations raffinées façonnées par les plus grands maîtres artisans marocains.'
              : 'Refined designs handcrafted by master Moroccan artisans to elevate your style.'}
        </p>

        <Link href={`/${locale}/products`} className="btn btn-primary btn-round px-6 sm:px-7 h-10 sm:h-11 mt-1 text-xs sm:text-sm">
          <ShoppingBag className="w-4 h-4" />
          <span>{isRTL ? 'تصفحي المجموعة' : locale === 'fr' ? 'Voir la collection' : 'Shop Collection'}</span>
        </Link>
      </section>
    </div>
  )
}
