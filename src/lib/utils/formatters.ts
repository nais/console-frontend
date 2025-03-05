export function percentageFormatter(value: number, maximumFractionDigits: number = 2): string {
	if (isNaN(value) || value == 0) {
		return '0';
	}
	return value.toLocaleString('en-GB', { maximumFractionDigits }) + '%';
}

export function capitalizeFirstLetter(sentence: string): string {
	return sentence.length ? sentence.charAt(0).toUpperCase() + sentence.slice(1) : sentence;
}

export function numberToWords(num: number): string {
	if (num < 0 || num > 999) throw new Error('Number out of range (0–999)');

	const ones = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
	const teens = [
		'eleven',
		'twelve',
		'thirteen',
		'fourteen',
		'fifteen',
		'sixteen',
		'seventeen',
		'eighteen',
		'nineteen'
	];
	const tens = [
		'ten',
		'twenty',
		'thirty',
		'forty',
		'fifty',
		'sixty',
		'seventy',
		'eighty',
		'ninety'
	];

	if (num < 10) return ones[num];
	if (num > 10 && num < 20) return teens[num - 11];
	if (num >= 10 && num < 100) {
		return num % 10 === 0
			? tens[Math.floor(num / 10) - 1]
			: `${tens[Math.floor(num / 10) - 1]}-${ones[num % 10]}`;
	}

	// Handling 100–999
	const hundredPart = ones[Math.floor(num / 100)] + ' hundred';
	const remainder = num % 100;

	if (remainder === 0) return hundredPart;
	return `${hundredPart} and ${numberToWords(remainder)}`;
}
