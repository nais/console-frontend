export function branchStateLabel(state: string): string {
	return state === 'PROGRESSING'
		? 'Preparing'
		: state === 'AVAILABLE'
			? 'Ready'
			: state === 'DEGRADED'
				? 'Degraded'
				: state;
}
