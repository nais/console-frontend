export function severityToColor({
	severity,
	isText,
	isGraph
}: {
	severity: string;
	isText?: boolean;
	isGraph?: boolean;
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
	} else if (isGraph) {
		switch (severity) {
			case 'critical':
				return '#e22a49';
			case 'high':
				return '#f89686';
			case 'medium':
				return '#ffebc7';
			case 'low':
				return '#a8dfb4';
			case 'unassigned':
			default:
				return '#cfd3d8';
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
