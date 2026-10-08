export function formString(data: FormData, name: string): string {
	const value = data.get(name);
	return typeof value === 'string' ? value.trim() : '';
}

export function postgresConfiguration(data: FormData) {
	return {
		cpu: formString(data, 'cpu'),
		memory: formString(data, 'memory'),
		diskSize: formString(data, 'diskSize'),
		highAvailability: data.get('highAvailability') === 'on'
	};
}

export function resourceInput(values: ReturnType<typeof postgresConfiguration>) {
	return {
		cpu: values.cpu ? values.cpu.replace(',', '.') : undefined,
		memory: values.memory ? `${values.memory.replace(',', '.')}Gi` : undefined,
		diskSize: values.diskSize ? `${values.diskSize}Gi` : undefined,
		highAvailability: values.highAvailability
	};
}

export type ResourceField = 'cpu' | 'memory' | 'diskSize';
export type ResourceErrors = Partial<Record<ResourceField, string>>;

export function configurationErrors(
	values: Pick<ReturnType<typeof postgresConfiguration>, ResourceField>
) {
	const errors: ResourceErrors = {};
	for (const [field, name, max] of [
		['cpu', 'CPU (cores)', postgresResources.cpu.max],
		['memory', 'Memory (GiB)', postgresResources.memory.max]
	] as const) {
		const value = values[field].trim();
		if (value && (!/^\d+(?:[.,]\d+)?$/.test(value) || !/[1-9]/.test(value))) {
			errors[field] = `${name} must be a positive decimal number.`;
			continue;
		}
		if (value) {
			const [whole, fraction = ''] = value.replace(',', '.').split('.');
			if (
				BigInt(whole) > BigInt(max) ||
				(BigInt(whole) === BigInt(max) && /[1-9]/.test(fraction))
			) {
				errors[field] = `${name} must be no greater than ${max}.`;
			}
		}
	}
	const diskSize = values.diskSize.trim();
	if (
		diskSize &&
		(!/^\d+$/.test(diskSize) ||
			BigInt(diskSize) < BigInt(postgresResources.diskSize.min) ||
			BigInt(diskSize) > BigInt(postgresResources.diskSize.max))
	) {
		errors.diskSize = `Storage (GiB) must be a whole number between ${postgresResources.diskSize.min} and ${postgresResources.diskSize.max}.`;
	}
	return errors;
}

export function configurationError(values: ReturnType<typeof postgresConfiguration>) {
	return Object.values(configurationErrors(values))[0];
}

export function quantityInUnits(quantity: string | null | undefined, unit: 'cores' | 'GiB') {
	if (!quantity) return '';
	const match = /^([+-]?)(\d*)(?:\.(\d*))?([eE][+-]?\d+|[numkKMGTPE]|[KMGTPE]i)?$/.exec(quantity);
	if (!match || !(match[2] || match[3])) {
		throw new Error(`Invalid Postgres resource quantity: ${quantity}`);
	}
	const fraction = match[3] ?? '';
	let numerator = BigInt(`${match[1]}${match[2] || '0'}${fraction}`);
	let denominator = 10n ** BigInt(fraction.length);
	const suffix = match[4] ?? '';
	if (suffix.endsWith('i')) {
		numerator *= 1024n ** BigInt('KMGTPE'.indexOf(suffix[0]) + 1);
	} else {
		const exponent =
			suffix.startsWith('e') || /^E[+-]?\d/.test(suffix)
				? Number(suffix.slice(1))
				: ({ n: -9, u: -6, m: -3, k: 3, K: 3, M: 6, G: 9, T: 12, P: 15, E: 18 }[suffix] ?? 0);
		if (exponent >= 0) numerator *= 10n ** BigInt(exponent);
		else denominator *= 10n ** BigInt(-exponent);
	}
	if (unit === 'GiB') denominator *= 1024n ** 3n;
	const negative = numerator < 0n;
	if (negative) numerator = -numerator;
	const whole = numerator / denominator;
	let remainder = numerator % denominator;
	let decimals = '';
	while (remainder) {
		remainder *= 10n;
		decimals += String(remainder / denominator);
		remainder %= denominator;
	}
	return `${negative ? '-' : ''}${whole}${decimals ? `.${decimals}` : ''}`;
}

export function canDeleteBranch(
	branch: string,
	activeBranch: string | null | undefined,
	desiredActiveBranch: string | null | undefined
) {
	return (
		branch !== activeBranch &&
		branch !== desiredActiveBranch &&
		!(!activeBranch && !desiredActiveBranch && branch === 'main')
	);
}
export const postgresResources = {
	cpu: { default: '0.1', max: 8 },
	memory: { default: '0.5', max: 32 },
	diskSize: { default: '10', min: 10, max: 1000 }
};
