<script lang="ts">
	import { fragment, graphql, type TeamDeploymentsNew } from '$houdini';
	import DeploymentStatus from '$lib/DeploymentStatus.svelte';
	import Time from '$lib/Time.svelte';
	import { Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';

	export let team: TeamDeploymentsNew;

	$: data = fragment(
		team,
		graphql(`
			fragment TeamDeploymentsNew on Team {
				deployments {
					nodes {
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
						team {
							slug
						}
					}
				}
			}
		`)
	);
</script>

<h4>Deployments</h4>
{#if $data !== null}
	<Table size="small" zebraStripes>
		<Thead>
			<Th>Team</Th>
			<Th>Environment</Th>
			<Th>Resource(s)</Th>
			<Th>Created</Th>
			<Th>Status</Th>
		</Thead>
		<Tbody>
			{#each $data.deployments.nodes as node}
				<Tr>
					<Td>{node.team.slug}</Td>
					<Td>
						{node.environment.name}
					</Td>
					<Td
						>{#each node.resources as resource}
							<span style="color:var(--a-gray-600)">{resource.kind}:</span>
							{#if resource.kind === 'Application'}
								<a href="/team/{node.team.slug}/{node.environment.name}/app/{resource.name}/deploys"
									>{resource.name}</a
								>
							{:else if resource.kind === 'Job'}
								<a href="/team/{node.team.slug}/{node.environment.name}/job/{resource.name}/deploys"
									>{resource.name}</a
								>
							{:else}
								{resource.name}
							{/if}
							<br />
						{/each}</Td
					>
					<Td><Time time={node.created} distance={true} /></Td>

					<Td
						>{#if node.statuses.length === 0}<DeploymentStatus
								status={'unknown'}
							/>{:else}<DeploymentStatus status={node.statuses[0].status} />{/if}</Td
					>
				</Tr>
			{/each}
		</Tbody>
	</Table>
{/if}
