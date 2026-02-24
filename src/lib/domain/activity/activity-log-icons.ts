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
	SecretValuesViewedActivityLogEntry: PadlockLockedIcon,

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
	UnleashInstanceDeletedActivityLogEntry: UnleashIcon,
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
	PostgresGrantAccessActivityLogEntry: PadlockLockedIcon,

	/* Fallback / infra ops */
	TeamDeployKeyUpdatedActivityLogEntry: CogIcon,
	ReconcilerConfiguredActivityLogEntry: CogIcon,
	ReconcilerEnabledActivityLogEntry: CogIcon,
	ReconcilerDisabledActivityLogEntry: CogIcon
};
