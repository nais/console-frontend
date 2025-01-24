<script lang="ts">
	import { fragment, graphql, PendingValue, type TeamDeployments } from '$houdini';
	import DeploymentStatus from '$lib/DeploymentStatus.svelte';
	import Time from '$lib/Time.svelte';
	import { Skeleton, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import { RocketIcon } from '@nais/ds-svelte-community/icons';
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
					deployments @loading {
						nodes @loading {
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
		)
	);

	type Deployment =
		| {
				readonly team: { readonly slug: string };
				readonly environment: { readonly name: string };
				readonly resources: {
					readonly group: string;
					readonly kind: string;
					readonly name: string;
					readonly version: string;
					readonly namespace: string;
				}[];
				readonly created: Date;
				readonly statuses: {
					readonly status: string;
					readonly message: string | null;
					readonly created: Date;
				}[];
		  }
		| typeof PendingValue;

	function orderDeploymentsByDate(nodes: Deployment[]) {
		return nodes.sort((a, b) => {
			if (a === PendingValue || b === PendingValue) return 0;
			return new Date(b.created).getTime() - new Date(a.created).getTime();
		});
	}
</script>

<h4 class="heading"><RocketIcon />Deployments</h4>

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
			{#each orderDeploymentsByDate($data.deployments.nodes) as deploy}
				<Tr>
					{#if deploy !== PendingValue}
						<Td
							>{#each deploy.resources as resource}
								{#if resource.kind === 'Application'}
									<WorkloadLink
										workload={{
											__typename: 'App',
											environment: { name: deploy.environment.name },
											team: { slug: deploy.team.slug },
											name: resource.name
										}}
										showIcon={true}
									/>
								{:else if resource.kind === 'Job' || resource.kind === 'Naisjob'}
									<WorkloadLink
										workload={{
											__typename: 'Job',
											environment: { name: deploy.environment.name },
											team: { slug: deploy.team.slug },
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
							{deploy.environment.name}
						</Td>
						<Td><Time time={deploy.created} distance={true} /></Td>

						<Td
							>{#if deploy.statuses.length === 0}<DeploymentStatus
									status={'unknown'}
								/>{:else}<DeploymentStatus status={deploy.statuses[0].status} />{/if}</Td
						>
					{:else}
						<Td>
							<Skeleton variant="text" />
						</Td>
						<Td>
							<Skeleton variant="text" />
						</Td>
						<Td>
							<Skeleton variant="text" />
						</Td>
						<Td>
							<Skeleton variant="text" />
						</Td>
						<Td>
							<Skeleton variant="text" />
						</Td>
					{/if}
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
	.heading {
		display: flex;
		gap: 0.3rem;
		align-items: center;
	}
</style>
