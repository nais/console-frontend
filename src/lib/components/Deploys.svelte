<script lang="ts">
	import { graphql } from '$houdini';

	import Time from '$lib/Time.svelte';
	import { Alert, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import type { TeamDeploysVariables } from './$houdini';
	import DeploymentStatus from './DeploymentStatus.svelte';

	export let teamName: string;

	export const _TeamDeploysVariables: TeamDeploysVariables = () => {
		return { team: teamName };
	};

	const store = graphql(`
		query TeamDeploys($team: Slug!) @load {
			team(slug: $team) {
				deployments(first: 20) {
					pageInfo {
						totalCount
					}
					edges {
						node {
							statuses {
								status
								message
								created
							}
							resources {
								group
								kind
								name
								version
								namespace
							}
							environment {
								name
							}
							created
						}
					}
				}
			}
		}
	`);
</script>

{#if $store.errors !== null}
	<Alert variant="error">
		{#each $store.errors as error}
			{error.message}
		{/each}
	</Alert>
{/if}
{#if $store.data !== null}
	<Table size="small" zebraStripes>
		<Thead>
			<Th>Resource(s)</Th>
			<Th>Created</Th>
			<Th>Cluster</Th>
			<Th>Status</Th>
		</Thead>
		<Tbody>
			{#each $store.data.team.deployments.edges as edge}
				<Tr>
					<Td
						>{#each edge.node.resources as resource}
							<span style="color:var(--a-gray-600)">{resource.kind}:</span>
							{#if resource.kind === 'Application'}
								<a href="/team/{teamName}/{edge.node.environment.name}/app/{resource.name}/deploys"
									>{resource.name}</a
								>
							{:else if resource.kind === 'Naisjob'}
								<a href="/team/{teamName}/{edge.node.environment.name}/job/{resource.name}/deploys"
									>{resource.name}</a
								>
							{:else}
								{resource.name}
							{/if}
							<br />
						{/each}</Td
					>
					<Td><Time time={edge.node.created} distance={true} /></Td>
					<Td>
						{edge.node.environment.name}
					</Td>

					<Td
						>{#if edge.node.statuses.length === 0}<DeploymentStatus
								status={'unknown'}
							/>{:else}<DeploymentStatus status={edge.node.statuses[0].status} />{/if}</Td
					>
				</Tr>
			{/each}
		</Tbody>
	</Table>
{/if}
