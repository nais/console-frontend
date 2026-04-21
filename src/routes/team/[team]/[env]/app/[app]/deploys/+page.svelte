<script lang="ts">
	import { page } from '$app/state';
	import { docURL } from '$lib/doc';
	import DeploymentListItem from '$lib/domain/list-items/DeploymentListItem.svelte';
	import { envTagVariant } from '$lib/envTagVariant';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import List from '$lib/ui/List.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import { cursorPaginationLoaders } from '$lib/urql/pagination';
	import { extractIdFromUrl } from '$lib/utils/extractIdFromUrl';
	import { BodyLong, Tag } from '@nais/ds-svelte-community';
	import { format } from 'date-fns';
	import { tick } from 'svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let { AppDeploys } = $derived(data);
	let application = $derived(AppDeploys.data?.team.environment.application);
	let deployments = $derived(application?.deployments);

	let highlightId = $state('');

	$effect(() => {
		const deployId = page.url.searchParams.get('deployId');
		if (!deployId || !AppDeploys.data) return;

		highlightId = deployId;

		let attempts = 0;

		const tryScroll = async () => {
			await tick(); // wait for DOM to update

			const el = document.getElementById(deployId);
			if (el) {
				el.scrollIntoView({ behavior: 'smooth', block: 'center' });
			} else if (attempts < 10) {
				attempts++;
				setTimeout(tryScroll, 100); // try again in 100ms
			}
		};

		tryScroll();
	});
</script>

<GraphErrors errors={AppDeploys.errors} />

{#if AppDeploys.data && application && deployments}
	<div class="wrapper">
		<div>
			<BodyLong spacing>
				{#if deployments.pageInfo.totalCount == 0}
					<strong
						>No deployments of <strong>{application.name}</strong>
						in <Tag
							size="small"
							variant={envTagVariant(application.teamEnvironment.environment.name)}
							>{application.teamEnvironment.environment.name}</Tag
						> found.</strong
					>
					<ExternalLink href={docURL('/build/')}
						>Learn more about builds and deployments in Nais.</ExternalLink
					>
				{:else}
					Overview of deployments of <strong>{application.name}</strong>
					in <Tag size="small" variant={envTagVariant(application.teamEnvironment.environment.name)}
						>{application.teamEnvironment.environment.name}</Tag
					>.
					<ExternalLink href={docURL('/build/')}
						>Learn more about builds and deployments in Nais.</ExternalLink
					>
				{/if}
			</BodyLong>
			{#if deployments.pageInfo.totalCount != 0}
				<List
					title="{deployments.pageInfo.totalCount} deployment{deployments.pageInfo.totalCount !== 1
						? 's'
						: ''} - showing {deployments.pageInfo.pageEnd -
						deployments.pageInfo.pageStart +
						1} from {format(deployments.nodes.at(0)?.createdAt ?? '', 'dd/MM/yyyy')} to {format(
						deployments.nodes.at(-1)?.createdAt ?? '',
						'dd/MM/yyyy'
					)}"
				>
					{#each deployments.nodes as deployment (deployment.id)}
						{@const id = extractIdFromUrl(deployment.triggerUrl ?? '')}
						<div {id} class:highlight-in={id !== '' && highlightId !== '' && id === highlightId}>
							<DeploymentListItem {deployment} />
						</div>
					{/each}
				</List>
				<Pagination
					page={deployments.pageInfo}
					loaders={cursorPaginationLoaders(page.url, deployments.pageInfo)}
				/>
			{/if}
		</div>
	</div>
{/if}

<style>
	.wrapper {
		display: grid;
		grid-template-columns: 1fr 300px;
		gap: var(--spacing-layout);
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
