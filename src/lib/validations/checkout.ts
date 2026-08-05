import { z } from 'zod'
import { isValidMoroccanPhone } from '@/lib/utils'

export const checkoutSchema = z.object({
  customerName: z
    .string()
    .min(2, 'الاسم يجب أن يكون على الأقل حرفين')
    .max(100, 'الاسم طويل جداً')
    .trim(),

  customerPhone: z
    .string()
    .min(1, 'رقم الهاتف مطلوب')
    .refine(isValidMoroccanPhone, {
      message: 'رقم الهاتف غير صحيح (مثال: 0612345678)',
    }),

  customerPhone2: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === '' || isValidMoroccanPhone(val),
      { message: 'رقم الهاتف الإضافي غير صحيح' },
    ),

  customerEmail: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === '' || z.string().email().safeParse(val).success,
      { message: 'البريد الإلكتروني غير صحيح' },
    ),

  city: z.string().min(1, 'يرجى اختيار المدينة'),

  district: z.string().optional(),

  address: z
    .string()
    .min(5, 'العنوان يجب أن يكون على الأقل 5 أحرف')
    .max(500, 'العنوان طويل جداً')
    .trim(),

  postalCode: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === '' || /^\d{5}$/.test(val),
      { message: 'الرمز البريدي يجب أن يكون 5 أرقام' },
    ),

  notes: z.string().max(500, 'الملاحظات طويلة جداً').optional(),
})

export type CheckoutFormValues = z.infer<typeof checkoutSchema>
