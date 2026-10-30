import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
	createBufferedLogAppender,
	filterLogsByLevel,
	formatPostgresLogInstance,
	getLogInstanceColor,
	getLogLevel,
	parseLogMessage,
	type LogLine
} from './logViewer';

function formatLocalTimestamp(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	const hour = String(date.getHours()).padStart(2, '0');
	const minute = String(date.getMinutes()).padStart(2, '0');
	const second = String(date.getSeconds()).padStart(2, '0');
	const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

	return `${year}-${month}-${day} ${hour}:${minute}:${second}.${milliseconds}`;
}

describe('getLogInstanceColor', () => {
	it('assigns distinct stable colors to the main and test instances', () => {
		const pods = [
			'pg-roger-test-f222277b-1',
			'pg-roger-test-f222277b-2',
			'pg-roger-main-bf09717d-1',
			'pg-roger-main-bf09717d-2'
		];
		const color = (pod: string) => getLogInstanceColor(formatPostgresLogInstance(pod, 'roger'));
		const colors = pods.map(color);
		expect(new Set(colors).size).toBe(4);
		expect(pods.toReversed().map(color)).toEqual(colors.toReversed());
		expect(color('pg-roger-test-abcdef12-1')).toBe(colors[0]);
	});

	it('preserves the existing color order for known application instances', () => {
		const instances = ['app-1', 'app-2', 'app-3'];
		expect(instances.map((instance) => getLogInstanceColor(instance, instances))).toEqual([
			'accent',
			'brand-beige',
			'brand-magenta'
		]);
	});
});

describe('getLogLevel', () => {
	it('extracts and uppercases the level from JSON logs', () => {
		expect(getLogLevel('{"level":"warn","message":"hello"}')).toBe('WARN');
		expect(getLogLevel('{ "level" : "error", "message": "hello" }')).toBe('ERROR');
	});

	it('maps numeric Pino levels to their display names', () => {
		expect(getLogLevel('{"level":30,"message":"info"}')).toBe('INFO');
		expect(getLogLevel('{"level":50,"message":"error"}')).toBe('ERROR');
		expect(getLogLevel('{"level":"40","message":"warn"}')).toBe('WARN');
	});

	it('defaults to INFO when level is missing', () => {
		expect(getLogLevel('{"message":"hello"}')).toBe('INFO');
		expect(getLogLevel('plain text log line')).toBe('INFO');
	});

	it.each(['constructor', '__proto__', 'toString', 'hasOwnProperty'])(
		'treats %s as a custom level rather than an inherited property',
		(level) => {
			expect(getLogLevel(JSON.stringify({ level }))).toBe(level.toUpperCase());
		}
	);
});

describe('parseLogMessage', () => {
	it('returns nested message from JSON payload', () => {
		expect(parseLogMessage('{"message":"parsed message"}')).toBe('parsed message');
	});

	describe('formatPostgresLogInstance', () => {
		it.each([
			['pg-roger-test-f222277b-1', 'test-1'],
			['pg-roger-test-f222277b-2', 'test-2'],
			['pg-roger-main-bf09717d-1', 'main-1'],
			['pg-roger-feature-test-f222277b-2', 'feature-test-2']
		])('formats %s as %s', (instance, expected) => {
			expect(formatPostgresLogInstance(instance, 'roger')).toBe(expected);
		});

		it('handles database names containing hyphens', () => {
			expect(formatPostgresLogInstance('pg-my-db-test-f222277b-1', 'my-db')).toBe('test-1');
		});

		it.each([
			'unknown',
			'pg-other-test-f222277b-1',
			'pg-roger-unexpected',
			'pg-roger-test-f222277b-pooler-abc'
		])('preserves unrecognized pod names: %s', (instance) => {
			expect(formatPostgresLogInstance(instance, 'roger')).toBe(instance);
		});
	});

	it('falls back to original message when payload has no message field', () => {
		expect(parseLogMessage('{"foo":"bar"}')).toBe('{"foo":"bar"}');
	});

	it('falls back to original message when payload is not JSON', () => {
		expect(parseLogMessage('not-json')).toBe('not-json');
	});
});

describe('createBufferedLogAppender', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('filters buffered logs without discarding them or receiving new entries', () => {
		let logs: LogLine[] = [];
		const appender = createBufferedLogAppender({
			maxEntries: 200,
			maxPendingEntries: 5000,
			flushIntervalMs: 100,
			getLogs: () => logs,
			setLogs: (nextLogs) => {
				logs = nextLogs;
			}
		});
		for (const [index, level] of ['INFO', 'ERROR', 'WARN'].entries()) {
			appender.enqueue({
				time: `2026-03-05T10:00:0${index}.000Z`,
				message: JSON.stringify({ level }),
				instance: 'i-1'
			});
		}
		appender.flush();

		const levels = new Set(['ERROR']);
		expect(filterLogsByLevel(logs, levels).map((log) => log.level)).toEqual(['ERROR']);
		levels.add('WARN');
		expect(filterLogsByLevel(logs, levels).map((log) => log.level)).toEqual(['ERROR', 'WARN']);
		levels.clear();
		expect(filterLogsByLevel(logs, levels)).toEqual([]);
		levels.add('INFO');
		expect(filterLogsByLevel(logs, levels).map((log) => log.level)).toEqual(['INFO']);
		expect(filterLogsByLevel(logs).map((log) => log.level)).toEqual(['INFO', 'ERROR', 'WARN']);
		expect(logs).toHaveLength(3);
	});

	it('retains incoming logs for deselected levels so they can be shown after stopping', () => {
		let logs: LogLine[] = [];
		const levels = new Set(['ERROR']);
		const appender = createBufferedLogAppender({
			maxEntries: 200,
			maxPendingEntries: 5000,
			flushIntervalMs: 100,
			getLogs: () => logs,
			setLogs: (nextLogs) => {
				logs = nextLogs;
			}
		});

		for (const level of ['INFO', 'ERROR']) {
			appender.enqueue({
				time: '2026-03-05T10:00:00.000Z',
				message: JSON.stringify({ level }),
				instance: 'i-1'
			});
		}
		appender.flush();

		expect(filterLogsByLevel(logs, levels).map((log) => log.level)).toEqual(['ERROR']);
		levels.add('INFO');
		expect(filterLogsByLevel(logs, levels).map((log) => log.level)).toEqual(['INFO', 'ERROR']);
		expect(logs).toHaveLength(2);
	});

	it('flushes pending logs after flush interval', () => {
		let logs: LogLine[] = [];
		const appender = createBufferedLogAppender({
			maxEntries: 200,
			maxPendingEntries: 5000,
			flushIntervalMs: 100,
			getLogs: () => logs,
			setLogs: (nextLogs) => {
				logs = nextLogs;
			}
		});

		appender.enqueue({
			time: '2026-03-05T10:00:00.000Z',
			message: '{"level":"info","message":"first"}',
			instance: 'i-1'
		});
		appender.enqueue({
			time: '2026-03-05T10:00:01.000Z',
			message: '{"level":"error","message":"second"}',
			instance: 'i-2'
		});

		expect(logs).toHaveLength(0);

		vi.advanceTimersByTime(100);

		expect(logs).toHaveLength(2);
		expect(logs.map((log) => log.parsedMessage)).toEqual(['first', 'second']);
		expect(logs.map((log) => log.level)).toEqual(['INFO', 'ERROR']);
		expect(logs[0].timestamp).toBe(formatLocalTimestamp(new Date('2026-03-05T10:00:00.000Z')));
		expect(logs[1].timestamp).toBe(formatLocalTimestamp(new Date('2026-03-05T10:00:01.000Z')));
	});

	it('clear() cancels pending flushes and drops pending logs', () => {
		let logs: LogLine[] = [];
		const appender = createBufferedLogAppender({
			maxEntries: 200,
			maxPendingEntries: 5000,
			flushIntervalMs: 100,
			getLogs: () => logs,
			setLogs: (nextLogs) => {
				logs = nextLogs;
			}
		});

		appender.enqueue({
			time: '2026-03-05T10:00:00.000Z',
			message: '{"message":"to-be-cleared"}',
			instance: 'i-1'
		});

		appender.clear();
		vi.advanceTimersByTime(100);

		expect(logs).toHaveLength(0);
	});

	it('flush() writes pending logs immediately', () => {
		let logs: LogLine[] = [];
		const appender = createBufferedLogAppender({
			maxEntries: 200,
			maxPendingEntries: 5000,
			flushIntervalMs: 100,
			getLogs: () => logs,
			setLogs: (nextLogs) => {
				logs = nextLogs;
			}
		});

		appender.enqueue({
			time: '2026-03-05T10:00:00.000Z',
			message: '{"message":"flush-now"}',
			instance: 'i-1'
		});

		appender.flush();

		expect(logs).toHaveLength(1);
		expect(logs[0].parsedMessage).toBe('flush-now');

		vi.advanceTimersByTime(100);
		expect(logs).toHaveLength(1);
	});

	it('preserves displayed and pending logs when flushing a stopped stream', () => {
		let logs: LogLine[] = [];
		const appender = createBufferedLogAppender({
			maxEntries: 200,
			maxPendingEntries: 5000,
			flushIntervalMs: 100,
			getLogs: () => logs,
			setLogs: (nextLogs) => {
				logs = nextLogs;
			}
		});

		appender.enqueue({
			time: '2026-03-05T10:00:00.000Z',
			message: 'displayed',
			instance: 'i-1'
		});
		vi.advanceTimersByTime(100);
		appender.enqueue({
			time: '2026-03-05T10:00:01.000Z',
			message: 'pending',
			instance: 'i-1'
		});

		appender.flush();

		expect(logs.map((log) => log.message)).toEqual(['displayed', 'pending']);
		expect(vi.getTimerCount()).toBe(0);
		vi.advanceTimersByTime(100);
		expect(logs.map((log) => log.message)).toEqual(['displayed', 'pending']);
	});

	it('enforces pending queue size limit before flush', () => {
		let logs: LogLine[] = [];
		const appender = createBufferedLogAppender({
			maxEntries: 200,
			maxPendingEntries: 2,
			flushIntervalMs: 100,
			getLogs: () => logs,
			setLogs: (nextLogs) => {
				logs = nextLogs;
			}
		});

		appender.enqueue({
			time: '2026-03-05T10:00:00.000Z',
			message: '{"message":"first"}',
			instance: 'i-1'
		});
		appender.enqueue({
			time: '2026-03-05T10:00:01.000Z',
			message: '{"message":"second"}',
			instance: 'i-1'
		});
		appender.enqueue({
			time: '2026-03-05T10:00:02.000Z',
			message: '{"message":"third"}',
			instance: 'i-1'
		});

		vi.advanceTimersByTime(100);

		expect(logs).toHaveLength(2);
		expect(logs.map((log) => log.parsedMessage)).toEqual(['second', 'third']);
	});

	it('keeps raw timestamp string when date is invalid', () => {
		let logs: LogLine[] = [];
		const appender = createBufferedLogAppender({
			maxEntries: 200,
			maxPendingEntries: 5000,
			flushIntervalMs: 100,
			getLogs: () => logs,
			setLogs: (nextLogs) => {
				logs = nextLogs;
			}
		});

		appender.enqueue({
			time: 'not-a-date',
			message: '{"message":"invalid-time"}',
			instance: 'i-1'
		});

		appender.flush();

		expect(logs).toHaveLength(1);
		expect(logs[0].timestamp).toBe('not-a-date');
	});
});
