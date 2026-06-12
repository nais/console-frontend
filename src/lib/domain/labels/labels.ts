export const LABEL_MAX_LENGTH = 63;

const KEY_CHARSET = /^[a-zA-Z0-9._/-]+$/;
const KEY_CHARSET_MESSAGE =
	'Must consist of letters, numbers, hyphens, underscores, slashes or dots';
const VALUE_CHARSET = /^[a-zA-Z0-9._-]+$/;
const VALUE_CHARSET_MESSAGE = 'Must consist of letters, numbers, hyphens, underscores, or dots';

export interface Label {
	key: string;
	value: string;
}

export interface LabelRow {
	key: string;
	value: string;
}

export function labelKeyError(suffix: string): string {
	const key = suffix.trim();
	if (key.length === 0) {
		return 'Key is required';
	}
	if (key.length > LABEL_MAX_LENGTH) {
		return `Must be at most ${LABEL_MAX_LENGTH} characters`;
	}
	if (!KEY_CHARSET.test(key)) {
		return KEY_CHARSET_MESSAGE;
	}
	return '';
}

export function labelValueError(value: string): string {
	const v = value.trim();
	if (v.length === 0) {
		return '';
	}
	if (v.length > LABEL_MAX_LENGTH) {
		return `Must be at most ${LABEL_MAX_LENGTH} characters`;
	}
	if (!VALUE_CHARSET.test(v)) {
		return VALUE_CHARSET_MESSAGE;
	}
	return '';
}

function isRowEmpty(row: LabelRow): boolean {
	return row.key.trim() === '' && row.value.trim() === '';
}

export function duplicateLabelKeys(rows: readonly LabelRow[]): Set<string> {
	const seen = new Set<string>();
	const dupes = new Set<string>();
	for (const row of rows) {
		const key = row.key.trim();
		if (!key) {
			continue;
		}
		if (seen.has(key)) {
			dupes.add(key);
		}
		seen.add(key);
	}
	return dupes;
}

export function rowKeyError(row: LabelRow, duplicates: Set<string>): string {
	if (isRowEmpty(row)) {
		return '';
	}
	const key = row.key.trim();
	if (key && duplicates.has(key)) {
		return 'Duplicate key';
	}
	return labelKeyError(row.key);
}

export function rowValueError(row: LabelRow): string {
	if (isRowEmpty(row)) {
		return '';
	}
	return labelValueError(row.value);
}

export function labelRowsHaveErrors(rows: readonly LabelRow[]): boolean {
	const duplicates = duplicateLabelKeys(rows);
	return rows.some((row) => rowKeyError(row, duplicates) !== '' || rowValueError(row) !== '');
}

export function rowsFromArrays(keys: string[], values: string[]): LabelRow[] {
	return keys.map((key, i) => ({ key, value: values[i] ?? '' }));
}

export function toLabelInput(rows: readonly LabelRow[]): Label[] {
	return rows
		.map((row) => ({ key: row.key.trim(), value: row.value.trim() }))
		.filter((row) => row.key.length > 0);
}

export function toLabelRows(labels: readonly Label[]): LabelRow[] {
	return labels.map((label) => ({
		key: label.key,
		value: label.value
	}));
}

/**
 * Parse a URL search param value like "key:value,key2:value2" into LabelFilter objects.
 * Returns undefined if the param is empty or null.
 */
export function parseLabelsParam(
	param: string | null
): { key: string; value: string }[] | undefined {
	if (!param) return undefined;
	const parsed = param
		.split(',')
		.filter(Boolean)
		.map((l) => {
			const [key, ...rest] = l.split(':');
			return { key, value: rest.join(':') };
		})
		.filter((l) => l.key && l.value);
	return parsed.length > 0 ? parsed : undefined;
}
