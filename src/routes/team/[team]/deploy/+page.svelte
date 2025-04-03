<script lang="ts">
	import DeploymentListItem from '$lib/components/list/DeploymentListItem.svelte';
	import List from '$lib/components/list/List.svelte';
	import { docURL } from '$lib/doc';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { BodyLong } from '@nais/ds-svelte-community';
	import type { PageProps } from './$houdini';

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
	<div class="wrapper">
		<div>
			<BodyLong spacing>
				{#if $Deployments.data?.team.deployments.pageInfo.totalCount == 0}
					<strong>No deployments found.</strong>
					<a href={docURL('/build/')}>Learn more about builds and deployments in Nais.</a>
				{:else}
					Overview of your team's deployments.
					<a href={docURL('/build/')}>Learn more about builds and deployments in Nais.</a>
				{/if}
			</BodyLong>
			<List
				title="{$Deployments.data.team.deployments.pageInfo.totalCount} deployment{$Deployments.data
					.team.deployments.pageInfo.totalCount !== 1
					? 's'
					: ''}"
			>
				{#each $Deployments.data.team.deployments.nodes as deployment (deployment.id)}
					<div><DeploymentListItem {deployment} /></div>
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
		</div>
	</div>
{/if}

<style>
	.wrapper {
		display: grid;
		grid-template-columns: 1fr 300px;
		gap: var(--spacing-layout);
	}
</style>
