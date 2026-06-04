/**
 * Converts a string to kebab-case: camelCase boundaries become hyphens,
 * whitespace and underscores collapse to single hyphens, and the result is
 * lowercased (e.g. `My Cover_Image` → `my-cover-image`).
 * @param {string} value - Raw string to convert
 * @returns {string} Kebab-cased string
 */
export const toKebabCase = (value: string): string =>
  value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
