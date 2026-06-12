<script lang="ts">
	import { page } from '$app/state';
	import { docURL } from '$lib/doc';
	import DeploymentListItem from '$lib/domain/list-items/DeploymentListItem.svelte';
	import DocsLink from '$lib/ui/DocsLink.svelte';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import List from '$lib/ui/List.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import { extractIdFromUrl } from '$lib/utils/extractIdFromUrl';
	import { changeParams } from '$lib/utils/searchparams';
	import { BodyLong } from '@nais/ds-svelte-community';
	import { tick } from 'svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let { AppDeploys } = $derived(data);

	let after: string = $derived($AppDeploys.variables?.after ?? '');
	let before: string = $derived($AppDeploys.variables?.before ?? '');

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

	let highlightId = $state('');

	$effect(() => {
		const deployId = page.url.searchParams.get('deployId');
		if (!deployId || !$AppDeploys.data) return;

		highlightId = deployId;

		let attempts = 0;

		const tryScroll = async () => {
			await tick();

			const el = document.getElementById(deployId);
			if (el) {
				el.scrollIntoView({ behavior: 'smooth', block: 'center' });
			} else if (attempts < 10) {
				attempts++;
				setTimeout(tryScroll, 100);
			}
		};

		tryScroll();
	});
</script>

<GraphErrors errors={$AppDeploys.errors} />

{#if $AppDeploys.data?.team?.environment?.application}
	{@const app = $AppDeploys.data.team.environment.application}
	{@const deploys = app.deployments}

	<div class="wrapper">
		{#if deploys.pageInfo.totalCount === 0}
			<List title="Deployments" count={0}>
				<div class="empty-state">
					<BodyLong>
						<strong>No deployments found.</strong> Deployments are listed here once a workload has
						been deployed.
						<ExternalLink href={docURL('/build/')}
							>Learn more about builds and deployments in Nais.</ExternalLink
						>
					</BodyLong>
				</div>
			</List>
		{:else}
			<List title="Deployments" count={deploys.pageInfo.totalCount}>
				{#snippet actions()}
					<DocsLink path="/build/" />
				{/snippet}
				{#each deploys.edges as { node: deployment } (deployment.id)}
					{@const id = extractIdFromUrl(deployment.triggerUrl ?? '')}
					<div {id} class:highlight-in={id !== '' && highlightId !== '' && id === highlightId}>
						<DeploymentListItem {deployment} />
					</div>
				{/each}
			</List>
			<Pagination
				page={deploys.pageInfo}
				loaders={{
					loadPreviousPage: () => {
						changeQuery({
							after: '',
							before: deploys.pageInfo.startCursor ?? ''
						});
					},
					loadNextPage: () => {
						changeQuery({
							before: '',
							after: deploys.pageInfo.endCursor ?? ''
						});
					}
				}}
			/>
		{/if}
	</div>
{/if}

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-24);
	}

	.empty-state {
		padding: var(--ax-space-16) var(--ax-space-24);
	}

	[id] {
		transition:
			background-color 0.8s ease,
			border-left-color 0.8s ease,
			border-left-width 0.8s ease,
			opacity 0.8s ease,
			padding-left 0.8s ease;
	}

	.highlight-in {
		background-color: var(--ax-accent-400);
		padding-left: 0.5rem;
		opacity: 1;
		border-left-width: 4px;
	}
</style>
