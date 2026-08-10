/**
 * Scheduled email worker. Run from a platform cron trigger:
 *
 *   npm run cron            # once
 *   * 9 * * *  npm run cron # daily at 09:00 in the host timezone
 */
import { runDueJobs } from "../src/lib/cron";

runDueJobs()
  .then((result) => {
    console.log(
      `cron complete — ${result.draftReminders} draft reminders, ${result.taskReminders} task reminders, ${result.digests} digests`,
    );
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
