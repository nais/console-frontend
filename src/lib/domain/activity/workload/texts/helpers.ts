export function summarizeChangedFields(
	fields: Array<{ field: string | null | undefined }>
): string {
	const names = fields
		.map((field) => field.field)
		.filter((field): field is string => Boolean(field));

	if (names.length === 0) {
		return 'settings';
	}

	if (names.length <= 3) {
		return names.join(', ');
	}

	return `${names.length} fields`;
}
