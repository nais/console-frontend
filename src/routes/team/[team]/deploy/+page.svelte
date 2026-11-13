<script lang="ts">
	import { resolve } from '$app/paths';
	import DeploymentListItem from '#lib/domain/list-items/DeploymentListItem.svelte';
	import { Alert } from '#lib/shadcn/ui/index.js';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import Collection from '#lib/ui/Collection.svelte';
	import Pagination from '#lib/ui/Pagination.svelte';
	import { changeParams } from '#lib/utils/searchparams.js';
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

<Alert variant="info" style="margin-bottom: var(--nais-space-16);">
	Deployments made with <code>nais/deploy@v3</code> or <code>nais apply</code> are shown in the
	<a
		href={`${resolve('/team/[team]/activity-log', { team: data.teamSlug })}?activityTypes=APPLICATION_UPDATED%2CJOB_UPDATED`}
		>Activity Log</a
	>.
</Alert>

{#if $Deployments.data}
	<Collection title="Deployments" count={$Deployments.data.team.deployments.pageInfo.totalCount}>
		{#each $Deployments.data.team.deployments.edges as { node: deployment } (deployment.id)}
			<DeploymentListItem {deployment} showEnv />
		{/each}
	</Collection>

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
