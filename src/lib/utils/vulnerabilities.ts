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
			case 'Critical':
				return '#e22a49';
			case 'High':
				return '#f89686';
			case 'Medium':
				return '#ffebc7';
			case 'Low':
				return '#a8dfb4';
			case 'Unassigned':
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

export type Severity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Unassigned';

export const allSeverities: Severity[] = ['Critical', 'High', 'Medium', 'Low', 'Unassigned'];

export const severityToRiskScore: Record<Severity, number> = {
	Critical: 10,
	High: 5,
	Medium: 3,
	Low: 1,
	Unassigned: 5
};
