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
        ? 'خياطة وتطريز مغربي تقليدي متوارث عبر الأجيال بعناية فائقة.'
        : locale === 'fr'
          ? 'Couture et broderie traditionnelles marocaines transmises avec passion.'
          : 'Traditional Moroccan stitching and embroidery crafted with generational mastery.',
    },
    {
      icon: ShieldCheck,
      title: isRTL ? 'أجود الخامات الفاخرة' : locale === 'fr' ? 'Matières nobles' : 'Finest Fabrics',
      desc: isRTL
        ? 'أقمشة ملكية مختارة بدقة لنمنحكِ الراحة المطلقة والأناقة المستدامة.'
        : locale === 'fr'
          ? 'Sélection rigoureuse des plus beaux tissus pour un confort et une tenue d\'exception.'
          : 'Meticulously chosen luxury fabrics ensuring unmatched comfort and lasting beauty.',
    },
    {
      icon: HeartHandshake,
      title: isRTL ? 'فخر التراث المغربي' : locale === 'fr' ? 'Héritage marocain' : 'Moroccan Heritage',
      desc: isRTL
        ? 'تصاميم تحتفي بالهوية والأصالة مع لمسات عصرية تناسب كل المناسبات.'
        : locale === 'fr'
          ? 'Des créations qui célèbrent l\'identité marocaine avec une touche contemporaine.'
          : 'Creations celebrating authentic Moroccan identity with a contemporary touch.',
    },
  ]

  return (
    <div
      className="container-brand page-shell"
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{ maxWidth: 960, paddingLeft: 'max(16px, 4vw)', paddingRight: 'max(16px, 4vw)' }}
    >
      {/* ── Back Navigation ───────────────────────────────────────── */}
      <Link
        href={`/${locale}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--muted-foreground)',
          textDecoration: 'none',
          marginBottom: 20,
        }}
      >
        <ArrowLeft style={{ width: 14, height: 14, transform: isRTL ? 'rotate(180deg)' : 'none' }} />
        {isRTL ? 'العودة للرئيسية' : locale === 'fr' ? 'Retour à l\'accueil' : 'Back to Home'}
      </Link>

      {/* ── Hero Showcase Card ────────────────────────────────────── */}
      <div
        style={{
          borderRadius: 24,
          border: '1px solid var(--border)',
          background: 'var(--card)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.06)',
          overflow: 'hidden',
          marginBottom: 32,
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(196,98,45,0.06) 0%, rgba(184,150,90,0.04) 100%)',
            padding: '36px 28px sm:p-10',
            borderBottom: '1px solid var(--border)',
          }}
          className="p-6 sm:p-10"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Story text */}
            <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-start space-y-4">
              <div
                className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold"
                style={{
                  background: 'var(--accent-light)',
                  color: 'var(--accent)',
                  border: '1px solid var(--accent-ring)',
                }}
              >
                <span>✦</span>
                <span>{locale === 'ar' ? 'أناقة مغربية أصيلة' : 'Authentic Moroccan Elegance'}</span>
                <span>✦</span>
              </div>

              <h1
                style={{
                  fontSize: 'clamp(1.6rem, 3.2vw, 2.3rem)',
                  fontWeight: 900,
                  color: 'var(--foreground)',
                  margin: 0,
                  fontFamily: isRTL ? 'var(--font-arabic)' : 'var(--font-display)',
                  lineHeight: 1.2,
                }}
              >
                {t('title')}
              </h1>

              {/* Decorative Moroccan Separator */}
              <div className="flex items-center gap-2.5 my-1" aria-hidden="true">
                <span className="h-[1.5px] w-10 rounded-full" style={{ background: 'linear-gradient(90deg, transparent, var(--gold))' }} />
                <span className="text-xs text-[var(--gold)]">✦</span>
                <span className="h-[1.5px] w-10 rounded-full" style={{ background: 'linear-gradient(90deg, var(--gold), transparent)' }} />
              </div>

              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.8,
                  color: 'var(--muted-foreground)',
                  margin: 0,
                }}
              >
                {t('story')}
              </p>
            </div>

            {/* Brand Emblem */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative flex items-center justify-center p-2">
                <div
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle, rgba(184,150,90,0.18) 0%, transparent 70%)',
                    filter: 'blur(14px)',
                  }}
                />
                <div
                  className="relative rounded-full overflow-hidden shadow-2xl transition-transform duration-500 hover:scale-105"
                  style={{
                    width: 'clamp(170px, 22vw, 220px)',
                    height: 'clamp(170px, 22vw, 220px)',
                    background: 'var(--card)',
                    border: '3px solid var(--gold-light)',
                    boxShadow: '0 12px 32px rgba(61,31,10,0.15)',
                  }}
                >
                  <Image
                    src="/images/brand/logo-full.png"
                    alt={siteConfig.name}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Brand Pillars ─────────────────────────────────────────── */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-5">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon
            return (
              <div
                key={idx}
                style={{
                  borderRadius: 16,
                  border: '1px solid var(--border)',
                  background: 'var(--bg-subtle)',
                  padding: '20px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  transition: 'transform 0.2s',
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: 'var(--accent-light)',
                    color: 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon style={{ width: 20, height: 20 }} />
                </div>
                <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--foreground)', margin: 0 }}>
                  {pillar.title}
                </h2>
                <p style={{ fontSize: 12.5, color: 'var(--muted-foreground)', lineHeight: 1.6, margin: 0 }}>
                  {pillar.desc}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Mission & Vision Section ──────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        {/* Mission */}
        <div
          style={{
            borderRadius: 20,
            border: '1px solid var(--border)',
            background: 'var(--card)',
            padding: '28px 24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'var(--accent-light)',
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Target style={{ width: 18, height: 18 }} />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: 'var(--foreground)', margin: 0 }}>
              {t('mission')}
            </h2>
          </div>
          <p style={{ fontSize: 13.5, color: 'var(--muted-foreground)', lineHeight: 1.7, margin: 0 }}>
            {t('missionText')}
          </p>
        </div>

        {/* Vision */}
        <div
          style={{
            borderRadius: 20,
            border: '1px solid var(--border)',
            background: 'var(--card)',
            padding: '28px 24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'var(--accent-light)',
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Eye style={{ width: 18, height: 18 }} />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: 'var(--foreground)', margin: 0 }}>
              {t('vision')}
            </h2>
          </div>
          <p style={{ fontSize: 13.5, color: 'var(--muted-foreground)', lineHeight: 1.7, margin: 0 }}>
            {t('visionText')}
          </p>
        </div>
      </div>

      {/* ── Call to Action Card ───────────────────────────────────── */}
      <div
        style={{
          borderRadius: 20,
          border: '1px solid var(--border)',
          background: 'linear-gradient(135deg, rgba(196,98,45,0.08) 0%, rgba(184,150,90,0.04) 100%)',
          padding: '28px 24px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 900, color: 'var(--foreground)', margin: 0 }}>
          {isRTL ? 'اكتشفي تشكيلة الجلابيات والنقابات الآن' : locale === 'fr' ? 'Découvrez notre collection exclusive' : 'Explore Our Exclusive Collection'}
        </h3>
        <Link
          href={`/${locale}/products`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 24px',
            borderRadius: 12,
            background: 'linear-gradient(90deg, #C4622D, #d97b4a)',
            color: '#fff',
            fontSize: 13,
            fontWeight: 800,
            textDecoration: 'none',
            boxShadow: '0 4px 16px rgba(196,98,45,0.25)',
          }}
        >
          <ShoppingBag style={{ width: 15, height: 15 }} />
          <span>{isRTL ? 'تصفحي المجموعة' : locale === 'fr' ? 'Voir la collection' : 'Shop Collection'}</span>
        </Link>
      </div>
    </div>
  )
}
