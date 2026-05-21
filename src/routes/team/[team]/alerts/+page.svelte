<script lang="ts">
	import { page } from '$app/state';
	import { AlertOrderField, OrderDirection } from '$houdini';
	import { docURL, tenantURL } from '$lib/doc';
	import AlertsFacets from '$lib/domain/alerts/AlertsFacets.svelte';
	import CodeBlockPromQl from '$lib/domain/monitoring/CodeBlockPromQL.svelte';
	import { formatSeconds } from '$lib/domain/vulnerability/dateUtils';
	import { envTagVariant } from '$lib/envTagVariant';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
	import List from '$lib/ui/List.svelte';
	import ListFilters from '$lib/ui/ListFilters.svelte';
	import ListItem from '$lib/ui/ListItem.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { CopyButton, Heading, Tag } from '@nais/ds-svelte-community';
	import { ChevronRightIcon, ClockDashedIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';
	import PrometheusAlarmDetail from './PrometheusAlarmDetail.svelte';

	let { data }: PageProps = $props();
	let { Alerts, AlertsMetadata } = $derived(data);

	let alerts = $derived($Alerts.data?.team.alerts);
	let filter = $state($Alerts.variables?.filter?.name ?? '');

	let after: string = $derived($Alerts.variables?.after ?? '');
	let before: string = $derived($Alerts.variables?.before ?? '');

	const totalAlerts = $derived($AlertsMetadata.data?.team.totalAlerts.pageInfo.totalCount ?? 0);

	const allEnvironments = $derived($AlertsMetadata.data?.team.environments ?? []);

	const stateFacets = $derived([
		{
			state: 'FIRING',
			count: $AlertsMetadata.data?.team.firingAlerts.pageInfo.totalCount ?? 0
		},
		{
			state: 'INACTIVE',
			count: $AlertsMetadata.data?.team.inactiveAlerts.pageInfo.totalCount ?? 0
		}
	]);

	let selectedEnvironments: string[] = $derived(
		page.url.searchParams.get('environments')?.split(',').filter(Boolean) ?? []
	);

	let selectedStates: string[] = $derived(
		page.url.searchParams.get('states')?.split(',').filter(Boolean) ?? []
	);

	type AlertOrderFieldOptions = (typeof AlertOrderField)[keyof typeof AlertOrderField];
	type OrderDirectionOptions = (typeof OrderDirection)[keyof typeof OrderDirection];

	const sortFields: { value: AlertOrderFieldOptions; label: string }[] = [
		{ value: AlertOrderField.STATE, label: 'State' },
		{ value: AlertOrderField.NAME, label: 'Name' },
		{ value: AlertOrderField.ENVIRONMENT, label: 'Environment' }
	];

	const currentSortField: AlertOrderFieldOptions = $derived(
		(Object.values(AlertOrderField).find((f) =>
			page.url.searchParams.get('sort')?.startsWith(f)
		) as AlertOrderFieldOptions | undefined) ?? AlertOrderField.STATE
	);

	const currentSortDirection: OrderDirectionOptions = $derived(
		(Object.values(OrderDirection).find((d) => page.url.searchParams.get('sort')?.endsWith(d)) as
			| OrderDirectionOptions
			| undefined) ?? OrderDirection.ASC
	);

	function setSort(field: AlertOrderFieldOptions) {
		const defaultDirection =
			field === AlertOrderField.NAME || field === AlertOrderField.ENVIRONMENT
				? OrderDirection.ASC
				: OrderDirection.DESC;
		const direction =
			field === currentSortField
				? currentSortDirection === OrderDirection.ASC
					? OrderDirection.DESC
					: OrderDirection.ASC
				: defaultDirection;
		changeParams({ sort: `${field}-${direction}`, after: '', before: '' }, { noScroll: true });
	}

	function makeGrafanaExploreUrl(query: string): string {
		const params = new URLSearchParams({
			orgId: '1',
			left: JSON.stringify({
				datasource: {
					type: 'prometheus',
					uid: 'Metrics'
				},
				queries: [
					{
						refId: 'A',
						expr: query
					}
				],
				range: {
					from: 'now-1h',
					to: 'now'
				}
			})
		});

		return tenantURL('grafana', `/explore?${params.toString()}`);
	}

	const changeQuery = (
		params: {
			after?: string;
			before?: string;
			newFilter?: string;
			environments?: string;
			states?: string;
		} = {}
	) => {
		changeParams(
			{
				before: params.before ?? before,
				after: params.after ?? after,
				filter: params.newFilter ?? filter,
				environments: params.environments ?? (selectedEnvironments.join(',') || ''),
				states: params.states ?? (selectedStates.join(',') || '')
			},
			{ noScroll: true }
		);
	};

	function handleStatesChange(selected: string[]) {
		changeQuery({ states: selected.join(','), after: '', before: '' });
	}

	function handleEnvironmentsChange(selected: string[]) {
		changeQuery({ environments: selected.join(','), after: '', before: '' });
	}
</script>

<div class="layout-two-column">
	<div>
		<List title="Alerts" count={alerts?.pageInfo.totalCount ?? 0}>
			{#if alerts && alerts.nodes.length > 0}
				{#each alerts.nodes as alert (alert.id)}
					<details class="item">
						<summary class="head">
							<div class="chev">
								<ChevronRightIcon />
							</div>
							<div class="name-group">
								<span class="item-name" title={alert.name}>{alert.name}</span>
								<Tag size="xsmall" variant={envTagVariant(alert.teamEnvironment.environment.name)}
									>{alert.teamEnvironment.environment.name}</Tag
								>
							</div>

							<div class="state">
								{#if alert.alarms.filter((a) => a.state === 'FIRING').length > 0}
									<Tag variant="error" size="small">
										FIRING ({alert.alarms.filter((a) => a.state === 'FIRING').length})
									</Tag>
								{/if}
								{#if alert.alarms.filter((a) => a.state === 'PENDING').length > 0}
									<Tag variant="warning" size="small">
										PENDING ({alert.alarms.filter((a) => a.state === 'PENDING').length})
									</Tag>
								{/if}
							</div>
						</summary>

						{#if alert.__typename === 'PrometheusAlert'}
							<div class="rule">
								{#if alert.alarms.length > 0}
									<div class="alarms">
										{#each alert.alarms as alarm, i (alarm)}
											<PrometheusAlarmDetail {alarm} {i} />
										{/each}
									</div>
								{:else}
									<div class="muted">No alerts firing</div>
								{/if}

								<div class="query-heading">
									<Heading as="h2" size="xsmall">Query</Heading>
									<div class="query-actions">
										<ExternalLink href={makeGrafanaExploreUrl(alert.query)}>
											<span style="font-size: 16px;">Run in Grafana</span>
										</ExternalLink>
										<CopyButton
											text="Copy query"
											activeText="Query copied"
											variant="action"
											copyText={alert.query}
											size="xsmall"
										/>
									</div>
								</div>
								<div style="display: flex; flex-direction: column; gap: 8px; flex-wrap: wrap;">
									<CodeBlockPromQl code={alert.query} />
									<div class="muted small for">
										<ClockDashedIcon />&nbsp;for: {formatSeconds(alert.duration)}
									</div>
								</div>
							</div>
						{/if}
					</details>
				{/each}
			{:else if totalAlerts === 0}
				<ListItem>
					<p>
						No alerts found. Alerts notify you when something needs your attention.
						<ExternalLink href={docURL('/observability/alerting')}
							>Learn more about alerts and how to get started.</ExternalLink
						>
					</p>
				</ListItem>
			{:else}
				<ListItem>
					<p>No alerts match the current filters. Try adjusting your filters.</p>
				</ListItem>
			{/if}
		</List>

		<Pagination
			page={alerts?.pageInfo}
			loaders={{
				loadPreviousPage: () =>
					changeQuery({ before: alerts?.pageInfo.startCursor ?? '', after: '' }),
				loadNextPage: () => changeQuery({ after: alerts?.pageInfo.endCursor ?? '', before: '' })
			}}
		/>
	</div>
	<div class="layout-sidebar">
		<SurfaceCard title="Filters">
			<ListFilters
				{filter}
				searchPlaceholder="Filter by name"
				searchLabel="Filter alerts"
				{sortFields}
				{currentSortField}
				{currentSortDirection}
				onFilterInput={(v) => (filter = v)}
				onFilterSubmit={() => changeQuery({ newFilter: filter })}
				onFilterClear={() => {
					filter = '';
					changeQuery({ newFilter: '' });
				}}
				onSort={(field) => setSort(field as AlertOrderFieldOptions)}
			>
				<AlertsFacets
					environments={allEnvironments}
					states={stateFacets}
					{selectedStates}
					{selectedEnvironments}
					onStatesChange={handleStatesChange}
					onEnvironmentsChange={handleEnvironmentsChange}
				/>
			</ListFilters>
		</SurfaceCard>
	</div>
</div>

<style>
	/* Mobile responsive layout */
	@media (max-width: 767px), (max-height: 500px) {
		.query-heading {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--ax-space-4);
		}

		.query-actions {
			width: 100%;
			flex-wrap: wrap;
			gap: var(--ax-space-6);
		}
	}

	details > summary {
		list-style: none;
	}
	details > summary::-webkit-details-marker {
		display: none;
	}

	.item {
		background: var(--ax-bg-default);
		border-bottom: 1px solid var(--ax-border-neutral-subtleA);
	}

	.head {
		display: grid;
		grid-template-columns: 22px 1fr auto;
		align-items: center;
		gap: var(--ax-space-12);
		padding: 10px 14px;
		cursor: pointer;
		transition: background-color 120ms ease;
	}

	.item:not([open]) > summary.head:hover {
		background: color-mix(in srgb, var(--surface-accent-color) 6%, var(--ax-bg-default));
	}

	.item[open] > summary.head {
		background: color-mix(in srgb, var(--surface-accent-color) 10%, var(--ax-bg-default));
	}

	.chev {
		width: 16px;
		height: 16px;
		color: var(--ax-text-neutral);
		transition: transform 0.18s ease;
	}
	.item[open] .chev {
		transform: rotate(90deg);
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
		font-weight: 500;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		min-width: 0;
		flex: 0 1 auto;
	}

	.muted {
		color: var(--ax-text-neutral);
	}
	.small {
		font-size: 0.8rem;
	}
	.for {
		display: inline-flex;
		align-items: center;
		gap: var(--ax-space-2);
	}

	.state {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.rule {
		padding: 12px 14px 14px calc(14px + 22px);
		background: var(--ax-bg-default);
		border-top: 1px dashed var(--ax-border-neutral-subtle);
	}

	.alarms {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-8);
	}

	.query-heading {
		margin-top: var(--ax-space-8);
		margin-bottom: var(--ax-space-8);
		display: flex;
		align-items: center;
		justify-content: space-between;
		word-break: break-word;
	}
	.query-actions {
		display: flex;
		align-items: center;
		gap: var(--ax-space-4);
	}

	.query-heading :global(h2) {
		width: 100%;
		text-align: left;
	}
</style>
