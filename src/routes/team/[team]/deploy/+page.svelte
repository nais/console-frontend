<script lang="ts">
	import DeploymentListItem from '$lib/domain/list-items/DeploymentListItem.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import List from '$lib/ui/List.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

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
	<List title="Deployments" count={$Deployments.data.team.deployments.pageInfo.totalCount}>
		{#each $Deployments.data.team.deployments.edges as { node: deployment } (deployment.id)}
			<DeploymentListItem {deployment} showEnv />
		{/each}
	</List>

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
