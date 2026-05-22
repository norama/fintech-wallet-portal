import { jsonError, jsonValidationError } from '@/lib/api/responses'
import {
  deleteSignInChallenge,
  findActiveUserById,
  findValidSignInChallenge,
  toBasicUserInfo,
} from '@/lib/auth/demoAuth'
import { setDemoSessionCookie } from '@/lib/auth/demoSession'
import { verifyCodeSchema } from '@/lib/validation/authSchemas'

const DEMO_VERIFICATION_CODE = '123456'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsedBody = verifyCodeSchema.safeParse(body)

  if (!parsedBody.success) {
    return jsonValidationError(parsedBody.error)
  }

  try {
    const challenge = await findValidSignInChallenge(parsedBody.data.challengeId)

    if (!challenge) {
      return jsonError(400, 'INVALID_CHALLENGE', 'Challenge ID is invalid')
    }

    if (parsedBody.data.code !== DEMO_VERIFICATION_CODE) {
      return jsonError(401, 'INVALID_CODE', 'Verification code is incorrect')
    }

    const userId = challenge.user_id
    const user = await findActiveUserById(userId)

    if (!user) {
      return jsonError(404, 'USER_NOT_FOUND', 'No active user was found for this challenge')
    }

    await deleteSignInChallenge(challenge.id)

    await setDemoSessionCookie(userId)

    return Response.json({
      user: toBasicUserInfo(user),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to verify code'
    return jsonError(500, 'VERIFY_CODE_FAILED', message)
  }
}
