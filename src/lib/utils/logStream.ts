type LogTimestamp = Date | string | number;

type LogEntry = {
	time: LogTimestamp;
};

function toMilliseconds(value: LogTimestamp): number {
	const milliseconds =
		value instanceof Date
			? value.getTime()
			: typeof value === 'number'
				? value
				: new Date(value).getTime();

	return Number.isFinite(milliseconds) ? milliseconds : Number.POSITIVE_INFINITY;
}

export function appendSortedBoundedLog<T extends LogEntry>(
	logs: T[],
	entry: T,
	maxEntries: number
): T[] {
	if (maxEntries <= 0) {
		return [];
	}

	const entryTimestamp = toMilliseconds(entry.time);
	const last = logs.at(-1);

	if (!last || toMilliseconds(last.time) <= entryTimestamp) {
		const appended = [...logs, entry];
		return appended.length > maxEntries ? appended.slice(appended.length - maxEntries) : appended;
	}

	let insertAt = logs.length;
	while (insertAt > 0 && toMilliseconds(logs[insertAt - 1].time) > entryTimestamp) {
		insertAt -= 1;
	}

	const merged = [...logs.slice(0, insertAt), entry, ...logs.slice(insertAt)];
	return merged.length > maxEntries ? merged.slice(merged.length - maxEntries) : merged;
}
