import { CronExpressionParser } from 'cron-parser';
import cronstrue from 'cronstrue';

export type CronContext = {
	team?: string;
	environment?: string;
	job?: string;
};

export type ScheduleContext = CronContext;

function formatInTimeZone(date: Date, timeZone: string): string {
	const formatter = new Intl.DateTimeFormat('en-US', {
		weekday: 'long',
		day: '2-digit',
		month: 'short',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		hour12: false,
		hourCycle: 'h23',
		timeZone
	});

	const parts = formatter.formatToParts(date);
	const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value;

	return `${get('weekday')}, ${get('day')} ${get('month')} ${get('year')} ${get('hour')}:${get('minute')}`;
}

function getNextRunTime(
	expression: string,
	cronTimeZone: string,
	localTimeZone: string,
	context?: CronContext
): { formatted: string; date: Date } | null {
	try {
		const interval = CronExpressionParser.parse(expression, {
			currentDate: new Date(),
			tz: cronTimeZone
		});

		const nextDate = interval.next().toDate();

		return {
			formatted: formatInTimeZone(nextDate, localTimeZone),
			date: nextDate
		};
	} catch (error) {
		console.error('Invalid cron schedule while calculating next run time', {
			expression,
			cronTimeZone,
			localTimeZone,
			context,
			error,
			errorMessage: error instanceof Error ? error.message : String(error)
		});
		return null;
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
}): { description?: string; nextRun?: string; nextRunDate?: Date; error?: string } {
	try {
		const description = cronstrue.toString(expression, {
			verbose: true,
			use24HourTimeFormat: true
		});

		const descriptionString = description + ' (' + timeZone + ')';

		const nextRunResult = getNextRunTime(expression, timeZone, 'Europe/Oslo', context);

		return {
			description: descriptionString,
			nextRun: nextRunResult?.formatted,
			nextRunDate: nextRunResult?.date,
			error: undefined
		};
	} catch (error) {
		console.error('Invalid cron schedule while generating description', {
			expression,
			timeZone,
			context,
			error,
			errorMessage: error instanceof Error ? error.message : String(error)
		});
		return {
			description: undefined,
			nextRun: undefined,
			nextRunDate: undefined,
			error: String(error)
		};
	}
}
