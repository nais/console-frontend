<script lang="ts">
	import {
		AuditEventResourceType,
		type AuditEventResourceType$options,
		graphql,
		PendingValue
	} from '$houdini';
	import type { TeamEventsVariables } from '$houdini/types/src/lib/components/$houdini';
	import Card from '$lib/Card.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import Time from '$lib/Time.svelte';
	import GitHubLink from '$lib/components/GitHubLink.svelte';
	import { BodyShort, Skeleton } from '@nais/ds-svelte-community';

	export let teamName: string;
	export let resourceType: AuditEventResourceType$options | undefined = undefined;
	export let style = '';
	export let columns = 0;
	export let rows = 0;

	const changePage = (page: number) => {
		offset = (page - 1) * limit;
		store.fetch({ variables: { offset, team: teamName } });
	};

	const limit = 5;
	let offset = 0;
	export const _TeamEventsVariables: TeamEventsVariables = () => {
		return { limit, offset, team: teamName, filter: { resourceType } };
	};

	const store = graphql(`
		query TeamEvents($limit: Int, $offset: Int, $team: Slug!, $filter: AuditEventsFilter)
		@load
		@cache(policy: NetworkOnly) {
			team(slug: $team) @loading {
				auditEvents(limit: $limit, offset: $offset, filter: $filter) @loading {
					nodes @loading {
						__typename
						... on AuditEvent {
							id
							actor
							action
							message
							createdAt
							resourceType
							resourceName
							env {
								name
							}
						}
						... on AuditEventTeamAddRepository {
							data {
								repositoryName
							}
						}
						... on AuditEventTeamRemoveRepository {
							data {
								repositoryName
							}
						}
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

	const resourceLink = (
		env: { name: string } | null,
		resourceType: AuditEventResourceType$options,
		resourceName: string
	) => {
		if (env === null || env.name.length == 0) {
			return null;
		}

		switch (resourceType) {
			case AuditEventResourceType.SECRET:
				return `/team/${teamName}/${env.name}/secret/${resourceName}`;
			case AuditEventResourceType.APP:
				return `/team/${teamName}/${env.name}/app/${resourceName}`;
			case AuditEventResourceType.NAISJOB:
				return `/team/${teamName}/${env.name}/job/${resourceName}`;
			default:
				return null;
		}
	};

	$: team = $store.data?.team;
</script>

{#if team}
	<Card {style} {columns} {rows}>
		<h3>Recent activity</h3>
		{#each team.auditEvents.nodes as event}
			{#if event !== PendingValue}
				<div class="line">
					<BodyShort size="small" spacing>
						{#if event.__typename === 'AuditEventTeamAddRepository'}
							Added repository <GitHubLink repository={event.data.repositoryName} />
						{:else if event.__typename === 'AuditEventTeamRemoveRepository'}
							Removed repository <GitHubLink repository={event.data.repositoryName} />
						{:else}
							{event.message}
							{@const link = resourceLink(event.env, event.resourceType, event.resourceName)}
							{#if link}
								<a href={link}>{event.resourceName}</a>
							{/if}
						{/if}
						{#if event.env}
							in {event.env.name}
						{/if}
					</BodyShort>
					<BodyShort size="small" style="color: var(--a-text-subtle)">
						{event.actor}
					</BodyShort>
					<BodyShort
						size="small"
						style="color: var(--a-text-subtle); position: absolute; top: 0; right: 0"
					>
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
			<Pagination pageInfo={team.auditEvents.pageInfo} {limit} {offset} {changePage} />
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
