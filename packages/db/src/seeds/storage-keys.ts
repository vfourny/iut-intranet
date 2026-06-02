/**
 * Conventions de clés S3 pour les objets seedés (avatars, couvertures).
 *
 * `db:seed` n'écrit QUE ces clés (de simples chaînes) dans les colonnes
 * concernées — il ne pousse aucun octet dans le bucket et ne dépend donc pas de
 * MinIO. C'est `provider:seed` (package `providers`) qui, dans un second temps,
 * relit ces clés en base et uploade les images correspondantes. Deux commandes
 * distinctes et ordonnées : `db:seed` puis `provider:seed`.
 *
 * Clés déterministes (pas de `randomUUID`) pour qu'un re-seed cible les mêmes
 * objets au lieu d'en empiler.
 */

const AVATAR_PREFIX = 'avatars/seed'
const COVER_PREFIX = 'covers'

export const avatarKey = (slug: string): string =>
  `${AVATAR_PREFIX}/${slug}.png`

export const coverKey = (slug: string): string => `${COVER_PREFIX}/${slug}.jpg`
