import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { loadTenantActivityLog, addPageMeta } = vi.hoisted(() => ({
	loadTenantActivityLog: vi.fn(async () => ({})),
	addPageMeta: vi.fn(async () => ({}))
}));

vi.mock('$houdini', () => ({ load_TenantActivityLog: loadTenantActivityLog }));
vi.mock('#lib/utils/pageMeta.js', () => ({ addPageMeta }));

import { load } from './+page';
import { formatOslo, parseOslo } from './osloTime';

function event(query = ''): Parameters<typeof load>[0] {
	return { url: new URL(`https://example.com/activity-log${query}`) } as Parameters<typeof load>[0];
}

describe('global activity log date range', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-09-24T12:00:00Z'));
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.clearAllMocks();
	});

	it('defaults to seven calendar days including today', async () => {
		const data = await load(event());
		expect(data.dateRange).toEqual({
			from: '2026-09-17T22:00:00.000Z',
			to: '2026-09-24T21:59:59.000Z',
			fromInput: '2026-09-18T00:00:00',
			toInput: '2026-09-24T23:59:59',
			todayEnd: '2026-09-24T23:59:59',
			custom: false,
			maxDays: 30
		});
		expect(loadTenantActivityLog).toHaveBeenCalledWith(
			expect.objectContaining({
				variables: expect.objectContaining({
					filter: expect.objectContaining({
						from: new Date('2026-09-17T22:00:00Z'),
						to: new Date('2026-09-24T22:00:00Z')
					})
				})
			})
		);
	});

	it('defaults only the missing endpoint', async () => {
		const fromOnly = (await load(event(`?from=${encodeURIComponent('2026-09-20T00:00:00+02:00')}`)))
			.dateRange;
		expect(fromOnly.to).toBe('2026-09-24T21:59:59.000Z');
		expect(fromOnly.custom).toBe(true);
		const toOnly = (await load(event(`?to=${encodeURIComponent('2026-09-21T23:59:59+02:00')}`)))
			.dateRange;
		expect(toOnly.from).toBe('2026-09-17T22:00:00.000Z');
		expect(toOnly.custom).toBe(true);
	});

	it('keeps the default range when only other filters or cursors are set', async () => {
		const { dateRange } = await load(event('?activityTypes=DEPLOYMENT&after=cursor'));
		expect(dateRange.custom).toBe(false);
		expect(dateRange.fromInput).toBe('2026-09-18T00:00:00');
		expect(dateRange.toInput).toBe('2026-09-24T23:59:59');
	});

	it('uses the Oslo calendar date for defaults after UTC midnight differs', async () => {
		vi.setSystemTime(new Date('2026-09-24T23:30:00Z'));
		const { dateRange } = await load(event());
		expect(dateRange.fromInput).toBe('2026-09-19T00:00:00');
		expect(dateRange.toInput).toBe('2026-09-25T23:59:59');
		expect(dateRange.todayEnd).toBe('2026-09-25T23:59:59');
	});

	it('accepts a 30-day inclusive range', async () => {
		const from = encodeURIComponent('2026-08-26T00:00:00+02:00');
		const to = encodeURIComponent('2026-09-24T23:59:59+02:00');
		await expect(load(event(`?from=${from}&to=${to}`))).resolves.toBeDefined();
	});

	it('accepts local timestamps with offsets and includes the selected to second', async () => {
		const from = encodeURIComponent('2026-09-24T12:34:56+02:00');
		const to = encodeURIComponent('2026-09-24T13:45:12+02:00');
		const data = await load(event(`?from=${from}&to=${to}`));

		expect(data.dateRange).toEqual({
			from: '2026-09-24T10:34:56.000Z',
			to: '2026-09-24T11:45:12.000Z',
			fromInput: '2026-09-24T12:34:56',
			toInput: '2026-09-24T13:45:12',
			todayEnd: '2026-09-24T23:59:59',
			custom: true,
			maxDays: 30
		});
		expect(loadTenantActivityLog).toHaveBeenCalledWith(
			expect.objectContaining({
				variables: expect.objectContaining({
					filter: expect.objectContaining({
						from: new Date('2026-09-24T10:34:56Z'),
						to: new Date('2026-09-24T11:45:13Z')
					})
				})
			})
		);
	});

	it('uses absolute instants even when the endpoints have different offsets', async () => {
		const from = encodeURIComponent('2026-09-24T23:15:00+02:00');
		const to = encodeURIComponent('2026-09-24T22:30:00+01:00');
		const data = await load(event(`?from=${from}&to=${to}`));

		expect(data.dateRange).toEqual({
			from: '2026-09-24T21:15:00.000Z',
			to: '2026-09-24T21:30:00.000Z',
			fromInput: '2026-09-24T23:15:00',
			toInput: '2026-09-24T23:30:00',
			todayEnd: '2026-09-24T23:59:59',
			custom: true,
			maxDays: 30
		});
	});

	it('interprets edited wall times in Oslo regardless of the machine timezone', () => {
		expect(parseOslo('2026-01-15T12:34:56').toISOString()).toBe('2026-01-15T11:34:56.000Z');
		expect(parseOslo('2026-07-15T12:34:56').toISOString()).toBe('2026-07-15T10:34:56.000Z');
		expect(formatOslo(new Date('2026-07-15T10:34:56Z'))).toBe('2026-07-15T12:34:56');
	});

	it('round-trips Oslo times around the spring DST transition', () => {
		expect(parseOslo('2026-03-29T01:30:00').toISOString()).toBe('2026-03-29T00:30:00.000Z');
		expect(parseOslo('2026-03-29T03:30:00').toISOString()).toBe('2026-03-29T01:30:00.000Z');
		expect(() => parseOslo('2026-03-29T02:30:00')).toThrow(
			'This time does not exist in Oslo due to daylight saving time.'
		);
	});

	it('selects a consistent instant for the repeated autumn hour', () => {
		const result = parseOslo('2026-10-25T02:30:00');
		expect(result.toISOString()).toBe('2026-10-25T01:30:00.000Z');
		expect(formatOslo(result)).toBe('2026-10-25T02:30:00');
	});

	it('keeps both absolute instants when an existing URL spans the repeated hour', async () => {
		const from = encodeURIComponent('2026-10-25T02:30:00+02:00');
		const to = encodeURIComponent('2026-10-25T02:30:00+01:00');
		const { dateRange } = await load(event(`?from=${from}&to=${to}`));
		expect(dateRange.fromInput).toBe('2026-10-25T02:30:00');
		expect(dateRange.toInput).toBe('2026-10-25T02:30:00');
		expect(dateRange.from).toBe('2026-10-25T00:30:00.000Z');
		expect(dateRange.to).toBe('2026-10-25T01:30:00.000Z');
	});

	it('accepts a single second and a 30-calendar-day range across a DST change', async () => {
		await expect(
			load(event('?from=2026-09-24T12:00:00Z&to=2026-09-24T12:00:00Z'))
		).resolves.toBeDefined();
		const from = encodeURIComponent('2026-10-01T00:00:00+02:00');
		const to = encodeURIComponent('2026-10-30T23:59:59+01:00');
		await expect(load(event(`?from=${from}&to=${to}`))).resolves.toBeDefined();
	});

	it.each([
		[
			'?from=2026-08-25T00:00:00Z&to=2026-09-24T23:59:59Z',
			'The activity log date range cannot exceed 30 days.'
		],
		['?from=2026-09-25T00:00:00Z&to=2026-09-24T23:59:59Z', 'From must be on or before to.'],
		[
			'?from=2026-10-01T00:00:00Z&to=2026-10-31T00:00:00Z',
			'The activity log date range cannot exceed 30 days.'
		],
		['?from=2026-09-24T13:00:00Z&to=2026-09-24T12:00:00Z', 'From must be on or before to.'],
		['?from=2026-09-24', 'From and to must be valid RFC 3339 timestamps with seconds.'],
		['?to=2026-09-24', 'From and to must be valid RFC 3339 timestamps with seconds.'],
		['?from=2026-02-30', 'From and to must be valid RFC 3339 timestamps with seconds.'],
		['?from=2026-02-30T12:00:00Z', 'From and to must be valid RFC 3339 timestamps with seconds.'],
		['?from=2026-09-24T12:00:00', 'From and to must be valid RFC 3339 timestamps with seconds.'],
		['?to=2026-09-24T12:00:00.123Z', 'From and to must be valid RFC 3339 timestamps with seconds.'],
		[
			'?from=2026-09-24T12:00:00%2B15:00',
			'From and to must be valid RFC 3339 timestamps with seconds.'
		],
		['?to=', 'From and to must be valid RFC 3339 timestamps with seconds.']
	])('rejects invalid range %s before fetching', async (query, message) => {
		await expect(load(event(query))).rejects.toMatchObject({
			status: 400,
			body: { message }
		});
		expect(loadTenantActivityLog).not.toHaveBeenCalled();
	});
});
