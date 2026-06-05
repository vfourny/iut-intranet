/**
 * Person/place name pattern: letters (incl. Latin-1 accented), with single space, hyphen or apostrophe between groups.
 */
export const NAME_PATTERN_REGEX = /^[a-zA-ZÀ-ÿ]+([ \-'][a-zA-ZÀ-ÿ]+)*$/

/**
 * Strong password pattern: ≥8 chars with at least one lowercase, uppercase, digit and special char (`@$!%*?&`).
 */
export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
