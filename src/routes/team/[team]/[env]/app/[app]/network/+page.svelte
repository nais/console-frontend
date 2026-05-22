<script lang="ts">
	import { page } from '$app/state';
	import LegendWrapper, { legendSnippet } from '$lib/chart/LegendWrapper.svelte';
	import NetworkPolicy from '$lib/domain/resources/NetworkPolicy.svelte';
	import WarningIcon from '$lib/icons/WarningIcon.svelte';
	import DocsLink from '$lib/ui/DocsLink.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import TooltipAlignHack from '$lib/ui/TooltipAlignHack.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import {
		Accordion,
		AccordionItem,
		CopyButton,
		Detail,
		Heading,
		Loader,
		ToggleGroup,
		ToggleGroupItem
	} from '@nais/ds-svelte-community';
	import { GlobeIcon, HouseIcon, PadlockLockedIcon } from '@nais/ds-svelte-community/icons';
	import { LineChart } from 'layerchart';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { IngressMetrics } = $derived(data);

	const interval = $derived(page.url.searchParams.get('interval') ?? '7d');

	let openIngresses: Record<string, boolean> = $state({});

	// Keep previous data visible during refetch (Houdini nulls .data on new variables)
	let lastData = $state<typeof $IngressMetrics.data>(null);
	$effect(() => {
		if ($IngressMetrics.data) {
			lastData = $IngressMetrics.data;
		}
	});
	let displayData = $derived($IngressMetrics.data ?? lastData);

	interface Metric {
		timestamp: Date;
		value: number;
	}

	type Series = {
		metrics: {
			rps: Metric[];
			eps: Metric[];
		};
	};

	function options(input: Series) {
		return {
			series: [
				{
					key: 'req/s',
					color: '#236B7D',
					data: input.metrics.rps
				},
				{
					key: 'err/s',
					color: '#F25C5C',
					data: input.metrics.eps
				}
			]
		};
	}

	function ingressTypeLabel(type: string): string {
		return type === 'UNKNOWN' ? 'Unknown' : `${type[0]}${type.slice(1).toLowerCase()}`;
	}
</script>

<GraphErrors errors={$IngressMetrics.errors} />

<Heading as="h2" class="aksel-sr-only">Network</Heading>

<div class="wrapper">
	{#if displayData}
		{@const app = displayData.team.environment.application}
		{@const ingresses = app.ingresses}

		<div class="section-heading">
			<div class="heading-wrapper">
				<Heading as="h2" size="medium" spacing>Ingresses</Heading>
			</div>
			<div class="actions">
				<DocsLink path="/workloads/application/reference/ingress/" />
			</div>
		</div>

		{#if ingresses.length > 0}
			<Accordion size="small" indent={false}>
				{#each ingresses as ingress (ingress.url)}
					<AccordionItem
						open={openIngresses[ingress.url] ?? false}
						onOpenChange={(isOpen) => {
							openIngresses[ingress.url] = isOpen;
						}}
					>
						{#snippet heading()}
							<span class="ingress-heading">
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
								<span class="ingress-url">{ingress.url}</span>
								<span class="ingress-metrics">
									<span>{ingress.metrics.requestsPerSecond.toFixed(2)} req/s</span>
									<span>{ingress.metrics.errorsPerSecond.toFixed(2)} err/s</span>
								</span>
							</span>
						{/snippet}
						<div class="chart-content">
							<div class="ingress-copy">
								<code class="ingress-url-text">{ingress.url}</code>
								<CopyButton copyText={ingress.url} size="xsmall" variant="action" />
							</div>
							<div class="chart-controls">
								<ToggleGroup
									value={interval}
									size="small"
									onchange={(interval) => changeParams({ interval }, { noScroll: true })}
								>
									{#each ['1h', '6h', '1d', '7d', '30d'] as interval (interval)}
										<ToggleGroupItem value={interval}>{interval}</ToggleGroupItem>
									{/each}
								</ToggleGroup>
							</div>
							{#if $IngressMetrics.fetching}
								<div class="chart-loading">
									<Loader size="xlarge" />
								</div>
							{:else}
								<div class="chart-wrapper">
									<LegendWrapper height="250px">
										<LineChart
											{...options(ingress)}
											padding={{ left: 40 }}
											brush={true}
											x="timestamp"
											y="value"
											legend={legendSnippet}
											props={{
												spline: {
													class: 'stroke-2'
												},
												tooltip: {
													hideTotal: true
												},
												xAxis: {
													format: 'day'
												}
											}}
										/>
									</LegendWrapper>
								</div>
							{/if}
						</div>
					</AccordionItem>
				{/each}
			</Accordion>
		{:else}
			<div class="empty-state">
				<Detail>No ingresses configured.</Detail>
			</div>
		{/if}

		<NetworkPolicy workload={app} />
	{/if}
</div>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-24);
	}

	.ingress-heading {
		display: flex;
		align-items: center;
		gap: var(--ax-space-4);
		color: var(--ax-text-neutral);
		width: 100%;
		font-size: 1rem;
	}

	:global(.aksel-accordion__header > .aksel-heading) {
		flex: 1;
		font-size: 1rem;
	}

	.ingress-icon {
		display: flex;
		align-items: center;
	}

	.ingress-metrics {
		margin-left: auto;
		display: flex;
		gap: var(--ax-space-8);
		color: var(--ax-text-neutral-subtle);
	}

	.ingress-copy {
		display: flex;
		align-items: center;
		gap: var(--ax-space-4);
	}

	.ingress-url-text {
		font-family: monospace;
		font-size: var(--ax-font-size-small);
		color: var(--ax-text-neutral);
	}

	.chart-loading {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 250px;
	}

	.chart-content {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-8);
	}

	.chart-controls {
		display: flex;
		justify-content: flex-end;
	}

	.chart-wrapper {
		width: 100%;
		min-width: 0;
		padding-block: var(--ax-space-4) var(--ax-space-16);
	}

	.section-heading {
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

	@media (max-width: 767px), (max-height: 500px) {
		.ingress-metrics {
			display: none;
		}
	}

	.empty-state {
		padding: var(--ax-space-4) 0;
	}
</style>
