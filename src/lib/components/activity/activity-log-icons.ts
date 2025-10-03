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

export function activityIconClassFromEntry(
	entry: { __typename: string; appScaled?: { direction?: string } },
	auditAction?: string // valgfri: ClusterAudit
): string {
	const base = 'activity-icon';
	const t = entry.__typename ?? '';

	// Scale
	if (t.includes('ApplicationScaled')) {
		const dir = entry.appScaled?.direction?.toUpperCase();
		if (dir === 'UP') return `${base} scale-up`;
		if (dir === 'DOWN') return `${base} scale-down`;
		return `${base} scale-neutral`;
	}

	// Cluster audit — farg etter action om mulig
	if (t.includes('ClusterAudit')) {
		if (auditAction) {
			const a = auditAction.toLowerCase();
			if (a.includes('create') || a === 'apply') return `${base} audit-create`;
			if (a.includes('delete')) return `${base} audit-delete`;
			if (a.includes('update') || a.includes('patch') || a.includes('replace'))
				return `${base} audit-update`;
			if (a.includes('get') || a.includes('list') || a.includes('read'))
				return `${base} audit-read`;
			if (a.includes('forbidden') || a.includes('deny')) return `${base} audit-forbidden`;
		}
		return `${base} audit`;
	}

	// Generiske mønstre
	if (/(Added|Created)ActivityLogEntry$/.test(t)) return `${base} added`;
	if (/(Removed|Deleted)ActivityLogEntry$/.test(t)) return `${base} deleted`;
	if (/(Updated|SetRole)ActivityLogEntry$/.test(t)) return `${base} updated`;
	if (/Maintenance/.test(t)) return `${base} maintenance`;
	if (t.includes('Deployment') || t.includes('Restarted')) return `${base} deployment`;

	// Temaer vi skiller ut som egne (valgfritt)
	if (t.startsWith('Vulnerability')) return `${base} vulnerability`;
	if (t.startsWith('Reconciler')) return `${base} reconciler`;

	return `${base} neutral`;
}
