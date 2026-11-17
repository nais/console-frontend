/**
 * When no target time is given, a clone is made from "now minus this buffer": the latest point
 * that is safely archived (recent write-ahead logs may not have been archived yet).
 */
export const CLONE_LATEST_POINT_BUFFER_MINUTES = 10;
const CLONE_LATEST_POINT_BUFFER_MS = CLONE_LATEST_POINT_BUFFER_MINUTES * 60_000;

export type CloneMode = 'empty' | 'clone';

/** `recovery` is the legacy name of the clone mode and is still accepted in old links/forms. */
export function parseCloneMode(value: string | null | undefined): CloneMode {
	return value === 'clone' || value === 'recovery' ? 'clone' : 'empty';
}

export function clonePostgresHref(team: string, environment: string, source: string) {
	return `/team/${encodeURIComponent(team)}/postgres/create?${new URLSearchParams({ environment, source, mode: 'clone' })}`;
}

export function browserTimeZone(): string {
	return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}

function wallClockParts(ms: number, timeZone: string) {
	const parts = new Intl.DateTimeFormat('en-US', {
		timeZone,
		hourCycle: 'h23',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit'
	}).formatToParts(new Date(ms));
	const get = (type: string) => Number(parts.find((part) => part.type === type)?.value);
	return {
		year: get('year'),
		month: get('month'),
		day: get('day'),
		hour: get('hour') % 24,
		minute: get('minute'),
		second: get('second')
	};
}

/** Offset of the zone from UTC, in ms, at the given instant. */
function zoneOffsetMs(ms: number, timeZone: string) {
	const p = wallClockParts(ms, timeZone);
	const wall = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
	return wall - Math.floor(ms / 1000) * 1000;
}

/** Formats an instant as a datetime-local value (`YYYY-MM-DDTHH:mm`) in the given zone. */
export function formatLocalInput(date: Date, timeZone = browserTimeZone()): string {
	const p = wallClockParts(date.getTime(), timeZone);
	const pad = (n: number, width = 2) => String(n).padStart(width, '0');
	return `${pad(p.year, 4)}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}`;
}

export type LocalTimeParse = { instant: Date } | { error: 'invalid' | 'nonexistent' };

/**
 * Interprets a datetime-local value in the given IANA zone and returns the absolute instant.
 * Nonexistent times (spring-forward gap) are rejected; ambiguous times (fall-back overlap)
 * resolve deterministically to the first (earlier) occurrence.
 */
export function parseLocalDateTime(value: string, timeZone = browserTimeZone()): LocalTimeParse {
	const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
	if (!match) return { error: 'invalid' };
	const [year, month, day, hour, minute] = match.slice(1).map(Number);
	const wall = Date.UTC(year, month - 1, day, hour, minute);
	if (!Number.isFinite(wall) || new Date(wall).toISOString().slice(0, 16) !== value) {
		return { error: 'invalid' };
	}
	const day24 = 24 * 60 * 60_000;
	const offsets = [wall - day24, wall, wall + day24].map((ms) => zoneOffsetMs(ms, timeZone));
	const candidates = offsets
		.map((offset) => wall - offset)
		.filter((ms, index, all) => all.indexOf(ms) === index)
		.filter((ms) => formatLocalInput(new Date(ms), timeZone) === value)
		.sort((a, b) => a - b);
	return candidates.length ? { instant: new Date(candidates[0]) } : { error: 'nonexistent' };
}

/** Parses the absolute whole-second ISO instant sent by the browser (`YYYY-MM-DDTHH:mm:ss(.000)Z`). */
export function parseInstant(value: string): Date | null {
	if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.000)?Z$/.test(value)) return null;
	const date = new Date(value);
	if (!Number.isFinite(date.getTime())) return null;
	return date.toISOString().slice(0, 19) === value.slice(0, 19) ? date : null;
}

export function truncateToSeconds(date: Date) {
	return new Date(Math.floor(date.getTime() / 1000) * 1000);
}

/** The target used when the user leaves the time empty: now minus the buffer, whole seconds. */
export function defaultCloneTime(now: Date) {
	return truncateToSeconds(new Date(now.getTime() - CLONE_LATEST_POINT_BUFFER_MS));
}

/** Earliest selectable datetime-local value (minute resolution, rounded up) in the given zone. */
export function recoveryTimeMinimum(earliest: Date | null | undefined, timeZone?: string) {
	if (!earliest || !Number.isFinite(earliest.getTime())) return undefined;
	return formatLocalInput(new Date(Math.ceil(earliest.getTime() / 60_000) * 60_000), timeZone);
}

/** Human readable time in the given zone, e.g. "1 Jan 2026, 13:00:01" (no zone name). */
export function formatLocalTime(date: Date, timeZone = browserTimeZone()): string {
	return new Intl.DateTimeFormat('en-GB', {
		timeZone,
		hourCycle: 'h23',
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit'
	}).format(date);
}

export type CloneTarget = { target: Date } | { error: string };

/**
 * Resolves the absolute target instant. `explicit` is null when the user left the time empty, in
 * which case the default (now minus buffer) is used. All comparisons are between absolute instants.
 */
export function resolveCloneTarget(
	explicit: Date | null,
	earliest: Date | null | undefined,
	now: Date,
	timeZone?: string
): CloneTarget {
	if (!earliest || !Number.isFinite(earliest.getTime())) {
		return { error: 'The source has no available recovery window.' };
	}
	const earliestText = formatLocalTime(earliest, timeZone);
	if (!explicit) {
		const target = defaultCloneTime(now);
		return target < earliest
			? {
					error: `The latest available point (about ${CLONE_LATEST_POINT_BUFFER_MINUTES} minutes ago) is before the earliest clone time, ${earliestText}. Try again later or specify a time.`
				}
			: { target };
	}
	const target = truncateToSeconds(explicit);
	if (target < earliest) {
		return { error: `Target time must not be before the earliest clone time, ${earliestText}.` };
	}
	if (target > now) return { error: 'Target time must not be in the future.' };
	return { target };
}

/** Client-side validation of the optional datetime-local field; empty means "use the default". */
export function recoveryTimeError(
	value: string,
	earliest: Date | null | undefined,
	now: Date,
	timeZone?: string
): string | undefined {
	let explicit: Date | null = null;
	if (value) {
		const parsed = parseLocalDateTime(value, timeZone);
		if ('error' in parsed) {
			return parsed.error === 'nonexistent'
				? 'This time does not exist because of a clock change. Choose another time.'
				: 'Enter a valid target time.';
		}
		explicit = parsed.instant;
	}
	const resolved = resolveCloneTarget(explicit, earliest, now, timeZone);
	return 'error' in resolved ? resolved.error : undefined;
}

export function recoveryPending(
	recovery: { completed: boolean; failureMessage?: string | null } | null | undefined
) {
	return !!recovery && !recovery.completed && !recovery.failureMessage;
}
