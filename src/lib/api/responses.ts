import { ZodError } from 'zod'

type ApiErrorBody = {
  error: {
    code: string
    message: string
  }
}

export function jsonError(status: number, code: string, message: string) {
  const body: ApiErrorBody = {
    error: {
      code,
      message,
    },
  }

  return Response.json(body, { status })
}

export function jsonValidationError(error: ZodError) {
  const issue = error.issues[0]

  return jsonError(400, 'VALIDATION_ERROR', issue?.message ?? 'Invalid request body')
}

function camelizeSegment(segment: string) {
  return segment.replace(/_([a-z])/g, (_, character: string) => character.toUpperCase())
}

export function toCamelCaseDeep(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(toCamelCaseDeep)
  }

  if (value && typeof value === 'object' && value.constructor === Object) {
    return Object.entries(value as Record<string, unknown>).reduce<Record<string, unknown>>(
      (result, [key, nestedValue]) => {
        result[camelizeSegment(key)] = toCamelCaseDeep(nestedValue)
        return result
      },
      {},
    )
  }

  return value
}
