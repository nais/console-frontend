export const EXPIRY_OPTIONS = [
	{ value: '30d', label: '30 days' },
	{ value: '90d', label: '90 days' },
	{ value: '180d', label: '180 days' },
	{ value: '365d', label: '365 days' },
	{ value: 'never', label: 'Never' },
	{ value: 'custom', label: 'Custom date' }
] as const;

export const DEFAULT_EXPIRY = '365d';

const PRESET_DAYS: Record<string, number> = {
	'30d': 30,
	'90d': 90,
	'180d': 180,
	'365d': 365
};

/**
 * Resolves the submitted expiry choice into a concrete date. Computed server-side so the
 * expiry does not depend on the client's clock.
 *
 * A missing `expiresIn` is tolerated so forms cached from before this field existed keep
 * working: a submitted date is treated as a custom expiry, otherwise the default applies.
 */
export function resolveExpiry(
	expiresIn: string | null,
	expiresAt: string | null
): { date?: Date; error?: string } {
	const choice = expiresIn || (expiresAt ? 'custom' : DEFAULT_EXPIRY);

	if (choice === 'never') {
		return {};
	}

	if (choice === 'custom') {
		if (!expiresAt) {
			return { error: 'Choose an expiry date' };
		}
		const date = new Date(expiresAt);
		if (isNaN(date.getTime())) {
			return { error: 'Expires at must be a valid date' };
		}
		return { date };
	}

	const days = PRESET_DAYS[choice];
	if (days === undefined) {
		return { error: 'Invalid expiry option' };
	}

	const date = new Date();
	date.setDate(date.getDate() + days);
	return { date };
}
