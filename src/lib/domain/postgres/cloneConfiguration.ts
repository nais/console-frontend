import { quantityInUnits, resourceInput, type postgresConfiguration } from './forms.js';

export type CloneSource = {
	majorVersion: string;
	extensions: readonly string[];
	highAvailability: boolean;
	resources?: { cpu?: string | null; memory?: string | null; diskSize?: string | null } | null;
};

/** The form values a clone starts with: the source's configuration. Empty means "not configured". */
export type CloneBaseline = {
	cpu: string;
	memory: string;
	diskSize: string;
	highAvailability: boolean;
	extensions: readonly string[];
	/** Smallest accepted whole-GiB storage: the source's size rounded up (undefined if unset). */
	diskSizeMin: number | undefined;
};

function ceilGiB(decimal: string) {
	const [whole, fraction = ''] = decimal.split('.');
	return BigInt(whole) + (/[1-9]/.test(fraction) ? 1n : 0n);
}

export function cloneBaseline(source: CloneSource): CloneBaseline {
	const diskGiB = quantityInUnits(source.resources?.diskSize, 'GiB');
	const disk = diskGiB ? ceilGiB(diskGiB) : undefined;
	return {
		cpu: quantityInUnits(source.resources?.cpu, 'cores'),
		memory: quantityInUnits(source.resources?.memory, 'GiB'),
		diskSize: disk === undefined ? '' : String(disk),
		highAvailability: Boolean(source.highAvailability),
		extensions: source.extensions ?? [],
		diskSizeMin: disk === undefined ? undefined : Number(disk)
	};
}

/** Normalizes a decimal typed by a user (`0,50` -> `0.5`) so equal numbers compare equal. */
function decimal(value: string) {
	return value.trim() ? quantityInUnits(value.trim().replace(',', '.'), 'cores') : '';
}

/** Added extensions (not in the source), and the source extensions missing from the selection. */
export function extensionDelta(selected: readonly string[], source: readonly string[]) {
	return {
		added: selected.filter((extension) => !source.includes(extension)),
		missing: source.filter((extension) => !selected.includes(extension))
	};
}

/**
 * Only what differs from the source: unchanged and blank values are omitted so the API inherits
 * them. Extensions are sent (as source ∪ added) only when at least one was added.
 */
export function cloneOverrides(
	values: ReturnType<typeof postgresConfiguration>,
	extensions: readonly string[] | undefined,
	baseline: CloneBaseline
) {
	const input = resourceInput(values);
	const added = extensions ? extensionDelta(extensions, baseline.extensions).added : [];
	return {
		cpu: decimal(values.cpu) && decimal(values.cpu) !== baseline.cpu ? input.cpu : undefined,
		memory:
			decimal(values.memory) && decimal(values.memory) !== baseline.memory
				? input.memory
				: undefined,
		diskSize:
			decimal(values.diskSize) && decimal(values.diskSize) !== baseline.diskSize
				? input.diskSize
				: undefined,
		highAvailability:
			values.highAvailability === baseline.highAvailability ? undefined : values.highAvailability,
		extensions: added.length ? [...new Set([...baseline.extensions, ...added])] : undefined
	};
}
