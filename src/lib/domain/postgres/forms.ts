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
		cpu: values.cpu || undefined,
		memory: values.memory || undefined,
		diskSize: values.diskSize || undefined,
		highAvailability: values.highAvailability
	};
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
