import type { ImageVulnerabilitySuppressionState$options } from '$houdini/graphql/enums';
import { ImageVulnerabilitySuppressionState } from '$houdini/graphql/enums';

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

export function severityToVariant(
	severity: Severity | string
): 'error' | 'warning' | 'success' | 'neutral' | 'info' {
	const normalizedSeverity = severity.toLowerCase();
	switch (normalizedSeverity) {
		case 'critical':
			return 'error';
		case 'high':
			return 'error';
		case 'medium':
			return 'warning';
		case 'low':
			return 'success';
		case 'unassigned':
		default:
			return 'neutral';
	}
}

export const severityToRiskScore: Record<Severity, number> = {
	Critical: 10,
	High: 5,
	Medium: 3,
	Low: 1,
	Unassigned: 5
};

export const suppressionStateLabels: Record<ImageVulnerabilitySuppressionState$options, string> = {
	FALSE_POSITIVE: 'False Positive',
	NOT_AFFECTED: 'Not Affected',
	IN_TRIAGE: 'In Triage',
	RESOLVED: 'Resolved'
};

export const suppressionStateOptions: Array<{
	value: ImageVulnerabilitySuppressionState$options | '';
	text: string;
}> = [
	{ value: '', text: 'Suppress Reason' },
	{ value: ImageVulnerabilitySuppressionState.IN_TRIAGE, text: 'In Triage' },
	{ value: ImageVulnerabilitySuppressionState.RESOLVED, text: 'Resolved' },
	{ value: ImageVulnerabilitySuppressionState.FALSE_POSITIVE, text: 'False Positive' },
	{ value: ImageVulnerabilitySuppressionState.NOT_AFFECTED, text: 'Not Affected' }
];
