<script lang="ts">
	import { page } from '$app/state';
	import { AlertOrderField } from '$houdini';
	import { docURL } from '$lib/doc';
	import CodeBlockPromQl from '$lib/domain/monitoring/CodeBlockPromQL.svelte';
	import { formatSeconds } from '$lib/domain/vulnerability/dateUtils';
	import { envTagVariant } from '$lib/envTagVariant';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
	import List from '$lib/ui/List.svelte';
	import OrderByMenu from '$lib/ui/OrderByMenu.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { BodyLong, Button, CopyButton, Heading, Search, Tag } from '@nais/ds-svelte-community';
	import { ActionMenu, ActionMenuCheckboxItem } from '@nais/ds-svelte-community/experimental';
	import {
		ChevronDownIcon,
		ChevronRightIcon,
		ClockDashedIcon
	} from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';
	import PrometheusAlarmDetail from './PrometheusAlarmDetail.svelte';

	let { data }: PageProps = $props();
	let { Alerts, AlertsMetadata, tenantName } = $derived(data);

	let filter = $state($Alerts.variables?.filter?.name ?? '');

	let after: string = $derived($Alerts.variables?.after ?? '');
	let before: string = $derived($Alerts.variables?.before ?? '');

	function makeGrafanaExploreUrl(tenantName: string, query: string): string {
		const cleanTenantName = tenantName.trim();
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

		return `https://grafana.${cleanTenantName}.cloud.nais.io/explore?${params.toString()}`;
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
		<BodyLong spacing>
			{#if totalAlerts == 0}
				<strong>No alerts found.</strong>
			{/if}
			Alerts notify you when something needs your attention. If your alert rules don't appear here, check
			that each rule has a <strong>team</strong> or <strong>namespace</strong> label set.
			<ExternalLink href={docURL('/observability/alerting')}
				>Learn more about alerts and how to get started.</ExternalLink
			>
		</BodyLong>
		{#if totalAlerts > 0}
			{@const alerts = $Alerts.data?.team.alerts}
			<div class="search">
				<form
					onsubmit={(e) => {
						e.preventDefault();
						changeQuery({ newFilter: filter });
					}}
				>
					<Search
						clearButton={true}
						clearButtonLabel="Clear"
						label="filter alerts"
						placeholder="Filter by name"
						hideLabel={true}
						size="small"
						variant="simple"
						width="100%"
						autocomplete="off"
						bind:value={filter}
						onclear={() => {
							filter = '';
							changeQuery({ newFilter: '' });
						}}
					/>
				</form>
			</div>

			<List
				title="{alerts?.pageInfo.totalCount} alert rule{alerts?.pageInfo.totalCount !== 1
					? 's'
					: ''}
						{alerts?.pageInfo.totalCount !== totalAlerts ? `(of total ${totalAlerts})` : ''}"
			>
				{#snippet menu()}
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
					<OrderByMenu orderField={AlertOrderField} defaultOrderField={AlertOrderField.STATE} />
				{/snippet}
				{#each alerts?.nodes ?? [] as alert (alert.id)}
					<details class="item">
						<summary class="head">
							<div class="chev">
								<ChevronRightIcon />
							</div>
							<div class="titleblock">
								<div class="titleline">
									<Heading size="xsmall" as="h2" title={alert.name}>{alert.name}</Heading>
								</div>
								<div class="subtitle">
									<Tag size="small" variant={envTagVariant(alert.teamEnvironment.environment.name)}>
										{alert.teamEnvironment.environment.name}
									</Tag>
								</div>
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
										<ExternalLink href={makeGrafanaExploreUrl(tenantName, alert.query)}>
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
			</List>

			<Pagination
				page={alerts?.pageInfo}
				loaders={{
					loadPreviousPage: () =>
						changeQuery({ before: alerts?.pageInfo.startCursor ?? '', after: '' }),
					loadNextPage: () => changeQuery({ after: alerts?.pageInfo.endCursor ?? '', before: '' })
				}}
			/>
		{/if}
	</div>
</div>

<style>
	.wrapper {
		display: grid;
		grid-template-columns: 1fr 300px;
		gap: var(--spacing-layout);
	}
	.search {
		display: flex;
		justify-content: flex-end;
		margin-bottom: 1rem;
	}

	details > summary {
		list-style: none;
	}
	details > summary::-webkit-details-marker {
		display: none;
	}

	.item {
		background: var(--ax-neutral-100);
	}

	.head {
		display: grid;
		grid-template-columns: 22px 1fr auto;
		align-items: center;
		gap: 12px;
		padding: 10px 14px;
		cursor: pointer;
		padding: 10px 14px;
	}

	.item:not([open]) > summary.head:hover {
		box-shadow: inset 0 0 0 9999px var(--ax-neutral-300);
		transition: box-shadow 0.12s ease;
	}

	.item[open] > summary.head {
		background-color: var(--ax-neutral-300);
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

	.titleblock {
		min-width: 0;
	}
	.titleline {
		display: flex;
		align-items: center;
		gap: 10px;
		min-width: 0;
	}

	.subtitle {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-top: 2px;
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
</style>
