export function severityToColor({
	severity,
	isText
}: {
	severity: string;
	isText?: boolean;
}): string {
	if (isText) {
		switch (severity) {
			case 'critical':
				return 'var(--a-red-400)';
			case 'high':
				return 'color-mix(in oklab, var(--a-red-400), var(--a-orange-400))';
			case 'medium':
				return 'var(--a-orange-400)';
			case 'low':
				return 'var(--a-green-400)';
			case 'unassigned':
			default:
				return 'var(--a-gray-400)';
		}
	} else {
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
			default:
				return 'var(--a-gray-200)';
		}
	}
}
