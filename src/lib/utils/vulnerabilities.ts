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
				return 'var(--ax-danger-400, --a-red-400)';
			case 'high':
				return 'color-mix(in oklab, var(--ax-danger-400, --a-red-400), var(--ax-warning-400, --a-orange-400))';
			case 'medium':
				return 'var(--ax-warning-400, --a-orange-400)';
			case 'low':
				return 'var(--ax-success-400, --a-green-400)';
			case 'unassigned':
			default:
				return 'var(--ax-neutral-400, --a-gray-400)';
		}
	} else {
		switch (severity) {
			case 'critical':
				return 'var(--ax-danger-200, --a-red-200)';
			case 'high':
				return 'color-mix(in oklab, var(--ax-danger-200, --a-red-200), var(--ax-warning-200, --a-orange-200))';
			case 'medium':
				return 'var(--ax-warning-200, --a-orange-200)';
			case 'low':
				return 'var(--ax-success-200, --a-green-200)';
			case 'unassigned':
			default:
				return 'var(--ax-neutral-200, --a-gray-200)';
		}
	}
}
