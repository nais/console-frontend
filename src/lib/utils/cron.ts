import { CronExpressionParser } from 'cron-parser';
import cronstrue from 'cronstrue';
import { DateTime } from 'luxon';
import { logger } from '$lib/logger';

function getNextRunTime(expression: string, cronTimeZone: string, localTimeZone: string): string {
	try {
		const interval = CronExpressionParser.parse(expression, {
			currentDate: new Date(),
			tz: cronTimeZone
		});

		const nextRunInCronTZ = interval.next().toISOString();

		if (!nextRunInCronTZ) {
			throw new Error('Invalid cron expression');
		}

		const nextRunInLocalTZ = DateTime.fromISO(nextRunInCronTZ, { zone: 'utc' }).setZone(
			localTimeZone
		);

		if (!nextRunInLocalTZ.isValid) {
			throw new Error(`Invalid DateTime for time zone: ${localTimeZone}`);
		}

		return nextRunInLocalTZ.toFormat('cccc, dd LLL yyyy HH:mm');
	} catch (error) {
		logger.error({ error, expression, cronTimeZone, localTimeZone }, 'Error calculating next run time');
		return 'Invalid cron expression or time zone';
	}
}

export function getLocalizedCronDescription({
	expression,
	timeZone
}: {
	expression: string;
	timeZone: string;
}): { description?: string; nextRun?: string; error?: string } {
	try {
		const description = cronstrue.toString(expression, {
			verbose: true,
			use24HourTimeFormat: true
		});

		const descriptionString = description + ' (' + timeZone + ')';

		const nextRun = getNextRunTime(expression, timeZone, 'Europe/Oslo');

		return { description: descriptionString, nextRun: nextRun, error: undefined };
	} catch (error) {
		return { description: undefined, nextRun: undefined, error: String(error) };
	}
}
