import { fakerFR as faker } from '@faker-js/faker'

import type { Prisma } from '@/generated/client'

/**
 * Seed fixé : les textes décoratifs générés (titres, descriptions, contenus)
 * sont identiques à chaque `db:reset`, tant que l'ordre des appels ne change pas.
 * Seuls les champs « cosmétiques » passent par faker ; tout ce qui porte du sens
 * métier (emails, rôles, dates, statuts, chevauchements…) reste écrit en dur.
 *
 * Note : `faker.lorem.*` ne génère que du latin, on compose donc nos propres
 * fragments français pour un rendu crédible côté IUT.
 */
faker.seed(20260602)

const pick = <T>(values: readonly T[]): T => faker.helpers.arrayElement(values)

const EVENT_KINDS = [
  'Réunion',
  'Conseil',
  'Atelier',
  'Séminaire',
  'Conférence',
  'Forum',
  'Journée',
  'Comité',
  'Restitution',
] as const

const EVENT_THEMES = [
  'de coordination pédagogique',
  "d'orientation",
  'des projets tuteurés',
  "de l'alternance",
  'de la vie étudiante',
  "d'information",
  'qualité',
  "d'insertion professionnelle",
  'de département',
] as const

const ARTICLE_PREFIXES = [
  'Bilan',
  'Point',
  'Retour',
  'Focus',
  'Zoom',
  'Actualité',
  'Information',
] as const

const ARTICLE_TOPICS = [
  'sur la vie étudiante',
  "sur l'insertion professionnelle",
  'sur les projets tuteurés',
  'sur la mobilité internationale',
  "sur l'alternance",
  'sur la rentrée',
  'sur le numérique pédagogique',
  'sur la recherche appliquée',
] as const

const SENTENCE_OPENERS = [
  'Dans le cadre de',
  'À la suite de',
  'En vue de',
  'Pour accompagner',
  'Afin de préparer',
] as const

// Tous commencent par « la » / « l' » pour rester corrects après un ouvreur
// terminant par « de » (évite le « de le » au lieu de « du »).
const SENTENCE_SUBJECTS = [
  'la prochaine session',
  "l'accueil des nouveaux étudiants",
  'la feuille de route du département',
  'la semaine thématique',
  'la campagne de stages',
  'la rencontre avec les entreprises',
] as const

const SENTENCE_PREDICATES = [
  'une présentation est organisée',
  'les équipes se mobilisent',
  'plusieurs ateliers sont proposés',
  'un accompagnement est mis en place',
  'les inscriptions sont ouvertes',
  'le programme a été actualisé',
] as const

const SENTENCE_COMPLEMENTS = [
  'pour tous les étudiants concernés.',
  'avec le soutien de la direction.',
  'sur le site du département.',
  'dès la semaine prochaine.',
  'en lien avec nos partenaires.',
  'à destination des enseignants.',
] as const

const EVENT_LOCATIONS = [
  'Amphi A',
  'Amphi B',
  'Salle 101',
  'Salle 204',
  'Salle 303',
  'Foyer étudiant',
  'Hall principal',
  'Salle de réunion direction',
] as const

const frSentence = (): string =>
  `${pick(SENTENCE_OPENERS)} ${pick(SENTENCE_SUBJECTS)}, ${pick(SENTENCE_PREDICATES)} ${pick(SENTENCE_COMPLEMENTS)}`

export const fakeEventTitle = (): string =>
  `${pick(EVENT_KINDS)} ${pick(EVENT_THEMES)}`

export const fakeEventDescription = (): string => frSentence()

export const fakeEventLocation = (): string => pick(EVENT_LOCATIONS)

export const fakeArticleTitle = (): string =>
  `${pick(ARTICLE_PREFIXES)} ${pick(ARTICLE_TOPICS)}`

export const fakeArticleExcerpt = (): string => frSentence()

export const fakeArticleContent = (): Prisma.InputJsonValue => ({
  blocks: Array.from({ length: faker.number.int({ max: 3, min: 1 }) }, () => ({
    data: { text: frSentence() },
    type: 'paragraph',
  })),
})
