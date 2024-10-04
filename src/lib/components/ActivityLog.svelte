<script lang="ts">
	import { AuditResourceType, graphql, type AuditResourceType$options } from '$houdini';
	import type { TeamEventsVariables } from '$houdini/types/src/lib/components/$houdini';

	import Card from '$lib/Card.svelte';
	import Time from '$lib/Time.svelte';
	import { BodyShort } from '@nais/ds-svelte-community';

	export let teamName: string;
	//export let resourceType: AuditResourceType$options | undefined = undefined;
	export let style = '';
	export let columns = 0;
	export let rows = 0;

	/*const changePage = (page: number) => {
		offset = (page - 1) * limit;
		store.fetch({ variables: { team: teamName } });
	};*/

	/*const limit = 5;
	let offset = 0;*/
	export const _TeamEventsVariables: TeamEventsVariables = () => {
		return { team: teamName };
	};

	const store = graphql(`
		query TeamEvents($team: Slug!) @load @cache(policy: NetworkOnly) {
			team(slug: $team) {
				slug
				auditEntries(first: 5) {
					pageInfo {
						endCursor
						hasNextPage
						hasPreviousPage
						pageEnd
						pageStart
						startCursor
					}
					edges {
						node {
							__typename
							actor
							createdAt
							environmentName
							message
							resourceName
							resourceType
						}
					}
				}
			}
		}
	`);

	const resourceLink = (
		environmentName: string,
		resourceType: AuditResourceType$options
		/*resourceName: string*/
	) => {
		switch (resourceType) {
			/*case AuditResourceType.SECRET:
				return `/team/${teamName}/${env.name}/secret/${resourceName}`;
			case AuditResourceType.APP:
				return `/team/${teamName}/${env.name}/app/${resourceName}`;
			case AuditResourceType.NAISJOB:
				return `/team/${teamName}/${env.name}/job/${resourceName}`;*/

			case AuditResourceType.TEAM:
				return `/team/${teamName}`;
			default:
				return null;
		}
	};
	$: team = $store.data?.team;
</script>

{#if team}
	<Card {style} {columns} {rows}>
		<h3>Recent activity</h3>
		{#each team.auditEntries.edges as edge}
			<div class="line">
				<BodyShort size="small" spacing>
					{#if edge.node.__typename === 'AuditEventTeamAddRepository'}
						Added repository <!--GitHubLink repository={edge.node.data.repositoryName} /-->
					{:else if edge.node.__typename === 'AuditEventTeamRemoveRepository'}
						Removed repository <!--GitHubLink repository={edge.data.repositoryName} /-->
					{:else}
						{edge.node.message}
						{@const link = resourceLink(
							edge.node.environmentName ? edge.node.environmentName : '',
							edge.node.resourceType /*, event.resourceName*/
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
					{edge.node.actor}
				</BodyShort>
				<BodyShort
					size="small"
					style="color: var(--a-text-subtle); position: absolute; top: 0; right: 0"
				>
					<Time time={edge.node.createdAt} distance={true} />
				</BodyShort>
			</div>
		{:else}
			<p>No events</p>
		{/each}

		<!--{#if team.auditEvents.pageInfo && team.auditEvents.pageInfo !== PendingValue}
			<Pagination pageInfo={team.auditEvents.pageInfo} {limit} {offset} {changePage} />
		{/if}-->
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
