<script lang="ts">
	import { page } from '$app/state';
	import { fragment, graphql, type ActivityLogEntryFragment } from '$houdini';
	import ListItem from '$lib/ui/ListItem.svelte';
	import { BodyLong, Tooltip } from '@nais/ds-svelte-community';
	import { QuestionmarkIcon } from '@nais/ds-svelte-community/icons';
	import { icons } from '../activity/activity-log-icons';
	import { activityTooltip } from '../activity/activity-log-tooltip';
	import { activityTextComponent } from '../activity/activityTextComponents';
	import type { TimelineModes } from '../activity/shared/texts/types';

	interface Props {
		item: ActivityLogEntryFragment;
		mode?: TimelineModes;
	}

	let { item, mode = 'full' }: Props = $props();

	let data = $derived(
		fragment(
			item,
			graphql(`
				fragment ActivityLogEntryFragment on ActivityLogEntry {
					__typename
					id
					createdAt
					actor
					createdAt
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
					... on CredentialsActivityLogEntry {
						credentialsData: data {
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
					... on PostgresDeletedActivityLogEntry {
						__typename
					}
					... on PostgresGrantAccessActivityLogEntry {
						__typename
						postgresGrantAccessData: data {
							grantee
							until
						}
					}
					... on RepositoryAddedActivityLogEntry {
						__typename
					}
					... on RepositoryRemovedActivityLogEntry {
						__typename
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
				}
			`)
		)
	);

	const Icon = $derived(icons[$data.__typename] || QuestionmarkIcon);

	const TextComponent = $derived(activityTextComponent($data.__typename));

	const textData = $derived.by(() => {
		const key = Object.keys($data).find(
			(k) => k.endsWith('ActivityLogEntry') && $data[k as keyof typeof $data] != null
		);
		if (key) {
			return { ...$data, ...($data[key as keyof typeof $data] as object) };
		}
		return $data;
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
				<BodyLong size="small">
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
	}

	.activity-log-list-item :global(.surface-icon) {
		background: var(--ax-bg-brand-blue-softA);
		color: var(--ax-text-brand-blue-decoration);
	}

	.activity-text {
		min-width: 0;
		overflow-wrap: anywhere;
	}

	.activity-icon {
		position: relative;
		z-index: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		font-size: 1rem;
		flex-shrink: 0;
		border-radius: var(--ax-radius-8);
		color: var(--ax-text-brand-blue-decoration);
		background: var(--ax-bg-brand-blue-softA);
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
