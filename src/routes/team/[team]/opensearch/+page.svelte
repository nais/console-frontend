<script lang="ts">
	import { OpenSearchOrderField, OrderDirection } from '$houdini';
	import { docURL } from '$lib/doc';
	import PersistenceCost from '$lib/domain/cost/PersistenceCost.svelte';
	import { envTagVariant } from '$lib/envTagVariant';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import IconLabel from '$lib/ui/IconLabel.svelte';
	import List from '$lib/ui/List.svelte';
	import ListItem from '$lib/ui/ListItem.svelte';
	import OrderByMenu from '$lib/ui/OrderByMenu.svelte';
	import PageModal, { pageModalClick } from '$lib/ui/PageModal.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import RunningIndicator from '$lib/ui/RunningIndicator.svelte';
	import TooltipAlignHack from '$lib/ui/TooltipAlignHack.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { BodyLong, Button, Tag } from '@nais/ds-svelte-community';
	import { CircleFillIcon, PlusIcon } from '@nais/ds-svelte-community/icons';
	import { endOfYesterday, startOfMonth, subMonths } from 'date-fns';
	import CreatePage from '../opensearch/create/+page.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { OpenSearch, userCanElevate } = $derived(data);

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
		userCanElevate: userCanElevate
	});
</script>

<GraphErrors errors={$OpenSearch.errors} />

{#if $OpenSearch.data}
	{#snippet createButton()}
		{#if create && create.userCanElevate}
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
							<IconLabel
								as="h4"
								href="/team/{instance.team.slug}/{instance.teamEnvironment.environment
									.name}/opensearch/{instance.name}"
								size="large"
								label={instance.name}
								tag={{
									label: instance.teamEnvironment.environment.name,
									variant: envTagVariant(instance.teamEnvironment.environment.name)
								}}
							>
								{#snippet icon()}
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
											<div
												style="width: 24px; color: var(--ax-bg-danger-strong); font-size: 0.7rem"
											>
												<CircleFillIcon />
											</div>
										{:else}
											<div
												style="width: 24px; color: var(--ax-bg-info-moderate-pressed); font-size: 0.7rem"
											>
												<CircleFillIcon />
											</div>
										{/if}
									</TooltipAlignHack>
								{/snippet}
							</IconLabel>
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
	</style>
{/if}
