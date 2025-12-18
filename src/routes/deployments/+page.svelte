<script lang="ts">
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import { Heading } from '@nais/ds-svelte-community';
	import type { PageProps } from './$types';
	import Pagination from '$lib/ui/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { format } from 'date-fns';
	import DeploymentListItem from '$lib/domain/list-items/DeploymentListItem.svelte';
	import List from '$lib/ui/List.svelte';

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

	let { data }: PageProps = $props();
	let { TenantDeployments } = $derived(data);
	let after: string = $derived($TenantDeployments.variables?.after ?? '');
	let before: string = $derived($TenantDeployments.variables?.before ?? '');
</script>

<div class="page">
	<div class="container">
		<GraphErrors errors={$TenantDeployments.errors} />
		{#if $TenantDeployments.data}
			<div>
				<Heading level="2" spacing>Deployments</Heading>

				{#if $TenantDeployments.data?.deployments.pageInfo.totalCount > 0}
					<List
						title="{$TenantDeployments.data.deployments.pageInfo
							.totalCount} deployment{$TenantDeployments.data.deployments.pageInfo.totalCount !== 1
							? 's'
							: ''} - showing {$TenantDeployments.data.deployments.pageInfo.pageEnd -
							$TenantDeployments.data.deployments.pageInfo.pageStart +
							1} from {format(
							$TenantDeployments.data.deployments.nodes.at(0)?.createdAt ?? '',
							'dd/MM/yyyy'
						)} to {format(
							$TenantDeployments.data.deployments.nodes.at(-1)?.createdAt ?? '',
							'dd/MM/yyyy'
						)}"
					>
						{#each $TenantDeployments.data.deployments.nodes as deployment (deployment.id)}
							<div><DeploymentListItem {deployment} showEnv showTeam /></div>
						{/each}
					</List>
				{/if}

				<Pagination
					page={$TenantDeployments.data.deployments.pageInfo}
					loaders={{
						loadPreviousPage: () => {
							changeQuery({
								after: '',
								before: $TenantDeployments.data?.deployments.pageInfo.startCursor ?? ''
							});
						},
						loadNextPage: () => {
							changeQuery({
								before: '',
								after: $TenantDeployments.data?.deployments.pageInfo.endCursor ?? ''
							});
						}
					}}
				/>
			</div>
		{/if}
	</div>
</div>

<style>
	.container {
		margin-top: var(--spacing-layout);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
	}
</style>
