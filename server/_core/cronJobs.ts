/**
 * Cron Jobs — placeholder para tarefas agendadas futuras.
 * Adicione jobs conforme necessário.
 */

let cronJobsInitialized = false;

export function initCronJobs() {
  if (cronJobsInitialized) return;
  console.log("[CronJobs] Inicializado.");
  cronJobsInitialized = true;
}
