export type LogEntry = {
	timestamp: string;
	message: string;
	labels: Record<string, string>;
};

export type LogRange = { start: string; end: string };
export type LogPage = {
	entries: LogEntry[];
	nextEnd?: string;
	warnings: string[];
};
export type VolumeBucket = { start: number; end: number; count: number };
type QueryOptions = LogRange & {
	query: string;
	limit: number;
	signal?: AbortSignal;
};

const boundaryLimit = 5000;
const nanosecondsPerMillisecond = 1_000_000n;

function record(value: unknown): value is Record<string, unknown> {
	return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function invalidResponse(): never {
	throw new Error('Loki returned an invalid response.');
}

export function resolveLogRange(
	relativeMinutes: number | undefined,
	from: string,
	to: string,
	now = Date.now()
): LogRange {
	const start =
		relativeMinutes === undefined
			? new Date(from).getTime()
			: now - Math.round(relativeMinutes * 60_000);
	const end = relativeMinutes === undefined ? new Date(to).getTime() : now;
	if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || start >= end || end > now) {
		throw new Error('Choose a valid time range in the past, with From before To.');
	}
	return {
		start: String(BigInt(start) * nanosecondsPerMillisecond),
		end: String(BigInt(end) * nanosecondsPerMillisecond)
	};
}

export function logDate(timestamp: string): Date {
	return new Date(Number(BigInt(timestamp) / nanosecondsPerMillisecond));
}

export function moveLogRange(
	range: LogRange,
	direction: 'previous' | 'next' | 'now',
	now = Date.now()
): LogRange {
	const start = BigInt(range.start);
	const end = BigInt(range.end);
	const duration = end - start;
	const current = BigInt(now) * nanosecondsPerMillisecond;
	if (start < 0n || duration <= 0n || end > current) {
		throw new Error('Choose a valid time range in the past.');
	}
	const nextEnd =
		direction === 'now' ? current : direction === 'previous' ? end - duration : end + duration;
	const nextStart = nextEnd - duration;
	if (nextStart < 0n || nextEnd > current) {
		throw new Error('This time window cannot be shifted beyond the available time range.');
	}
	return { start: String(nextStart), end: String(nextEnd) };
}

export function toLocalDateTime(date: Date): string {
	return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 23);
}

async function request(
	parameters: Record<string, string>,
	signal?: AbortSignal,
	endpoint: 'query_range' | 'query' = 'query_range'
): Promise<{ data: Record<string, unknown>; warnings: string[] }> {
	const response = await fetch(`/api/loki/api/v1/${endpoint}?${new URLSearchParams(parameters)}`, {
		signal: signal
			? AbortSignal.any([signal, AbortSignal.timeout(60_000)])
			: AbortSignal.timeout(60_000),
		credentials: 'same-origin',
		headers: { Accept: 'application/json' }
	});
	if (response.status === 401)
		throw new Error('Your session has expired. Reload the page to sign in.');
	const text = await response.text();
	if (!response.ok) {
		const detail = text.trim().startsWith('<') ? '' : text.slice(0, 500);
		throw new Error(`Loki query failed (${response.status}). ${detail}`.trim());
	}
	let body: unknown;
	try {
		body = JSON.parse(text);
	} catch {
		throw new Error('Loki returned an invalid JSON response.');
	}
	if (!record(body)) invalidResponse();
	if (body.status !== 'success') {
		throw new Error(typeof body.error === 'string' ? body.error : 'Loki query failed.');
	}
	if (!record(body.data)) invalidResponse();
	if (
		body.warnings !== undefined &&
		(!Array.isArray(body.warnings) || !body.warnings.every((w) => typeof w === 'string'))
	) {
		invalidResponse();
	}
	return { data: body.data, warnings: body.warnings ?? [] };
}

function parseEntries(data: Record<string, unknown>): LogEntry[] {
	if (data.resultType !== 'streams' || !Array.isArray(data.result)) invalidResponse();
	const entries: LogEntry[] = [];
	for (const stream of data.result) {
		if (!record(stream) || !record(stream.stream) || !Array.isArray(stream.values))
			invalidResponse();
		const labels: Record<string, string> = {};
		for (const [key, value] of Object.entries(stream.stream)) {
			if (typeof value !== 'string') invalidResponse();
			labels[key] = value;
		}
		for (const value of stream.values) {
			if (
				!Array.isArray(value) ||
				typeof value[0] !== 'string' ||
				!/^\d+$/.test(value[0]) ||
				typeof value[1] !== 'string'
			) {
				invalidResponse();
			}
			const entryLabels = { ...labels };
			if (value[2] !== undefined) {
				if (!record(value[2])) invalidResponse();
				for (const [key, metadata] of Object.entries(value[2])) {
					if (typeof metadata !== 'string') invalidResponse();
					entryLabels[key] = metadata;
				}
			}
			entries.push({ timestamp: value[0], message: value[1], labels: entryLabels });
		}
	}
	return entries.sort((a, b) =>
		BigInt(a.timestamp) > BigInt(b.timestamp)
			? -1
			: BigInt(a.timestamp) < BigInt(b.timestamp)
				? 1
				: 0
	);
}

export async function fetchLogPage(options: QueryOptions): Promise<LogPage> {
	const parameters = {
		query: options.query,
		start: options.start,
		end: options.end,
		direction: 'backward',
		limit: String(options.limit)
	};
	const result = await request(parameters, options.signal);
	let entries = parseEntries(result.data);
	const warnings = [...result.warnings];
	let nextEnd: string | undefined;
	if (entries.length >= options.limit) {
		const boundary = entries.at(-1)!.timestamp;
		const complete = await request(
			{
				...parameters,
				start: boundary,
				end: String(BigInt(boundary) + 1n),
				limit: String(boundaryLimit)
			},
			options.signal
		);
		const boundaryEntries = parseEntries(complete.data);
		if (boundaryEntries.length >= boundaryLimit) {
			throw new Error(
				'Too many log lines share the same timestamp to paginate safely. Narrow the query or time range.'
			);
		}
		const existingBoundaryCount = entries.filter((entry) => entry.timestamp === boundary).length;
		if (
			boundaryEntries.length < existingBoundaryCount ||
			boundaryEntries.some((entry) => entry.timestamp !== boundary)
		) {
			throw new Error('The log results changed while loading a page. Run the query again.');
		}
		entries = [...entries.filter((entry) => entry.timestamp !== boundary), ...boundaryEntries];
		warnings.push(...complete.warnings);
		if (BigInt(boundary) > BigInt(options.start)) nextEnd = boundary;
	}
	return { entries, nextEnd, warnings: [...new Set(warnings)] };
}

export async function fetchLogVolume(
	query: string,
	range: LogRange,
	signal?: AbortSignal
): Promise<{ buckets: VolumeBucket[]; warnings: string[] }> {
	const startMs = logDate(range.start).getTime();
	const endMs = logDate(range.end).getTime();
	const stepMs = Math.max(1, Math.ceil((endMs - startMs) / 60_000)) * 1000;
	const buckets: VolumeBucket[] = [];
	for (let start = startMs; start < endMs;) {
		const end = Math.min(endMs, (Math.floor(start / stepMs) + 1) * stepMs);
		buckets.push({ start, end, count: 0 });
		start = end;
	}
	const groups: { first: number; last: number; instant: boolean }[] = [];
	const firstFull = buckets.findIndex((bucket) => bucket.end - bucket.start === stepMs);
	if (firstFull !== -1) {
		groups.push({
			first: firstFull,
			last: buckets.findLastIndex((bucket) => bucket.end - bucket.start === stepMs),
			instant: false
		});
	}
	for (const [index, bucket] of buckets.entries()) {
		if (bucket.end - bucket.start !== stepMs) {
			groups.push({ first: index, last: index, instant: true });
		}
	}
	const indexes = new Map(buckets.map((bucket, index) => [bucket.end, index]));
	const results = await Promise.all(
		groups.map(async (group) => {
			const first = buckets[group.first];
			const last = buckets[group.last];
			const parameters: Record<string, string> = {
				query: `sum(count_over_time(${query} [${first.end - first.start}ms]))`
			};
			if (group.instant) {
				parameters.time = String(BigInt(first.end) * nanosecondsPerMillisecond);
			} else {
				parameters.start = String(BigInt(first.end) * nanosecondsPerMillisecond);
				parameters.end = String(BigInt(last.end) * nanosecondsPerMillisecond);
				parameters.step = `${stepMs}ms`;
			}
			const result = await request(parameters, signal, group.instant ? 'query' : 'query_range');
			return { ...result, group };
		})
	);
	for (const result of results) {
		if (
			result.data.resultType !== (result.group.instant ? 'vector' : 'matrix') ||
			!Array.isArray(result.data.result)
		) {
			invalidResponse();
		}
		for (const series of result.data.result) {
			if (!record(series)) invalidResponse();
			const values = result.group.instant ? [series.value] : series.values;
			if (!Array.isArray(values)) invalidResponse();
			for (const value of values) {
				if (!Array.isArray(value) || typeof value[0] !== 'number' || typeof value[1] !== 'string')
					invalidResponse();
				const count = Number(value[1]);
				const index = result.group.instant
					? result.group.first
					: indexes.get(Math.round(value[0] * 1000));
				if (
					!Number.isFinite(value[0]) ||
					!Number.isFinite(count) ||
					count < 0 ||
					index === undefined ||
					index < result.group.first ||
					index > result.group.last
				) {
					invalidResponse();
				}
				buckets[index].count += count;
			}
		}
	}
	return { buckets, warnings: [...new Set(results.flatMap((result) => result.warnings))] };
}
