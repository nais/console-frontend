export const EXPIRY_OPTIONS = [
	{ value: '3m', text: '3 months' },
	{ value: '6m', text: '6 months' },
	{ value: '1y', text: '1 year' },
	{ value: '2y', text: '2 years' },
	{ value: 'never', text: 'Never' },
	{ value: 'custom', text: 'Custom date' }
] as const;

export const DEFAULT_EXPIRY = '1y';

const PRESET_MONTHS: Record<string, number> = {
	'3m': 3,
	'6m': 6,
	'1y': 12,
	'2y': 24
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

	const months = PRESET_MONTHS[choice];
	if (months === undefined) {
		return { error: 'Invalid expiry option' };
	}

	const date = new Date();
	date.setMonth(date.getMonth() + months);
	return { date };
}
