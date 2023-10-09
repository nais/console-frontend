export function euroValueFormatter(value: number): string {
	let fraction = 2;

	if (value < 0.01) {
		fraction = 6;
	}

	return value.toLocaleString('en-GB', {
		style: 'currency',
		currency: 'EUR',
		maximumFractionDigits: fraction
	});
}
