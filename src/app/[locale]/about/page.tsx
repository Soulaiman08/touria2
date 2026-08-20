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
      className="container-brand"
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '16px 20px 60px',
        display: 'flex',
        flexDirection: 'column',
        gap: '28px',
      }}
    >
      {/* ── Back Navigation ───────────────────────────────────────── */}
      <div>
        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border px-3.5 py-1 text-xs font-bold transition-all hover:bg-[var(--bg-subtle)] hover:scale-[1.02]"
          style={{
            borderColor: 'var(--border)',
            background: 'var(--card)',
            color: 'var(--muted-foreground)',
            textDecoration: 'none',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
          }}
        >
          <ArrowLeft style={{ width: 13, height: 13, transform: isRTL ? 'rotate(180deg)' : 'none' }} />
          <span>{isRTL ? 'العودة للرئيسية' : locale === 'fr' ? 'Retour à l\'accueil' : 'Back to Home'}</span>
        </Link>
      </div>

      {/* ── 1. Hero Story Section ─────────────────────────────────── */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Ambient atmospheric luxury glow (desktop only) */}
        <div
          className="absolute inset-0 pointer-events-none hidden sm:block"
          style={{
            background:
              'radial-gradient(ellipse 70% 60% at 75% 45%, rgba(196, 98, 45, 0.08) 0%, rgba(184, 150, 90, 0.03) 50%, transparent 70%)',
          }}
        />

        <div className="relative z-10 w-full">
          <div
            className="hero-grid grid grid-cols-1 lg:grid-cols-12 items-center gap-x-6 sm:gap-x-8 lg:gap-x-10 xl:gap-x-12 gap-y-4 sm:gap-y-6 lg:gap-y-0"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {/* Story Text (Col 7 on Desktop / Left Column on Mobile) */}
            <div
              className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-start"
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              {/* Overline Badge */}
              <div
                className="hero-badge inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold tracking-wide mb-2 shadow-2xs"
                style={{
                  background: 'var(--accent-light)',
                  color: 'var(--accent)',
                  border: '1px solid var(--accent-ring)',
                }}
              >
                <span className="text-amber-500 dark:text-amber-400 text-xs">✦</span>
                <span>{locale === 'ar' ? 'أناقة مغربية أصيلة' : 'Authentic Moroccan Elegance'}</span>
                <span className="text-amber-500 dark:text-amber-400 text-xs">✦</span>
              </div>

              {/* Main Headline */}
              <h1
                className="font-extrabold tracking-tight leading-[1.18] sm:leading-[1.15] max-w-xl text-[var(--text-primary)]"
                style={{
                  fontSize: 'clamp(1.65rem, 3.6vw, 3.2rem)',
                  fontFamily: isRTL ? 'var(--font-arabic)' : 'var(--font-display)',
                }}
              >
                {t('title')}
              </h1>

              {/* Moroccan Separator */}
              <div
                className="hero-separator flex items-center justify-center lg:justify-start gap-2.5 sm:gap-3 my-2 md:my-3"
                aria-hidden="true"
              >
                <span
                  className="h-[1.5px] w-8 sm:w-12 rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, transparent, var(--accent-ring), var(--gold))',
                  }}
                />
                <span
                  className="text-xs sm:text-sm font-serif"
                  style={{ color: 'var(--gold)' }}
                >
                  ✦
                </span>
                <span
                  className="h-[1.5px] w-8 sm:w-12 rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, var(--gold), var(--accent-ring), transparent)',
                  }}
                />
              </div>

              {/* Description */}
              <p
                className="hero-description text-xs sm:text-sm md:text-base max-w-lg leading-6 sm:leading-7 md:leading-relaxed text-[var(--text-muted)] font-normal mb-3 sm:mb-4"
              >
                {t('story')}
              </p>

              {/* Action Buttons */}
              <div className="hero-actions flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-2.5 sm:gap-3 w-full sm:w-auto">
                <Link
                  href={`/${locale}/products`}
                  className="btn btn-primary btn-round w-full sm:w-auto shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-95 group"
                  style={{
                    minWidth: 155,
                    minHeight: 42,
                    justifyContent: 'center',
                  }}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span className="font-semibold text-xs sm:text-sm">
                    {isRTL ? 'اكتشفي المجموعة' : locale === 'fr' ? 'Découvrir la collection' : 'Explore Collection'}
                  </span>
                </Link>
              </div>
            </div>

            {/* Visual Showcase (Col 5 on Desktop / Right Column on Mobile - Shadow removed on mobile) */}
            <div
              className="lg:col-span-5 flex flex-col items-center lg:items-end justify-center"
              dir="ltr"
            >
              <div
                className="hero-showcase relative flex items-center justify-center p-1.5 sm:p-2"
                style={{
                  width: 'clamp(190px, 28vw, 320px)',
                  aspectRatio: '1 / 1',
                }}
              >
                {/* Soft ambient radial aura (Desktop Only - Removed on Mobile) */}
                <div
                  className="absolute inset-0 rounded-full pointer-events-none hidden sm:block"
                  style={{
                    background:
                      'radial-gradient(circle, rgba(184, 150, 90, 0.14) 0%, rgba(196, 98, 45, 0.04) 55%, transparent 72%)',
                    filter: 'blur(16px)',
                  }}
                />

                {/* Decorative outer ring */}
                <div
                  className="absolute inset-1 rounded-full pointer-events-none hidden sm:block"
                  style={{
                    border: '1.5px solid var(--accent-ring)',
                    opacity: 0.65,
                  }}
                />

                {/* Decorative dashed inner ring */}
                <div
                  className="absolute rounded-full pointer-events-none hidden sm:block"
                  style={{
                    inset: 9,
                    border: '1px dashed rgba(184, 150, 90, 0.35)',
                  }}
                />

                {/* Showcase Container - Clean on Mobile without bottom blur/shadow */}
                <div
                  className="hero-logo-mark relative rounded-full overflow-hidden shadow-none sm:shadow-xl transition-transform duration-500 hover:scale-[1.02]"
                  style={{
                    width: 'clamp(160px, 24vw, 270px)',
                    height: 'clamp(160px, 24vw, 270px)',
                    background: 'var(--card-bg)',
                    border: '3px solid var(--bg-base)',
                  }}
                >
                  <Image
                    src="/images/brand/logo-full.png"
                    alt={siteConfig.name}
                    fill
                    priority
                    sizes="(max-width: 768px) 190px, (max-width: 1024px) 240px, 270px"
                    className="object-cover transition-transform duration-700 hover:scale-105"
                    style={{
                      background: 'var(--bg-subtle)',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Brand Pillars Section ──────────────────────────────── */}
      <section>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-6">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon
            const isLastOnMobile = idx === 2
            return (
              <div
                key={idx}
                className={`rounded-2xl sm:rounded-3xl border flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                  isLastOnMobile ? 'col-span-2 md:col-span-1' : 'col-span-1'
                }`}
                style={{
                  borderColor: 'var(--border)',
                  background: 'var(--card)',
                  boxShadow: '0 4px 20px rgba(61,31,10,0.04)',
                  padding: 'clamp(14px, 2vw, 28px) clamp(10px, 1.8vw, 22px)',
                  gap: 'clamp(8px, 1.2vw, 14px)',
                  boxSizing: 'border-box',
                }}
              >
                <div
                  className="flex items-center justify-center rounded-xl sm:rounded-2xl flex-shrink-0"
                  style={{
                    width: 'clamp(32px, 4vw, 48px)',
                    height: 'clamp(32px, 4vw, 48px)',
                    background: 'var(--accent-light)',
                    color: 'var(--accent)',
                    border: '1px solid var(--accent-ring)',
                  }}
                >
                  <Icon style={{ width: 'clamp(16px, 2vw, 22px)', height: 'clamp(16px, 2vw, 22px)' }} />
                </div>
                <h2
                  style={{
                    fontSize: 'clamp(12px, 1.4vw, 17px)',
                    fontWeight: 800,
                    color: 'var(--foreground)',
                    margin: 0,
                  }}
                >
                  {pillar.title}
                </h2>
                <p
                  style={{
                    fontSize: 'clamp(10px, 1.1vw, 13.5px)',
                    lineHeight: 1.6,
                    color: 'var(--muted-foreground)',
                    margin: 0,
                  }}
                >
                  {pillar.desc}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── 3. Mission & Vision ───────────────────────────────────── */}
      <section>
        <div className="grid grid-cols-2 gap-2.5 sm:gap-6">
          {/* Mission */}
          <div
            className="rounded-2xl sm:rounded-3xl border shadow-xs flex flex-col transition-all duration-300 hover:shadow-md"
            style={{
              borderColor: 'var(--border)',
              background: 'var(--card)',
              padding: 'clamp(14px, 2.2vw, 28px) clamp(12px, 2vw, 26px)',
              gap: 'clamp(8px, 1.2vw, 14px)',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(6px, 1vw, 12px)' }}>
              <div
                style={{
                  width: 'clamp(28px, 3.5vw, 42px)',
                  height: 'clamp(28px, 3.5vw, 42px)',
                  borderRadius: 'clamp(8px, 1.2vw, 14px)',
                  background: 'var(--accent-light)',
                  color: 'var(--accent)',
                  border: '1px solid var(--accent-ring)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Target style={{ width: 'clamp(14px, 1.8vw, 20px)', height: 'clamp(14px, 1.8vw, 20px)' }} />
              </div>
              <h2
                style={{
                  fontSize: 'clamp(12px, 1.5vw, 18px)',
                  fontWeight: 900,
                  color: 'var(--foreground)',
                  margin: 0,
                }}
              >
                {t('mission')}
              </h2>
            </div>
            <p
              style={{
                fontSize: 'clamp(10px, 1.1vw, 13.5px)',
                lineHeight: 1.6,
                color: 'var(--muted-foreground)',
                margin: 0,
              }}
            >
              {t('missionText')}
            </p>
          </div>

          {/* Vision */}
          <div
            className="rounded-2xl sm:rounded-3xl border shadow-xs flex flex-col transition-all duration-300 hover:shadow-md"
            style={{
              borderColor: 'var(--border)',
              background: 'var(--card)',
              padding: 'clamp(14px, 2.2vw, 28px) clamp(12px, 2vw, 26px)',
              gap: 'clamp(8px, 1.2vw, 14px)',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(6px, 1vw, 12px)' }}>
              <div
                style={{
                  width: 'clamp(28px, 3.5vw, 42px)',
                  height: 'clamp(28px, 3.5vw, 42px)',
                  borderRadius: 'clamp(8px, 1.2vw, 14px)',
                  background: 'var(--accent-light)',
                  color: 'var(--accent)',
                  border: '1px solid var(--accent-ring)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Eye style={{ width: 'clamp(14px, 1.8vw, 20px)', height: 'clamp(14px, 1.8vw, 20px)' }} />
              </div>
              <h2
                style={{
                  fontSize: 'clamp(12px, 1.5vw, 18px)',
                  fontWeight: 900,
                  color: 'var(--foreground)',
                  margin: 0,
                }}
              >
                {t('vision')}
              </h2>
            </div>
            <p
              style={{
                fontSize: 'clamp(10px, 1.1vw, 13.5px)',
                lineHeight: 1.6,
                color: 'var(--muted-foreground)',
                margin: 0,
              }}
            >
              {t('visionText')}
            </p>
          </div>
        </div>
      </section>

      {/* ── 4. Call to Action Banner ──────────────────────────────── */}
      <section
        style={{
          borderRadius: '24px',
          border: '1px solid var(--border)',
          background: 'linear-gradient(135deg, rgba(196,98,45,0.08) 0%, rgba(184,150,90,0.05) 100%)',
          boxShadow: '0 8px 28px rgba(196,98,45,0.06)',
          padding: 'clamp(20px, 3vw, 36px) clamp(16px, 2.5vw, 28px)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'clamp(10px, 1.5vw, 14px)',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '3px 10px',
            borderRadius: '9999px',
            fontSize: 'clamp(9px, 1vw, 11px)',
            fontWeight: 800,
            background: 'var(--accent-light)',
            color: 'var(--accent)',
            border: '1px solid var(--accent-ring)',
          }}
        >
          <span style={{ color: '#f59e0b' }}>✦</span>
          <span>{locale === 'ar' ? 'تشكيلة حصرية' : 'Exclusive Collection'}</span>
          <span style={{ color: '#f59e0b' }}>✦</span>
        </div>

        <h2
          style={{
            fontSize: 'clamp(14px, 2.2vw, 24px)',
            fontWeight: 900,
            color: 'var(--foreground)',
            margin: 0,
          }}
        >
          {isRTL ? 'اكتشفي تشكيلة الجلابيات والنقابات الآن' : locale === 'fr' ? 'Découvrez notre collection exclusive' : 'Explore Our Exclusive Collection'}
        </h2>

        <p
          style={{
            fontSize: 'clamp(10.5px, 1.2vw, 13.5px)',
            maxWidth: '520px',
            color: 'var(--muted-foreground)',
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          {isRTL
            ? 'تصاميم راقية مصممة بأيدي أمهر الحرفيين المغاربة لتليق بإطلالتكِ وتبرز أناقتكِ في كل مناسبة.'
            : locale === 'fr'
              ? 'Des créations raffinées façonnées par les plus grands maîtres artisans marocains.'
              : 'Refined designs handcrafted by master Moroccan artisans to elevate your style.'}
        </p>

        <Link
          href={`/${locale}/products`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: 'clamp(8px, 1.2vw, 12px) clamp(20px, 2.5vw, 28px)',
            borderRadius: '14px',
            background: 'linear-gradient(90deg, #C4622D, #d97b4a)',
            color: '#ffffff',
            fontSize: 'clamp(11px, 1.2vw, 13px)',
            fontWeight: 800,
            textDecoration: 'none',
            boxShadow: '0 6px 20px rgba(196,98,45,0.28)',
            marginTop: '2px',
            transition: 'transform 0.2s ease',
          }}
        >
          <ShoppingBag style={{ width: '15px', height: '15px' }} />
          <span>{isRTL ? 'تصفحي المجموعة' : locale === 'fr' ? 'Voir la collection' : 'Shop Collection'}</span>
        </Link>
      </section>
    </div>
  )
}
