<script lang="ts">
	import { OpenSearchOrderField, OrderDirection } from '$houdini';
	import ExternalLink from '$lib/components/ExternalLink.svelte';
	import List from '$lib/components/list/List.svelte';
	import ListItem from '$lib/components/list/ListItem.svelte';
	import OrderByMenu from '$lib/components/OrderByMenu.svelte';
	import PageModal, { pageModalClick } from '$lib/components/PageModal.svelte';
	import PersistenceCost from '$lib/components/persistence/PersistenceCost.svelte';
	import PersistenceLink from '$lib/components/persistence/PersistenceLink.svelte';
	import WorkloadLink from '$lib/components/WorkloadLink.svelte';
	import { docURL } from '$lib/doc';
	import { envTagVariant } from '$lib/envTagVariant';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { BodyLong, Button, Tag } from '@nais/ds-svelte-community';
	import { PlusIcon } from '@nais/ds-svelte-community/icons';
	import { endOfYesterday, startOfMonth, subMonths } from 'date-fns';
	import CreatePage from '../opensearch/create/+page.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { OpenSearch, viewerIsMember } = $derived(data);

	let cost = $derived(() => {
		const costData = $OpenSearch.data?.team.cost;
		const teamSlug = $OpenSearch.data?.team.slug;

		if (!costData || !teamSlug) return null;

		return {
			costData,
			teamSlug,
			pageName: 'OpenSearch'
		};
	});

	let create = $derived({
		buttonText: 'Create OpenSearch',
		url: `/team/${$OpenSearch.data?.team.slug}/opensearch/create`,
		page: CreatePage,
		header: 'Create OpenSearch',
		viewerIsMember: viewerIsMember
	});
</script>

<GraphErrors errors={$OpenSearch.errors} />

{#if $OpenSearch.data}
	{#snippet createButton()}
		{#if create && create.viewerIsMember}
			<div class="button">
				<Button
					variant="secondary"
					size="small"
					as="a"
					href={create.url}
					icon={PlusIcon}
					onclick={pageModalClick}
				>
					{create.buttonText}
				</Button>
			</div>
		{/if}
	{/snippet}

	{#if $OpenSearch.data.team.openSearches.pageInfo.totalCount}
		<div class="content-wrapper">
			<div>
				<BodyLong spacing>
					OpenSearch is a distributed search and analytics engine.
					<ExternalLink href={docURL('/persistence/opensearch')}
						>Learn more about OpenSearch and how to get started.</ExternalLink
					>
				</BodyLong>

				{@render createButton()}
				<List title="{$OpenSearch.data.team.openSearches.pageInfo.totalCount} entries">
					{#snippet menu()}
						<OrderByMenu
							orderField={OpenSearchOrderField}
							defaultOrderField={OpenSearchOrderField.ISSUES}
							defaultOrderDirection={OrderDirection.DESC}
						/>
					{/snippet}
					{#each $OpenSearch.data.team.openSearches.nodes as instance (instance.id)}
						<ListItem>
							<div>
								<PersistenceLink {instance} />
								<Tag size="small" variant={envTagVariant(instance.teamEnvironment.environment.name)}
									>{instance.teamEnvironment.environment.name}</Tag
								>
							</div>
							{#if (instance.issues?.pageInfo.totalCount ?? 0) > 0}
								{@const criticalCount = instance.issues?.edges.filter(
									(e) => e.node.severity === 'CRITICAL'
								).length}
								{@const warningCount = instance.issues?.edges.filter(
									(e) => e.node.severity === 'WARNING'
								).length}
								{@const todoCount = instance.issues?.edges.filter(
									(e) => e.node.severity === 'TODO'
								).length}

								<div class="issues-container">
									{#if criticalCount ?? 0 > 0}
										<Tag variant="error" size="xsmall"
											>{criticalCount ?? 0} critical issue{(criticalCount ?? 0) > 1 ? 's' : ''}</Tag
										>
									{/if}
									{#if warningCount ?? 0 > 0}
										<Tag variant="warning" size="xsmall"
											>{warningCount ?? 0} warning{(warningCount ?? 0) > 1 ? 's' : ''}</Tag
										>
									{/if}
									{#if todoCount ?? 0 > 0}
										<Tag variant="info" size="xsmall"
											>{todoCount ?? 0} todo{(todoCount ?? 0) > 1 ? 's' : ''}</Tag
										>
									{/if}
								</div>
							{/if}
							{#if instance.workload}
								<div class="right">
									Owner: <WorkloadLink workload={instance.workload} hideTeam hideEnv />
								</div>
							{/if}
						</ListItem>
					{/each}
				</List>
				<Pagination
					page={$OpenSearch.data.team.openSearches.pageInfo}
					loaders={{
						loadPreviousPage: () =>
							changeParams(
								{
									after: '',
									before: $OpenSearch.data?.team.openSearches.pageInfo.startCursor ?? ''
								},
								{ noScroll: true }
							),
						loadNextPage: () =>
							changeParams(
								{ before: '', after: $OpenSearch.data?.team.openSearches.pageInfo.endCursor ?? '' },
								{ noScroll: true }
							)
					}}
				/>
			</div>
			<div class="right-column">
				{#if cost()}
					{@const costData = cost()!}
					<div>
						<PersistenceCost
							pageName={costData.pageName}
							costData={costData.costData}
							teamSlug={costData.teamSlug}
							from={startOfMonth(subMonths(new Date(), 1))}
							to={endOfYesterday()}
							service="OpenSearch"
						/>
					</div>
				{/if}
			</div>
		</div>
	{:else}
		<div class="content-wrapper">
			<BodyLong as="div">
				{@render createButton()}

				<strong>No OpenSearch found.</strong> OpenSearch is a distributed search and analytics
				engine.
				<ExternalLink href={docURL('/persistence/opensearch')}
					>Learn more about OpenSearch and how to get started.</ExternalLink
				>
			</BodyLong>
		</div>
	{/if}

	{#if create}
		<PageModal content={create.page} header={create.header} />
	{/if}

	<style>
		.content-wrapper {
			display: grid;
			gap: var(--ax-space-24);
			grid-template-columns: 1fr 300px;
		}
		.right {
			display: flex;
			gap: var(--ax-space-6);
			align-items: center;
		}

		.right-column {
			display: grid;
			gap: var(--ax-space-24);
		}
		.button {
			display: flex;
			justify-content: flex-end;
			margin-bottom: var(--spacing-layout);
		}
		.issues-container {
			display: flex;
			flex-wrap: wrap;
			gap: var(--ax-space-16);
			width: 100%;
			align-items: center;
		}
	</style>
{/if}
