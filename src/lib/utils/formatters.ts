export function percentageFormatter(value: number, maximumFractionDigits: number = 2): string {
	if (isNaN(value) || value == 0) {
		return '0';
	}
	return value.toLocaleString('en-GB', { maximumFractionDigits }) + '%';
}

export function capitalizeFirstLetter(sentence: string): string {
	return sentence.length ? sentence.charAt(0).toUpperCase() + sentence.slice(1) : sentence;
}
