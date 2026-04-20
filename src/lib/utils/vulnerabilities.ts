import type { ImageVulnerabilitySuppressionState$options } from '$houdini/graphql/enums';
import { ImageVulnerabilitySuppressionState } from '$houdini/graphql/enums';

export type SbomStatus = 'PROCESSING' | 'READY' | 'NO_SBOM' | 'FAILED';

export type SbomStatusIndicator = 'healthy' | 'processing' | 'warning' | 'no-sbom';

export type SbomStatusIconIndicator = 'healthy' | 'processing' | 'warning' | 'no-sbom';

export interface SbomStatusSource {
	status: SbomStatus;
	imageUpdatedAt?: Date | null;
	hasVulnerabilityData?: boolean;
}

export interface SbomStatusDetails {
	status: SbomStatus;
	indicator: SbomStatusIndicator;
	iconIndicator: SbomStatusIconIndicator;
	label: string;
}

const sbomStatusIndicators: Record<SbomStatus, SbomStatusIndicator> = {
	READY: 'healthy',
	PROCESSING: 'processing',
	NO_SBOM: 'no-sbom',
	FAILED: 'warning'
};

const sbomStatusLabels: Record<SbomStatus, string> = {
	READY: 'SBOM up to date',
	PROCESSING: 'Processing',
	NO_SBOM: 'No SBOM found',
	FAILED: 'SBOM processing failed'
};

export function formatProcessingDuration(imageUpdatedAt: Date | null | undefined): string | null {
	if (!imageUpdatedAt) return null;
	const diffMs = Date.now() - imageUpdatedAt.getTime();
	const diffMin = Math.floor(diffMs / 60_000);
	if (diffMin < 1) return 'Processing for less than a minute';
	if (diffMin < 60) return `Processing for ${diffMin} min`;
	const diffH = Math.floor(diffMin / 60);
	const remMin = diffMin % 60;
	if (diffH < 24)
		return remMin > 0 ? `Processing for ${diffH} h ${remMin} min` : `Processing for ${diffH} h`;
	return `Processing for ${Math.floor(diffH / 24)} d`;
}

export const sbomStatusDetails = (source: SbomStatusSource): SbomStatusDetails => {
	const status = source.status ?? 'NO_SBOM';
	const indicator = sbomStatusIndicators[status] ?? 'no-sbom';
	const baseLabel = sbomStatusLabels[status] ?? 'No SBOM found';
	const iconIndicator =
		indicator === 'no-sbom' || (indicator === 'healthy' && source.hasVulnerabilityData === false)
			? 'no-sbom'
			: indicator;
	const label =
		indicator === 'processing'
			? (formatProcessingDuration(source.imageUpdatedAt) ?? baseLabel)
			: baseLabel;
	return { status, indicator, iconIndicator, label };
};

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
