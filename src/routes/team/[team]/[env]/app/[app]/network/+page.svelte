<script lang="ts">
	import { page } from '$app/state';
	import PrometheusChart from '$lib/chart/PrometheusChart.svelte';
	import { PrometheusChartQueryInterval } from '$lib/chart/util';
	import NetworkPolicy from '$lib/domain/resources/NetworkPolicy.svelte';
	import WarningIcon from '$lib/icons/WarningIcon.svelte';
	import DocsLink from '$lib/ui/DocsLink.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import TooltipAlignHack from '$lib/ui/TooltipAlignHack.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import {
		CopyButton,
		Detail,
		Heading,
		ToggleGroup,
		ToggleGroupItem
	} from '@nais/ds-svelte-community';
	import { GlobeIcon, HouseIcon, PadlockLockedIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { IngressMetrics } = $derived(data);
	let { interval } = $derived(data);

	function sanitizeLabel(value: string): string {
		return value.replace(/[^a-zA-Z0-9_-]/g, '');
	}

	const team = $derived(sanitizeLabel(page.params.team!));
	const app = $derived(sanitizeLabel(page.params.app!));
	const environmentName = $derived(page.params.env!);

	const trafficQuery = $derived(
		`label_replace(sum(rate(haproxy_backend_http_requests_total{proxy=~"${team}_svc_${app}_.*"}[$__rate_interval])), "metric", "req/s", "", "")` +
			` or ` +
			`label_replace(sum(rate(haproxy_backend_http_responses_total{proxy=~"${team}_svc_${app}_.*", code="5xx"}[$__rate_interval])), "metric", "5xx/s", "", "")` +
			` or ` +
			`label_replace(sum(rate(haproxy_backend_http_responses_total{proxy=~"${team}_svc_${app}_.*", code="4xx"}[$__rate_interval])), "metric", "4xx/s", "", "")`
	);

	function ingressTypeLabel(type: string): string {
		return type === 'UNKNOWN' ? 'Unknown' : `${type.at(0)}${type.slice(1).toLowerCase()}`;
	}
</script>

<GraphErrors errors={$IngressMetrics.errors} />

<Heading as="h2" class="aksel-sr-only">Network</Heading>

<div class="wrapper">
	{#if $IngressMetrics.data}
		{@const appData = $IngressMetrics.data.team.environment.application}
		{@const ingresses = appData.ingresses}

		<section>
			<div class="heading-row">
				<div class="heading-wrapper">
					<Heading as="h2" size="medium" spacing>Ingresses</Heading>
				</div>
				<div class="actions">
					<DocsLink path="/workloads/application/reference/ingress/" />
				</div>
			</div>

			{#if ingresses.length > 0}
				<ul class="ingress-list">
					{#each ingresses as ingress (ingress.url)}
						<li class="ingress-item">
							<span class="ingress-icon">
								<TooltipAlignHack content="{ingressTypeLabel(ingress.type)} ingress">
									{#if ingress.type === 'EXTERNAL'}
										<GlobeIcon />
									{:else if ingress.type === 'INTERNAL'}
										<HouseIcon />
									{:else if ingress.type === 'AUTHENTICATED'}
										<PadlockLockedIcon />
									{:else}
										<WarningIcon />
									{/if}
								</TooltipAlignHack>
							</span>
							<code class="ingress-url">{ingress.url}</code>
							<CopyButton copyText={ingress.url} size="xsmall" variant="action" />
						</li>
					{/each}
				</ul>
			{:else}
				<div class="empty-state">
					<Detail>No ingresses configured.</Detail>
				</div>
			{/if}
		</section>

		<section>
			<div class="heading-row">
				<div class="heading-wrapper">
					<Heading as="h2" size="medium" spacing>Traffic</Heading>
				</div>
				<div class="actions">
					<ToggleGroup
						value={interval}
						size="small"
						onchange={(v) => changeParams({ interval: v }, { noScroll: true })}
					>
						{#each Object.values(PrometheusChartQueryInterval) as intervalOption (intervalOption)}
							<ToggleGroupItem value={intervalOption}>{intervalOption}</ToggleGroupItem>
						{/each}
					</ToggleGroup>
				</div>
			</div>

			<PrometheusChart
				{environmentName}
				title="Ingress traffic"
				description="Request rate, server errors (5xx), and client errors (4xx)."
				query={trafficQuery}
				{interval}
				labelFormatter={(labels) => {
					const metric = labels.find((l) => l.name === 'metric')?.value;
					if (metric === '4xx/s') return '4xx/s (client errors)';
					if (metric === '5xx/s') return '5xx/s (server errors)';
					return metric ?? 'unknown';
				}}
				formatYValue={(value) => `${value.toFixed(2)}/s`}
				colorizer={(label) => {
					if (label.startsWith('5xx')) return '#d62728';
					if (label.startsWith('4xx')) return '#ff7f0e';
					return '#1f77b4';
				}}
			/>
		</section>

		<NetworkPolicy workload={appData} />
	{/if}
</div>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-32);
	}

	.heading-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--ax-space-16);
		flex-wrap: wrap;
	}

	.heading-wrapper {
		display: flex;
		align-items: center;
		gap: var(--ax-space-12);
	}

	.actions {
		display: flex;
		align-items: center;
		gap: var(--ax-space-4);
		flex-shrink: 0;
	}

	.ingress-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-4);
	}

	.ingress-item {
		display: flex;
		align-items: center;
		gap: var(--ax-space-4);
	}

	.ingress-icon {
		display: flex;
		align-items: center;
	}

	.ingress-url {
		font-family: monospace;
		font-size: var(--ax-font-size-small);
		color: var(--ax-text-neutral);
		word-break: break-all;
	}

	.empty-state {
		padding: var(--ax-space-4) 0;
	}
</style>
