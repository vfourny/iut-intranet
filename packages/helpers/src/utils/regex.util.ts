export const NAME_PATTERN_REGEX = /^[a-zA-ZÀ-ÿ]+([ \-'][a-zA-ZÀ-ÿ]+)*$/
export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
