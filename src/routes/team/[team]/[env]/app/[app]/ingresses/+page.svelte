<script lang="ts">
	import { page } from '$app/state';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import LegendWrapper, { legendSnippet } from '$lib/chart/LegendWrapper.svelte';
	import IconLabel from '$lib/components/IconLabel.svelte';
	import TooltipAlignHack from '$lib/components/TooltipAlignHack.svelte';
	import WarningIcon from '$lib/icons/WarningIcon.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { Heading, Loader, ToggleGroup, ToggleGroupItem } from '@nais/ds-svelte-community';
	import { GlobeIcon, HouseIcon, PadlockLockedIcon } from '@nais/ds-svelte-community/icons';
	import { LineChart } from 'layerchart';
	import { tick, type ComponentProps } from 'svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { IngressMetrics } = $derived(data);

	const interval = $derived(page.url.searchParams.get('interval') ?? '7d');

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

	function options(input: Series): ComponentProps<LineChart<unknown>> {
		const rpsData = input.metrics.rps;
		const epsData = input.metrics.eps;

		return {
			series: [
				{
					key: 'req/s',
					color: '#236B7D', // --a-lightblue-800
					data: rpsData
				},
				{
					key: 'err/s',
					color: '#F25C5C', //--a-red-300
					data: epsData
				}
			]
		};
	}

	// Scroll to ingress target and add a subtle pulse glow (1s fade-out)
	$effect(() => {
		if ($IngressMetrics.fetching) return;

		const q = page.url.searchParams.get('ingress');
		if (!q || !$IngressMetrics.data) return;

		const id = decodeURIComponent(q);

		let attempts = 0;
		const tryScroll = async () => {
			await tick(); // wait for DOM to render
			const el = document.getElementById(id) as HTMLElement | null;
			if (el) {
				el.scrollIntoView({ behavior: 'smooth', block: 'start' });

				const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
				if (!prefersReduced) {
					const initial = getComputedStyle(el).backgroundColor || 'transparent';
					el.animate(
						[
							{ backgroundColor: 'color-mix(in srgb, var(--ax-accent, #2563eb) 12%, transparent)' }, // start: gentle tint
							{ backgroundColor: initial } // end: whatever it was
						],
						{ duration: 1500, easing: 'ease-out' }
					);
				}
			} else if (attempts < 10) {
				attempts++;
				setTimeout(tryScroll, 100);
			}
		};

		tryScroll();
	});
</script>

<GraphErrors errors={$IngressMetrics.errors} />

<div class="wrapper">
	{#if $IngressMetrics.fetching}
		<div style="display: flex; justify-content: center; align-items: center; min-height: 500px;">
			<Loader size="3xlarge" />
		</div>
	{:else if $IngressMetrics.data?.team.environment.application.ingresses && $IngressMetrics.data.team.environment.application.ingresses.length > 0}
		<div style="display: flex; justify-content: end">
			<ToggleGroup
				value={interval}
				onchange={(interval) => changeParams({ interval }, { noScroll: true })}
			>
				{#each ['1h', '6h', '1d', '7d', '30d'] as interval (interval)}
					<ToggleGroupItem value={interval}>{interval}</ToggleGroupItem>
				{/each}
			</ToggleGroup>
		</div>
		{#each Object.entries(Object.groupBy($IngressMetrics.data.team.environment.application.ingresses, ({ type }) => type)) as [group, ingresses] (group)}
			{#each ingresses as ingress (ingress.url)}
				{(() => console.log(options(ingress)))()}
				<div class="section" id={ingress.url}>
					<IconLabel size="large" level="2" label={ingress.url}>
						{#snippet icon()}
							<TooltipAlignHack
								content={`${ingress.type[0]}${ingress.type.slice(1).toLowerCase()} Ingress`}
							>
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
						{/snippet}
					</IconLabel>

					<div class="chart-wrapper">
						<!-- <EChart options={options(ingress)} /> -->
						<LegendWrapper height="300px">
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
				</div>
			{/each}
		{/each}
	{:else}
		<div class="no-data">
			<Heading level="2" size="medium" spacing>No Ingress Data Available</Heading>
		</div>
	{/if}
</div>

<style>
	.wrapper {
		display: grid;
		gap: var(--ax-space-24);
	}

	.section {
		display: grid;
		scroll-margin-top: 72px; /* avoids sticky header overlap */
		border-radius: 12px; /* rounded corners */
		padding: var(--ax-space-16, 16px); /* inner space */
		background: color-mix(in srgb, Canvas 96%, transparent); /* subtle card bg */
		border: 1px solid color-mix(in srgb, CanvasText 12%, transparent); /* faint border */
	}

	.chart-wrapper {
		padding-block: 0.5rem 1rem; /* a touch more room under the title */
	}
</style>
