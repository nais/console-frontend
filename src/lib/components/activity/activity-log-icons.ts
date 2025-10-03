// src/lib/components/activity/activity-log-icons.ts
import type { Component } from 'svelte';

// Resource icons (same “shapes” you use elsewhere)
import {
	BranchingIcon,
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
	RepositoryAddedActivityLogEntry: BranchingIcon,
	RepositoryRemovedActivityLogEntry: BranchingIcon,

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

// activity-log-icons.ts
export function activityIconClassFromEntry(
	entry: {
		__typename: string;
		appScaled?: { direction?: string | null } | null;
		clusterAuditData?: { action?: string | null } | null;
	},
	auditAction?: string | null
): string {
	const t = entry.__typename;
	const cls: string[] = ['activity-icon'];

	// Application scaled
	if (t === 'ApplicationScaledActivityLogEntry') {
		const dir = (entry.appScaled?.direction || '').toUpperCase();
		if (dir === 'UP') return cls.concat('scale-up').join(' ');
		if (dir === 'DOWN') return cls.concat('scale-down').join(' ');
		return cls.concat('scale-neutral').join(' ');
	}

	// Cluster audit (always include 'audit')
	if (t === 'ClusterAuditActivityLogEntry') {
		const a = (auditAction ?? entry.clusterAuditData?.action ?? '').toLowerCase();

		if (a.includes('create') || a === 'apply') return cls.concat('audit', 'audit-create').join(' ');
		if (a.includes('delete')) return cls.concat('audit', 'audit-delete').join(' ');
		if (a.includes('update') || a.includes('patch') || a.includes('replace'))
			return cls.concat('audit', 'audit-update').join(' ');
		return cls.concat('audit').join(' ');
	}

	// Generic buckets
	if (/(Added|Created)ActivityLogEntry$/.test(t)) return cls.concat('added').join(' ');
	if (/(Removed|Deleted)ActivityLogEntry$/.test(t)) return cls.concat('deleted').join(' ');
	if (/(Updated|SetRole)ActivityLogEntry$/.test(t)) return cls.concat('updated').join(' ');
	if (/Maintenance/.test(t)) return cls.concat('maintenance').join(' ');
	if (t.includes('Deployment') || t.includes('Restarted'))
		return cls.concat('deployment').join(' ');

	return cls.concat('neutral').join(' ');
}
