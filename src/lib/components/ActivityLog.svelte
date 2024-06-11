<script lang="ts">
	import { type AuditEventResourceType$options, graphql, PendingValue } from '$houdini';
	import { Skeleton } from '@nais/ds-svelte-community';
	import Card from '$lib/Card.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import LogLine from '$lib/AuditLogLine.svelte';
	import type { TeamEventsVariables } from '$houdini/types/src/lib/components/$houdini';

	export let teamName: string;
	export let resourceType: AuditEventResourceType$options;

	const changePage = (page: number) => {
		offset = (page - 1) * limit;
		store.fetch({ variables: { offset } });
	};

	const limit = 5;
	let offset = 0;
	export const _TeamEventsVariables: TeamEventsVariables = () => {
		return { limit, offset, team: teamName, filter: { resourceType } };
	};

	const store = graphql(`
		query TeamEvents($limit: Int, $offset: Int, $team: Slug!, $filter: AuditEventsFilter) @load {
			team(slug: $team) @loading {
				auditEvents(limit: $limit, offset: $offset, filter: $filter) @loading {
					nodes @loading {
						id
						actor
						action
						message
						createdAt
						resourceType
					}
					pageInfo @loading {
						hasPreviousPage
						hasNextPage
						totalCount
					}
				}
			}
		}
	`);

	$: team = $store.data?.team;
</script>

{#if team && team !== PendingValue}
	<Card>
		<h3>Activity</h3>

		{#each team.auditEvents.nodes as event}
			{#if event !== PendingValue}
				<LogLine log={event} />
			{:else}
				<Skeleton variant="text" />
			{/if}
		{:else}
			<p>No events</p>
		{/each}

		{#if team.auditEvents.pageInfo && team.auditEvents.pageInfo !== PendingValue}
			<Pagination
				pageInfo={team.auditEvents.pageInfo}
				{limit}
				{offset}
				{changePage}
			/>
		{/if}
	</Card>
{/if}
