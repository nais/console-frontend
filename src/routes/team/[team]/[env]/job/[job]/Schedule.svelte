<script lang="ts">
	import cronParser from 'cron-parser';
	import cronstrue from 'cronstrue';
	import { DateTime } from 'luxon';

	interface Props {
		schedule: {
			readonly expression: string;
			readonly timeZone: string;
		} | null;
	}

	let { schedule }: Props = $props();

	function getNextRunTime(expression: string, cronTimeZone: string, localTimeZone: string): string {
		try {
			const interval = cronParser.parseExpression(expression, {
				currentDate: new Date(),
				tz: cronTimeZone
			});

			const nextRunInCronTZ = interval.next().toISOString();

			const nextRunInLocalTZ = DateTime.fromISO(nextRunInCronTZ, { zone: 'utc' }).setZone(
				localTimeZone
			);

			if (!nextRunInLocalTZ.isValid) {
				throw new Error(`Invalid DateTime for time zone: ${localTimeZone}`);
			}

			return nextRunInLocalTZ.toFormat('cccc, dd LLL yyyy HH:mm');
		} catch (error) {
			console.error('Error calculating next run time:', error);
			return 'Invalid cron expression or time zone';
		}
	}

	function getLocalizedCronDescription(
		expression: string,
		cronTimeZone: string
	): { description?: string; nextRun?: string; error?: string } {
		try {
			const description = cronstrue.toString(expression, {
				verbose: true,
				use24HourTimeFormat: true
			});

			const descriptionParts = description.split(',');
			const descriptionString = descriptionParts[0] + ` (${cronTimeZone}),` + descriptionParts[1];

			const nextRun = getNextRunTime(expression, cronTimeZone, 'Europe/Oslo');

			return { description: descriptionString, nextRun: nextRun, error: undefined };
		} catch (error) {
			return { description: undefined, nextRun: undefined, error: String(error) };
		}
	}
</script>

<div>
	{#if schedule}
		{@const runConfig = getLocalizedCronDescription(schedule.expression, schedule.timeZone)}
		{#if runConfig.error}
			<p style="color: red;">Error: {runConfig.error}</p>
		{:else}
			<dl>
				<dt>Schedule</dt>
				<dd style="margin: 0">{runConfig.description}</dd>
				<dt>Next run</dt>
				<dd style="margin: 0">{runConfig.nextRun}</dd>
			</dl>
		{/if}
	{:else}
		<p>No schedule</p>
	{/if}
</div>

<style>
	dt {
		font-weight: bold;
	}
</style>
