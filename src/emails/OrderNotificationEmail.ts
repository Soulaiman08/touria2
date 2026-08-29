import type { Order, ProductSnapshot } from '@/types/order'

export interface OrderNotificationEmailData {
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

function formatPrice(amount: number): string {
  const formatted = new Intl.NumberFormat('ar-MA', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
  return `${formatted} د.م.`
}

function formatDate(date: Date | string): string {
  try {
    const d = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat('ar-MA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Africa/Casablanca',
    }).format(d)
  } catch {
    return String(date)
  }
}

function getProductName(snapshot: ProductSnapshot): string {
  return snapshot.nameAr || snapshot.nameFr || snapshot.nameEn || 'منتج ثريا'
}

function getColorName(snapshot: ProductSnapshot): string {
  const color = snapshot.selectedColor
  if (!color) return ''
  return color.nameAr || color.nameFr || color.nameEn || ''
}

export function renderOrderNotificationEmail({ order, appUrl }: OrderNotificationEmailData): {
  subject: string
  html: string
} {
  const baseAppUrl = appUrl || process.env.NEXT_PUBLIC_APP_URL || 'https://thurayaalmaghribi.com'
  const cleanAppUrl = baseAppUrl.replace(/\/$/, '')
  const dashboardOrderUrl = `${cleanAppUrl}/control-panel-ss7/orders/${order.id}`

  const formattedDate = formatDate(order.createdAt || new Date())
  const currentYear = new Date().getFullYear().toString()
  const totalFormatted = formatPrice(Number(order.total))
  const subtotalFormatted = formatPrice(Number(order.subtotal))
  const shippingFormatted =
    Number(order.shippingCost) > 0
      ? formatPrice(Number(order.shippingCost))
      : `<span style="color: #16A34A; font-weight: 700;">مجاني</span>`
  const discountFormatted =
    Number(order.discountAmount) > 0
      ? `-${formatPrice(Number(order.discountAmount))}`
      : null

  const subject = `🔔 طلب جديد #${order.orderNumber} – ${order.customerName} (${totalFormatted})`

  // Render Order Items
  const itemsHtml = (order.items || [])
    .map((item, index) => {
      const snap = item.productSnapshot
      const productName = escapeHtml(getProductName(snap))
      const colorName = escapeHtml(getColorName(snap))
      const size = escapeHtml(snap?.selectedSize || '')
      const imageUrl = snap?.mainImage || ''
      const isNiqab = snap?.isNiqab ?? false
      const unitPriceFormatted = formatPrice(Number(item.unitPrice))
      const totalPriceFormatted = formatPrice(Number(item.totalPrice))

      const variantDetails: string[] = []
      if (size) variantDetails.push(`المقاس: <strong style="color:#111827;">${size}</strong>`)
      if (colorName) {
        const colorBullet = snap.selectedColor?.code
          ? `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background-color:${escapeHtml(snap.selectedColor.code)};border:1px solid #ccc;vertical-align:middle;margin-left:4px;"></span>`
          : ''
        variantDetails.push(`اللون: ${colorBullet}<strong style="color:#111827;">${colorName}</strong>`)
      }

      const niqabBadgeHtml = isNiqab
        ? `<span style="display:inline-block;padding:2px 8px;font-size:11px;font-weight:700;background-color:#FBF2EB;color:#C4622D;border-radius:4px;border:1px solid #F3DFC9;margin-right:6px;">نقاب إضافي</span>`
        : ''

      // Attached niqabs array if exists in snapshot
      const attachedNiqabsHtml = (snap?.niqabs && snap.niqabs.length > 0)
        ? `<div style="margin-top: 8px; padding: 6px 10px; background-color: #FDF8F3; border-radius: 6px; border: 1px dashed #E5D5C5; font-size: 11.5px; color: #78350F;">
            <div style="font-weight: 700; margin-bottom: 2px;">✦ نقاب مرفق:</div>
            ${snap.niqabs.map(n => `<div>• ${escapeHtml(n.nameAr || n.nameFr || 'نقاب')} (الكمية: ${n.quantity} × ${formatPrice(Number(n.unitPrice))}) ${n.color?.nameAr ? `— لون: ${escapeHtml(n.color.nameAr)}` : ''}</div>`).join('')}
          </div>`
        : ''

      return `
        <tr style="border-bottom: 1px solid #E5E7EB; background-color: ${index % 2 === 0 ? '#FFFFFF' : '#F9FAFB'};">
          <td style="padding: 14px 10px; vertical-align: top; width: 60px;">
            ${
              imageUrl
                ? `<img src="${escapeHtml(imageUrl)}" alt="${productName}" width="56" height="70" style="width: 56px; height: 70px; object-fit: cover; border-radius: 6px; border: 1px solid #E5E7EB; display: block;" />`
                : `<div style="width: 56px; height: 70px; background: #F3F4F6; border-radius: 6px; border: 1px solid #E5E7EB; text-align: center; line-height: 70px; color: #9CA3AF; font-size: 18px;">✦</div>`
            }
          </td>
          <td style="padding: 14px 12px; vertical-align: top; text-align: right;">
            <div style="font-size: 14px; font-weight: 700; color: #111827; margin-bottom: 4px; line-height: 1.4;">
              ${productName} ${niqabBadgeHtml}
            </div>
            ${
              variantDetails.length > 0
                ? `<div style="font-size: 12px; color: #4B5563; margin-bottom: 4px; line-height: 1.5;">${variantDetails.join(' &nbsp;•&nbsp; ')}</div>`
                : ''
            }
            <div style="font-size: 12px; color: #6B7280;">
              الكمية: <strong style="color: #111827; font-size: 13px;">${item.quantity}</strong> &nbsp;×&nbsp; ${unitPriceFormatted}
            </div>
            ${attachedNiqabsHtml}
          </td>
          <td style="padding: 14px 10px; vertical-align: top; text-align: left; white-space: nowrap;">
            <div style="font-size: 14px; font-weight: 800; color: #C4622D;">
              ${totalPriceFormatted}
            </div>
          </td>
        </tr>
      `
    })
    .join('')

  const customerPhone = escapeHtml(order.customerPhone)
  const customerPhone2 = order.customerPhone2 ? escapeHtml(order.customerPhone2) : null
  const customerEmail = order.customerEmail ? escapeHtml(order.customerEmail) : null
  const region = escapeHtml(order.region || '')
  const city = escapeHtml(order.city || '')
  const district = order.district ? escapeHtml(order.district) : null
  const address = escapeHtml(order.address || '')
  const postalCode = order.postalCode ? escapeHtml(order.postalCode) : null
  const notes = order.notes ? escapeHtml(order.notes) : null
  const paymentMethodLabel = order.paymentMethod === 'COD' || !order.paymentMethod ? 'الدفع نقداً عند الاستلام (COD)' : escapeHtml(order.paymentMethod)

  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #F3F4F6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; direction: rtl; text-align: right;">
  
  <!-- PREVIEW TEXT -->
  <div style="display: none; font-size: 1px; color: #F3F4F6; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    إشعار طلب جديد #${escapeHtml(order.orderNumber)} من ${escapeHtml(order.customerName)} بمبلغ ${escapeHtml(totalFormatted)}.
  </div>

  <!-- CONTAINER TABLE -->
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F3F4F6; padding: 24px 12px; direction: rtl;">
    <tr>
      <td align="center">
        <!-- INNER CONTAINER (640px MAX) -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 640px; background-color: #FFFFFF; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); border: 1px solid #E5E7EB; direction: rtl;">
          
          <!-- ── ADMIN HEADER ── -->
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #111827 0%, #1F2937 100%); padding: 28px 24px; text-align: center; border-bottom: 4px solid #C4622D;">
              <div style="display: inline-block; padding: 5px 14px; background-color: rgba(196, 98, 45, 0.2); color: #FDBA74; border-radius: 20px; font-size: 12px; font-weight: 700; margin-bottom: 8px; border: 1px solid rgba(196, 98, 45, 0.4);">
                🔔 إشعار إداري فوري
              </div>
              <div style="font-size: 20px; font-weight: 900; color: #FFFFFF; letter-spacing: 0.5px; margin-bottom: 4px;">
                تم استلام طلب جديد بنجاح!
              </div>
              <div style="font-size: 13px; color: #9CA3AF;">
                متجر ثريا المغربي — لوحة التحكم
              </div>
            </td>
          </tr>

          <!-- ── QUICK SUMMARY BAR ── -->
          <tr>
            <td style="padding: 20px 24px 10px; background-color: #F9FAFB; border-bottom: 1px solid #E5E7EB;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td width="33%" style="text-align: right; vertical-align: top; padding: 4px 8px;">
                    <div style="font-size: 11px; font-weight: 600; color: #6B7280; text-transform: uppercase;">رقم الطلب</div>
                    <div style="font-size: 16px; font-weight: 800; color: #C4622D; font-family: monospace, sans-serif; margin-top: 2px;">
                      #${escapeHtml(order.orderNumber)}
                    </div>
                  </td>
                  <td width="33%" style="text-align: center; vertical-align: top; padding: 4px 8px;">
                    <div style="font-size: 11px; font-weight: 600; color: #6B7280; text-transform: uppercase;">تاريخ الطلب</div>
                    <div style="font-size: 12.5px; font-weight: 700; color: #111827; margin-top: 2px;">
                      ${escapeHtml(formattedDate)}
                    </div>
                  </td>
                  <td width="33%" style="text-align: left; vertical-align: top; padding: 4px 8px;">
                    <div style="font-size: 11px; font-weight: 600; color: #6B7280; text-transform: uppercase;">المبلغ الإجمالي</div>
                    <div style="font-size: 16px; font-weight: 900; color: #16A34A; margin-top: 2px;">
                      ${totalFormatted}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── CTA DIRECT TO DASHBOARD ── -->
          <tr>
            <td style="padding: 16px 24px; background-color: #FEF3C7; border-bottom: 1px solid #FDE68A; text-align: center;">
              <a href="${escapeHtml(dashboardOrderUrl)}" target="_blank" style="display: inline-block; padding: 12px 28px; font-size: 14px; font-weight: 800; color: #FFFFFF; background: linear-gradient(90deg, #C4622D 0%, #B24F1F 100%); text-decoration: none; border-radius: 8px; box-shadow: 0 2px 8px rgba(196, 98, 45, 0.35);">
                🔗 فتح تفاصيل الطلب في لوحة التحكم
              </a>
            </td>
          </tr>

          <!-- ── CUSTOMER & SHIPPING DETAILS ── -->
          <tr>
            <td style="padding: 24px 24px 12px;">
              <div style="font-size: 15px; font-weight: 800; color: #111827; margin-bottom: 12px; border-bottom: 2px solid #E5E7EB; padding-bottom: 6px;">
                👤 بيانات العميل والتوصيل
              </div>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F9FAFB; border-radius: 10px; border: 1px solid #E5E7EB; padding: 14px 16px;">
                <tr>
                  <td style="padding: 5px 0; font-size: 13px; color: #4B5563; width: 130px; font-weight: 600;">اسم العميل:</td>
                  <td style="padding: 5px 0; font-size: 14px; font-weight: 800; color: #111827;">${escapeHtml(order.customerName)}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; font-size: 13px; color: #4B5563; font-weight: 600;">رقم الهاتف:</td>
                  <td style="padding: 5px 0; font-size: 14px; font-weight: 700; color: #111827; direction: ltr; text-align: right;">
                    <a href="tel:${customerPhone}" style="color: #C4622D; text-decoration: none;">${customerPhone}</a>
                    <span style="font-size: 12px; margin-right: 8px; color: #6B7280;">(واتساب: <a href="https://wa.me/${customerPhone.replace(/[^0-9]/g, '')}" target="_blank" style="color: #16A34A; text-decoration: underline;">مراسلة</a>)</span>
                  </td>
                </tr>
                ${
                  customerPhone2
                    ? `<tr>
                        <td style="padding: 5px 0; font-size: 13px; color: #4B5563; font-weight: 600;">الهاتف الإضافي:</td>
                        <td style="padding: 5px 0; font-size: 13.5px; color: #111827; direction: ltr; text-align: right;">
                          <a href="tel:${customerPhone2}" style="color: #4B5563; text-decoration: none;">${customerPhone2}</a>
                        </td>
                      </tr>`
                    : ''
                }
                <tr>
                  <td style="padding: 5px 0; font-size: 13px; color: #4B5563; font-weight: 600;">البريد الإلكتروني:</td>
                  <td style="padding: 5px 0; font-size: 13.5px; color: #111827;">
                    ${customerEmail ? `<a href="mailto:${customerEmail}" style="color: #2563EB; text-decoration: none;">${customerEmail}</a>` : '<span style="color: #9CA3AF;">غير محدد (طلب عبر الهاتف/الواتساب)</span>'}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; font-size: 13px; color: #4B5563; font-weight: 600;">الجهة / المنطقة:</td>
                  <td style="padding: 5px 0; font-size: 13.5px; font-weight: 700; color: #111827;">${region || 'غير محدد'}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; font-size: 13px; color: #4B5563; font-weight: 600;">المدينة:</td>
                  <td style="padding: 5px 0; font-size: 13.5px; font-weight: 700; color: #111827;">${city}</td>
                </tr>
                ${
                  district
                    ? `<tr>
                        <td style="padding: 5px 0; font-size: 13px; color: #4B5563; font-weight: 600;">الحي / المنطقة الفرعية:</td>
                        <td style="padding: 5px 0; font-size: 13.5px; color: #111827;">${district}</td>
                      </tr>`
                    : ''
                }
                <tr>
                  <td style="padding: 5px 0; font-size: 13px; color: #4B5563; font-weight: 600; vertical-align: top;">العنوان بالتفصيل:</td>
                  <td style="padding: 5px 0; font-size: 13.5px; color: #111827; line-height: 1.5;">${address}</td>
                </tr>
                ${
                  postalCode
                    ? `<tr>
                        <td style="padding: 5px 0; font-size: 13px; color: #4B5563; font-weight: 600;">الرمز البريدي:</td>
                        <td style="padding: 5px 0; font-size: 13.5px; color: #111827;">${postalCode}</td>
                      </tr>`
                    : ''
                }
                ${
                  notes
                    ? `<tr>
                        <td style="padding: 5px 0; font-size: 13px; color: #C4622D; font-weight: 700; vertical-align: top;">ملاحظات العميل:</td>
                        <td style="padding: 5px 0; font-size: 13.5px; color: #9A461A; font-style: italic; background-color: #FEF3C7; border-radius: 4px; padding: 6px 10px;">"${notes}"</td>
                      </tr>`
                    : ''
                }
              </table>
            </td>
          </tr>

          <!-- ── ORDER ITEMS TABLE ── -->
          <tr>
            <td style="padding: 16px 24px 8px;">
              <div style="font-size: 15px; font-weight: 800; color: #111827; margin-bottom: 12px; border-bottom: 2px solid #E5E7EB; padding-bottom: 6px;">
                📦 تفاصيل المنتجات المطلوبة (${order.items?.length || 0})
              </div>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #111827; color: #FFFFFF;">
                    <th style="padding: 10px; font-size: 12px; font-weight: 700; text-align: right; width: 60px;">الصورة</th>
                    <th style="padding: 10px 12px; font-size: 12px; font-weight: 700; text-align: right;">المنتج والمواصفات</th>
                    <th style="padding: 10px; font-size: 12px; font-weight: 700; text-align: left; width: 90px;">الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- ── FINANCIAL BREAKDOWN ── -->
          <tr>
            <td style="padding: 16px 24px 24px;">
              <div style="font-size: 15px; font-weight: 800; color: #111827; margin-bottom: 12px; border-bottom: 2px solid #E5E7EB; padding-bottom: 6px;">
                💰 ملخص الحساب
              </div>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FAF5F0; border-radius: 10px; border: 1px solid #F0E5DB; padding: 16px 20px;">
                <tr>
                  <td style="padding: 4px 0; font-size: 13px; color: #6B7280; text-align: right;">المجموع الفرعي (المنتجات):</td>
                  <td style="padding: 4px 0; font-size: 13.5px; font-weight: 700; color: #374151; text-align: left;">${subtotalFormatted}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-size: 13px; color: #6B7280; text-align: right;">رسوم الشحن والتوصيل:</td>
                  <td style="padding: 4px 0; font-size: 13.5px; font-weight: 700; color: #374151; text-align: left;">${shippingFormatted}</td>
                </tr>
                ${
                  discountFormatted
                    ? `<tr>
                        <td style="padding: 4px 0; font-size: 13px; color: #16A34A; text-align: right;">الخصم المطبق:</td>
                        <td style="padding: 4px 0; font-size: 13.5px; font-weight: 700; color: #16A34A; text-align: left;">${discountFormatted}</td>
                      </tr>`
                    : ''
                }
                <tr>
                  <td colspan="2" style="padding: 8px 0;">
                    <div style="height: 1px; background-color: #E5D5C5; width: 100%;"></div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-size: 15px; font-weight: 800; color: #111827; text-align: right;">المبلغ الإجمالي المطلوب تحصيله:</td>
                  <td style="padding: 4px 0; font-size: 18px; font-weight: 900; color: #C4622D; text-align: left;">${totalFormatted}</td>
                </tr>
                <tr>
                  <td colspan="2" style="padding-top: 10px; text-align: right;">
                    <div style="font-size: 12px; color: #78350F; background-color: #FEF3C7; border: 1px solid #FDE68A; padding: 6px 12px; border-radius: 6px; display: inline-block;">
                      💵 <strong>طريقة الدفع:</strong> ${paymentMethodLabel}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── FOOTER ── -->
          <tr>
            <td align="center" style="padding: 20px 24px; background-color: #111827; text-align: center; color: #9CA3AF; font-size: 11.5px; line-height: 1.6;">
              <div style="font-size: 13px; font-weight: 800; color: #F3F4F6; margin-bottom: 4px;">
                لوحة تحكم ثريا المغربي
              </div>
              <div style="color: #6B7280; font-size: 11px;">
                هذا البريد تم إرساله تلقائياً إلى إدارة المتجر عند تأكيد الطلب © ${escapeHtml(currentYear)}
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
