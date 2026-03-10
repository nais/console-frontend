import { CronExpressionParser } from 'cron-parser';
import cronstrue from 'cronstrue';
import { DateTime } from 'luxon';

type CronContext = {
	team?: string;
	environment?: string;
	job?: string;
};

function getNextRunTime(
	expression: string,
	cronTimeZone: string,
	localTimeZone: string,
	context?: CronContext
): string {
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
		console.warn('Invalid cron schedule while calculating next run time', {
			expression,
			cronTimeZone,
			localTimeZone,
			context,
			error: error instanceof Error ? error.message : String(error)
		});
		return 'Invalid cron expression or time zone';
	}
}

export function getLocalizedCronDescription({
	expression,
	timeZone,
	context
}: {
	expression: string;
	timeZone: string;
	context?: CronContext;
}): { description?: string; nextRun?: string; error?: string } {
	try {
		const description = cronstrue.toString(expression, {
			verbose: true,
			use24HourTimeFormat: true
		});

		const descriptionString = description + ' (' + timeZone + ')';

		const nextRun = getNextRunTime(expression, timeZone, 'Europe/Oslo', context);

		return { description: descriptionString, nextRun: nextRun, error: undefined };
	} catch (error) {
		console.warn('Invalid cron schedule while generating description', {
			expression,
			timeZone,
			context,
			error: error instanceof Error ? error.message : String(error)
		});
		return { description: undefined, nextRun: undefined, error: String(error) };
	}
}
