import { createLogger } from '@iut-intranet/configs/logger'

import { scheduleArchiveNewsCron } from '@/cron/archive-news.cron'

/**
 * Enregistre tous les crons de l'API. Point d'entrée unique appelé au démarrage du serveur.
 */
export function startCrons() {
  const logger = createLogger('cron')
  scheduleArchiveNewsCron(logger)
}
