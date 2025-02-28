<script lang="ts">
	import DeploymentStatus from '$lib/DeploymentStatus.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import Time from '$lib/Time.svelte';
	import { changeParams } from '$lib/utils/searchparams.svelte';
	import { Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import { ExternalLinkIcon } from '@nais/ds-svelte-community/icons';
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

	function isValidSha(sha: string): boolean {
		return /^[0-9a-f]{40}$/i.test(sha);
	}
</script>

<GraphErrors errors={$Deployments.errors} />

{#if $Deployments.data}
	<Table size="small">
		<Thead>
			<Tr>
				<Th style="width: var(--a-spacing-32);">Resource(s)</Th>
				<Th></Th>
				<Th>Commit</Th>
				<Th>Run</Th>
				<Th>Actor</Th>
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
						<Td>
							{#each deploy.resources.nodes as resource (resource.id)}
								<div style="color:var(--a-gray-600)">{resource.kind}:</div>
							{/each}
						</Td>
						<Td>
							{#each deploy.resources.nodes as resource (resource.id)}
								<div>
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
								</div>
							{/each}
						</Td>
						<Td>
							{#if deploy.commitSha && isValidSha(deploy.commitSha)}
								<span style="font-family: monospace; font-size: var(--a-font-size-small)">
									<a href="https://github.com/{deploy.repository}/commit/{deploy.commitSha}"
										>{deploy?.commitSha.slice(0, 7)} <ExternalLinkIcon /></a
									>
								</span>
							{/if}
						</Td>
						<Td>
							{#if deploy.triggerUrl}
								<span style=" font-size: var(--a-font-size-small)">
									<a href={deploy.triggerUrl}>Github action <ExternalLinkIcon /></a>
								</span>
							{/if}
						</Td>
						<Td>
							{deploy.deployerUsername}
						</Td>

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
{/if}
