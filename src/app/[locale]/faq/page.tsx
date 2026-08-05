import Link from 'next/link'

interface Props { params: Promise<{ locale: string }> }

export default async function FaqPage({ params }: Props) {
  const { locale } = await params
  const isRTL = locale === 'ar'

  const faqs = isRTL ? [
    { q: 'كيف أضع طلباً؟', a: 'أضيفي المنتجات التي تريدين إلى سلة التسوق، ثم انقري على "إتمام الطلب" وأدخلي بياناتك وعنوانك. سيتواصل معك فريقنا لتأكيد الطلب.' },
    { q: 'ما طريقة الدفع المتاحة؟', a: 'نوفر حالياً الدفع عند الاستلام (COD) فقط. ستدفعين عند استلام طلبك مباشرة.' },
    { q: 'كم يستغرق التوصيل؟', a: 'يستغرق التوصيل عادةً من 3 إلى 5 أيام عمل، حسب مدينتك.' },
    { q: 'هل يمكنني إرجاع المنتج؟', a: 'نعم، يمكنك إرجاع المنتج خلال 7 أيام من تاريخ الاستلام إذا كان في حالته الأصلية. راجعي سياسة الإرجاع للمزيد من التفاصيل.' },
    { q: 'هل يمكنني تتبع طلبي؟', a: 'نعم، يمكنك تتبع طلبك باستخدام رقم الطلب في صفحة تتبع الطلبات.' },
    { q: 'ما المدن التي تشحنون إليها؟', a: 'نشحن إلى جميع مدن المملكة المغربية.' },
  ] : locale === 'fr' ? [
    { q: 'Comment passer une commande?', a: 'Ajoutez les produits à votre panier, puis cliquez sur "Commander" et saisissez vos coordonnées. Notre équipe vous contactera pour confirmer.' },
    { q: 'Quel mode de paiement acceptez-vous?', a: 'Nous acceptons uniquement le paiement à la livraison (COD). Vous payez à la réception de votre commande.' },
    { q: 'Quel est le délai de livraison?', a: 'La livraison prend généralement 3 à 5 jours ouvrables selon votre ville.' },
    { q: 'Puis-je retourner un produit?', a: 'Oui, sous 7 jours à condition que le produit soit dans son état d\'origine. Consultez notre politique de retour.' },
    { q: 'Puis-je suivre ma commande?', a: 'Oui, utilisez votre numéro de commande sur la page de suivi des commandes.' },
    { q: 'Dans quelles villes livrez-vous?', a: 'Nous livrons dans toutes les villes du Maroc.' },
  ] : [
    { q: 'How do I place an order?', a: 'Add products to your cart, then click "Checkout" and enter your details. Our team will contact you to confirm.' },
    { q: 'What payment methods do you accept?', a: 'We currently accept Cash on Delivery (COD) only. You pay when you receive your order.' },
    { q: 'How long does delivery take?', a: 'Delivery usually takes 3 to 5 business days depending on your city.' },
    { q: 'Can I return a product?', a: 'Yes, within 7 days of receipt if it\'s in original condition. Check our return policy for details.' },
    { q: 'Can I track my order?', a: 'Yes, use your order number on the order tracking page.' },
    { q: 'Which cities do you ship to?', a: 'We ship to all cities in Morocco.' },
  ]

  return (
    <div className="container-brand py-16 max-w-3xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            {isRTL ? 'الأسئلة الشائعة' : locale === 'fr' ? 'Questions fréquentes' : 'Frequently Asked Questions'}
          </h1>
          <div className="h-1 w-16 rounded-full" style={{ background: 'var(--accent)' }} />
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <details
              key={i}
              className="card p-0 overflow-hidden group"
            >
              <summary
                className="flex items-center justify-between gap-4 p-5 cursor-pointer font-semibold text-sm list-none select-none"
                style={{ color: 'var(--text-primary)' }}
              >
                <span>{faq.q}</span>
                <svg
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                  className="w-4 h-4 flex-shrink-0 transition-transform duration-200 group-open:rotate-45"
                  style={{ color: 'var(--accent)' }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
                </svg>
              </summary>
              <div
                className="px-5 pb-5 text-sm leading-relaxed"
                style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)' }}
              >
                <p className="pt-4">{faq.a}</p>
              </div>
            </details>
          ))}
        </div>

        <div className="card p-6 text-center space-y-3">
          <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
            {isRTL ? 'لم تجدي إجابتك؟' : locale === 'fr' ? 'Vous n\'avez pas trouvé votre réponse?' : 'Didn\'t find your answer?'}
          </p>
          <a
            href={`https://wa.me/212600000000?text=${encodeURIComponent(isRTL ? 'مرحباً، لدي استفسار' : 'Hello, I have a question')}`}
            target="_blank" rel="noopener noreferrer"
            className="btn btn-primary btn-sm btn-round inline-flex"
          >
            {isRTL ? 'تواصل معنا عبر واتساب' : locale === 'fr' ? 'Contactez-nous via WhatsApp' : 'Contact us via WhatsApp'}
          </a>
        </div>

        <Link href={`/${locale}`} className="btn btn-outline btn-sm btn-round inline-flex">
          {isRTL ? 'العودة للرئيسية' : locale === 'fr' ? 'Retour à l\'accueil' : 'Back to Home'}
        </Link>
      </div>
    </div>
  )
}
