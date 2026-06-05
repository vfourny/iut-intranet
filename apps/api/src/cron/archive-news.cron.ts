import { createLogger, type Logger } from '@iut-intranet/configs/logger'
import { newsService } from '@iut-intranet/services'
import cron from 'node-cron'

// Tous les jours à 2h (Europe/Paris).
const ARCHIVE_NEWS_SCHEDULE = '0 2 * * *'

/**
 * Tâche d'archivage : délègue au service le balayage des news publiées trop anciennes.
 */
export async function archiveNewsCron(logger: Logger) {
  const { count } = await newsService.archivePastPublishedNews()
  logger.info(`[cron] archiveNews: ${count} news archivée(s)`)
}

/**
 * Enregistre le cron quotidien d'archivage auprès de node-cron.
 */
export function scheduleArchiveNewsCron(logger: Logger) {
  cron.schedule(
    ARCHIVE_NEWS_SCHEDULE,
    async () => {
      try {
        await archiveNewsCron(logger)
      } catch (error) {
        logger.error({ err: error }, 'Error during archive news cron')
      }
    },
    { timezone: 'Europe/Paris' },
  )
}

async function boot() {
  const logger = createLogger('cron-archive-news')
  try {
    logger.info("Démarrage manuel du cron d'archivage des news")
    await archiveNewsCron(logger)
    logger.info("Fin de l'exécution du cron.")
    process.exit(0)
  } catch (error) {
    logger.error({ err: error }, 'Le cron a échoué')
    process.exit(1)
  }
}

if (
  process.argv[1]?.endsWith('archive-news.cron.ts') ||
  process.argv[1]?.endsWith('archive-news.cron.js')
) {
  boot()
}
