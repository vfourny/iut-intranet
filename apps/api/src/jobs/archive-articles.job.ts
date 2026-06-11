import { createLogger, type Logger } from '@iut-intranet/configs/logger'
import { newsService } from '@iut-intranet/services'

export async function ArchiveArticlesJob(logger: Logger) {
  const { count } = await newsService.archivePastPublishedNews()
  logger.info(`[cron] archiveArticles: ${count} article(s) archivé(s)`)
}

async function boot() {
  const logger = createLogger('job-archive-articles')
  try {
    logger.info("Démarrage manuel du job d'archivage")
    await ArchiveArticlesJob(logger)
    logger.info("Fin de l'exécution du job.")
    process.exit(0)
  } catch (error) {
    logger.error({ err: error }, 'Le job a échoué')
    process.exit(1)
  }
}

if (
  process.argv[1]?.endsWith('archive-articles.job.ts') ||
  process.argv[1]?.endsWith('archive-articles.job.js')
) {
  boot()
}
