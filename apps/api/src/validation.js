export function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export function validateRequiredStrings(body, fields, issues) {
  for (const [field, { min = 1, max, pattern }] of Object.entries(fields)) {
    const value = body?.[field]
    if (typeof value !== 'string' || value.trim().length < min || value.length > max) {
      issues.push({ field, message: `Must be a string between ${min} and ${max} characters` })
      continue
    }
    if (pattern && !pattern.test(value)) issues.push({ field, message: 'Has an invalid format' })
  }
}

export function validateOptionalString(body, field, max, issues) {
  const value = body?.[field]
  if (value !== undefined && value !== null && (typeof value !== 'string' || value.length > max)) {
    issues.push({ field, message: `Must be a string of at most ${max} characters` })
  }
}

export function validatePositiveInteger(value) {
  return Number.isSafeInteger(value) && value > 0 && value <= 4_294_967_295
}

export function validateNonnegativeInteger(value) {
  return Number.isSafeInteger(value) && value >= 0 && value <= 4_294_967_295
}

export function validateMoney(value) {
  return Number.isSafeInteger(value) && value >= 0 && value <= 999_999_999_999_999
}

export function bodyIssues(validator) {
  return (body) => {
    const issues = []
    if (!isRecord(body)) return [{ field: 'body', message: 'Must be a JSON object' }]
    validator(body, issues)
    return issues
  }
}
