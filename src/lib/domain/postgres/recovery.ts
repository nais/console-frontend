export function restorePostgresHref(team: string, environment: string, source: string) {
	return `/team/${encodeURIComponent(team)}/postgres/create?${new URLSearchParams({ environment, source, mode: 'recovery' })}`;
}

/** datetime-local values are deliberately interpreted as UTC, never browser-local time. */
export function parseRecoveryTime(value: string): Date | null {
	if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
	const date = new Date(`${value}:00.000Z`);
	return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 16) === value ? date : null;
}

export function recoveryTimeMinimum(earliest: Date | null | undefined) {
	if (!earliest || !Number.isFinite(earliest.getTime())) return undefined;
	return new Date(Math.ceil(earliest.getTime() / 60_000) * 60_000).toISOString().slice(0, 16);
}

export function recoveryTimeError(value: string, earliest: Date | null | undefined, now: Date) {
	const target = parseRecoveryTime(value);
	if (!target) return 'Enter a valid target time in UTC.';
	if (!earliest || !Number.isFinite(earliest.getTime()))
		return 'The source has no available recovery window.';
	if (target < earliest) return 'Target time must not be before the earliest restore time.';
	if (target > now) return 'Target time must not be in the future.';
}

export function recoveryPending(
	recovery: { completed: boolean; failureMessage?: string | null } | null | undefined
) {
	return !!recovery && !recovery.completed && !recovery.failureMessage;
}
