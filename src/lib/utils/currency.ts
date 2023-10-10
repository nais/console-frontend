export function euroValueFormatter(value: number): string {
	return value.toLocaleString('en-GB', {
		style: 'currency',
		currency: 'EUR',
		maximumFractionDigits: 2
	});
}
