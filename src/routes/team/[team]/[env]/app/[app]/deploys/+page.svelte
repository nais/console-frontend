<script lang="ts">
	import { page } from '$app/state';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
	import DeploymentListItem from '$lib/domain/list-items/DeploymentListItem.svelte';
	import List from '$lib/ui/List.svelte';
	import { extractIdFromUrl } from '$lib/utils/extractIdFromUrl';
	import { docURL } from '$lib/doc';
	import { envTagVariant } from '$lib/envTagVariant';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { BodyLong, Tag } from '@nais/ds-svelte-community';
	import { format } from 'date-fns';
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

<GraphErrors errors={$AppDeploys.errors} />

{#if $AppDeploys.data}
	<div class="wrapper">
		<div>
			<BodyLong spacing>
				{#if $AppDeploys.data.team.environment.application.deployments.pageInfo.totalCount == 0}
					<strong
						>No deployments of <strong>{$AppDeploys.data.team.environment.application.name}</strong>
						in <Tag
							size="small"
							variant={envTagVariant(
								$AppDeploys.data.team.environment.application.teamEnvironment.environment.name
							)}
							>{$AppDeploys.data.team.environment.application.teamEnvironment.environment.name}</Tag
						> found.</strong
					>
					<ExternalLink href={docURL('/build/')}
						>Learn more about builds and deployments in Nais.</ExternalLink
					>
				{:else}
					Overview of deployments of <strong
						>{$AppDeploys.data.team.environment.application.name}</strong
					>
					in <Tag
						size="small"
						variant={envTagVariant(
							$AppDeploys.data.team.environment.application.teamEnvironment.environment.name
						)}>{$AppDeploys.data.team.environment.application.teamEnvironment.environment.name}</Tag
					>.
					<ExternalLink href={docURL('/build/')}
						>Learn more about builds and deployments in Nais.</ExternalLink
					>
				{/if}
			</BodyLong>
			{#if $AppDeploys.data.team.environment.application.deployments.pageInfo.totalCount != 0}
				<List
					title="{$AppDeploys.data.team.environment.application.deployments.pageInfo
						.totalCount} deployment{$AppDeploys.data.team.environment.application.deployments
						.pageInfo.totalCount !== 1
						? 's'
						: ''} - showing {$AppDeploys.data.team.environment.application.deployments.pageInfo
						.pageEnd -
						$AppDeploys.data.team.environment.application.deployments.pageInfo.pageStart +
						1} from {format(
						$AppDeploys.data.team.environment.application.deployments.nodes.at(0)?.createdAt ?? '',
						'dd/MM/yyyy'
					)} to {format(
						$AppDeploys.data.team.environment.application.deployments.nodes.at(-1)?.createdAt ?? '',
						'dd/MM/yyyy'
					)}"
				>
					{#each $AppDeploys.data.team.environment.application.deployments.nodes as deployment (deployment.id)}
						{@const id = extractIdFromUrl(deployment.triggerUrl ?? '')}
						<div {id} class:highlight-in={id !== '' && highlightId !== '' && id === highlightId}>
							<DeploymentListItem {deployment} />
						</div>
					{/each}
				</List>
				<Pagination
					page={$AppDeploys.data.team.environment.application.deployments.pageInfo}
					loaders={{
						loadPreviousPage: () => {
							changeQuery({
								after: '',
								before:
									$AppDeploys.data?.team.environment.application.deployments.pageInfo.startCursor ??
									''
							});
						},
						loadNextPage: () => {
							changeQuery({
								before: '',
								after:
									$AppDeploys.data?.team.environment.application.deployments.pageInfo.endCursor ??
									''
							});
						}
					}}
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
		border-radius: var(--a-border-radius);
		opacity: 1;
		border-left-width: 4px;
	}
</style>
