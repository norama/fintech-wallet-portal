import { jsonError, jsonValidationError } from '@/lib/api/responses'
import {
  createSignInChallenge,
  findActiveUserByEmail,
  getUserId,
  toBasicUserInfo,
} from '@/lib/auth/demoAuth'
import { startSignInSchema } from '@/lib/validation/authSchemas'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsedBody = startSignInSchema.safeParse(body)

  if (!parsedBody.success) {
    return jsonValidationError(parsedBody.error)
  }

  try {
    const user = await findActiveUserByEmail(parsedBody.data.email)

    if (!user) {
      return jsonError(404, 'USER_NOT_FOUND', 'No active user was found for that email address')
    }

    const userId = getUserId(user)

    if (!userId) {
      return jsonError(500, 'INVALID_USER', 'The matched user record is missing an id')
    }

    const challenge = await createSignInChallenge(userId)

    return Response.json({
      challengeId: challenge.id,
      user: toBasicUserInfo(user),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to start sign-in'
    return jsonError(500, 'SIGN_IN_START_FAILED', message)
  }
}
