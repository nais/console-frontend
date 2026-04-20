import { appendSortedBoundedLog } from '$lib/utils/logStream';

type WorkloadLog = {
	time: Date | string | number;
	message: string;
	instance: string;
};

export type LogLine = {
	id: number;
	time: Date;
	timestamp: string;
	message: string;
	instance: string;
	parsedMessage: string;
	level: string;
};

type BufferedLogAppenderOptions = {
	maxEntries: number;
	maxPendingEntries: number;
	flushIntervalMs: number;
	getLogs: () => LogLine[];
	setLogs: (logs: LogLine[]) => void;
};

function formatTimestamp(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	const hour = String(date.getHours()).padStart(2, '0');
	const minute = String(date.getMinutes()).padStart(2, '0');
	const second = String(date.getSeconds()).padStart(2, '0');
	const milliseconds = String(date.getMilliseconds()).padStart(3, '0');

	return `${year}-${month}-${day} ${hour}:${minute}:${second}.${milliseconds}`;
}

export function getLogLevel(message: string): string {
	const logLevel = message.match(/"level":"(\w+)"/);
	if (logLevel) {
		return logLevel[1].toUpperCase();
	}
	return 'INFO';
}

export function parseLogMessage(message: string): string {
	try {
		const parsed = JSON.parse(message) as { message?: string };
		return parsed.message ?? message;
	} catch {
		return message;
	}
}

function createLogLine(log: WorkloadLog, id: number): LogLine {
	const time = new Date(log.time);
	return {
		id,
		time,
		timestamp: Number.isNaN(time.getTime()) ? String(log.time) : formatTimestamp(time),
		message: log.message,
		instance: log.instance,
		parsedMessage: parseLogMessage(log.message),
		level: getLogLevel(log.message)
	};
}

export function createBufferedLogAppender(options: BufferedLogAppenderOptions) {
	let nextId = 0;
	let pendingLogs: LogLine[] = [];
	let flushTimeout: ReturnType<typeof setTimeout> | undefined;

	function flushPendingLogs() {
		flushTimeout = undefined;
		if (pendingLogs.length === 0) {
			return;
		}

		let nextLogs = options.getLogs();
		for (const pendingLog of pendingLogs) {
			nextLogs = appendSortedBoundedLog(nextLogs, pendingLog, options.maxEntries);
		}

		pendingLogs = [];
		options.setLogs(nextLogs);
	}

	function scheduleFlush() {
		if (flushTimeout !== undefined) {
			return;
		}

		flushTimeout = setTimeout(flushPendingLogs, options.flushIntervalMs);
	}

	return {
		enqueue(log: WorkloadLog) {
			const line = createLogLine(log, nextId++);
			pendingLogs = appendSortedBoundedLog(pendingLogs, line, options.maxPendingEntries);
			scheduleFlush();
		},
		flush() {
			if (flushTimeout !== undefined) {
				clearTimeout(flushTimeout);
			}
			flushPendingLogs();
		},
		clear() {
			pendingLogs = [];
			if (flushTimeout !== undefined) {
				clearTimeout(flushTimeout);
				flushTimeout = undefined;
			}
		}
	};
}
