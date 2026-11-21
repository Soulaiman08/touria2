import { AdminLoginClient } from '@/components/admin/login/AdminLoginClient'
import { isDevPreviewAuthBypassEnabled } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default function AdminLoginPage() {
  return <AdminLoginClient devPreviewEnabled={isDevPreviewAuthBypassEnabled()} />
}
