<script lang="ts">
	import { fragment, graphql, type TeamDeployments } from '$houdini';
	import DeploymentStatus from '$lib/DeploymentStatus.svelte';
	import Time from '$lib/Time.svelte';
	import { Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';

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

<Table size="small">
	<Thead>
		<Tr>
			<Th>Resource(s)</Th>
			<Th>Environment</Th>
			<Th>Created</Th>
			<Th>Status</Th>
		</Tr>
	</Thead>
	<Tbody>
		{#if $data !== null}
			{@const deploys = $data.deployments.nodes}
			{#each deploys as deploy (deploy.id)}
				<Tr>
					<Td
						><dl>
							{#each deploy.resources.nodes as resource (resource.id)}
								<dt><span style="color:var(--a-gray-600)">{resource.kind}:</span></dt>
								<dd>
									{#if resource.kind === 'Application'}
										<a href="/team/{deploy.teamSlug}/{deploy.environmentName}/app/{resource.name}"
											>{resource.name}</a
										>
									{:else if resource.kind === 'Job' || resource.kind === 'Naisjob'}
										<a href="/team/{deploy.teamSlug}/{deploy.environmentName}/job/{resource.name}"
											>{resource.name}</a
										>
									{:else}
										{resource.name}
									{/if}
								</dd>
							{/each}
						</dl></Td
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

<style>
	dl {
		display: grid;
		grid-template-columns: 100px 1fr;
		margin: 0;
	}
	dt {
		font-weight: 400;
	}
	dd {
		margin-inline-start: 20px;
	}
</style>
