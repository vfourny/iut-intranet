// Identifiants des outlets de l'en-tête de page, partagés entre `PageHeader`
// (qui pose les `id`) et les pages (qui y téléportent leur contenu). Source
// unique pour éviter une chaîne magique désynchronisée entre les deux côtés.
export const PageHeaderOutlet = {
  actions: 'page-header-actions',
  subtitle: 'page-header-subtitle',
} as const

// Sélecteurs CSS dérivés, prêts pour `<Teleport :to>`.
export const pageHeaderSelector = {
  actions: `#${PageHeaderOutlet.actions}`,
  subtitle: `#${PageHeaderOutlet.subtitle}`,
} as const
