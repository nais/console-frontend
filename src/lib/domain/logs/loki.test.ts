import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchLogPage, fetchLogVolume, moveLogRange, resolveLogRange } from './loki.js';

function streams(values: [string, string][], labels = { service_name: 'app' }) {
	return {
		status: 'success',
		data: { resultType: 'streams', result: [{ stream: labels, values }] }
	};
}

function respond(body: unknown, status = 200) {
	return new Response(JSON.stringify(body), { status });
}

afterEach(() => vi.unstubAllGlobals());

describe('Loki history', () => {
	it.each([0.25, 0.5, 1, 5, 10, 15, 30, 45, 60, 180, 360, 720, 1440, 2880, 10080])(
		'resolves the %s-minute preset precisely',
		(minutes) => {
			const now = Date.UTC(2026, 9, 30, 10);
			const range = resolveLogRange(minutes, '', '', now);
			expect(BigInt(range.end) - BigInt(range.start)).toBe(BigInt(minutes * 60_000) * 1_000_000n);
			expect(range.end).toBe(String(BigInt(now) * 1_000_000n));
		}
	);

	it('rounds fractional-minute durations to milliseconds for subsequent live refreshes', () => {
		const range = resolveLogRange(1001 / 60_000, '', '', 1_000_000);
		expect(BigInt(range.end) - BigInt(range.start)).toBe(1_001_000_000n);
	});

	it('keeps the two repeated Oslo daylight-saving windows distinct', async () => {
		const now = Date.UTC(2026, 9, 25, 3);
		const summer = resolveLogRange(
			undefined,
			'2026-10-25T02:15:00+02:00',
			'2026-10-25T02:30:00+02:00',
			now
		);
		const winter = resolveLogRange(
			undefined,
			'2026-10-25T02:15:00+01:00',
			'2026-10-25T02:30:00+01:00',
			now
		);
		const localTime = new Intl.DateTimeFormat('en-GB', {
			timeZone: 'Europe/Oslo',
			hour: '2-digit',
			minute: '2-digit'
		});
		expect(localTime.format(Number(BigInt(summer.start) / 1_000_000n))).toBe('02:15');
		expect(localTime.format(Number(BigInt(winter.start) / 1_000_000n))).toBe('02:15');
		expect(BigInt(winter.start) - BigInt(summer.start)).toBe(3_600_000_000_000n);
		expect(moveLogRange(moveLogRange(winter, 'previous', now), 'next', now)).toEqual(winter);
		const mock = vi.fn().mockResolvedValue(respond(streams([])));
		vi.stubGlobal('fetch', mock);
		await fetchLogPage({ ...winter, query: '{app="x"} |= "filter"', limit: 100 });
		const url = new URL(mock.mock.calls[0][0], 'https://console.test');
		expect(url.searchParams.get('start')).toBe(winter.start);
		expect(url.searchParams.get('end')).toBe(winter.end);
	});

	it('moves complete adjacent windows backward and forward without losing nanoseconds', () => {
		const range = { start: '3000000001', end: '4000000003' };
		const previous = moveLogRange(range, 'previous', 10_000);
		expect(previous).toEqual({ start: '1999999999', end: '3000000001' });
		expect(moveLogRange(previous, 'next', 10_000)).toEqual(range);
		expect(moveLogRange(range, 'next', 10_000)).toEqual({
			start: '4000000003',
			end: '5000000005'
		});
	});

	it('jumps to now with the original duration and can subsequently advance on refresh', () => {
		const range = { start: '1000000000', end: '2501000000' };
		const latest = moveLogRange(range, 'now', 10_000);
		expect(latest).toEqual({ start: '8499000000', end: '10000000000' });
		const minutes = Number((BigInt(latest.end) - BigInt(latest.start)) / 1_000_000n) / 60_000;
		expect(resolveLogRange(minutes, '', '', 11_000)).toEqual({
			start: '9499000000',
			end: '11000000000'
		});
	});

	it('rejects shifts before Unix time or into the future, without shortening the window', () => {
		const range = { start: '1000000000', end: '2000000000' };
		expect(moveLogRange(range, 'previous', 3000)).toEqual({
			start: '0',
			end: '1000000000'
		});
		expect(moveLogRange(range, 'next', 3000)).toEqual({
			start: '2000000000',
			end: '3000000000'
		});
		expect(() => moveLogRange({ start: '0', end: '1000000000' }, 'previous', 3000)).toThrow(
			'cannot be shifted'
		);
		expect(() => moveLogRange(range, 'next', 2999)).toThrow('cannot be shifted');
		expect(() => moveLogRange({ start: '0', end: '4000000000' }, 'now', 3000)).toThrow(
			'valid time range'
		);
		expect(() => moveLogRange({ start: '1000000000', end: '1000000000' }, 'now', 3000)).toThrow(
			'valid time range'
		);
	});

	it('resolves relative ranges against a fresh clock and preserves absolute ranges', () => {
		expect(resolveLogRange(15, '', '', 1_000_000)).toEqual({
			start: '100000000000',
			end: '1000000000000'
		});
		expect(
			resolveLogRange(
				undefined,
				'2026-10-30T09:00:00Z',
				'2026-10-30T09:15:00Z',
				Date.UTC(2026, 9, 30, 10)
			)
		).toEqual({
			start: '1793350800000000000',
			end: '1793351700000000000'
		});
	});

	it('rejects invalid, reversed and future ranges', () => {
		for (const [from, to] of [
			['bad', 'bad'],
			['2026-10-30T10:00:00Z', '2026-10-30T09:00:00Z'],
			['2026-10-30T09:00:00Z', '2026-10-31T09:00:00Z']
		]) {
			expect(() => resolveLogRange(undefined, from, to, Date.UTC(2026, 9, 30, 10))).toThrow(
				'valid time range'
			);
		}
	});

	it('uses the authenticated proxy and sorts all streams at nanosecond precision', async () => {
		const mock = vi.fn().mockResolvedValue(
			respond({
				status: 'success',
				data: {
					resultType: 'streams',
					result: [
						{ stream: { pod: 'a' }, values: [['1793350800000000001', 'first']] },
						{ stream: { pod: 'b' }, values: [['1793350800000000002', 'second']] }
					]
				}
			})
		);
		vi.stubGlobal('fetch', mock);
		const result = await fetchLogPage({
			query: '{app="x"} |= "a&b"',
			start: '1',
			end: '1793350900000000000',
			limit: 10
		});
		expect(result.entries.map((entry) => entry.message)).toEqual(['second', 'first']);
		expect(result.nextEnd).toBeUndefined();
		const url = new URL(mock.mock.calls[0][0], 'https://console.test');
		expect(url.pathname).toBe('/api/loki/api/v1/query_range');
		expect(url.searchParams.get('query')).toBe('{app="x"} |= "a&b"');
		expect(mock.mock.calls[0][1].credentials).toBe('same-origin');
	});

	it('completes timestamp boundaries, preserving identical lines and excluding the boundary on the next page', async () => {
		const mock = vi
			.fn()
			.mockResolvedValueOnce(
				respond(
					streams([
						['1000000002', 'new'],
						['1000000001', 'same']
					])
				)
			)
			.mockResolvedValueOnce(
				respond(
					streams([
						['1000000001', 'same'],
						['1000000001', 'same'],
						['1000000001', 'other']
					])
				)
			);
		vi.stubGlobal('fetch', mock);
		const result = await fetchLogPage({
			query: '{app="x"}',
			start: '1',
			end: '2000000000',
			limit: 2
		});
		expect(result.entries.map((entry) => entry.message)).toEqual(['new', 'same', 'same', 'other']);
		expect(result.nextEnd).toBe('1000000001');
		const boundary = new URL(mock.mock.calls[1][0], 'https://console.test').searchParams;
		expect(boundary.get('start')).toBe('1000000001');
		expect(boundary.get('end')).toBe('1000000002');
		expect(boundary.get('limit')).toBe('5000');
	});

	it('fails explicitly instead of skipping an oversized timestamp boundary', async () => {
		vi.stubGlobal(
			'fetch',
			vi
				.fn()
				.mockResolvedValueOnce(respond(streams([['100', 'line']])))
				.mockResolvedValueOnce(
					respond(streams(Array.from({ length: 5000 }, () => ['100', 'line'])))
				)
		);
		await expect(fetchLogPage({ query: '{}', start: '1', end: '200', limit: 1 })).rejects.toThrow(
			'paginate safely'
		);
	});

	it("paginates adjacent nanoseconds using Loki's inclusive-start, exclusive-end contract", async () => {
		const values: [string, string][] = [
			['103', 'a'],
			['102', 'b'],
			['102', 'c'],
			['101', 'd'],
			['100', 'e']
		];
		vi.stubGlobal(
			'fetch',
			vi.fn().mockImplementation((input: string) => {
				const parameters = new URL(input, 'https://console.test').searchParams;
				const start = BigInt(parameters.get('start')!);
				const end = BigInt(parameters.get('end')!);
				const limit = Number(parameters.get('limit'));
				return Promise.resolve(
					respond(
						streams(
							values.filter(([time]) => BigInt(time) >= start && BigInt(time) < end).slice(0, limit)
						)
					)
				);
			})
		);
		const first = await fetchLogPage({ query: '{}', start: '100', end: '104', limit: 2 });
		const second = await fetchLogPage({ query: '{}', start: '100', end: first.nextEnd!, limit: 2 });
		expect([...first.entries, ...second.entries].map((entry) => entry.message)).toEqual([
			'a',
			'b',
			'c',
			'd',
			'e'
		]);
		expect(second.nextEnd).toBeUndefined();
	});

	it('does not continue before the selected start', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockImplementation(() => Promise.resolve(respond(streams([['100', 'line']]))))
		);
		expect(
			(await fetchLogPage({ query: '{}', start: '100', end: '200', limit: 1 })).nextEnd
		).toBeUndefined();
	});

	it.each([
		[respond({}, 401), 'session has expired'],
		[new Response('bad query', { status: 400 }), 'bad query'],
		[new Response('<html>Unavailable</html>', { status: 502 }), '502'],
		[new Response('<html>login</html>'), 'invalid JSON'],
		[respond({ status: 'error', error: 'parse error' }), 'parse error'],
		[
			respond({ status: 'success', data: { resultType: 'matrix', result: [] } }),
			'invalid response'
		],
		[respond(streams([['invalid', 'line']])), 'invalid response']
	])('surfaces HTTP and invalid response errors', async (response, message) => {
		vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response));
		await expect(fetchLogPage({ query: '{}', start: '1', end: '2', limit: 10 })).rejects.toThrow(
			message
		);
	});

	it('propagates cancellation and query warnings', async () => {
		const controller = new AbortController();
		const mock = vi.fn().mockResolvedValue(respond({ ...streams([]), warnings: ['partial data'] }));
		vi.stubGlobal('fetch', mock);
		expect(
			(
				await fetchLogPage({
					query: '{}',
					start: '1',
					end: '2',
					limit: 10,
					signal: controller.signal
				})
			).warnings
		).toEqual(['partial data']);
		controller.abort();
		expect(mock.mock.calls[0][1].signal.aborted).toBe(true);
	});
});

describe('Loki volume', () => {
	it('queries counts independently of the log limit and fills empty buckets', async () => {
		const mock = vi.fn().mockResolvedValue(
			respond({
				status: 'success',
				data: {
					resultType: 'matrix',
					result: [
						{
							values: [
								[2, '3'],
								[4, '5']
							]
						}
					]
				}
			})
		);
		vi.stubGlobal('fetch', mock);
		const result = await fetchLogVolume('{app="x"} |= "error"', { start: '0', end: '4000000000' });
		expect(result.buckets.map((bucket) => bucket.count)).toEqual([0, 3, 0, 5]);
		const parameters = new URL(mock.mock.calls[0][0], 'https://console.test').searchParams;
		expect(parameters.get('query')).toBe('sum(count_over_time({app="x"} |= "error" [1000ms]))');
		expect(parameters.has('limit')).toBe(false);
	});

	it('keeps the first histogram bucket inside an uneven custom range', async () => {
		const mock = vi.fn().mockImplementation((input: string) => {
			const url = new URL(input, 'https://console.test');
			return Promise.resolve(
				respond({
					status: 'success',
					data: { resultType: url.pathname.endsWith('/query') ? 'vector' : 'matrix', result: [] }
				})
			);
		});
		vi.stubGlobal('fetch', mock);
		const result = await fetchLogVolume('{app="x"}', { start: '1000000000', end: '62500000000' });
		expect(result.buckets).toHaveLength(32);
		expect(result.buckets[0]).toEqual({ start: 1000, end: 2000, count: 0 });
		expect(result.buckets.at(-1)?.end).toBe(62500);
		const remaining = new URL(mock.mock.calls[0][0], 'https://console.test').searchParams;
		expect(remaining.get('query')).toContain('[2000ms]');
		expect(remaining.get('step')).toBe('2000ms');
		expect(remaining.get('start')).toBe('4000000000');
		expect(remaining.get('end')).toBe('62000000000');
		const first = new URL(mock.mock.calls[1][0], 'https://console.test');
		expect(first.pathname).toBe('/api/loki/api/v1/query');
		expect(first.searchParams.get('query')).toContain('[1000ms]');
		expect(first.searchParams.get('time')).toBe('2000000000');
		const last = new URL(mock.mock.calls[2][0], 'https://console.test').searchParams;
		expect(last.get('query')).toContain('[500ms]');
		expect(last.get('time')).toBe('62500000000');
	});

	it.each(
		[0, 500, 7000, 8000, 9000, 14999].flatMap((offset) =>
			[900_000, 61_000, 500].map((duration) => ({ offset, duration }))
		)
	)(
		'handles Loki step alignment with a $offset ms offset and $duration ms range',
		async ({ offset, duration }) => {
			const mock = vi.fn().mockImplementation((input: string) => {
				const url = new URL(input, 'https://console.test');
				const p = url.searchParams;
				const duration = Number(p.get('query')!.match(/\[(\d+)ms\]/)![1]);
				if (url.pathname.endsWith('/query')) {
					return Promise.resolve(
						respond({
							status: 'success',
							data: {
								resultType: 'vector',
								result: [
									{
										value: [Number(BigInt(p.get('time')!)) / 1e9, String(duration)]
									}
								]
							}
						})
					);
				}
				const step = Number(p.get('step')!.replace('ms', ''));
				const start = Math.floor(Number(BigInt(p.get('start')!)) / 1e6 / step) * step;
				const end = Math.floor(Number(BigInt(p.get('end')!)) / 1e6 / step) * step;
				const values = [];
				for (let time = start; time <= end; time += step)
					values.push([time / 1000, String(duration)]);
				return Promise.resolve(
					respond({
						status: 'success',
						data: { resultType: 'matrix', result: [{ values }] }
					})
				);
			});
			vi.stubGlobal('fetch', mock);
			const start = Date.UTC(2026, 9, 30, 11) + offset;
			const result = await fetchLogVolume('{app="x"}', {
				start: String(BigInt(start) * 1_000_000n),
				end: String(BigInt(start + duration) * 1_000_000n)
			});
			expect(result.buckets[0].start).toBe(start);
			expect(result.buckets.at(-1)?.end).toBe(start + duration);
			expect(result.buckets.reduce((sum, bucket) => sum + bucket.count, 0)).toBe(duration);
			expect(result.buckets.every((bucket) => bucket.count === bucket.end - bucket.start)).toBe(
				true
			);
		}
	);

	it('preserves structured metadata on individual log entries', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue(
				respond({
					status: 'success',
					data: {
						resultType: 'streams',
						result: [
							{
								stream: { service_name: 'app' },
								values: [['100', 'line', { k8s_pod_name: 'old-pod', trace_id: 'trace' }]]
							}
						]
					}
				})
			)
		);
		const result = await fetchLogPage({ query: '{}', start: '1', end: '200', limit: 10 });
		expect(result.entries[0].labels).toEqual({
			service_name: 'app',
			k8s_pod_name: 'old-pod',
			trace_id: 'trace'
		});
	});
});
