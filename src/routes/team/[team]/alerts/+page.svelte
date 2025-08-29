<script lang="ts">
	import { AlertOrderField } from '$houdini';
	import ExternalLink from '$lib/components/ExternalLink.svelte';
	import OrderByMenu from '$lib/components/OrderByMenu.svelte';
	import { formatSeconds } from '$lib/components/vulnerability/dateUtils';
	import { docURL } from '$lib/doc';
	import { envTagVariant } from '$lib/envTagVariant';
	import Pagination from '$lib/Pagination.svelte';
	import Time from '$lib/Time.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { BodyLong, CopyButton, Heading, Tag } from '@nais/ds-svelte-community';
	import { ChevronRightIcon, ClockDashedIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { Alerts, tenantName } = $derived(data);

	let after: string = $derived($Alerts.variables?.after ?? '');
	let before: string = $derived($Alerts.variables?.before ?? '');

	function makePrometheusQueryUrl(baseUrl: string, query: string): string {
		const cleanBase = baseUrl.replace(/\/+$/, '');
		const params = new URLSearchParams({
			'g0.expr': query,
			'g0.show_tree': '0',
			'g0.tab': 'table',
			'g0.range_input': '1h',
			'g0.res_type': 'auto',
			'g0.res_density': 'medium',
			'g0.display_mode': 'lines',
			'g0.show_exemplars': '0'
		});
		return `${cleanBase}/query?${params.toString()}`;
	}

	const changeQuery = (params: { after?: string; before?: string } = {}) => {
		changeParams({
			before: params.before ?? before,
			after: params.after ?? after
		});
	};
</script>

<div class="wrapper">
	<div>
		<BodyLong spacing>
			{#if $Alerts.data?.team.alerts.pageInfo.totalCount == 0}
				<strong>No alerts found.</strong> Alerts notify you when something needs your attention.
				<ExternalLink href={docURL('/observability/alerting')}
					>Learn more about alerts and how to get started.</ExternalLink
				>
			{:else}
				Alerts notify you when something needs your attention.
				<ExternalLink href={docURL('/observability/alerting')}
					>Learn more about alerts and how to get started.</ExternalLink
				>
			{/if}
		</BodyLong>

		{#if $Alerts.data && $Alerts.data?.team.alerts.pageInfo.totalCount > 0}
			{@const page = $Alerts.data.team.alerts}

			<div class="toolbar">
				<OrderByMenu orderField={AlertOrderField} defaultOrderField={AlertOrderField.STATE} />
			</div>

			<div class="list">
				{#each page.nodes as alert (alert.id)}
					<details class="item">
						<summary class="head">
							<div class="chev">
								<ChevronRightIcon />
							</div>
							<div class="titleblock">
								<div class="titleline">
									<Heading size="xsmall" level="2" title={alert.name}>{alert.name}</Heading>
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
											<div class="alarm">
												<div class="alarm-head">
													<div class="heading-with-tag">
														<Tag
															variant={alarm.state === 'FIRING' ? 'error' : 'warning'}
															size="small"
														>
															{alarm.state}
														</Tag>
														<Heading level="3" size="xsmall">
															{alarm.summary !== '' ? alarm.summary : `Alarm ${i + 1}`}
														</Heading>
													</div>
													<div class="right">
														<span class="since">
															Active since
															<Time time={alarm.since} distance />
														</span>
													</div>
												</div>

												<dl class="kv">
													<dt>Action</dt>
													<dd>{alarm.action || 'No action label defined in PrometheusRule'}</dd>

													<dt>Consequence</dt>
													<dd>{alarm.consequence || 'No consequence defined in PrometheusRule'}</dd>

													<dt>Value</dt>
													<dd>{alarm.value}</dd>
												</dl>
											</div>
										{/each}
									</div>
								{:else}
									<div class="muted">No alerts firing</div>
								{/if}

								<div class="query-heading">
									<Heading level="2" size="xsmall">Query</Heading>
									<div class="query-actions">
										<ExternalLink
											href={makePrometheusQueryUrl(
												`https://prometheus.${alert.teamEnvironment.environment.name}.${tenantName}.cloud.nais.io`,
												alert.query
											)}
										>
											Run in Prometheus
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
								<div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
									<code>{alert.query}</code>
									<span class="muted small for">
										<ClockDashedIcon />&nbsp;for: {formatSeconds(alert.duration)}
									</span>
								</div>
							</div>
						{/if}
					</details>
				{/each}
			</div>

			<Pagination
				page={page.pageInfo}
				loaders={{
					loadPreviousPage: () =>
						changeQuery({ before: page.pageInfo.startCursor ?? '', after: '' }),
					loadNextPage: () => changeQuery({ after: page.pageInfo.endCursor ?? '', before: '' })
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
	.toolbar {
		display: flex;
		justify-content: flex-end;
		margin-bottom: var(--ax-space-4);
	}

	.list {
		border: 1px solid var(--ax-border-neutral-subtle);
		border-radius: 12px;
		overflow: hidden;
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
	.item + .item {
		border-top: 1px solid var(--ax-border-neutral-subtle);
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
		font-size: 12px;
	}

	.state {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.for {
		display: inline-flex;
		align-items: center;
		gap: 6px;
	}

	.rule {
		padding: 12px 14px 14px calc(14px + 22px);
		background: var(--ax-bg-subtle);
		border-top: 1px dashed var(--ax-border-neutral-subtle);
	}

	.alarms {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-10);
	}
	.alarm {
		margin-bottom: var(--ax-space-16);
		border-bottom: 1px solid var(--ax-border-neutral-subtle);
	}
	.alarm:last-child {
		border-bottom: 0;
	}
	.alarm-head {
		display: flex;
		justify-content: space-between;
	}
	.heading-with-tag {
		display: flex;
		align-items: center;
		gap: var(--ax-space-8);
		margin-bottom: var(--ax-space-8);
	}

	.kv {
		display: grid;
		grid-template-columns: minmax(4rem, 18rem) 1fr;
		gap: var(--ax-space-2) var(--ax-space-6);
		align-items: start;
		margin-top: var(--ax-space-3);
		font-size: 0.9rem;
	}
	.kv dt {
		font-weight: 600;
	}
	.since {
		color: var(--ax-text-neutral);
		font-size: 0.9rem;
		text-align: right;
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

	code {
		overflow-wrap: anywhere;
		word-break: break-word;
		font-size: 0.9rem;
	}
</style>
