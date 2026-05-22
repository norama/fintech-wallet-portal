import { jsonError } from '@/lib/api/responses'
import { clearDemoSessionCookie } from '@/lib/auth/demoSession'

export async function POST() {
  try {
    await clearDemoSessionCookie()

    return Response.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to sign out'
    return jsonError(500, 'SIGN_OUT_FAILED', message)
  }
}
