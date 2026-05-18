<script lang="ts">
	import { page } from '$app/state';
	import { docURL } from '$lib/doc';
	import DeploymentListItem from '$lib/domain/list-items/DeploymentListItem.svelte';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import List from '$lib/ui/List.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import Time from '$lib/ui/Time.svelte';
	import { extractIdFromUrl } from '$lib/utils/extractIdFromUrl';
	import { changeParams } from '$lib/utils/searchparams';
	import { BodyShort } from '@nais/ds-svelte-community';
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

	let latestDeploy = $derived.by(() => {
		const nodes = $AppDeploys.data?.team?.environment?.application?.deployments?.nodes;
		if (!nodes || nodes.length === 0) return null;
		return nodes[0];
	});
</script>

<GraphErrors errors={$AppDeploys.errors} />

{#if $AppDeploys.data?.team?.environment?.application}
	{@const app = $AppDeploys.data.team.environment.application}
	{@const deploys = app.deployments}

	<div class="wrapper">
		{#if deploys.pageInfo.totalCount === 0}
			<BodyShort size="small" textColor="subtle">
				No deployments found.
				<ExternalLink href={docURL('/build/')}
					>Learn more about builds and deployments.</ExternalLink
				>
			</BodyShort>
		{:else}
			<div class="content">
				<div class="list">
				<List title="Deployments" count={deploys.pageInfo.totalCount}>
						{#each deploys.nodes as deployment (deployment.id)}
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
				</div>

				<div class="sidebar">
					<SurfaceCard title="Statistics">
						<dl class="stats">
							<div>
								<dt>Total deployments</dt>
								<dd>{deploys.pageInfo.totalCount}</dd>
							</div>
							{#if latestDeploy}
								<div>
									<dt>Latest deploy</dt>
									<dd><Time time={latestDeploy.createdAt} distance={true} /></dd>
								</div>
								{#if latestDeploy.deployerUsername}
									<div>
										<dt>Deployed by</dt>
										<dd>{latestDeploy.deployerUsername}</dd>
									</div>
								{/if}
								{#if latestDeploy.repository}
									<div>
										<dt>Repository</dt>
										<dd>
											<a href="https://github.com/{latestDeploy.repository}"
												>{latestDeploy.repository}</a
											>
										</dd>
									</div>
								{/if}
							{/if}
						</dl>
					</SurfaceCard>
				</div>
			</div>
		{/if}
	</div>
{/if}

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-24);
	}

	.content {
		display: grid;
		grid-template-columns: 1fr 300px;
		gap: var(--ax-space-24);
		align-items: start;
	}

	.list {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-24);
		min-width: 0;
	}

	.sidebar {
		min-width: 0;
	}

	.stats {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-8);
		margin: 0;
		font-size: var(--ax-font-size-small);
	}

	.stats dt {
		font-weight: var(--ax-font-weight-bold);
		color: var(--ax-text-neutral);
	}

	.stats dd {
		margin: 0;
		color: var(--ax-text-neutral-subtle);
	}

	.stats dd a {
		color: inherit;
		text-decoration: none;
	}

	.stats dd a:hover {
		text-decoration: underline;
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

	@media (max-width: 767px), (max-height: 500px) {
		.content {
			grid-template-columns: 1fr;
		}
	}
</style>
