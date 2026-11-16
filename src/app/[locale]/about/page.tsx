import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Sparkles, Target, Eye, ShieldCheck, HeartHandshake, ShoppingBag } from 'lucide-react'
import { siteConfig } from '@/config/site'

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
      className="container-brand page-shell flex flex-col gap-10"
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ maxWidth: 1100 }}
    >
      {/* ── Back Navigation ───────────────────────────────────────── */}
      <div>
        <Link href={`/${locale}`} className="btn btn-outline btn-sm btn-round">
          <ArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
          <span>{isRTL ? 'العودة للرئيسية' : locale === 'fr' ? 'Retour à l\'accueil' : 'Back to Home'}</span>
        </Link>
      </div>

      {/* ── 1. Hero Story Section ─────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div
          className="grid grid-cols-1 lg:grid-cols-12 items-center gap-8 lg:gap-12"
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          {/* Story Text */}
          <div
            className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-start"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--accent)] mb-2">
              {isRTL ? 'أناقة مغربية أصيلة' : locale === 'fr' ? 'Élégance marocaine authentique' : 'Authentic Moroccan Elegance'}
            </p>

            <h1
              className="font-extrabold tracking-tight leading-[1.18] max-w-xl text-[var(--text-primary)] mb-3"
              style={{
                fontSize: 'clamp(1.75rem, 3.6vw, 3rem)',
                fontFamily: isRTL ? 'var(--font-arabic)' : 'var(--font-display)',
              }}
            >
              {t('title')}
            </h1>

            {/* Subtle Moroccan Hairline */}
            <div className="flex items-center justify-center lg:justify-start gap-2.5 mb-4" aria-hidden="true">
              <span className="h-[1px] w-10 bg-[var(--gold)] opacity-60" />
              <span className="w-1.5 h-1.5 rotate-45 bg-[var(--gold)]" />
              <span className="h-[1px] w-10 bg-[var(--gold)] opacity-60" />
            </div>

            <p className="text-sm md:text-base max-w-lg leading-relaxed text-[var(--text-muted)] mb-6">
              {t('story')}
            </p>

            <Link href={`/${locale}/products`} className="btn btn-primary btn-round px-6 py-3">
              <ShoppingBag className="w-4 h-4" />
              <span className="font-semibold text-sm">
                {isRTL ? 'اكتشفي المجموعة' : locale === 'fr' ? 'Découvrir la collection' : 'Explore Collection'}
              </span>
            </Link>
          </div>

          {/* Single Clean Showcase Medallion */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-end justify-center" dir="ltr">
            <div
              className="relative rounded-full overflow-hidden border-2 border-[var(--gold-ring)] bg-[var(--card-bg)] shadow-lg"
              style={{
                width: 'clamp(190px, 26vw, 290px)',
                height: 'clamp(190px, 26vw, 290px)',
              }}
            >
              <Image
                src="/images/brand/logo-full.png"
                alt={siteConfig.name}
                fill
                priority
                sizes="(max-width: 768px) 190px, (max-width: 1024px) 240px, 290px"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Brand Pillars Section ──────────────────────────────── */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon
            return (
              <div
                key={idx}
                className="rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-6 flex flex-col items-center text-center gap-3 transition-colors hover:border-[var(--accent-ring)]"
              >
                <div className="w-12 h-12 rounded-xl bg-[var(--accent-light)] border border-[var(--accent-ring)] text-[var(--accent)] flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <h2 className="text-base font-extrabold text-[var(--text-primary)] m-0">
                  {pillar.title}
                </h2>
                <p className="text-sm leading-relaxed text-[var(--text-muted)] m-0">
                  {pillar.desc}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── 3. Mission & Vision ───────────────────────────────────── */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Mission */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-6 sm:p-7 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--accent-light)] border border-[var(--accent-ring)] text-[var(--accent)] flex items-center justify-center flex-shrink-0">
                <Target className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-extrabold text-[var(--text-primary)] m-0">
                {t('mission')}
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-[var(--text-muted)] m-0">
              {t('missionText')}
            </p>
          </div>

          {/* Vision */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-6 sm:p-7 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--accent-light)] border border-[var(--accent-ring)] text-[var(--accent)] flex items-center justify-center flex-shrink-0">
                <Eye className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-extrabold text-[var(--text-primary)] m-0">
                {t('vision')}
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-[var(--text-muted)] m-0">
              {t('visionText')}
            </p>
          </div>
        </div>
      </section>

      {/* ── 4. Call to Action Banner ──────────────────────────────── */}
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-subtle)] p-8 text-center flex flex-col items-center gap-3.5">
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--gold)] m-0">
          {isRTL ? 'تشكيلة حصرية' : locale === 'fr' ? 'Collection exclusive' : 'Exclusive Collection'}
        </p>

        <h2
          className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] m-0"
          style={{ fontFamily: isRTL ? 'var(--font-arabic)' : 'var(--font-display)' }}
        >
          {isRTL ? 'اكتشفي تشكيلة الجلابيات والنقابات الآن' : locale === 'fr' ? 'Découvrez notre collection exclusive' : 'Explore Our Exclusive Collection'}
        </h2>

        <p className="text-sm max-w-lg text-[var(--text-muted)] leading-relaxed m-0">
          {isRTL
            ? 'تصاميم راقية مصممة بأيدي أمهر الحرفيين المغاربة لتليق بإطلالتكِ وتبرز أناقتكِ في كل مناسبة.'
            : locale === 'fr'
              ? 'Des créations raffinées façonnées par les plus grands maîtres artisans marocains.'
              : 'Refined designs handcrafted by master Moroccan artisans to elevate your style.'}
        </p>

        <Link href={`/${locale}/products`} className="btn btn-primary btn-round px-7 py-3 mt-1">
          <ShoppingBag className="w-4 h-4" />
          <span>{isRTL ? 'تصفحي المجموعة' : locale === 'fr' ? 'Voir la collection' : 'Shop Collection'}</span>
        </Link>
      </section>
    </div>
  )
}
