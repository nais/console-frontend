<script lang="ts">
	import { page } from '$app/state';
	import { AlertOrderField } from '$houdini';
	import { docURL, tenantURL } from '$lib/doc';
	import CodeBlockPromQl from '$lib/domain/monitoring/CodeBlockPromQL.svelte';
	import { formatSeconds } from '$lib/domain/vulnerability/dateUtils';
	import { envTagVariant } from '$lib/envTagVariant';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
	import List from '$lib/ui/List.svelte';
	import ListItem from '$lib/ui/ListItem.svelte';
	import OrderByMenu from '$lib/ui/OrderByMenu.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import SearchField from '$lib/ui/SearchField.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { Button, CopyButton, Heading, Tag } from '@nais/ds-svelte-community';
	import { ActionMenu, ActionMenuCheckboxItem } from '@nais/ds-svelte-community/experimental';
	import {
		ChevronDownIcon,
		ChevronRightIcon,
		ClockDashedIcon
	} from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';
	import PrometheusAlarmDetail from './PrometheusAlarmDetail.svelte';

	let { data }: PageProps = $props();
	let { Alerts, AlertsMetadata } = $derived(data);

	let alerts = $derived($Alerts.data?.team.alerts);
	let filter = $state($Alerts.variables?.filter?.name ?? '');

	let after: string = $derived($Alerts.variables?.after ?? '');
	let before: string = $derived($Alerts.variables?.before ?? '');

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

	const totalAlerts = $derived($AlertsMetadata.data?.team.totalAlerts.pageInfo.totalCount ?? 0);

	const allEnvs = $derived(
		$AlertsMetadata.data?.team.environments.map((env) => env.environment.name) ?? []
	);

	let filteredEnvs = $derived(page.url.searchParams.get('environments')?.split(',') ?? allEnvs);

	$effect(() => {
		const environments = filteredEnvs.length === allEnvs.length ? '' : filteredEnvs.join(',');

		if (environments !== (page.url.searchParams.get('environments') ?? '')) {
			changeQuery({ environments });
		}
	});

	const changeQuery = (
		params: {
			after?: string;
			before?: string;
			newFilter?: string;
			environments?: string;
		} = {}
	) => {
		changeParams({
			before: params.before ?? before,
			after: params.after ?? after,
			filter: params.newFilter ?? filter,
			environments: params.environments ?? ''
		});
	};
</script>

<div class="wrapper">
	<div>
		<List title="Alerts" count={totalAlerts}>
			{#snippet search()}
				<SearchField
					value={filter}
					placeholder="Filter by name"
					label="Filter alerts"
					oninput={(v) => (filter = v)}
					onsubmit={() => changeQuery({ newFilter: filter })}
					onclear={() => {
						filter = '';
						changeQuery({ newFilter: '' });
					}}
				/>
			{/snippet}
			{#snippet filters()}
				<ActionMenu>
					{#snippet trigger(props)}
						<Button
							variant="tertiary-neutral"
							size="small"
							iconPosition="right"
							{...props}
							icon={ChevronDownIcon}
						>
							<span style="font-weight: normal">Environment</span>
						</Button>
					{/snippet}
					<ActionMenuCheckboxItem
						checked={$Alerts.data?.team.environments.every((env) =>
							filteredEnvs.includes(env.environment.name)
						)
							? true
							: filteredEnvs.length > 0
								? 'indeterminate'
								: false}
						onchange={(checked) => (filteredEnvs = checked ? allEnvs : [])}
					>
						All environments
					</ActionMenuCheckboxItem>
					{#each $Alerts.data?.team.environments ?? [] as { environment, id } (id)}
						<ActionMenuCheckboxItem
							checked={filteredEnvs.includes(environment.name)}
							onchange={(checked) =>
								(filteredEnvs = checked
									? [...filteredEnvs, environment.name]
									: filteredEnvs.filter((env) => env !== environment.name))}
						>
							{environment.name}
						</ActionMenuCheckboxItem>
					{/each}
				</ActionMenu>
			{/snippet}
			{#snippet menu()}
				<OrderByMenu orderField={AlertOrderField} defaultOrderField={AlertOrderField.STATE} />
			{/snippet}
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
			{:else}
				<ListItem>
					<p>
						No alerts found. Alerts notify you when something needs your attention.
						<ExternalLink href={docURL('/observability/alerting')}
							>Learn more about alerts and how to get started.</ExternalLink
						>
					</p>
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
</div>

<style>
	.wrapper {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--spacing-layout);
	}

	/* Mobile responsive layout */
	@media (max-width: 767px), (max-height: 500px) {
		.wrapper {
			grid-template-columns: 1fr;
			gap: var(--ax-space-24);
		}

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

	.item:last-child {
		border-bottom: none;
		border-radius: 0 0 var(--ax-radius-8) var(--ax-radius-8);
	}

	.item:last-child:not([open]) > summary.head {
		border-radius: 0 0 var(--ax-radius-8) var(--ax-radius-8);
	}

	.head {
		display: grid;
		grid-template-columns: 22px 1fr auto;
		align-items: center;
		gap: 12px;
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
