export function percentageFormatter(value: number, maximumFractionDigits: number = 2): string {
	if (isNaN(value) || value == 0) {
		return '0';
	}
	return value.toLocaleString('en-GB', { maximumFractionDigits }) + '%';
}
