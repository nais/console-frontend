import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createBufferedLogAppender, getLogLevel, parseLogMessage, type LogLine } from './logViewer';

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

describe('getLogLevel', () => {
	it('extracts and uppercases the level from JSON logs', () => {
		expect(getLogLevel('{"level":"warn","message":"hello"}')).toBe('WARN');
	});

	it('defaults to INFO when level is missing', () => {
		expect(getLogLevel('{"message":"hello"}')).toBe('INFO');
		expect(getLogLevel('plain text log line')).toBe('INFO');
	});
});

describe('parseLogMessage', () => {
	it('returns nested message from JSON payload', () => {
		expect(parseLogMessage('{"message":"parsed message"}')).toBe('parsed message');
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
