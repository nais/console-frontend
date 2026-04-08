import type { ImageVulnerabilitySuppressionState$options } from '$houdini/graphql/enums';
import { ImageVulnerabilitySuppressionState } from '$houdini/graphql/enums';

const staleSeverity = {
	STALE_NONE: 'STALE_NONE',
	STALE_PROCESSING: 'STALE_PROCESSING',
	STALE_PERMANENT: 'STALE_PERMANENT'
} as const;

export type StaleReasonCode =
	| 'UNSPECIFIED'
	| 'UP_TO_DATE'
	| 'PROCESSING'
	| 'PROCESSING_WITH_FALLBACK'
	| 'NO_SBOM'
	| 'SBOM_UPLOAD_FAILED'
	| 'NO_ATTESTATION';

const staleReasonLabels: Record<StaleReasonCode, string> = {
	UNSPECIFIED: 'Status unknown',
	UP_TO_DATE: 'Up to date',
	PROCESSING: 'Processing',
	PROCESSING_WITH_FALLBACK: 'Processing with fallback',
	NO_SBOM: 'No SBOM registered',
	SBOM_UPLOAD_FAILED: 'SBOM upload failed',
	NO_ATTESTATION: 'No attestation found'
};

export type StalenessIndicator = 'healthy' | 'processing' | 'warning' | 'missing';

export interface StalenessSource {
	hasSBOM: boolean;
	staleness: {
		severity: string;
		code?: string | null;
		reason?: string | null;
	};
}

const staleReasonIndicators: Record<StaleReasonCode, StalenessIndicator> = {
	UNSPECIFIED: 'warning',
	UP_TO_DATE: 'healthy',
	PROCESSING: 'processing',
	PROCESSING_WITH_FALLBACK: 'processing',
	NO_SBOM: 'missing',
	SBOM_UPLOAD_FAILED: 'warning',
	NO_ATTESTATION: 'warning'
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

export const stalenessStatusLabel = ({
	severity,
	hasSBOM,
	reasonCode
}: {
	severity: string;
	hasSBOM: boolean;
	reasonCode?: string | null;
}) => {
	if (reasonCode && reasonCode in staleReasonLabels) {
		return staleReasonLabels[reasonCode as StaleReasonCode];
	}

	if (!hasSBOM) {
		return staleReasonLabels.NO_SBOM;
	}

	switch (severity) {
		case staleSeverity.STALE_NONE:
			return staleReasonLabels.UP_TO_DATE;
		case staleSeverity.STALE_PROCESSING:
			return staleReasonLabels.PROCESSING;
		case staleSeverity.STALE_PERMANENT:
			return 'Needs attention';
		default:
			return staleReasonLabels.UNSPECIFIED;
	}
};

export const stalenessStatusText = ({
	severity,
	hasSBOM,
	reasonCode,
	reason
}: {
	severity: string;
	hasSBOM: boolean;
	reasonCode?: string | null;
	reason?: string | null;
}) => {
	if (reason?.trim()) {
		return reason;
	}

	return stalenessStatusLabel({
		severity,
		hasSBOM,
		reasonCode
	});
};

export const stalenessIndicator = ({
	severity,
	hasSBOM,
	reasonCode
}: {
	severity: string;
	hasSBOM: boolean;
	reasonCode?: string | null;
}): StalenessIndicator => {
	if (reasonCode && reasonCode in staleReasonIndicators) {
		return staleReasonIndicators[reasonCode as StaleReasonCode];
	}

	if (!hasSBOM) {
		return 'missing';
	}

	switch (severity) {
		case staleSeverity.STALE_NONE:
			return 'healthy';
		case staleSeverity.STALE_PROCESSING:
			return 'processing';
		case staleSeverity.STALE_PERMANENT:
			return 'warning';
		default:
			return 'warning';
	}
};

export const stalenessDetails = (source: StalenessSource) => ({
	code: source.staleness.code ?? null,
	reason: source.staleness.reason ?? null,
	severity: source.staleness.severity,
	indicator: stalenessIndicator({
		severity: source.staleness.severity,
		hasSBOM: source.hasSBOM,
		reasonCode: source.staleness.code
	}),
	label: stalenessStatusLabel({
		severity: source.staleness.severity,
		hasSBOM: source.hasSBOM,
		reasonCode: source.staleness.code
	}),
	text: stalenessStatusText({
		severity: source.staleness.severity,
		hasSBOM: source.hasSBOM,
		reasonCode: source.staleness.code,
		reason: source.staleness.reason
	})
});
