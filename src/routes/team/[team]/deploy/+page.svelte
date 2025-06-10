<script lang="ts">
	import ExternalLink from '$lib/components/ExternalLink.svelte';
	import DeploymentListItem from '$lib/components/list/DeploymentListItem.svelte';
	import List from '$lib/components/list/List.svelte';
	import { docURL } from '$lib/doc';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { BodyLong } from '@nais/ds-svelte-community';
	import { format } from 'date-fns';
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
					<ExternalLink href={docURL('/build/')}
						>Learn more about builds and deployments in Nais.</ExternalLink
					>
				{:else}
					Overview of your team's deployments.
					<ExternalLink href={docURL('/build/')}
						>Learn more about builds and deployments in Nais.</ExternalLink
					>
				{/if}
			</BodyLong>

			<List
				title="{$Deployments.data.team.deployments.pageInfo.totalCount} deployment{$Deployments.data
					.team.deployments.pageInfo.totalCount !== 1
					? 's'
					: ''} - showing {$Deployments.data.team.deployments.pageInfo.pageEnd -
					$Deployments.data.team.deployments.pageInfo.pageStart +
					1} from {format(
					$Deployments.data.team.deployments.nodes.at(0)?.createdAt ?? '',
					'dd/MM/yyyy'
				)} to {format(
					$Deployments.data.team.deployments.nodes.at(-1)?.createdAt ?? '',
					'dd/MM/yyyy'
				)}"
			>
				{#each $Deployments.data.team.deployments.nodes as deployment (deployment.id)}
					<div><DeploymentListItem {deployment} showEnv /></div>
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
