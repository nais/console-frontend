// src/lib/components/activity/activity-log-icons.ts
import type { Component } from 'svelte';

// Resource icons (same "shapes" you use elsewhere)
import {
	BranchingIcon,
	BriefcaseClockIcon,
	// Fallbacks / misc
	CogIcon,
	PackageIcon,
	PadlockLockedIcon,
	PersonGroupIcon,
	RocketIcon,
	TerminalIcon,
	VirusIcon
} from '@nais/ds-svelte-community/icons';

import OpenSearchIcon from '$lib/icons/OpenSearchIcon.svelte';
import UnleashIcon from '$lib/icons/UnleashIcon.svelte';
import ValkeyIcon from '$lib/icons/ValkeyIcon.svelte';

/**
 * ICON SHAPES (what is operated on)
 * Keep this aligned with Icon.svelte's mental model:
 * - Applications → PackageIcon
 * - Jobs → BriefcaseClockIcon
 * - Secrets → PadlockLockedIcon
 * - Repositories → BranchingIcon
 * - Team/Members → PersonGroupIcon
 * - Unleash → UnleashIcon
 * - OpenSearch / Valkey → product icons
 * - Deployments → RocketIcon
 * - Cluster audit → TerminalIcon
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
	TeamCreateDeleteKeyActivityLogEntry: CogIcon,
	TeamConfirmDeleteKeyActivityLogEntry: CogIcon,

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
	ClusterAuditActivityLogEntry: TerminalIcon,

	/* Fallback / infra ops */
	TeamDeployKeyUpdatedActivityLogEntry: CogIcon,
	ReconcilerConfiguredActivityLogEntry: CogIcon,
	ReconcilerEnabledActivityLogEntry: CogIcon,
	ReconcilerDisabledActivityLogEntry: CogIcon
};

// activity-log-icons.ts
export function activityIconClassFromEntry(entry: {
	__typename: string;
	appScaled?: { direction?: string | null } | null;
	clusterAuditData?: { action?: string | null } | null;
}): string {
	const t = entry.__typename;
	const cls: string[] = ['activity-icon'];

	// Resource-based colors (aligned with serviceColor palette)

	// Applications
	if (/^Application/.test(t)) {
		return cls.concat('resource-application').join(' ');
	}

	// Jobs
	if (/^Job/.test(t)) {
		return cls.concat('resource-job').join(' ');
	}

	// Deployments (special event, keep distinct)
	if (t === 'DeploymentActivityLogEntry') {
		return cls.concat('resource-deployment').join(' ');
	}

	// Secrets
	if (/^Secret/.test(t)) {
		return cls.concat('resource-secret').join(' ');
	}

	// Repositories
	if (/^Repository/.test(t)) {
		return cls.concat('resource-repository').join(' ');
	}

	// Team & Members
	if (/^Team/.test(t)) {
		// Delete key operations are security-related, use secret color
		if (
			t === 'TeamCreateDeleteKeyActivityLogEntry' ||
			t === 'TeamConfirmDeleteKeyActivityLogEntry'
		) {
			return cls.concat('resource-secret').join(' ');
		}
		return cls.concat('resource-team').join(' ');
	}

	// OpenSearch (matches chart color)
	if (/^OpenSearch/.test(t)) {
		return cls.concat('resource-opensearch').join(' ');
	}

	// Valkey (matches chart color)
	if (/^Valkey/.test(t)) {
		return cls.concat('resource-valkey').join(' ');
	}

	// Unleash
	if (/^Unleash/.test(t)) {
		return cls.concat('resource-unleash').join(' ');
	}

	// Vulnerabilities (keep distinct for visibility)
	if (/^Vulnerability/.test(t)) {
		return cls.concat('resource-vulnerability').join(' ');
	}

	// Cluster/Kubernetes (matches Kubernetes Engine chart color)
	if (t === 'ClusterAuditActivityLogEntry') {
		return cls.concat('resource-kubernetes').join(' ');
	}

	// Reconciler / System operations
	if (/^Reconciler/.test(t)) {
		return cls.concat('resource-system').join(' ');
	}

	// Service Maintenance (for OpenSearch/Valkey maintenance)
	if (/Maintenance/.test(t)) {
		return cls.concat('resource-maintenance').join(' ');
	}

	return cls.concat('resource-neutral').join(' ');
}
