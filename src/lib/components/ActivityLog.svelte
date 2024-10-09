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

							#... on TeamConfirmDeleteKeyAuditEntry{}
							#... on TeamCreateDeleteKeyAuditEntry{}
							#... on TeamCreatedAuditEntry{}
							... on TeamEnvironmentUpdatedAuditEntry {
								teamEnvironmentUpdated: data {
									environmentName
									updatedFields {
										field
										newValue
										oldValue
									}
								}
							}
							... on TeamMemberAddedAuditEntry {
								teamMemberAdded: data {
									role
									user {
										email
										externalID
										id
										name
									}
									userEmail
									userID
								}
							}
							... on TeamMemberRemovedAuditEntry {
								teamMemberRemoved: data {
									user {
										email
										externalID
										id
										name
									}
									userEmail
									userID
								}
							}
							... on TeamMemberSetRoleAuditEntry {
								teamMemberSetRole: data {
									role
									user {
										email
										externalID
										id
										name
									}
									userEmail
									userID
								}
							}
							... on TeamUpdatedAuditEntry {
								teamUpdated: data {
									updatedFields {
										field
										newValue
										oldValue
									}
								}
							}
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
					{#if edge.node.__typename === 'TeamEnvironmentUpdatedAuditEntry'}
						{edge.node.message}
						{#if edge.node.teamEnvironmentUpdated.updatedFields.length > 0}
							{#each edge.node.teamEnvironmentUpdated.updatedFields as field}
								{field.field}. Changed from {field.oldValue} to {field.newValue}.
							{/each}
						{/if}
					{:else if edge.node.__typename === 'TeamMemberAddedAuditEntry'}
						{edge.node.message}
						{#if edge.node.teamMemberAdded}
							{edge.node.teamMemberAdded.user?.name} ({edge.node.teamMemberAdded.user?.email}) was
							added as {edge.node.teamMemberAdded.role}.
						{/if}
					{:else if edge.node.__typename === 'TeamMemberRemovedAuditEntry'}
						{edge.node.message}
						{#if edge.node.teamMemberRemoved}
							{edge.node.teamMemberRemoved.user?.name} ({edge.node.teamMemberRemoved.user?.email})
							was removed.
						{/if}
					{:else if edge.node.__typename === 'TeamMemberSetRoleAuditEntry'}
						{edge.node.message}
						{#if edge.node.teamMemberSetRole}
							{edge.node.teamMemberSetRole.user?.name} ({edge.node.teamMemberSetRole.user?.email})
							was set to {edge.node.teamMemberSetRole.role}.
						{/if}
					{:else if edge.node.__typename === 'TeamUpdatedAuditEntry'}
						{edge.node.message}
						{#if edge.node.teamUpdated?.updatedFields.length}
							{#each edge.node.teamUpdated?.updatedFields as field}
								{field.field}. Changed from {field.oldValue} to {field.newValue}.
							{/each}
						{/if}
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
