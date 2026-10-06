<script lang="ts">
	import { browser } from '$app/env';
	import { graphql } from '$houdini';
	import StaticUtilizationDonut from '#lib/chart/StaticUtilizationDonut.svelte';
	import { intersect } from '#lib/utils/intersectionObserver.js';
	import { Loader } from '@nais/ds-svelte-community';

	let {
		environmentName,
		query,
		label,
		height = '200px'
	}: {
		environmentName: string;
		query: string;
		label: string;
		height?: `${number}px`;
	} = $props();

	const metrics = graphql(`
		query PrometheusStaticUtilizationDonutQuery(
			$environmentName: String!
			$input: MetricsQueryInput!
		) {
			environment(name: $environmentName) {
				metrics(input: $input) {
					series {
						values {
							value
						}
					}
				}
			}
		}
	`);

	let visible = $state(false);
	let requestedKey = '';
	let loadedKey = $state('');
	let queryKey = $derived(`${environmentName}/${query}`);
	let value = $derived.by(() => {
		if (loadedKey !== queryKey) return null;
		const values = $metrics.data?.environment.metrics.series
			.map((series) => series.values.at(-1)?.value)
			.filter((sample): sample is number => sample !== undefined && Number.isFinite(sample));
		if (!values?.length) return null;
		return (values.reduce((sum, sample) => sum + sample, 0) / values.length) * 100;
	});

	$effect(() => {
		if (!browser || !visible || !query || requestedKey === queryKey) return;
		const key = queryKey;
		requestedKey = key;
		void metrics
			.fetch({
				variables: { environmentName, input: { query, time: new Date() } },
				policy: 'NetworkOnly'
			})
			.then(() => {
				if (requestedKey === key) loadedKey = key;
			});
	});
</script>

<div class="donut" {@attach intersect((isVisible) => (visible = isVisible))}>
	<StaticUtilizationDonut {value} {label} {height} />
	{#if $metrics.fetching && loadedKey !== queryKey}
		<div class="overlay" role="status"><Loader size="small" /> Loading...</div>
	{:else if $metrics.errors}
		<div class="overlay">Failed to load data</div>
	{/if}
</div>

<style>
	.donut {
		position: relative;
		width: 100%;
	}
	.overlay {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--ax-space-4);
		background: var(--ax-bg-default);
	}
</style>
