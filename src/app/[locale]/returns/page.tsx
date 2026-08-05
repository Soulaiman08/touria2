import Link from 'next/link'

interface Props { params: Promise<{ locale: string }> }

export default async function ReturnsPage({ params }: Props) {
  const { locale } = await params
  const isRTL = locale === 'ar'

  const sections = isRTL ? [
    { title: 'شروط الإرجاع', content: 'يمكنكم إرجاع المنتج خلال 7 أيام من تاريخ الاستلام، بشرط أن يكون المنتج في حالته الأصلية غير مستعمل وبعبوته الأصلية.' },
    { title: 'المنتجات المستثناة', content: 'لا يمكن إرجاع المنتجات المُخصصة أو المصنوعة حسب الطلب، أو المنتجات التي تم استخدامها.' },
    { title: 'كيفية الإرجاع', content: 'للبدء في عملية الإرجاع، تواصلي معنا عبر واتساب أو الهاتف وسنرشدك خلال الخطوات.' },
    { title: 'استرداد المبالغ', content: 'يتم استرداد المبلغ كاملاً بعد استلام المنتج المُرجع والتحقق من حالته خلال 3-5 أيام عمل.' },
  ] : locale === 'fr' ? [
    { title: 'Conditions de retour', content: 'Vous pouvez retourner le produit dans les 7 jours suivant la réception, à condition qu\'il soit dans son état d\'origine, non utilisé et dans son emballage d\'origine.' },
    { title: 'Produits exclus', content: 'Les produits personnalisés ou fabriqués sur commande, ainsi que les produits utilisés, ne peuvent pas être retournés.' },
    { title: 'Comment retourner', content: 'Pour initier un retour, contactez-nous via WhatsApp ou téléphone et nous vous guiderons.' },
    { title: 'Remboursements', content: 'Le remboursement complet est effectué dans les 3 à 5 jours ouvrables après réception et vérification du produit retourné.' },
  ] : [
    { title: 'Return Conditions', content: 'You may return the product within 7 days of receipt, provided it is in its original unused condition and original packaging.' },
    { title: 'Excluded Products', content: 'Customized or made-to-order products, as well as used products, cannot be returned.' },
    { title: 'How to Return', content: 'To start a return, contact us via WhatsApp or phone and we will guide you through the steps.' },
    { title: 'Refunds', content: 'Full refund is processed within 3–5 business days after receiving and verifying the returned product.' },
  ]

  return (
    <div className="container-brand py-16 max-w-3xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            {isRTL ? 'سياسة الإرجاع والاستبدال' : locale === 'fr' ? 'Politique de retour' : 'Return Policy'}
          </h1>
          <div className="h-1 w-16 rounded-full" style={{ background: 'var(--accent)' }} />
        </div>

        <div className="space-y-6">
          {sections.map((s, i) => (
            <div key={i} className="card p-6 space-y-2">
              <h2 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                {i + 1}. {s.title}
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{s.content}</p>
            </div>
          ))}
        </div>

        <Link href={`/${locale}`} className="btn btn-outline btn-sm btn-round inline-flex">
          {isRTL ? 'العودة للرئيسية' : locale === 'fr' ? 'Retour à l\'accueil' : 'Back to Home'}
        </Link>
      </div>
    </div>
  )
}
