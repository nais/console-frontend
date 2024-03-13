export function euroValueFormatter(value: number): string {
	return value.toLocaleString('en-GB', {
		style: 'currency',
		currency: 'EUR',
		maximumFractionDigits: 2
	});
}

export function percentageFormatter(value: number, maximumFractionDigits: number = 2): string {
	return value.toLocaleString('en-GB', { maximumFractionDigits }) + '%';
}
