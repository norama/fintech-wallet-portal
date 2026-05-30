import { jsonError } from '@/lib/api/responses'
import { findActiveUserById, toBasicUserInfo } from '@/lib/auth/demoAuth'
import { readDemoSessionUserId } from '@/lib/auth/demoSession'

export const dynamic = 'force-dynamic'

export async function GET() {
  const sessionUserId = await readDemoSessionUserId()

  if (!sessionUserId) {
    return jsonError(401, 'UNAUTHORIZED', 'Not signed in')
  }

  const user = await findActiveUserById(sessionUserId)

  if (!user) {
    return jsonError(401, 'UNAUTHORIZED', 'Session no longer valid')
  }

  return Response.json(toBasicUserInfo(user))
}
