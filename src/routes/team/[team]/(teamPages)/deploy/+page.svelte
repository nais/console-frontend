<script lang="ts">
	import Card from '$lib/Card.svelte';
	import DeploymentStatus from '$lib/DeploymentStatus.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import Time from '$lib/Time.svelte';
	import { changeParams } from '$lib/utils/searchparams.svelte';
	import { Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let { Deployments } = $derived(data);

	let after: string = $derived($Deployments.variables?.after ?? '');
	let before: string = $derived($Deployments.variables?.before ?? '');

	const changeQuery = (
		params: {
			after?: string;
			before?: string;
		} = {}
	) => {
		changeParams({
			before: params.before ?? before,
			after: params.after ?? after
		});
	};
</script>

<GraphErrors errors={$Deployments.errors} />

{#if $Deployments.data}
	<Card>
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
				{#if $Deployments.data !== null}
					{@const deploys = $Deployments.data.team.deployments.nodes}
					{#each deploys as deploy (deploy.id)}
						<Tr>
							<Td
								><dl>
									{#each deploy.resources.nodes as resource (resource.id)}
										<dt><span style="color:var(--a-gray-600)">{resource.kind}:</span></dt>
										<dd>
											{#if resource.kind === 'Application'}
												<a
													href="/team/{deploy.teamSlug}/{deploy.environmentName}/app/{resource.name}"
													>{resource.name}</a
												>
											{:else if resource.kind === 'Job' || resource.kind === 'Naisjob'}
												<a
													href="/team/{deploy.teamSlug}/{deploy.environmentName}/job/{resource.name}"
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

		<Pagination
			page={$Deployments.data.team.deployments.pageInfo}
			loaders={{
				loadPreviousPage: () => {
					changeQuery({
						after: '',
						before: $Deployments.data?.team.deployments.pageInfo.startCursor ?? ''
					});
				},
				loadNextPage: () => {
					changeQuery({
						before: '',
						after: $Deployments.data?.team.deployments.pageInfo.endCursor ?? ''
					});
				}
			}}
		/>
	</Card>
{/if}

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
