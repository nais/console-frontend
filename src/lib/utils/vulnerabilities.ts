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
				return 'var(--ax-danger-600)';
			case 'high':
				return 'color-mix(in oklab, var(--ax-danger-600), var(--ax-warning-400))';
			case 'medium':
				return 'var(--ax-warning-400)';
			case 'low':
				return 'var(--ax-success-500)';
			case 'unassigned':
			default:
				return 'var(--ax-neutral-600)';
		}
	} else {
		switch (severity) {
			case 'critical':
				return 'var(--ax-danger-600)';
			case 'high':
				return 'color-mix(in oklab, var(--ax-danger-600), var(--ax-warning-200))';
			case 'medium':
				return 'var(--ax-warning-200)';
			case 'low':
				return 'var(--ax-success-400)';
			case 'unassigned':
			default:
				return 'var(--ax-neutral-400)';
		}
	}
}
