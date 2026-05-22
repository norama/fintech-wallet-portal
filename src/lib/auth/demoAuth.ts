import 'server-only'

import type { AppUserRow, SignInChallengeRow } from '@/lib/supabase/database.types'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export type BasicUserInfo = {
  id: string
  email: string | null
  companyId: string | null
  fullName: string | null
  role: string | null
}

function isActiveUser(user: AppUserRow) {
  return user.status === 'active'
}

export function getUserId(user: AppUserRow) {
  return user.id
}

export function toBasicUserInfo(user: AppUserRow): BasicUserInfo {
  const id = getUserId(user)

  return {
    id,
    email: user.email,
    companyId: user.company_id,
    fullName: user.full_name,
    role: user.role,
  }
}

export async function findActiveUserByEmail(email: string): Promise<AppUserRow | null> {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from('app_users')
    .select('*')
    .ilike('email', email)
    .limit(1)
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to load app user by email: ${error.message}`)
  }

  if (!data || !isActiveUser(data)) {
    return null
  }

  return data
}

export async function findActiveUserById(userId: string): Promise<AppUserRow | null> {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from('app_users')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to load app user by id: ${error.message}`)
  }

  if (!data || !isActiveUser(data)) {
    return null
  }

  return data
}

export async function createSignInChallenge(userId: string): Promise<SignInChallengeRow> {
  const supabase = createSupabaseServerClient()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('sign_in_challenges')
    .insert({
      user_id: userId,
      method: 'mobile_app_code',
      expires_at: expiresAt,
    })
    .select('id, user_id, method, expires_at, consumed_at, attempts, created_at')
    .single()

  if (error) {
    throw new Error(`Failed to create sign-in challenge: ${error.message}`)
  }

  return data
}

export async function findValidSignInChallenge(
  challengeId: string,
): Promise<SignInChallengeRow | null> {
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from('sign_in_challenges')
    .select('id, user_id, method, expires_at, consumed_at, attempts, created_at')
    .eq('id', challengeId)
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to load sign-in challenge: ${error.message}`)
  }

  if (!data) {
    return null
  }

  const challenge = data

  if (challenge.method !== 'mobile_app_code') {
    return null
  }

  if (challenge.consumed_at) {
    return null
  }

  if (new Date(challenge.expires_at).getTime() <= Date.now()) {
    return null
  }

  return challenge
}

export async function deleteSignInChallenge(challengeId: string) {
  const supabase = createSupabaseServerClient()
  const { error } = await supabase.from('sign_in_challenges').delete().eq('id', challengeId)

  if (error) {
    throw new Error(`Failed to delete sign-in challenge: ${error.message}`)
  }
}
