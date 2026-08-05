import Link from 'next/link'

interface Props { params: Promise<{ locale: string }> }

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params
  const isRTL = locale === 'ar'

  return (
    <div className="container-brand py-16 max-w-3xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            {isRTL ? 'سياسة الخصوصية' : locale === 'fr' ? 'Politique de confidentialité' : 'Privacy Policy'}
          </h1>
          <div className="h-1 w-16 rounded-full" style={{ background: 'var(--accent)' }} />
        </div>

        <div className="space-y-6 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          <section className="space-y-2">
            <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              {isRTL ? '١. جمع المعلومات' : '1. Information Collection'}
            </h2>
            <p>
              {isRTL
                ? 'نجمع فقط المعلومات الضرورية لإتمام طلبك: الاسم، رقم الهاتف، العنوان، والمدينة. لا نحتفظ ببيانات بطاقات الائتمان.'
                : 'We only collect the information necessary to complete your order: name, phone number, address, and city. We do not store credit card information.'}
            </p>
          </section>
          <section className="space-y-2">
            <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              {isRTL ? '٢. استخدام المعلومات' : '2. Use of Information'}
            </h2>
            <p>
              {isRTL
                ? 'تُستخدم معلوماتك فقط لمعالجة طلبك والتواصل معك بشأن توصيله.'
                : 'Your information is used only to process your order and communicate with you about its delivery.'}
            </p>
          </section>
          <section className="space-y-2">
            <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              {isRTL ? '٣. مشاركة المعلومات' : '3. Sharing of Information'}
            </h2>
            <p>
              {isRTL
                ? 'لا نشارك معلوماتك مع أي طرف ثالث باستثناء شركات التوصيل اللازمة لإتمام خدمة الشحن.'
                : 'We do not share your information with any third party except delivery companies required to complete the shipping service.'}
            </p>
          </section>
          <section className="space-y-2">
            <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              {isRTL ? '٤. التواصل معنا' : '4. Contact Us'}
            </h2>
            <p>
              {isRTL
                ? 'لأي استفسارات حول خصوصيتك، تواصل معنا عبر واتساب أو البريد الإلكتروني.'
                : 'For any privacy-related questions, contact us via WhatsApp or email.'}
            </p>
          </section>
        </div>

        <Link href={`/${locale}`} className="btn btn-outline btn-sm btn-round inline-flex">
          {isRTL ? 'العودة للرئيسية' : locale === 'fr' ? 'Retour à l\'accueil' : 'Back to Home'}
        </Link>
      </div>
    </div>
  )
}
