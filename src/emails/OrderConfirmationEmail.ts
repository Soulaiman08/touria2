import type { Order, ProductSnapshot } from '@/types/order'
import { emailTranslations, type EmailTranslations } from './translations'

export interface OrderConfirmationEmailData {
  order: Order
  appUrl?: string
}

function escapeHtml(str: string | null | undefined): string {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function formatPriceLocalized(amount: number, currency: string, isRTL: boolean): string {
  const formatted = new Intl.NumberFormat(isRTL ? 'ar-MA' : 'fr-MA', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)

  return isRTL ? `${formatted} ${currency}` : `${formatted} ${currency}`
}

function formatDateLocalized(date: Date | string, locale: string): string {
  try {
    const d = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat(
      locale === 'ar' ? 'ar-MA' : locale === 'fr' ? 'fr-FR' : 'en-US',
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      },
    ).format(d)
  } catch {
    return String(date)
  }
}

function getLocalizedProductName(snapshot: ProductSnapshot, locale: string): string {
  if (locale === 'fr' && snapshot.nameFr) return snapshot.nameFr
  if (locale === 'en' && snapshot.nameEn) return snapshot.nameEn
  return snapshot.nameAr || snapshot.nameFr || snapshot.nameEn || 'منتج ثريا'
}

function getLocalizedColorName(snapshot: ProductSnapshot, locale: string): string {
  const color = snapshot.selectedColor
  if (!color) return ''
  if (locale === 'fr' && color.nameFr) return color.nameFr
  if (locale === 'en' && color.nameEn) return color.nameEn
  return color.nameAr || color.nameFr || color.nameEn || ''
}

export function renderOrderConfirmationEmail({ order, appUrl }: OrderConfirmationEmailData): {
  subject: string
  html: string
} {
  const locale = (order.locale || 'ar').toLowerCase()
  const isRTL = locale === 'ar'
  const t: EmailTranslations = emailTranslations[locale] || emailTranslations.ar
  const dir = isRTL ? 'rtl' : 'ltr'
  const textAlign = isRTL ? 'right' : 'left'
  const oppositeAlign = isRTL ? 'left' : 'right'

  const baseAppUrl = appUrl || process.env.NEXT_PUBLIC_APP_URL || 'https://thurayaalmaghribi.com'
  const trackingUrl = `${baseAppUrl.replace(/\/$/, '')}/${locale}/orders`

  const formattedDate = formatDateLocalized(order.createdAt || new Date(), locale)
  const currentYear = new Date().getFullYear().toString()

  const subject = t.subject.replace('{orderNumber}', order.orderNumber)
  const greetingText = t.greeting.replace('{name}', escapeHtml(order.customerName))

  // Render Order Items
  const itemsHtml = (order.items || [])
    .map((item) => {
      const snap = item.productSnapshot
      const productName = escapeHtml(getLocalizedProductName(snap, locale))
      const colorName = escapeHtml(getLocalizedColorName(snap, locale))
      const size = escapeHtml(snap?.selectedSize || '')
      const imageUrl = snap?.mainImage || ''
      const isNiqab = snap?.isNiqab ?? false
      const unitPriceFormatted = formatPriceLocalized(Number(item.unitPrice), t.currency, isRTL)
      const totalPriceFormatted = formatPriceLocalized(Number(item.totalPrice), t.currency, isRTL)

      const variantDetails: string[] = []
      if (size) variantDetails.push(`${t.sizeLabel}: <strong>${size}</strong>`)
      if (colorName) {
        const colorBullet = snap.selectedColor?.code
          ? `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background-color:${escapeHtml(snap.selectedColor.code)};border:1px solid #ccc;vertical-align:middle;margin-${isRTL ? 'left' : 'right'}:4px;"></span>`
          : ''
        variantDetails.push(`${t.colorLabel}: ${colorBullet}<strong>${colorName}</strong>`)
      }

      const niqabBadgeHtml = isNiqab
        ? `<span style="display:inline-block;padding:2px 8px;font-size:11px;font-weight:700;background-color:#FBF2EB;color:#C4622D;border-radius:4px;border:1px solid #F3DFC9;margin-${isRTL ? 'right' : 'left'}:6px;">${t.niqabBadge}</span>`
        : ''

      return `
        <tr style="border-bottom: 1px solid #F3F4F6;">
          <td style="padding: 16px 8px; vertical-align: top; width: 64px;">
            ${
              imageUrl
                ? `<img src="${escapeHtml(imageUrl)}" alt="${productName}" width="60" height="75" style="width: 60px; height: 75px; object-fit: cover; border-radius: 8px; border: 1px solid #E5E7EB; display: block;" />`
                : `<div style="width: 60px; height: 75px; background: #F3F4F6; border-radius: 8px; border: 1px solid #E5E7EB; text-align: center; line-height: 75px; color: #9CA3AF; font-size: 20px;">✦</div>`
            }
          </td>
          <td style="padding: 16px 12px; vertical-align: top; text-align: ${textAlign};">
            <div style="font-size: 14px; font-weight: 700; color: #1F2937; margin-bottom: 4px; line-height: 1.4;">
              ${productName} ${niqabBadgeHtml}
            </div>
            ${
              variantDetails.length > 0
                ? `<div style="font-size: 12px; color: #6B7280; margin-bottom: 6px; line-height: 1.5;">${variantDetails.join(' &nbsp;•&nbsp; ')}</div>`
                : ''
            }
            <div style="font-size: 12px; color: #9CA3AF;">
              ${t.qtyLabel}: <strong style="color: #374151;">${item.quantity}</strong> × ${unitPriceFormatted}
            </div>
          </td>
          <td style="padding: 16px 8px; vertical-align: top; text-align: ${oppositeAlign}; white-space: nowrap;">
            <div style="font-size: 14px; font-weight: 700; color: #C4622D;">
              ${totalPriceFormatted}
            </div>
          </td>
        </tr>
      `
    })
    .join('')

  const subtotalFormatted = formatPriceLocalized(Number(order.subtotal), t.currency, isRTL)
  const shippingFormatted =
    Number(order.shippingCost) > 0
      ? formatPriceLocalized(Number(order.shippingCost), t.currency, isRTL)
      : `<span style="color: #16A34A; font-weight: 700;">${t.freeShipping}</span>`
  const discountFormatted =
    Number(order.discountAmount) > 0
      ? `-${formatPriceLocalized(Number(order.discountAmount), t.currency, isRTL)}`
      : null
  const totalFormatted = formatPriceLocalized(Number(order.total), t.currency, isRTL)

  const html = `<!DOCTYPE html>
<html lang="${escapeHtml(locale)}" dir="${dir}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${escapeHtml(subject)}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #F8F9FA; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
  
  <!-- PREVIEW TEXT -->
  <div style="display: none; font-size: 1px; color: #F8F9FA; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${escapeHtml(t.previewText.replace('{orderNumber}', order.orderNumber))}
  </div>

  <!-- CONTAINER TABLE -->
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8F9FA; padding: 24px 12px;">
    <tr>
      <td align="center">
        <!-- INNER CONTAINER (600px MAX) -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); border: 1px solid #E5E7EB; direction: ${dir};">
          
          <!-- ── BRAND HEADER ── -->
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #1A1A1A 0%, #2D231E 100%); padding: 32px 24px; text-align: center; border-bottom: 3px solid #C4622D;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <div style="font-size: 22px; font-weight: 900; letter-spacing: 2px; color: #FFFFFF; text-transform: uppercase; margin-bottom: 4px;">
                      ${escapeHtml(t.storeName)}
                    </div>
                    <div style="font-size: 12px; color: #C4622D; letter-spacing: 1px; font-weight: 600;">
                      ✦ ${escapeHtml(t.tagline)} ✦
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── CONFIRMATION HERO BANNER ── -->
          <tr>
            <td style="padding: 28px 24px 20px; background-color: #FAF5F0; border-bottom: 1px solid #F0E5DB; text-align: ${textAlign};">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="text-align: ${textAlign};">
                    <div style="display: inline-block; padding: 4px 12px; background-color: #F3DFC9; color: #9A461A; border-radius: 20px; font-size: 12px; font-weight: 700; margin-bottom: 12px;">
                      ✓ ${escapeHtml(t.orderConfirmedTitle)}
                    </div>
                    <h1 style="margin: 0 0 8px; font-size: 18px; font-weight: 800; color: #1F2937; line-height: 1.3;">
                      ${greetingText}
                    </h1>
                    <p style="margin: 0; font-size: 13.5px; color: #6B7280; line-height: 1.6;">
                      ${escapeHtml(t.orderConfirmedSubtitle)}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── ORDER INFO CARD ── -->
          <tr>
            <td style="padding: 20px 24px 10px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F9FAFB; border-radius: 12px; border: 1px solid #E5E7EB; padding: 14px 16px;">
                <tr>
                  <td width="50%" style="vertical-align: top; text-align: ${textAlign}; padding: 4px 8px;">
                    <div style="font-size: 11px; font-weight: 600; color: #9CA3AF; text-transform: uppercase; margin-bottom: 4px;">
                      ${escapeHtml(t.orderNumberLabel)}
                    </div>
                    <div style="font-size: 15px; font-weight: 800; color: #C4622D; font-family: monospace, sans-serif;">
                      ${escapeHtml(order.orderNumber)}
                    </div>
                  </td>
                  <td width="50%" style="vertical-align: top; text-align: ${oppositeAlign}; padding: 4px 8px;">
                    <div style="font-size: 11px; font-weight: 600; color: #9CA3AF; text-transform: uppercase; margin-bottom: 4px;">
                      ${escapeHtml(t.orderDateLabel)}
                    </div>
                    <div style="font-size: 13px; font-weight: 700; color: #374151;">
                      ${escapeHtml(formattedDate)}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── ORDER ITEMS SECTION ── -->
          <tr>
            <td style="padding: 16px 24px 8px;">
              <div style="font-size: 15px; font-weight: 800; color: #1F2937; margin-bottom: 12px; text-align: ${textAlign}; border-bottom: 2px solid #F3F4F6; padding-bottom: 8px;">
                🛍️ ${escapeHtml(t.itemsSectionTitle)}
              </div>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                ${itemsHtml}
              </table>
            </td>
          </tr>

          <!-- ── FINANCIAL SUMMARY ── -->
          <tr>
            <td style="padding: 12px 24px 20px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FAF5F0; border-radius: 12px; border: 1px solid #F0E5DB; padding: 16px 20px;">
                <!-- Subtotal -->
                <tr>
                  <td style="padding: 4px 0; font-size: 13px; color: #6B7280; text-align: ${textAlign};">
                    ${escapeHtml(t.subtotalLabel)}
                  </td>
                  <td style="padding: 4px 0; font-size: 13px; font-weight: 600; color: #374151; text-align: ${oppositeAlign};">
                    ${subtotalFormatted}
                  </td>
                </tr>
                <!-- Shipping -->
                <tr>
                  <td style="padding: 4px 0; font-size: 13px; color: #6B7280; text-align: ${textAlign};">
                    ${escapeHtml(t.shippingLabel)}
                  </td>
                  <td style="padding: 4px 0; font-size: 13px; font-weight: 600; color: #374151; text-align: ${oppositeAlign};">
                    ${shippingFormatted}
                  </td>
                </tr>
                <!-- Discount (if any) -->
                ${
                  discountFormatted
                    ? `<tr>
                        <td style="padding: 4px 0; font-size: 13px; color: #16A34A; text-align: ${textAlign};">
                          ${escapeHtml(t.discountLabel)}
                        </td>
                        <td style="padding: 4px 0; font-size: 13px; font-weight: 700; color: #16A34A; text-align: ${oppositeAlign};">
                          ${discountFormatted}
                        </td>
                      </tr>`
                    : ''
                }
                <!-- Divider -->
                <tr>
                  <td colspan="2" style="padding: 8px 0;">
                    <div style="height: 1px; background-color: #E5D5C5; width: 100%;"></div>
                  </td>
                </tr>
                <!-- Grand Total -->
                <tr>
                  <td style="padding: 4px 0; font-size: 15px; font-weight: 800; color: #1F2937; text-align: ${textAlign};">
                    ${escapeHtml(t.totalLabel)}
                  </td>
                  <td style="padding: 4px 0; font-size: 18px; font-weight: 900; color: #C4622D; text-align: ${oppositeAlign};">
                    ${totalFormatted}
                  </td>
                </tr>
                <!-- Payment Method Badge -->
                <tr>
                  <td colspan="2" style="padding-top: 10px; text-align: ${textAlign};">
                    <div style="font-size: 11.5px; color: #78350F; background-color: #FEF3C7; border: 1px solid #FDE68A; padding: 6px 10px; border-radius: 6px; display: inline-block;">
                      💵 <strong>${escapeHtml(t.paymentMethodLabel)}:</strong> ${escapeHtml(t.paymentMethodValue)}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── DELIVERY DETAILS CARD ── -->
          <tr>
            <td style="padding: 0 24px 20px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FFFFFF; border-radius: 12px; border: 1px solid #E5E7EB; padding: 18px 20px;">
                <tr>
                  <td style="text-align: ${textAlign};">
                    <div style="font-size: 14px; font-weight: 800; color: #1F2937; margin-bottom: 12px; border-bottom: 1px solid #F3F4F6; padding-bottom: 8px;">
                      📍 ${escapeHtml(t.deliveryInfoTitle)}
                    </div>
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="padding: 3px 0; font-size: 13px; color: #6B7280; width: 110px; vertical-align: top; text-align: ${textAlign};">
                          ${escapeHtml(t.recipientLabel)}:
                        </td>
                        <td style="padding: 3px 0; font-size: 13px; font-weight: 700; color: #1F2937; text-align: ${textAlign};">
                          ${escapeHtml(order.customerName)}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 3px 0; font-size: 13px; color: #6B7280; vertical-align: top; text-align: ${textAlign};">
                          ${escapeHtml(t.phoneLabel)}:
                        </td>
                        <td style="padding: 3px 0; font-size: 13px; font-weight: 700; color: #1F2937; text-align: ${textAlign}; direction: ltr;">
                          ${escapeHtml(order.customerPhone)}
                        </td>
                      </tr>
                      ${
                        order.customerPhone2
                          ? `<tr>
                              <td style="padding: 3px 0; font-size: 13px; color: #6B7280; vertical-align: top; text-align: ${textAlign};">
                                ${escapeHtml(t.phone2Label)}:
                              </td>
                              <td style="padding: 3px 0; font-size: 13px; color: #374151; text-align: ${textAlign}; direction: ltr;">
                                ${escapeHtml(order.customerPhone2)}
                              </td>
                            </tr>`
                          : ''
                      }
                      <tr>
                        <td style="padding: 3px 0; font-size: 13px; color: #6B7280; vertical-align: top; text-align: ${textAlign};">
                          ${escapeHtml(t.cityLabel)} / ${escapeHtml(t.regionLabel)}:
                        </td>
                        <td style="padding: 3px 0; font-size: 13px; font-weight: 600; color: #1F2937; text-align: ${textAlign};">
                          ${escapeHtml(order.city)}${order.district ? ` (${escapeHtml(order.district)})` : ''}${order.region ? ` – ${escapeHtml(order.region)}` : ''}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 3px 0; font-size: 13px; color: #6B7280; vertical-align: top; text-align: ${textAlign};">
                          ${escapeHtml(t.addressLabel)}:
                        </td>
                        <td style="padding: 3px 0; font-size: 13px; color: #374151; text-align: ${textAlign};">
                          ${escapeHtml(order.address)}${order.postalCode ? ` (${escapeHtml(order.postalCode)})` : ''}
                        </td>
                      </tr>
                      ${
                        order.notes
                          ? `<tr>
                              <td style="padding: 3px 0; font-size: 13px; color: #6B7280; vertical-align: top; text-align: ${textAlign};">
                                ${escapeHtml(t.notesLabel)}:
                              </td>
                              <td style="padding: 3px 0; font-size: 13px; color: #6B7280; font-style: italic; text-align: ${textAlign};">
                                "${escapeHtml(order.notes)}"
                              </td>
                            </tr>`
                          : ''
                      }
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── TRACKING CTA BUTTON ── -->
          <tr>
            <td align="center" style="padding: 10px 24px 28px; text-align: center;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="border-radius: 12px; background: linear-gradient(90deg, #C4622D 0%, #D97B4A 100%); box-shadow: 0 4px 14px rgba(196, 98, 45, 0.3);">
                    <a href="${escapeHtml(trackingUrl)}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 14px; font-weight: 800; color: #FFFFFF; text-decoration: none; border-radius: 12px; text-align: center;">
                      🔍 ${escapeHtml(t.trackOrderBtn)}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── CUSTOMER CARE ASSISTANCE ── -->
          <tr>
            <td style="padding: 16px 24px; background-color: #FAF5F0; border-top: 1px solid #F0E5DB; text-align: center;">
              <div style="font-size: 13px; font-weight: 700; color: #1F2937; margin-bottom: 4px;">
                💬 ${escapeHtml(t.needHelpTitle)}
              </div>
              <div style="font-size: 12px; color: #6B7280; line-height: 1.5; max-width: 440px; margin: 0 auto;">
                ${escapeHtml(t.needHelpText)}
              </div>
            </td>
          </tr>

          <!-- ── FOOTER ── -->
          <tr>
            <td align="center" style="padding: 24px; background-color: #1A1A1A; text-align: center; color: #9CA3AF; font-size: 11.5px; line-height: 1.6;">
              <div style="font-size: 13px; font-weight: 800; color: #F3F4F6; margin-bottom: 6px;">
                ${escapeHtml(t.storeName)}
              </div>
              <div style="color: #9CA3AF; margin-bottom: 12px;">
                ${escapeHtml(t.footerThankYou)}
              </div>
              <div style="color: #6B7280; font-size: 11px;">
                ${escapeHtml(t.footerRights.replace('{year}', currentYear))}
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  return {
    subject,
    html,
  }
}
