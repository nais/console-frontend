<script lang="ts">
	import {
		ActivityLogEntryResourceType,
		type ActivityLogEntryResourceType$options
	} from '$houdini';
	import List from '$lib/components/list/List.svelte';
	import ListItem from '$lib/components/list/ListItem.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import Time from '$lib/Time.svelte';
	import { changeParams } from '$lib/utils/searchparams.svelte';
	import { BodyShort } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let { ActivityLog, viewerIsMember, teamSlug } = $derived(data);

	const resourceLink = (
		environmentName: string,
		resourceType: ActivityLogEntryResourceType$options,
		resourceName: string
	) => {
		switch (resourceType) {
			case ActivityLogEntryResourceType.APP:
				return `/team/${teamSlug}/${environmentName}/app/${resourceName}`;
			case ActivityLogEntryResourceType.JOB:
				return `/team/${teamSlug}/${environmentName}/job/${resourceName}`;
			case ActivityLogEntryResourceType.UNLEASH:
				return `/team/${teamSlug}/unleash`;
			case ActivityLogEntryResourceType.SECRET:
				return `/team/${teamSlug}/${environmentName}/secret/${resourceName}`;
			case ActivityLogEntryResourceType.TEAM:
				return `/team/${teamSlug}`;
			default:
				return null;
		}
	};
</script>

<div>
	{#if viewerIsMember}
		{#if $ActivityLog.data}
			{@const ae = $ActivityLog.data}
			<div class="wrapper">
				<div>
					<List title="{ae.team.activityLog.pageInfo.totalCount} entries">
						{#each ae.team.activityLog.edges as edge (edge.node.id)}
							<ListItem>
								<div class="activity">
									<div>
										<BodyShort size="small" spacing>
											{#if edge.node.__typename === 'SecretValueAddedActivityLogEntry'}
												{edge.node.message}
												<strong>{edge.node.secretValueAdded?.valueName}</strong> from
												{@const link = resourceLink(
													edge.node.environmentName ? edge.node.environmentName : '',
													edge.node.resourceType,
													edge.node.resourceName
												)}
												{#if link}
													<a href={link}>{edge.node.resourceName}</a>
												{/if}
											{:else if edge.node.__typename === 'SecretValueRemovedActivityLogEntry'}
												{edge.node.message}
												<strong>{edge.node.secretValueRemoved?.valueName}</strong> from
												{@const link = resourceLink(
													edge.node.environmentName ? edge.node.environmentName : '',
													edge.node.resourceType,
													edge.node.resourceName
												)}
												{#if link}
													<a href={link}>{edge.node.resourceName}</a>
												{/if}
											{:else if edge.node.__typename === 'SecretValueUpdatedActivityLogEntry'}
												{edge.node.message}
												<strong>{edge.node.secretValueUpdated?.valueName}</strong> from
												{@const link = resourceLink(
													edge.node.environmentName ? edge.node.environmentName : '',
													edge.node.resourceType,
													edge.node.resourceName
												)}
												{#if link}
													<a href={link}>{edge.node.resourceName}</a>
												{/if}
											{:else if edge.node.__typename === 'TeamEnvironmentUpdatedActivityLogEntry'}
												{edge.node.message}
												{#if edge.node.teamEnvironmentUpdated.updatedFields.length > 0}
													{#each edge.node.teamEnvironmentUpdated.updatedFields as field (field)}
														{field.field}. Changed from {field.oldValue} to {field.newValue}.
													{/each}
												{/if}
											{:else if edge.node.__typename === 'TeamMemberAddedActivityLogEntry'}
												{#if edge.node.teamMemberAdded}
													Added member {edge.node.teamMemberAdded.userEmail !== ''
														? edge.node.teamMemberAdded.userEmail
														: 'unknown email'} to team as {edge.node.teamMemberAdded.role}.
												{/if}
											{:else if edge.node.__typename === 'TeamMemberRemovedActivityLogEntry'}
												{#if edge.node.teamMemberRemoved}
													Removed {edge.node.teamMemberRemoved.userEmail !== ''
														? edge.node.teamMemberRemoved.userEmail
														: 'unknown email'}
													from team.
												{/if}
											{:else if edge.node.__typename === 'TeamMemberSetRoleActivityLogEntry'}
												{#if edge.node.teamMemberSetRole}
													Set role to {edge.node.teamMemberSetRole.role} for {edge.node
														.teamMemberSetRole.userEmail !== ''
														? edge.node.teamMemberSetRole.userEmail
														: 'unknown email'}.
												{/if}
											{:else if edge.node.__typename === 'TeamUpdatedActivityLogEntry'}
												{edge.node.message}
												{#if edge.node.teamUpdated?.updatedFields.length}
													{#each edge.node.teamUpdated?.updatedFields as field (field)}
														{field.field}. Changed from {field.oldValue} to {field.newValue}.
													{/each}
												{/if}
											{:else if edge.node.__typename === 'UnleashInstanceUpdatedActivityLogEntry'}
												{@const data = edge.node.unleashInstanceUpdated}
												{edge.node.message}
												{#if data?.allowedTeamSlug}
													Allowed <a href="/team/{data.allowedTeamSlug}">
														{data.allowedTeamSlug}
													</a> to access the instance.
												{:else if data?.revokedTeamSlug}
													Revoked access for <a href="/team/{data.revokedTeamSlug}">
														{data.revokedTeamSlug}
													</a> to the instance.
												{/if}
											{:else if edge.node.__typename === 'RepositoryRemovedActivityLogEntry'}
												{edge.node.actor} removed
												<a href="/team/{teamSlug}/repositories">repository</a>
												{edge.node.resourceName} from team {edge.node.teamSlug}.
											{:else if edge.node.__typename === 'RepositoryAddedActivityLogEntry'}
												{edge.node.actor} added
												<a href="/team/{teamSlug}/repositories">repository</a>
												{edge.node.resourceName} to team {edge.node.teamSlug}.
											{:else}
												{edge.node.message}
												{@const link = resourceLink(
													edge.node.environmentName ? edge.node.environmentName : '',
													edge.node.resourceType,
													edge.node.resourceName
												)}
												{#if link}
													<a href={link}>{edge.node.resourceName}</a>
												{/if}
											{/if}
											{#if edge.node.environmentName}
												in {edge.node.environmentName}
											{/if}
										</BodyShort>
									</div>
									<div>
										<BodyShort size="small" style="color: var(--a-text-subtle)">
											<Time time={edge.node.createdAt} distance={true} />
											by {edge.node.actor}
										</BodyShort>
									</div>
								</div>
							</ListItem>
						{/each}
					</List>
					<Pagination
						page={ae.team.activityLog.pageInfo}
						loaders={{
							loadPreviousPage: () =>
								changeParams({
									after: '',
									before: ae.team.activityLog.pageInfo.startCursor ?? ''
								}),
							loadNextPage: () =>
								changeParams({
									before: '',
									after: ae.team.activityLog.pageInfo.endCursor ?? ''
								})
						}}
					/>
				</div>
			</div>
		{/if}
	{/if}
</div>

<style>
	.wrapper {
		display: grid;
		grid-template-columns: 1fr 300px;
		gap: var(--spacing-layout);
	}
	.activity {
		display: flex;
		flex-direction: column;
	}
</style>
