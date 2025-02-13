<script lang="ts">
	import { fragment, graphql, type TeamDeployments } from '$houdini';
	import DeploymentStatus from '$lib/DeploymentStatus.svelte';
	import Time from '$lib/Time.svelte';
	import { Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import WorkloadLink from './WorkloadLink.svelte';

	interface Props {
		team: TeamDeployments;
	}

	let { team }: Props = $props();

	let data = $derived(
		fragment(
			team,
			graphql(`
				fragment TeamDeployments on Team {
					deployments {
						nodes {
							id
							statuses {
								nodes {
									state
									message
									createdAt
								}
							}
							resources {
								nodes {
									id
									kind
									name
								}
							}
							environmentName
							createdAt
							teamSlug
						}
					}
				}
			`)
		)
	);
</script>

<Table size="small" zebraStripes>
	<Thead>
		<Tr>
			<Th>Resource(s)</Th>
			<Th>Environment</Th>
			<Th>Created</Th>
			<Th>Status</Th>
		</Tr>
	</Thead>
	<Tbody>
		{#if $data.deployments !== null}
			{#each $data.deployments.nodes as deploy (deploy.id)}
				<Tr>
					<Td
						>{#each deploy.resources.nodes as resource (resource.id)}
							{#if resource.kind === 'Application'}
								<WorkloadLink
									workload={{
										__typename: 'App',
										environment: { name: deploy.environmentName },
										team: { slug: deploy.teamSlug },
										name: resource.name
									}}
									showIcon={true}
								/>
							{:else if resource.kind === 'Job' || resource.kind === 'Naisjob'}
								<WorkloadLink
									workload={{
										__typename: 'Job',
										environment: { name: deploy.environmentName },
										team: { slug: deploy.teamSlug },
										name: resource.name
									}}
									showIcon={true}
								/>
							{:else}
								<span style="color:var(--a-gray-600)">{resource.kind}:</span>
								{resource.name}
							{/if}
							<br />
						{/each}</Td
					>
					<Td>
						{deploy.environmentName}
					</Td>
					<Td><Time time={deploy.createdAt} distance={true} /></Td>

					<Td
						>{#if deploy.statuses.nodes.length === 0}<DeploymentStatus
								status={'UNKNOWN'}
							/>{:else}<DeploymentStatus status={deploy.statuses.nodes[0].state} />{/if}</Td
					>
				</Tr>
			{:else}
				<Tr>
					<Td colspan={999}>No deployments found</Td>
				</Tr>
			{/each}
		{/if}
	</Tbody>
</Table>
