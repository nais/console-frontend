export function percentageFormatter(value: number, maximumFractionDigits: number = 2): string {
	if (isNaN(value) || value === 0) {
		return '0 %';
	}

	const fraction = value / 100;

	return fraction.toLocaleString('nb-NO', {
		style: 'percent',
		maximumFractionDigits
	});
}

export function capitalizeFirstLetter(sentence: string): string {
	return sentence.length ? sentence.charAt(0).toUpperCase() + sentence.slice(1) : sentence;
}

export function numberFormatter(value: number, maximumFractionDigits: number = 2): string {
	if (isNaN(value)) {
		return '0';
	}
	return value.toLocaleString('no-NO', { maximumFractionDigits });
}

export function euroValueFormatter(
	value?: number,
	{ maximumFractionDigits = 2 }: Intl.NumberFormatOptions = {}
): string {
	if (value === undefined) {
		return '';
	}

	return value.toLocaleString('nb-NO', {
		style: 'currency',
		currency: 'EUR',
		maximumFractionDigits,
		maximumSignificantDigits: 2,
		roundingPriority: 'morePrecision'
	});
}

export function formatKubernetesMemory(bytes: number): string {
	// Define the units used in Kubernetes memory representation.
	const units = ['Ei', 'Pi', 'Ti', 'Gi', 'Mi', 'Ki'];
	const factor = 1024; // Memory sizes in Kubernetes are based on powers of 1024.
	const powers = [6, 5, 4, 3, 2, 1];

	// Iterate through the units to find the appropriate one for the given byte size.
	for (let i = 0; i < units.length; i++) {
		const unitSize = Math.pow(factor, powers[i]);

		// Check if the byte size is greater than or equal to the current unit size.
		if (bytes >= unitSize) {
			// Calculate the raw value in the current unit.
			const raw = bytes / unitSize;

			// If the value would have decimals in the current unit,
			// use the next smaller unit instead to get an integer value.
			// This ensures Kubernetes manifest compatibility (pattern: ^\d+[KMG]i$)
			if (raw < 10 && i < units.length - 1) {
				// Use the next smaller unit
				const smallerUnitSize = Math.pow(factor, powers[i + 1]);
				const valueInSmallerUnit = Math.ceil(bytes / smallerUnitSize);
				return `${valueInSmallerUnit}${units[i + 1]}`;
			}

			// Round to the nearest integer for values >= 10
			const rounded = Math.ceil(raw);
			return `${rounded}${units[i]}`;
		}
	}

	// If the byte size is smaller than the smallest unit, return it as bytes (B).
	return `${bytes}B`;
}

export function formatKubernetesCPU(cpu: number): string {
	// If CPU is less than 1 (in millicores)
	if (cpu < 1) {
		// Convert to millicores and round up to nearest integer
		const millicores = Math.ceil(cpu * 1000); // Round up to nearest integer
		return `${millicores}m`; // Show the raw value in parentheses
	}

	// Otherwise, return as normal CPU cores (round to 1 decimal place for CPUs >= 1)
	const rounded = Math.ceil(cpu * 10) / 10; // Round to 1 decimal place for CPUs >= 1
	return `${rounded}`; // Show the raw value in parentheses
}
