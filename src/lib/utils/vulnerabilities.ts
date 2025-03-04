export function severityToColor(severity: string): string {
	switch (severity) {
		case 'critical':
			return 'var(--a-red-200)';
		case 'high':
			return 'color-mix(in oklab, var(--a-red-200), var(--a-orange-200))';
		case 'medium':
			return 'var(--a-orange-200)';
		case 'low':
			return 'var(--a-green-200)';
		case 'unassigned':
			return 'var(--a-gray-200)';
		default:
			return 'var(--a-gray-200)';
	}
}
