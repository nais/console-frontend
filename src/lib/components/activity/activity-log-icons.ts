// src/lib/components/activity/activity-log-icons.ts
import type { Component } from 'svelte';

// Resource icons (same “shapes” you use elsewhere)
import {
	BriefcaseClockIcon,
	// Fallbacks / misc
	CogIcon,
	PackageIcon,
	PadlockLockedIcon,
	PersonGroupIcon,
	RocketIcon,
	ShieldLockIcon,
	VirusIcon
} from '@nais/ds-svelte-community/icons';

import GitHubIcon from '$lib/icons/GitHubIcon.svelte';
import OpenSearchIcon from '$lib/icons/OpenSearchIcon.svelte';
import UnleashIcon from '$lib/icons/UnleashIcon.svelte';
import ValkeyIcon from '$lib/icons/ValkeyIcon.svelte';

/**
 * ICON SHAPES (what is operated on)
 * Keep this aligned with Icon.svelte’s mental model:
 * - Applications → PackageIcon
 * - Jobs → BriefcaseClockIcon
 * - Secrets → PadlockLockedIcon
 * - Repositories → BranchingIcon
 * - Team/Members → PersonGroupIcon
 * - Unleash → UnleashIcon
 * - OpenSearch / Valkey → product icons
 * - Deployments → RocketIcon
 * - Cluster audit → ShieldLockIcon (or Terminal if you prefer)
 */
export const icons: { [typename: string]: Component } = {
	/* Applications (various operations) */
	ApplicationDeletedActivityLogEntry: PackageIcon,
	ApplicationRestartedActivityLogEntry: PackageIcon,
	ApplicationScaledActivityLogEntry: PackageIcon,

	/* Deployments & jobs */
	DeploymentActivityLogEntry: RocketIcon,
	JobTriggeredActivityLogEntry: BriefcaseClockIcon,
	JobDeletedActivityLogEntry: BriefcaseClockIcon,

	/* Secrets */
	SecretCreatedActivityLogEntry: PadlockLockedIcon,
	SecretDeletedActivityLogEntry: PadlockLockedIcon,
	SecretValueAddedActivityLogEntry: PadlockLockedIcon,
	SecretValueRemovedActivityLogEntry: PadlockLockedIcon,
	SecretValueUpdatedActivityLogEntry: PadlockLockedIcon,

	/* Repositories */
	RepositoryAddedActivityLogEntry: GitHubIcon,
	RepositoryRemovedActivityLogEntry: GitHubIcon,

	/* Team & members */
	TeamMemberAddedActivityLogEntry: PersonGroupIcon,
	TeamMemberRemovedActivityLogEntry: PersonGroupIcon,
	TeamMemberSetRoleActivityLogEntry: PersonGroupIcon,
	TeamCreatedActivityLogEntry: PersonGroupIcon,
	TeamUpdatedActivityLogEntry: PersonGroupIcon,
	TeamEnvironmentUpdatedActivityLogEntry: PersonGroupIcon,

	/* Unleash */
	UnleashInstanceCreatedActivityLogEntry: UnleashIcon,
	UnleashInstanceUpdatedActivityLogEntry: UnleashIcon,

	/* Stores */
	OpenSearchCreatedActivityLogEntry: OpenSearchIcon,
	OpenSearchDeletedActivityLogEntry: OpenSearchIcon,
	OpenSearchUpdatedActivityLogEntry: OpenSearchIcon,

	ValkeyCreatedActivityLogEntry: ValkeyIcon,
	ValkeyDeletedActivityLogEntry: ValkeyIcon,
	ValkeyUpdatedActivityLogEntry: ValkeyIcon,
	ValkeyMaintenanceStartedActivityLogEntry: ValkeyIcon,

	/* Security / Audit */
	VulnerabilityUpdatedActivityLogEntry: VirusIcon,
	ClusterAuditActivityLogEntry: ShieldLockIcon,

	/* Fallback / infra ops */
	TeamDeployKeyUpdatedActivityLogEntry: CogIcon,
	ReconcilerConfiguredActivityLogEntry: CogIcon,
	ReconcilerEnabledActivityLogEntry: CogIcon,
	ReconcilerDisabledActivityLogEntry: CogIcon
};

/**
 * COLOR/VARIANT (what operation happened)
 * This returns the full class string for the icon “bubble”.
 * It expects you have the shared CSS loaded (activity-log.css),
 * which defines .activity-icon and the --variant modifiers.
 *
 * Examples returned:
 *  - "activity-icon activity-icon--added"
 *  - "activity-icon activity-icon--audit activity-icon--audit-delete"
 */
export function activityIconClass(
	typename: string,
	opts: { direction?: string | null; auditAction?: string | null } = {}
): string {
	const t = typename ?? '';
	const dir = opts.direction?.toLowerCase() ?? null;
	const action = opts.auditAction?.toLowerCase() ?? null;

	// Scaling (up/down/neutral)
	if (t.includes('ApplicationScaled')) {
		if (dir === 'up') return 'activity-icon activity-icon--scale-up';
		if (dir === 'down') return 'activity-icon activity-icon--scale-down';
		return 'activity-icon activity-icon--scale-neutral';
	}

	// Cluster audit (kubectl) — color by action if available
	if (t.includes('ClusterAudit')) {
		if (action) {
			if (/forbidden|denied|unauthori[sz]ed/.test(action))
				return 'activity-icon activity-icon--audit activity-icon--audit-forbidden';
			if (/^(get|list|watch)$|logs|describe|top/.test(action))
				return 'activity-icon activity-icon--audit activity-icon--audit-read';
			if (/delete(collection)?/.test(action))
				return 'activity-icon activity-icon--audit activity-icon--audit-delete';
			if (/(create|apply)/.test(action))
				return 'activity-icon activity-icon--audit activity-icon--audit-create';
			if (/(update|patch|replace|scale|rollout|cordon|uncordon|drain)/.test(action))
				return 'activity-icon activity-icon--audit activity-icon--audit-update';
		}
		return 'activity-icon activity-icon--audit';
	}

	// Generic CRUD buckets (match “…ActivityLogEntry” suffixes)
	if (/(Added|Created)ActivityLogEntry$/.test(t)) return 'activity-icon activity-icon--added';
	if (/(Removed|Deleted)ActivityLogEntry$/.test(t)) return 'activity-icon activity-icon--deleted';
	if (/(Updated|SetRole|Restarted)ActivityLogEntry$/.test(t))
		return 'activity-icon activity-icon--updated';
	if (/Maintenance/.test(t)) return 'activity-icon activity-icon--maintenance';

	// Job triggered behaves like a deployment (runtime operation)
	if (t === 'JobTriggeredActivityLogEntry') return 'activity-icon activity-icon--deployment';

	// Deployment-like
	if (t.includes('Deployment')) return 'activity-icon activity-icon--deployment';

	// Special buckets
	if (t.startsWith('Vulnerability')) return 'activity-icon activity-icon--vulnerability';
	if (t.startsWith('Reconciler')) return 'activity-icon activity-icon--reconciler';

	// Fallback
	return 'activity-icon activity-icon--neutral';
}

/** Convenience for when you have the whole entry object. */
export function activityIconClassFromEntry(entry: {
	__typename: string;
	appScaled?: { direction?: string | null };
	clusterAuditData?: { action?: string | null };
}): string {
	return activityIconClass(entry.__typename, {
		direction: entry.appScaled?.direction ?? null,
		auditAction: entry.clusterAuditData?.action ?? null
	});
}
