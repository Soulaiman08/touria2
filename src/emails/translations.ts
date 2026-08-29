export interface EmailTranslations {
  storeName: string
  tagline: string
  subject: string
  previewText: string
  orderConfirmedTitle: string
  orderConfirmedSubtitle: string
  greeting: string
  orderNumberLabel: string
  orderDateLabel: string
  itemsSectionTitle: string
  productLabel: string
  sizeLabel: string
  colorLabel: string
  qtyLabel: string
  unitPriceLabel: string
  totalPriceLabel: string
  niqabBadge: string
  subtotalLabel: string
  shippingLabel: string
  freeShipping: string
  discountLabel: string
  totalLabel: string
  paymentMethodLabel: string
  paymentMethodValue: string
  deliveryInfoTitle: string
  recipientLabel: string
  phoneLabel: string
  phone2Label: string
  addressLabel: string
  cityLabel: string
  regionLabel: string
  postalCodeLabel: string
  notesLabel: string
  trackOrderBtn: string
  needHelpTitle: string
  needHelpText: string
  footerThankYou: string
  footerRights: string
  currency: string
}

export const emailTranslations: Record<string, EmailTranslations> = {
  ar: {
    storeName: 'ثريا المغربي',
    tagline: 'أناقة مغربية أصيلة',
    subject: 'تأكيد طلبكِ #{orderNumber} – ثريا المغربي',
    previewText: 'شكراً لطلبكِ من ثريا المغربي! رقم طلبكِ هو #{orderNumber}.',
    orderConfirmedTitle: 'تم تأكيد طلبكِ بنجاح! ✨',
    orderConfirmedSubtitle: 'نشكركِ على ثقتكِ بنا. فريقنا يعمل الآن على تجهيز طلبكِ بعناية ليصلكِ في أسرع وقت.',
    greeting: 'مرحباً {name}،',
    orderNumberLabel: 'رقم الطلب',
    orderDateLabel: 'تاريخ الطلب',
    itemsSectionTitle: 'تفاصيل المنتجات',
    productLabel: 'المنتج',
    sizeLabel: 'المقاس',
    colorLabel: 'اللون',
    qtyLabel: 'الكمية',
    unitPriceLabel: 'السعر',
    totalPriceLabel: 'الإجمالي',
    niqabBadge: 'نقاب إضافي',
    subtotalLabel: 'المجموع الفرعي',
    shippingLabel: 'رسوم الشحن والتوصيل',
    freeShipping: 'مجاناً',
    discountLabel: 'الخصم',
    totalLabel: 'المبلغ الإجمالي المطلوب',
    paymentMethodLabel: 'طريقة الدفع',
    paymentMethodValue: 'الدفع نقداً عند الاستلام (COD)',
    deliveryInfoTitle: 'معلومات التوصيل والعنوان',
    recipientLabel: 'اسم المستلم',
    phoneLabel: 'رقم الهاتف',
    phone2Label: 'رقم هاتف إضافي',
    addressLabel: 'العنوان',
    cityLabel: 'المدينة',
    regionLabel: 'الجهة / المنطقة',
    postalCodeLabel: 'الرمز البريدي',
    notesLabel: 'ملاحظات الطلب',
    trackOrderBtn: 'تتبع حالة طلبكِ',
    needHelpTitle: 'هل لديكِ أي استفسار؟',
    needHelpText: 'فريق خدمة العملاء جاهز دائماً لمساعدتكِ عبر الواتساب أو البريد الإلكتروني.',
    footerThankYou: 'شكراً لاختياركِ ثريا المغربي للأناقة والجلابيات المغربية الأصيلة.',
    footerRights: 'جميع الحقوق محفوظة © {year} ثريا المغربي.',
    currency: 'د.م.',
  },
  fr: {
    storeName: 'Thuraya Al Maghribi',
    tagline: 'Élégance Marocaine Authentique',
    subject: 'Confirmation de votre commande #{orderNumber} – Thuraya Al Maghribi',
    previewText: 'Merci pour votre commande chez Thuraya Al Maghribi ! Votre n° de commande est #{orderNumber}.',
    orderConfirmedTitle: 'Votre commande est confirmée ! ✨',
    orderConfirmedSubtitle: 'Merci de votre confiance. Notre équipe prépare votre commande avec le plus grand soin.',
    greeting: 'Bonjour {name},',
    orderNumberLabel: 'N° de commande',
    orderDateLabel: 'Date de commande',
    itemsSectionTitle: 'Détails des articles',
    productLabel: 'Article',
    sizeLabel: 'Taille',
    colorLabel: 'Couleur',
    qtyLabel: 'Qté',
    unitPriceLabel: 'Prix unit.',
    totalPriceLabel: 'Total',
    niqabBadge: 'Niqab assorti',
    subtotalLabel: 'Sous-total',
    shippingLabel: 'Frais de livraison',
    freeShipping: 'Gratuit',
    discountLabel: 'Remise',
    totalLabel: 'Total à payer',
    paymentMethodLabel: 'Mode de paiement',
    paymentMethodValue: 'Paiement à la livraison (Cash on Delivery)',
    deliveryInfoTitle: 'Informations de livraison',
    recipientLabel: 'Destinataire',
    phoneLabel: 'Téléphone',
    phone2Label: 'Téléphone 2',
    addressLabel: 'Adresse',
    cityLabel: 'Ville',
    regionLabel: 'Région',
    postalCodeLabel: 'Code postal',
    notesLabel: 'Notes de livraison',
    trackOrderBtn: 'Suivre ma commande',
    needHelpTitle: 'Besoin d\'aide ?',
    needHelpText: 'Notre service client est à votre disposition par WhatsApp ou e-mail.',
    footerThankYou: 'Merci d\'avoir choisi Thuraya Al Maghribi pour vos djellabas et tenues traditionnelles.',
    footerRights: 'Tous droits réservés © {year} Thuraya Al Maghribi.',
    currency: 'DH',
  },
  en: {
    storeName: 'Thuraya Al Maghribi',
    tagline: 'Authentic Moroccan Elegance',
    subject: 'Order Confirmation #{orderNumber} – Thuraya Al Maghribi',
    previewText: 'Thank you for your order with Thuraya Al Maghribi! Your order number is #{orderNumber}.',
    orderConfirmedTitle: 'Your Order is Confirmed! ✨',
    orderConfirmedSubtitle: 'Thank you for shopping with us. Our team is carefully preparing your package.',
    greeting: 'Hello {name},',
    orderNumberLabel: 'Order Number',
    orderDateLabel: 'Order Date',
    itemsSectionTitle: 'Order Items',
    productLabel: 'Item',
    sizeLabel: 'Size',
    colorLabel: 'Color',
    qtyLabel: 'Qty',
    unitPriceLabel: 'Unit Price',
    totalPriceLabel: 'Total',
    niqabBadge: 'Matching Niqab',
    subtotalLabel: 'Subtotal',
    shippingLabel: 'Shipping Cost',
    freeShipping: 'Free',
    discountLabel: 'Discount',
    totalLabel: 'Total Amount',
    paymentMethodLabel: 'Payment Method',
    paymentMethodValue: 'Cash on Delivery (COD)',
    deliveryInfoTitle: 'Delivery Information',
    recipientLabel: 'Recipient',
    phoneLabel: 'Phone Number',
    phone2Label: 'Secondary Phone',
    addressLabel: 'Address',
    cityLabel: 'City',
    regionLabel: 'Region',
    postalCodeLabel: 'Postal Code',
    notesLabel: 'Order Notes',
    trackOrderBtn: 'Track Your Order',
    needHelpTitle: 'Need Assistance?',
    needHelpText: 'Our customer support team is always here to assist you via WhatsApp or email.',
    footerThankYou: 'Thank you for choosing Thuraya Al Maghribi for authentic Moroccan fashion.',
    footerRights: 'All rights reserved © {year} Thuraya Al Maghribi.',
    currency: 'MAD',
  },
}
