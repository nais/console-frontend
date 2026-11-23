export const backupRetention = { min: 2, max: 30, default: 2 };

// Standard storage in a Nais GCP region, per GiB-month in euro. A rough list price.
const STORAGE_EUR_PER_GIB_MONTH = 0.02;

/** Whole days within the allowed range, or an error message. Blank means "not provided". */
export function backupRetentionError(value: string | null | undefined): string | undefined {
	const text = (value ?? '').trim();
	if (!text) return undefined;
	const days = Number(text);
	if (!/^\d+$/.test(text) || days < backupRetention.min || days > backupRetention.max) {
		return `Recovery window must be a whole number of days between ${backupRetention.min} and ${backupRetention.max}.`;
	}
}

export function parseBackupRetention(value: string | null | undefined): number | undefined {
	const text = (value ?? '').trim();
	return text && !backupRetentionError(text) ? Number(text) : undefined;
}

/**
 * Upper bound for the monthly storage cost of the recovery window.
 *
 * The amount of data actually stored is unknown, so the storage size is used as a stand-in for
 * the size of one base backup. A base backup is taken every night and one is kept from before the
 * window starts, giving `days + 1` copies. Compression, an unfilled disk and write-ahead logs
 * (usually small next to the base backups) make the real number differ.
 */
export function estimateBackupCost(diskSizeGiB: number, days: number) {
	const storedGiB = diskSizeGiB * (days + 1);
	return { storedGiB, eurPerMonth: storedGiB * STORAGE_EUR_PER_GIB_MONTH };
}
