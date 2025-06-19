export function percentageFormatter(value: number, maximumFractionDigits: number = 2): string {
	if (isNaN(value) || value == 0) {
		return '0';
	}
	return value.toLocaleString('en-GB', { maximumFractionDigits }) + '%';
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
			// Ensure the smallest unit is used if no match
			// Calculate the raw value in the current unit.
			const raw = bytes / unitSize;

			// Round the value based on its size:
			// - If >= 10, round to the nearest integer.
			// - Otherwise, round to two decimal places.
			const rounded = raw >= 10 ? Math.floor(raw) : Math.round(raw * 100) / 100;

			let str = rounded.toString();
			if (str.includes('.')) {
				str = str.replace(/0+$/, '');
				if (str.endsWith('.')) {
					str = str.slice(0, -1);
				}
			}

			// Return the formatted string with the appropriate unit.
			return `${str}${units[i]}`;
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
