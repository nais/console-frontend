<script lang="ts">
	import { page } from '$app/state';
	import { fragment, graphql, type ActivityLogEntryFragment } from '$houdini';
	import ListItem from '#lib/ui/ListItem.svelte';
	import { BodyLong, Tooltip } from '#lib/shadcn/ui/index.js';
	import { QuestionmarkIcon } from '#lib/icons/index.js';
	import { icons } from '../activity/activity-log-icons';
	import { activityTooltip } from '../activity/activity-log-tooltip';
	import { activityTextComponent } from '../activity/activityTextComponents';
	import { setActivityMetaContext } from '../activity/activityMetaContext';
	import type { TimelineModes } from '../activity/shared/texts/types';

	interface Props {
		item: ActivityLogEntryFragment;
		mode?: TimelineModes;
		showTeam?: boolean;
	}

	let { item, mode = 'full', showTeam = false }: Props = $props();

	let data = $derived(
		fragment(
			item,
			graphql(`
				fragment ActivityLogEntryFragment on ActivityLogEntry {
					__typename
					id
					createdAt
					actor
					environmentName
					message
					resourceName
					resourceType
					teamSlug
					... on ApplicationDeletedActivityLogEntry {
						__typename
					}
					... on ApplicationCreatedActivityLogEntry {
						__typename
					}
					... on ApplicationRestartedActivityLogEntry {
						__typename
					}
					... on ApplicationScaledActivityLogEntry {
						appScaled: data {
							newSize
							direction
						}
					}
					... on ApplicationUpdatedActivityLogEntry {
						applicationUpdated: data {
							changedFields {
								field
								newValue
								oldValue
							}
						}
					}
					... on ClusterAuditActivityLogEntry {
						id
						clusterAuditData: data {
							action
							resourceKind
						}
					}
					... on ConfigCreatedActivityLogEntry {
						__typename
					}
					... on ConfigDeletedActivityLogEntry {
						__typename
					}
					... on ConfigUpdatedActivityLogEntry {
						configUpdated: data {
							updatedFields {
								field
								newValue
								oldValue
							}
						}
					}
					... on KafkaCredentialsCreatedActivityLogEntry {
						kafkaCredentialsData: data {
							ttl
						}
					}
					... on KafkaTopicUpdatedActivityLogEntry {
						kafkaTopicUpdatedData: data {
							addedGrants {
								access
								subject
								teamName
							}
							revokedGrants {
								access
								subject
								teamName
							}
						}
					}
					... on OpenSearchCredentialsCreatedActivityLogEntry {
						opensearchCredentialsData: data {
							permission
							ttl
						}
					}
					... on DeploymentActivityLogEntry {
						deploymentData: data {
							triggerURL
						}
					}
					... on GenericKubernetesResourceActivityLogEntry {
						genericKubernetesData: data {
							kind
							changedFields {
								field
								newValue
								oldValue
							}
						}
					}
					... on JobDeletedActivityLogEntry {
						__typename
					}
					... on JobCreatedActivityLogEntry {
						__typename
					}
					... on JobRunDeletedActivityLogEntry {
						jobRunDeletedData: data {
							runName
						}
					}
					... on JobTriggeredActivityLogEntry {
						__typename
					}
					... on JobUpdatedActivityLogEntry {
						jobUpdated: data {
							changedFields {
								field
								newValue
								oldValue
							}
						}
					}
					... on OpenSearchCreatedActivityLogEntry {
						__typename
					}
					... on OpenSearchDeletedActivityLogEntry {
						__typename
					}
					... on OpenSearchUpdatedActivityLogEntry {
						opensearchData: data {
							updatedFields {
								field
								newValue
								oldValue
							}
						}
					}
					... on PostgresBranchCreatedActivityLogEntry {
						__typename
						id
						createdAt
						actor
						environmentName
						message
						resourceName
						resourceType
						postgresTeamSlug: teamSlug
						postgresBranch: data {
							branch
							sourceBranch
							targetTime
						}
					}
					... on PostgresBranchActivatedActivityLogEntry {
						__typename
						id
						createdAt
						actor
						environmentName
						message
						resourceName
						resourceType
						postgresTeamSlug: teamSlug
						postgresBranch: data {
							branch
						}
					}
					... on PostgresBranchDeletedActivityLogEntry {
						__typename
						id
						createdAt
						actor
						environmentName
						message
						resourceName
						resourceType
						postgresTeamSlug: teamSlug
						postgresBranch: data {
							branch
						}
					}
					... on PostgresCreatedActivityLogEntry {
						id
						createdAt
						actor
						environmentName
						message
						resourceName
						resourceType
						postgresTeamSlug: teamSlug
						__typename
					}
					... on PostgresUpdatedActivityLogEntry {
						__typename
						id
						createdAt
						actor
						environmentName
						message
						resourceName
						resourceType
						postgresTeamSlug: teamSlug
						postgresUpdated: data {
							updatedFields {
								field
								newValue
								oldValue
							}
						}
					}
					... on PostgresDeletedActivityLogEntry {
						__typename
						id
						createdAt
						actor
						environmentName
						message
						resourceName
						resourceType
						postgresTeamSlug: teamSlug
					}
					... on PostgresPersonalAccessCreatedActivityLogEntry {
						__typename
						id
						createdAt
						actor
						environmentName
						message
						resourceName
						resourceType
						postgresTeamSlug: teamSlug
						postgresPersonalAccessCreated: data {
							accessLevel
							expiresAt
							reason
							username
						}
					}
					... on PostgresPersonalAccessConnectionActivityLogEntry {
						id
						createdAt
						actor
						environmentName
						message
						resourceName
						resourceType
						postgresTeamSlug: teamSlug
						__typename
					}
					... on PostgresGrantAccessActivityLogEntry {
						__typename
						id
						createdAt
						actor
						environmentName
						message
						resourceName
						resourceType
						postgresTeamSlug: teamSlug
						postgresGrantAccessData: data {
							grantee
							until
						}
					}
					... on RepositoryAddedActivityLogEntry {
						__typename
					}
					... on TunnelCreatedActivityLogEntry {
						id
						createdAt
						actor
						environmentName
						message
						resourceName
						resourceType
						teamSlug
						tunnelCreated: data {
							targetHost
							tunnelName
						}
					}
					... on TunnelDeletedActivityLogEntry {
						id
						createdAt
						actor
						environmentName
						message
						resourceName
						resourceType
						teamSlug
						tunnelDeleted: data {
							tunnelName
						}
					}
					... on RepositoryRemovedActivityLogEntry {
						__typename
					}
					... on RoleAssignedToServiceAccountActivityLogEntry {
						roleAssignedToServiceAccount: data {
							roleName
						}
					}
					... on RoleRevokedFromServiceAccountActivityLogEntry {
						roleRevokedFromServiceAccount: data {
							roleName
						}
					}
					... on SecretUpdatedActivityLogEntry {
						secretUpdated: data {
							updatedFields {
								field
								newValue
								oldValue
							}
						}
					}
					... on SecretCreatedActivityLogEntry {
						__typename
					}
					... on SecretDeletedActivityLogEntry {
						__typename
					}
					... on SecretValueAddedActivityLogEntry {
						secretValueAdded: data {
							valueName
						}
					}
					... on SecretValueRemovedActivityLogEntry {
						secretValueRemoved: data {
							valueName
						}
					}
					... on SecretValueUpdatedActivityLogEntry {
						secretValueUpdated: data {
							valueName
						}
					}
					... on SecretValuesViewedActivityLogEntry {
						secretValuesViewed: data {
							reason
						}
					}
					... on ServiceAccountCreatedActivityLogEntry {
						__typename
					}
					... on ServiceAccountDeletedActivityLogEntry {
						__typename
					}
					... on ServiceAccountUpdatedActivityLogEntry {
						serviceAccountUpdated: data {
							updatedFields {
								field
								newValue
								oldValue
							}
						}
					}
					... on ServiceAccountTokenCreatedActivityLogEntry {
						serviceAccountTokenCreated: data {
							tokenName
						}
					}
					... on ServiceAccountTokenDeletedActivityLogEntry {
						serviceAccountTokenDeleted: data {
							tokenName
						}
					}
					... on ServiceAccountTokenUpdatedActivityLogEntry {
						serviceAccountTokenUpdated: data {
							tokenName
							updatedFields {
								field
								newValue
								oldValue
							}
						}
					}
					... on ServiceAccountWorkloadBindingAddedActivityLogEntry {
						serviceAccountWorkloadBindingAdded: data {
							teamSlug
							workloadName
							workloadType
						}
					}
					... on ServiceAccountWorkloadBindingRemovedActivityLogEntry {
						serviceAccountWorkloadBindingRemoved: data {
							teamSlug
							workloadName
							workloadType
						}
					}
					... on ServiceMaintenanceActivityLogEntry {
						__typename
					}
					... on TeamConfirmDeleteKeyActivityLogEntry {
						__typename
					}
					... on TeamCreateDeleteKeyActivityLogEntry {
						__typename
					}
					... on TeamCreatedActivityLogEntry {
						__typename
					}
					... on TeamDeployKeyUpdatedActivityLogEntry {
						__typename
					}
					... on TeamEnvironmentUpdatedActivityLogEntry {
						teamEnvironmentUpdated: data {
							updatedFields {
								field
								newValue
								oldValue
							}
						}
					}
					... on TeamMemberAddedActivityLogEntry {
						teamMemberAdded: data {
							role
							userEmail
						}
					}
					... on TeamMemberRemovedActivityLogEntry {
						teamMemberRemoved: data {
							userEmail
						}
					}
					... on TeamMemberSetRoleActivityLogEntry {
						teamMemberSetRole: data {
							role
							userEmail
						}
					}
					... on TeamUpdatedActivityLogEntry {
						teamUpdated: data {
							updatedFields {
								field
								newValue
								oldValue
							}
						}
					}
					... on UnleashInstanceUpdatedActivityLogEntry {
						unleashInstanceUpdated: data {
							allowedTeamSlug
							revokedTeamSlug
							updatedReleaseChannel
						}
					}
					... on UnleashInstanceCreatedActivityLogEntry {
						__typename
					}
					... on UnleashInstanceDeletedActivityLogEntry {
						__typename
					}
					... on ValkeyCreatedActivityLogEntry {
						__typename
					}
					... on ValkeyDeletedActivityLogEntry {
						__typename
					}
					... on ValkeyCredentialsCreatedActivityLogEntry {
						valkeyCredentialsData: data {
							permission
							ttl
						}
					}
					... on ValkeyUpdatedActivityLogEntry {
						valkeyData: data {
							updatedFields {
								field
								newValue
								oldValue
							}
						}
					}
					... on VulnerabilityUpdatedActivityLogEntry {
						__typename
						vulnerabilityUpdated: data {
							identifier
							package
							severity
							previousSuppression {
								reason
								state
							}
							newSuppression {
								reason
								state
							}
						}
					}
					... on ReconcilerConfiguredActivityLogEntry {
						__typename
					}
					... on ReconcilerDisabledActivityLogEntry {
						__typename
					}
					... on ReconcilerEnabledActivityLogEntry {
						__typename
					}
				}
			`)
		)
	);

	setActivityMetaContext({
		showTeam: () => showTeam,
		teamSlug: () => textData.teamSlug,
		resourceType: () => $data.resourceType
	});

	const Icon = $derived(icons[$data.__typename] || QuestionmarkIcon);

	const TextComponent = $derived(activityTextComponent($data.__typename));

	const textData = $derived.by(() => {
		const payload = $data[$data.__typename as keyof typeof $data];
		const resolved =
			payload && typeof payload === 'object' ? { ...$data, ...(payload as object) } : $data;
		if ('postgresTeamSlug' in resolved) {
			return { ...resolved, teamSlug: resolved.postgresTeamSlug };
		}
		return resolved;
	}) as unknown as typeof $data;
</script>

{#if mode === 'full'}
	<ListItem interactive highlight={page.url.searchParams.get('id') === $data.id}>
		<div class="activity-log-list-item" id={$data.id}>
			<Tooltip content={activityTooltip($data.__typename)}>
				<div class="surface-icon surface-icon-timeline">
					<Icon />
				</div>
			</Tooltip>

			<div class="activity-text">
				<TextComponent data={textData} {mode} />
			</div>
		</div>
	</ListItem>
{:else}
	<div class="activity-item">
		<div class="activity-icon">
			<Icon width="75%" height="75%" />
		</div>
		<div class="content">
			{#if mode === 'sidebar'}
				<BodyLong size="small" as="div">
					<TextComponent data={textData} {mode} />
				</BodyLong>
			{:else}
				<TextComponent data={textData} {mode} />
			{/if}
		</div>
	</div>
{/if}

<style>
	.activity-log-list-item {
		display: flex;
		align-items: center;
		gap: var(--ax-space-12);
		font-size: var(--ax-font-size-medium);
		--surface-icon-size: 2rem;
		--surface-icon-glyph-size: 1rem;
	}

	.activity-log-list-item :global(.surface-icon) {
		background: var(--secondary);
		color: var(--muted-foreground);
		border: 1px solid var(--border);
	}

	.activity-text {
		min-width: 0;
		overflow-wrap: anywhere;
	}

	.activity-text :global(a:not(.meta a)),
	.content :global(a:not(.meta a)) {
		color: var(--foreground);
		font-weight: 600;
		text-decoration: underline;
		text-decoration-color: var(--border-strong);
		text-underline-offset: 0.18em;
	}

	.activity-text :global(a:not(.meta a):hover),
	.content :global(a:not(.meta a):hover) {
		color: var(--link);
		text-decoration-color: currentColor;
	}

	.activity-icon {
		position: relative;
		z-index: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.875rem;
		height: 1.875rem;
		font-size: 0.9375rem;
		flex-shrink: 0;
		border-radius: calc(var(--radius) - 2px);
		color: var(--muted-foreground);
		background: var(--secondary);
		border: 1px solid var(--border);
	}

	.activity-item {
		display: flex;
		position: relative;
		padding-bottom: 0.75rem;
	}

	.content {
		flex: 1 1 auto;
		min-width: 0;
		overflow-wrap: anywhere;
		padding: 0 0 0 var(--ax-space-8);
	}

	.activity-item:not(:last-child)::before {
		background: var(--ax-border-neutral-subtleA);
		content: '';
		top: 2rem;
		bottom: calc(-1 * var(--ax-space-4));
		left: calc(1rem - 1px);
		position: absolute;
		width: 2px;
	}

	@media (max-width: 767px) {
		.activity-item:not(:last-child)::before {
			display: none;
		}
	}
</style>
