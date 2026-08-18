import { describe, expect, it } from 'vitest';
import { getLocalizedCronDescription } from './cron';

describe('getLocalizedCronDescription', () => {
	it('returns description and next run for valid expression', () => {
		const result = getLocalizedCronDescription({
			expression: '0 12 * * *',
			timeZone: 'Europe/Oslo'
		});

		expect(result.error).toBeUndefined();
		expect(result.description).toContain('12:00');
		expect(result.description).toContain('Europe/Oslo');
		expect(result.nextRun).toBeDefined();
		expect(result.nextRunDate).toBeInstanceOf(Date);
	});

	it('formats midnight as 00:00, not 24:00', () => {
		const result = getLocalizedCronDescription({
			expression: '0 0 * * *',
			timeZone: 'Europe/Oslo'
		});

		expect(result.nextRun).toMatch(/00:00/);
		expect(result.nextRun).not.toMatch(/24:00/);
	});

	it('returns error for invalid expression', () => {
		const result = getLocalizedCronDescription({
			expression: 'not-a-cron',
			timeZone: 'UTC'
		});

		expect(result.error).toBeDefined();
		expect(result.description).toBeUndefined();
	});

	it('formats next run with weekday, date and time', () => {
		const result = getLocalizedCronDescription({
			expression: '30 14 * * *',
			timeZone: 'UTC'
		});

		expect(result.nextRun).toMatch(/^\w+, \d{2} \w{3} \d{4} \d{2}:\d{2}$/);
	});
});
