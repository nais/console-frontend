<script lang="ts">
	import DeploymentListItem from '$lib/components/list/DeploymentListItem.svelte';
	import List from '$lib/components/list/List.svelte';
	import { docURL } from '$lib/doc';
	import { envTagVariant } from '$lib/envTagVariant';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { BodyLong, Tag } from '@nais/ds-svelte-community';
	import type { PageProps } from './$houdini';

	let { data }: PageProps = $props();

	let { JobDeploys } = $derived(data);

	let after: string = $derived($JobDeploys.variables?.after ?? '');
	let before: string = $derived($JobDeploys.variables?.before ?? '');

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

<GraphErrors errors={$JobDeploys.errors} />

{#if $JobDeploys.data}
	<div class="wrapper">
		<div>
			<BodyLong spacing>
				{#if $JobDeploys.data.team.environment.job.deployments.pageInfo.totalCount == 0}
					<strong
						>No deployments of <strong>{$JobDeploys.data.team.environment.job.name}</strong> in <Tag
							size="small"
							variant={envTagVariant(
								$JobDeploys.data.team.environment.job.teamEnvironment.environment.name
							)}>{$JobDeploys.data.team.environment.job.teamEnvironment.environment.name}</Tag
						> found.</strong
					>
					<a href={docURL('/build/')}>Learn more about builds and deployments in Nais.</a>
				{:else}
					Overview of deployments of <strong>{$JobDeploys.data.team.environment.job.name}</strong>
					in <Tag
						size="small"
						variant={envTagVariant(
							$JobDeploys.data.team.environment.job.teamEnvironment.environment.name
						)}>{$JobDeploys.data.team.environment.job.teamEnvironment.environment.name}</Tag
					>.
					<a href={docURL('/build/')}>Learn more about builds and deployments in Nais.</a>
				{/if}
			</BodyLong>
			<List
				title="{$JobDeploys.data.team.environment.job.deployments.pageInfo
					.totalCount} deployment{$JobDeploys.data.team.environment.job.deployments.pageInfo
					.totalCount !== 1
					? 's'
					: ''}"
			>
				{#each $JobDeploys.data.team.environment.job.deployments.nodes as deployment (deployment.id)}
					<div><DeploymentListItem {deployment} /></div>
				{/each}
			</List>
			<Pagination
				page={$JobDeploys.data.team.environment.job.deployments.pageInfo}
				loaders={{
					loadPreviousPage: () => {
						changeQuery({
							after: '',
							before: $JobDeploys.data?.team.environment.job.deployments.pageInfo.startCursor ?? ''
						});
					},
					loadNextPage: () => {
						changeQuery({
							before: '',
							after: $JobDeploys.data?.team.environment.job.deployments.pageInfo.endCursor ?? ''
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
