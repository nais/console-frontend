<script lang="ts">
	import { page } from '$app/stores';
	import {
		ActivityLogEntryResourceType,
		type ActivityLogEntryResourceType$options,
		PendingValue
	} from '$houdini';
	import Card from '$lib/Card.svelte';
	import Time from '$lib/Time.svelte';
	import { BodyShort, Button, Skeleton } from '@nais/ds-svelte-community';
	import { ChevronLeftIcon, ChevronRightIcon } from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let { ActivityLog, viewerIsMember } = $derived(data);

	let teamName = $derived($page.params.team);

	const resourceLink = (
		environmentName: string,
		resourceType: ActivityLogEntryResourceType$options,
		resourceName: string
	) => {
		switch (resourceType) {
			case ActivityLogEntryResourceType.APP:
				return `/team/${teamName}/${environmentName}/app/${resourceName}`;
			case ActivityLogEntryResourceType.JOB:
				return `/team/${teamName}/${environmentName}/job/${resourceName}`;
			case ActivityLogEntryResourceType.UNLEASH:
				return `/team/${teamName}/unleash`;
			case ActivityLogEntryResourceType.SECRET:
				return `/team/${teamName}/${environmentName}/secret/${resourceName}`;
			case ActivityLogEntryResourceType.TEAM:
				return `/team/${teamName}`;
			default:
				return null;
		}
	};
</script>

<div class="grid">
	<Card columns={12}>
		<h4>Activity log</h4>
		{#if viewerIsMember}
			{#if $ActivityLog.data}
				{@const ae = $ActivityLog.data}

				{#each ae.team.activityLog.edges as edge}
					{#if edge.node.createdAt === PendingValue}
						<div class="line">
							<BodyShort size="small" spacing>
								<Skeleton variant="rounded" />
							</BodyShort>
							<BodyShort size="small">
								<Skeleton variant="rounded" />
							</BodyShort>
						</div>
					{:else}
						<div class="line">
							<div style="width: 85%">
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
											{#each edge.node.teamEnvironmentUpdated.updatedFields as field}
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
											{#each edge.node.teamUpdated?.updatedFields as field}
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
							<BodyShort size="small" style="color: var(--a-text-subtle)">
								{edge.node.actor}
							</BodyShort>
							<BodyShort
								size="small"
								style="color: var(--a-text-subtle); position: absolute; top: 0; right: 0"
							>
								<Time time={edge.node.createdAt} distance={true} />
							</BodyShort>
						</div>
					{/if}
				{:else}
					<p>No events</p>
				{/each}
				{#if ae.team.activityLog.pageInfo !== PendingValue && (ae.team.activityLog.pageInfo.hasPreviousPage || ae.team.activityLog.pageInfo.hasNextPage)}
					<div class="pagination">
						<span>
							{#if ae.team.activityLog.pageInfo.pageStart !== ae.team.activityLog.pageInfo.pageEnd}
								{ae.team.activityLog.pageInfo.pageStart} - {ae.team.activityLog.pageInfo.pageEnd}
							{:else}
								{ae.team.activityLog.pageInfo.pageStart}
							{/if}

							of {ae.team.activityLog.pageInfo.totalCount}
						</span>

						<span style="padding-left: 1rem;">
							<Button
								size="small"
								variant="secondary"
								disabled={!ae.team.activityLog.pageInfo.hasPreviousPage}
								onclick={async () => {
									return await ActivityLog.loadPreviousPage();
								}}><ChevronLeftIcon /></Button
							>
							<Button
								size="small"
								variant="secondary"
								disabled={!ae.team.activityLog.pageInfo.hasNextPage}
								onclick={async () => {
									return await ActivityLog.loadNextPage();
								}}
							>
								<ChevronRightIcon /></Button
							>
						</span>
					</div>
				{/if}
			{/if}
		{/if}
	</Card>
</div>

<style>
	.line {
		position: relative;
	}

	.line:is(:global(:not(:last-child))) {
		border-bottom: 1px solid var(--a-border-divider);
		padding-bottom: 1rem;
		margin-bottom: 1rem;
	}
	.pagination {
		text-align: right;
		padding: 0.5rem;
	}
</style>
