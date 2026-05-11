<script lang="ts">
	import { page } from '$app/state';
	import LegendWrapper, { legendSnippet } from '$lib/chart/LegendWrapper.svelte';
	import NetworkPolicy from '$lib/domain/resources/NetworkPolicy.svelte';
	import WarningIcon from '$lib/icons/WarningIcon.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import TooltipAlignHack from '$lib/ui/TooltipAlignHack.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import {
		Accordion,
		AccordionItem,
		BodyShort,
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

<div class="wrapper">
	{#if displayData}
		{@const app = displayData.team.environment.application}
		{@const ingresses = app.ingresses}

		{#if ingresses.length > 0}
			<SurfaceCard title="Ingresses">
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
			</SurfaceCard>
		{:else}
			<SurfaceCard title="Ingresses">
				<BodyShort size="small" textColor="subtle">No ingresses configured.</BodyShort>
			</SurfaceCard>
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

	@media (max-width: 767px), (max-height: 500px) {
		.ingress-metrics {
			display: none;
		}
	}
</style>
