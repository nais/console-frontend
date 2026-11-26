export const standaloneBackupRetention = { min: 1, max: 730, default: 30 };

const DNS_SUBDOMAIN_RE = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/;

export function standaloneBackupNameError(value: string | null | undefined): string | undefined {
	const text = (value ?? '').trim();
	if (!text) {
		return 'Backup name is required.';
	}
	if (text.length > 253 || !DNS_SUBDOMAIN_RE.test(text)) {
		return 'Backup name must be lowercase letters, numbers, hyphens or dots, starting and ending with an alphanumeric character.';
	}
}

export function standaloneBackupRetentionError(
	value: string | null | undefined
): string | undefined {
	const text = (value ?? '').trim();
	if (!text) return undefined;
	const days = Number(text);
	if (
		!/^\d+$/.test(text) ||
		days < standaloneBackupRetention.min ||
		days > standaloneBackupRetention.max
	) {
		return `Retention must be a whole number of days between ${standaloneBackupRetention.min} and ${standaloneBackupRetention.max}.`;
	}
}

export function parseStandaloneBackupRetention(
	value: string | null | undefined
): number | undefined {
	const text = (value ?? '').trim();
	return text && !standaloneBackupRetentionError(text) ? Number(text) : undefined;
}

export function defaultStandaloneBackupName(postgresName: string, now = new Date()): string {
	const pad = (n: number) => String(n).padStart(2, '0');
	const stamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}-${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}`;
	const prefix = postgresName
		.toLowerCase()
		.replace(/[^a-z0-9-]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, Math.max(1, 63 - stamp.length - 1))
		.replace(/-+$/g, '');
	return `${prefix || 'backup'}-${stamp}`;
}

export function backupPhaseTone(phase: string): 'success' | 'danger' | 'warning' {
	if (phase === 'COMPLETED') return 'success';
	if (phase === 'FAILED') return 'danger';
	return 'warning';
}

export function backupPhaseLabel(phase: string): string {
	switch (phase) {
		case 'COMPLETED':
			return 'Completed';
		case 'FAILED':
			return 'Failed';
		case 'RUNNING':
			return 'Running';
		default:
			return 'Preparing';
	}
}

export function backupPending(phase: string | null | undefined): boolean {
	return phase === 'PREPARING' || phase === 'RUNNING';
}
