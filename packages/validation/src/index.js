export const validateRequest = (schema, input) => schema.parse(input)

export const formatValidationError = (error) =>
  error.issues.map((issue) => ({
    path: issue.path,
    code: issue.code,
    message: issue.message,
  }))
