<script lang="ts">
	import { OpenSearchOrderField, OrderDirection } from '$houdini';
	import { docURL } from '$lib/doc';
	import PersistenceCost from '$lib/domain/cost/PersistenceCost.svelte';
	import IssueSeverityTags from '$lib/domain/issues/IssueSeverityTags.svelte';
	import { envTagVariant } from '$lib/envTagVariant';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import List from '$lib/ui/List.svelte';
	import ListItem from '$lib/ui/ListItem.svelte';
	import OrderByMenu from '$lib/ui/OrderByMenu.svelte';
	import PageModal, { pageModalClick } from '$lib/ui/PageModal.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import RunningIndicator from '$lib/ui/RunningIndicator.svelte';
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import TooltipAlignHack from '$lib/ui/TooltipAlignHack.svelte';
	import { countIssuesBySeverity } from '$lib/utils/issueCounts';
	import { changeParams } from '$lib/utils/searchparams';
	import { Button, Tag } from '@nais/ds-svelte-community';
	import { CircleFillIcon, PlusIcon } from '@nais/ds-svelte-community/icons';
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
				{@render createButton()}
				<List title="OpenSearch" count={$OpenSearch.data.team.openSearches.pageInfo.totalCount}>
					{#snippet menu()}
						<OrderByMenu
							orderField={OpenSearchOrderField}
							defaultOrderField={OpenSearchOrderField.ISSUES}
							defaultOrderDirection={OrderDirection.DESC}
						/>
					{/snippet}
					{#each $OpenSearch.data.team.openSearches.nodes as instance (instance.id)}
						<ListItem interactive>
							<div class="name-group">
								<TooltipAlignHack
									content={{
										RUNNING: 'Instance is running',
										UNKNOWN: 'Unknown status',
										POWEROFF: 'Powered off',
										REBALANCING: 'Rebalancing',
										REBUILDING: 'Rebuilding'
									}[instance.state] ?? ''}
								>
									{#if instance.state === 'RUNNING'}
										<RunningIndicator />
									{:else if instance.state === 'REBALANCING'}
										<div class="status-indicator rebalancing">
											<CircleFillIcon />
										</div>
									{:else if instance.state === 'REBUILDING'}
										<div class="status-indicator rebuilding">
											<CircleFillIcon />
										</div>
									{:else if instance.state === 'POWEROFF'}
										<CircleFillIcon style="color: var(--ax-bg-danger-strong); font-size: 0.7rem" />
									{:else}
										<CircleFillIcon
											style="color: var(--ax-bg-info-moderate-pressed); font-size: 0.7rem"
										/>
									{/if}
								</TooltipAlignHack>
								<a
									href="/team/{instance.team.slug}/{instance.teamEnvironment.environment
										.name}/opensearch/{instance.name}"
									class="item-name">{instance.name}</a
								>
								<Tag
									size="xsmall"
									variant={envTagVariant(instance.teamEnvironment.environment.name)}
									>{instance.teamEnvironment.environment.name}</Tag
								>
							</div>
							{#if (instance.issues?.pageInfo.totalCount ?? 0) > 0}
								{@const criticalCount = countIssuesBySeverity(instance.issues?.edges, 'CRITICAL')}
								{@const warningCount = countIssuesBySeverity(instance.issues?.edges, 'WARNING')}
								{@const todoCount = countIssuesBySeverity(instance.issues?.edges, 'TODO')}

								<div class="right">
									<IssueSeverityTags
										critical={criticalCount}
										warning={warningCount}
										todo={todoCount}
									/>
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
					<SurfaceCard title="Cost">
						<PersistenceCost
							pageName={costData.pageName}
							costData={costData.costData}
							teamSlug={costData.teamSlug}
							from={startOfMonth(subMonths(new Date(), 1))}
							to={endOfYesterday()}
							service="OpenSearch"
						/>
					</SurfaceCard>
				{/if}
			</div>
		</div>
	{:else}
		<div class="content-wrapper">
			<div>
				{@render createButton()}
				<List title="OpenSearch" count={0}>
					<ListItem>
						<p>
							No OpenSearch instances found. OpenSearch is a distributed search and analytics
							engine.
							<ExternalLink href={docURL('/persistence/opensearch')}
								>Learn more about OpenSearch and how to get started.</ExternalLink
							>
						</p>
					</ListItem>
				</List>
			</div>
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
			align-items: start;
		}
		.right {
			display: flex;
			gap: var(--ax-space-6);
			align-items: center;
		}

		.right-column {
			display: grid;
			gap: var(--ax-space-24);
			align-content: start;
		}
		.button {
			display: flex;
			justify-content: flex-end;
			margin-bottom: var(--spacing-layout);
		}
		/* OpenSearch state indicators */
		.status-indicator {
			width: 24px;
			font-size: 0.7rem;
			display: flex;
			align-items: center;
			justify-content: center;
		}

		.status-indicator.rebalancing {
			color: var(--ax-bg-warning-moderate-pressed);
			animation: pulse 2s ease-in-out infinite;
		}

		.status-indicator.rebuilding {
			color: var(--ax-bg-info-strong);
			animation: pulse 2s ease-in-out infinite;
		}

		@keyframes pulse {
			0%,
			100% {
				opacity: 1;
			}
			50% {
				opacity: 0.4;
			}
		}

		/* Mobile responsive layout */
		@media (max-width: 767px), (max-height: 500px) {
			.content-wrapper {
				grid-template-columns: 1fr;
			}

			.right {
				align-items: flex-end;
				margin-top: var(--ax-space-6);
			}
		}

		.name-group {
			display: flex;
			align-items: center;
			gap: var(--ax-space-8);
			min-width: 0;
		}
		.name-group :global(.aksel-tag) {
			white-space: nowrap;
			flex-shrink: 0;
		}
		.item-name {
			color: var(--ax-text-neutral);
			text-decoration: none;
			font-weight: 500;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			min-width: 0;
			flex: 0 1 auto;
		}
		.item-name:hover {
			text-decoration: underline;
		}
	</style>
{/if}
