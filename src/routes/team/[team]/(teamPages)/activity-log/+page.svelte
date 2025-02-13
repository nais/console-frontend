<script lang="ts">
	import {
		ActivityLogEntryResourceType,
		type ActivityLogEntryResourceType$options
	} from '$houdini';
	import Card from '$lib/Card.svelte';
	import IconWithText from '$lib/components/IconWithText.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import Time from '$lib/Time.svelte';
	import { changeParams } from '$lib/utils/searchparams.svelte';
	import { BodyShort, Button } from '@nais/ds-svelte-community';
	import {
		ActionMenu,
		ActionMenuRadioGroup,
		ActionMenuRadioItem
	} from '@nais/ds-svelte-community/experimental.js';
	import { ChevronDownIcon, ShieldLockIcon } from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let { ActivityLog, viewerIsMember, teamSlug } = $derived(data);

	let rows: number = $state(data.initialRows);
	$effect(() => {
		rows = data.initialRows;
	});

	let after: string = $state(data.initialAfter);
	$effect(() => {
		after = data.initialAfter;
	});

	let before: string = $state(data.initialBefore);
	$effect(() => {
		before = data.initialBefore;
	});

	const handleNumberOfRows = (value: number) => {
		rows = Number(value);
		changeQuery();
	};

	const changeQuery = (params: { after?: string; before?: string } = {}) => {
		after = params.after ?? '';
		before = params.before ?? '';

		changeParams({
			rows: rows.toString(),
			before,
			after
		});
	};

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

<div class="header">
	<IconWithText text="Activity log" icon={ShieldLockIcon} size="large" />
</div>
<div class="grid">
	<Card columns={12}>
		{#if viewerIsMember}
			{#if $ActivityLog.data}
				{@const ae = $ActivityLog.data}
				<div class="list">
					<div class="list-header">
						<div class="count">
							<BodyShort size="small" style="font-weight: bold;">
								{ae.team.activityLog.pageInfo.totalCount} entries
							</BodyShort>
						</div>
						<div style="display: flex; gap: 1rem;">
							<div style="display: flex; gap: 1rem;">
								<ActionMenu>
									{#snippet trigger(props)}
										<Button
											variant="tertiary-neutral"
											size="small"
											iconPosition="right"
											{...props}
											icon={ChevronDownIcon}
										>
											<span style="font-weight: normal"># of rows</span>
										</Button>
									{/snippet}
									<ActionMenuRadioGroup bind:value={rows} label="Rows per page">
										<ActionMenuRadioItem
											value="5"
											onselect={(value) => handleNumberOfRows(value as number)}
											>5</ActionMenuRadioItem
										>
										<ActionMenuRadioItem
											value="10"
											onselect={(value) => handleNumberOfRows(value as number)}
											>10</ActionMenuRadioItem
										>
										<ActionMenuRadioItem
											value="25"
											onselect={(value) => handleNumberOfRows(value as number)}
											>25</ActionMenuRadioItem
										>
										<ActionMenuRadioItem
											value="50"
											onselect={(value) => handleNumberOfRows(value as number)}
											>50</ActionMenuRadioItem
										>
									</ActionMenuRadioGroup>
								</ActionMenu>
							</div>
						</div>
					</div>
					{#each ae.team.activityLog.edges as edge (edge.node.id)}
						<div class="list-item">
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
										{edge.node.actor} removed repository
										{edge.node.resourceName} from team {edge.node.teamSlug}.
									{:else if edge.node.__typename === 'RepositoryAddedActivityLogEntry'}
										{edge.node.actor} added repository {edge.node.resourceName} to team {edge.node
											.teamSlug}.
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
								<BodyShort size="small" style="color: var(--a-text-subtle)">
									<Time time={edge.node.createdAt} distance={true} />
									by {edge.node.actor}
								</BodyShort>
							</div>
						</div>
					{:else}
						<p>No events</p>
					{/each}
				</div>
				{#if ae.team.activityLog.pageInfo.hasPreviousPage || ae.team.activityLog.pageInfo.hasNextPage}
					<Pagination
						page={ae.team.activityLog.pageInfo}
						loaders={{
							loadPreviousPage: () => {
								changeQuery({ before: ae.team.activityLog.pageInfo.startCursor ?? '' });
							},
							loadNextPage: () => {
								changeQuery({ after: ae.team.activityLog.pageInfo.endCursor ?? '' });
							}
						}}
					/>
				{/if}
			{/if}
		{/if}
	</Card>
</div>

<style>
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		align-self: stretch;
		margin-bottom: var(--a-spacing-3);
	}

	.list {
		border: 1px solid var(--a-border-default);
		border-radius: 4px;

		.list-header {
			background-color: var(--active-color);
			border-radius: 4px 4px 0 0;
			border-bottom: 1px solid var(--a-border-default);
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 8px 12px;
		}
		.count {
			font-weight: bold;
		}
		.list-item {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 8px 12px;

			&:not(:last-of-type) {
				border-bottom: 1px solid var(--a-border-default);
			}

			&:hover {
				background-color: var(--a-surface-subtle);
			}
		}
	}
</style>
