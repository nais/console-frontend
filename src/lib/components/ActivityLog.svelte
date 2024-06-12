<script lang="ts">
	import { type AuditEventResourceType$options, graphql, PendingValue } from '$houdini';
	import { BodyLong, BodyShort, Skeleton } from '@nais/ds-svelte-community';
	import Card from '$lib/Card.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import type { TeamEventsVariables } from '$houdini/types/src/lib/components/$houdini';
	import Time from '$lib/Time.svelte';

	export let teamName: string;
	export let resourceType: AuditEventResourceType$options;
	export let style = '';
	export let columns = 0;
	export let rows = 0;

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
		query TeamEvents($limit: Int, $offset: Int, $team: Slug!, $filter: AuditEventsFilter) @load @cache(policy: NetworkOnly) {
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
	<Card {style} {columns} {rows}>
		<h3>Recent activity</h3>

		{#each team.auditEvents.nodes as event}
			{#if event !== PendingValue}
				<div class="line">
					<BodyShort size="medium" spacing>
						{event.message}
					</BodyShort>
					<BodyShort size="small" style="color: var(--a-text-subtle)">
						{event.actor}
					</BodyShort>
					<BodyShort size="small" style="color: var(--a-text-subtle); position: absolute; top: 0; right: 0">
						<Time time={event.createdAt} distance={true} />
					</BodyShort>
				</div>
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

<style>
	.line {
		position: relative;
	}

	.line:is(:not(:last-child)) {
		border-bottom: 1px solid var(--a-border-divider);
		padding-bottom: 1rem;
		margin-bottom: 1rem;
	}
</style>
