import { appendSortedBoundedLog } from '#lib/utils/logStream.js';

export const PINO_LOG_LEVELS: Record<string, number> = {
	TRACE: 10,
	DEBUG: 20,
	INFO: 30,
	WARN: 40,
	ERROR: 50,
	FATAL: 60
};

const pinoLogLevelNames = Object.fromEntries(
	Object.entries(PINO_LOG_LEVELS).map(([name, value]) => [String(value), name])
);

const logInstanceColors = [
	'accent',
	'success',
	'warning',
	'danger',
	'brand-magenta',
	'meta-purple',
	'meta-lime',
	'brand-beige',
	'info',
	'brand-blue'
] as const;

export function getLogInstanceColor(instance: string, instances: readonly string[] = []) {
	const position = instances.indexOf(instance);
	if (position >= 0) return logInstanceColors[(position * 7) % logInstanceColors.length];

	let hash = 0;
	for (const character of instance) {
		hash = (Math.imul(hash, 31) + character.charCodeAt(0)) >>> 0;
	}
	return logInstanceColors[hash % logInstanceColors.length];
}

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
	getSelectedLevels?: () => ReadonlySet<string>;
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
	const logLevel = message.match(/"level"\s*:\s*(?:"([^"]+)"|(\d+))/);
	const value = logLevel?.[1] ?? logLevel?.[2];
	if (value === undefined) return 'INFO';
	return Object.hasOwn(pinoLogLevelNames, value) ? pinoLogLevelNames[value] : value.toUpperCase();
}

export function filterLogsByLevel(logs: LogLine[], levels?: ReadonlySet<string>): LogLine[] {
	return levels === undefined ? logs : logs.filter((log) => levels.has(log.level));
}

export function formatPostgresLogInstance(instance: string, postgres: string): string {
	const prefix = `pg-${postgres}-`;
	if (!instance.startsWith(prefix)) return instance;
	const match = instance.slice(prefix.length).match(/^(.+)-[a-f0-9]{8}-(\d+)$/);
	return match ? `${match[1]}-${match[2]}` : instance;
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

	function appendLog(logs: LogLine[], entry: LogLine, maxEntries: number): LogLine[] {
		const selectedLevels = options.getSelectedLevels?.();
		if (selectedLevels === undefined) {
			return appendSortedBoundedLog(logs, entry, maxEntries);
		}

		let matchingCount = 0;
		let hiddenCount = 0;
		return appendSortedBoundedLog(logs, entry, maxEntries * 2 + 1)
			.toReversed()
			.filter((log) =>
				selectedLevels.has(log.level) ? ++matchingCount <= maxEntries : ++hiddenCount <= maxEntries
			)
			.toReversed();
	}

	function flushPendingLogs() {
		flushTimeout = undefined;
		if (pendingLogs.length === 0) {
			return;
		}

		let nextLogs = options.getLogs();
		for (const pendingLog of pendingLogs) {
			nextLogs = appendLog(nextLogs, pendingLog, options.maxEntries);
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
			pendingLogs = appendLog(pendingLogs, line, options.maxPendingEntries);
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
