<script lang="ts">
	import { type ActivityLogFilter, graphql } from '$houdini';
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import { Loader } from '@nais/ds-svelte-community';

	import ActivityTimeline from './ActivityTimeline.svelte';
	import { sidebarTextComponent } from './sidebar/textComponent';

	interface Props {
		teamSlug: string;
		filter?: ActivityLogFilter;
		viewAllHref: string;
		title?: string;
	}

	let { teamSlug, filter, viewAllHref, title = 'Activity' }: Props = $props();

	const viewAllLink = $derived.by(() => {
		const params = new URLSearchParams();
		if (filter?.activityTypes?.length) {
			params.set('activityTypes', filter.activityTypes.join(','));
		}
		if (filter?.resourceTypes?.length) {
			params.set('resourceTypes', filter.resourceTypes.join(','));
		}
		if (filter?.environments?.length) {
			params.set('environments', filter.environments.join(','));
		}
		const qs = params.toString();
		return qs ? `${viewAllHref}?${qs}` : viewAllHref;
	});

	const first = 5;

	const activityQuery = graphql(`
		query TeamActivityCard($teamSlug: Slug!, $first: Int!, $filter: ActivityLogFilter) {
			team(slug: $teamSlug) {
				activityLog(first: $first, filter: $filter) @paginate(mode: Infinite) {
					pageInfo {
						endCursor
						hasNextPage
					}
					edges {
						node {
							id
							actor
							message
							createdAt
							resourceName
							resourceType
							environmentName
							teamSlug
							__typename

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
										oldValue
										newValue
									}
								}
							}
							... on ApplicationScaledActivityLogEntry {
								appScaled: data {
									newSize
									direction
								}
							}
							... on ApplicationCreatedActivityLogEntry {
								id
							}
							... on ApplicationUpdatedActivityLogEntry {
								applicationUpdatedData: data {
									changedFields {
										field
										oldValue
										newValue
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
							... on RepositoryAddedActivityLogEntry {
								id
							}
							... on RepositoryRemovedActivityLogEntry {
								id
							}
							... on SecretCreatedActivityLogEntry {
								id
							}
							... on SecretDeletedActivityLogEntry {
								id
							}
							... on SecretValueAddedActivityLogEntry {
								secretValueAddedData: data {
									valueName
								}
							}
							... on SecretValueUpdatedActivityLogEntry {
								secretValueUpdatedData: data {
									valueName
								}
							}
							... on SecretValueRemovedActivityLogEntry {
								secretValueRemovedData: data {
									valueName
								}
							}
							... on SecretValuesViewedActivityLogEntry {
								secretValuesViewedData: data {
									reason
								}
							}
							... on ConfigCreatedActivityLogEntry {
								id
							}
							... on ConfigDeletedActivityLogEntry {
								id
							}
							... on ConfigUpdatedActivityLogEntry {
								configUpdatedData: data {
									updatedFields {
										field
										oldValue
										newValue
									}
								}
							}
							... on TeamEnvironmentUpdatedActivityLogEntry {
								id
								teamEnvironmentUpdatedData: data {
									updatedFields {
										field
										oldValue
										newValue
									}
								}
							}
							... on TeamConfirmDeleteKeyActivityLogEntry {
								id
							}
							... on TeamCreateDeleteKeyActivityLogEntry {
								id
							}
							... on TeamCreatedActivityLogEntry {
								id
							}
							... on TeamDeployKeyUpdatedActivityLogEntry {
								id
							}
							... on JobRunDeletedActivityLogEntry {
								id
								jobRunDeletedData: data {
									runName
								}
							}
							... on JobCreatedActivityLogEntry {
								id
							}
							... on JobTriggeredActivityLogEntry {
								id
							}
							... on JobUpdatedActivityLogEntry {
								jobUpdatedData: data {
									changedFields {
										field
										oldValue
										newValue
									}
								}
							}
							... on TeamMemberAddedActivityLogEntry {
								addedData: data {
									role
									userEmail
									userID
								}
							}
							... on TeamMemberRemovedActivityLogEntry {
								removedData: data {
									userEmail
									userID
								}
							}
							... on TeamMemberSetRoleActivityLogEntry {
								setRoleData: data {
									role
									userEmail
									userID
								}
							}
							... on TeamUpdatedActivityLogEntry {
								id
								teamUpdatedData: data {
									updatedFields {
										field
										oldValue
										newValue
									}
								}
							}
							... on UnleashInstanceUpdatedActivityLogEntry {
								unleashInstanceUpdatedData: data {
									allowedTeamSlug
									revokedTeamSlug
									updatedReleaseChannel
								}
							}
							... on ApplicationRestartedActivityLogEntry {
								id
							}
							... on ApplicationDeletedActivityLogEntry {
								id
							}
							... on JobDeletedActivityLogEntry {
								id
							}
							... on CredentialsActivityLogEntry {
								credentialsData: data {
									permission
									ttl
								}
							}
							... on ServiceMaintenanceActivityLogEntry {
								id
							}
							... on ValkeyCreatedActivityLogEntry {
								id
							}
							... on ValkeyDeletedActivityLogEntry {
								id
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
							... on OpenSearchCreatedActivityLogEntry {
								id
							}
							... on OpenSearchDeletedActivityLogEntry {
								id
							}
							... on PostgresDeletedActivityLogEntry {
								id
							}
							... on PostgresGrantAccessActivityLogEntry {
								postgresGrantAccessData: data {
									grantee
									until
								}
							}
							... on UnleashInstanceCreatedActivityLogEntry {
								id
							}
							... on UnleashInstanceDeletedActivityLogEntry {
								id
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
							... on VulnerabilityUpdatedActivityLogEntry {
								vulnerabilityUpdatedData: data {
									identifier
									package
									severity
									previousSuppression {
										state
										reason
									}
									newSuppression {
										state
										reason
									}
								}
							}
							... on ServiceAccountCreatedActivityLogEntry {
								id
							}
							... on ServiceAccountDeletedActivityLogEntry {
								id
							}
							... on ServiceAccountUpdatedActivityLogEntry {
								serviceAccountUpdatedData: data {
									updatedFields {
										field
										oldValue
										newValue
									}
								}
							}
							... on ServiceAccountTokenCreatedActivityLogEntry {
								serviceAccountTokenCreatedData: data {
									tokenName
								}
							}
							... on ServiceAccountTokenDeletedActivityLogEntry {
								serviceAccountTokenDeletedData: data {
									tokenName
								}
							}
							... on ServiceAccountTokenUpdatedActivityLogEntry {
								serviceAccountTokenUpdatedData: data {
									updatedFields {
										field
										oldValue
										newValue
									}
								}
							}
							... on RoleAssignedToServiceAccountActivityLogEntry {
								roleAssignedData: data {
									roleName
								}
							}
							... on RoleRevokedFromServiceAccountActivityLogEntry {
								roleRevokedData: data {
									roleName
								}
							}
							... on ServiceAccountWorkloadBindingAddedActivityLogEntry {
								workloadBindingAddedData: data {
									workloadName
									teamSlug
								}
							}
							... on ServiceAccountWorkloadBindingRemovedActivityLogEntry {
								workloadBindingRemovedData: data {
									workloadName
									teamSlug
								}
							}
						}
					}
				}
			}
		}
	`);

	$effect(() => {
		activityQuery.fetch({ variables: { teamSlug, first, filter } });
	});

	let loadingMore = $state(false);

	async function loadMore() {
		loadingMore = true;
		await activityQuery.loadNextPage({ first });
		loadingMore = false;
	}

	const entries = $derived(($activityQuery.data?.team?.activityLog.edges ?? []).map((e) => e.node));
	const hasNextPage = $derived(
		$activityQuery.data?.team?.activityLog.pageInfo.hasNextPage ?? false
	);
</script>

<SurfaceCard {title}>
	{#snippet headerAside()}
		<a class="view-all" href={viewAllLink}>View all</a>
	{/snippet}

	{#if $activityQuery.fetching && entries.length === 0}
		<div class="loader">
			<Loader size="3xlarge" />
		</div>
	{:else}
		<ActivityTimeline
			{entries}
			{hasNextPage}
			loading={loadingMore}
			{loadMore}
			textComponentFn={sidebarTextComponent}
		/>
	{/if}
</SurfaceCard>

<style>
	.view-all {
		font-size: var(--ax-font-size-small);
		font-weight: var(--ax-font-weight-bold);
		color: var(--ax-text-accent);
		text-decoration: none;
	}

	.view-all:hover {
		text-decoration: underline;
	}

	.loader {
		display: flex;
		justify-content: center;
		align-items: center;
		min-width: 100%;
		min-height: 200px;
	}
</style>
