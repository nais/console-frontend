<script lang="ts">
	import { page } from '$app/state';
	import EChart from '$lib/chart/EChart.svelte';
	import { transformVulnerabilities } from '$lib/chart/transformVulnerabilities';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import {
		BodyLong,
		Heading,
		Loader,
		ToggleGroup,
		ToggleGroupItem
	} from '@nais/ds-svelte-community';
	import type { PageProps } from './$houdini';

	let { data }: PageProps = $props();
	let { TenantVulnerabilites, interval } = $derived(data);
	let riskScoreArea = $state('off');

	let options = $derived(
		transformVulnerabilities($TenantVulnerabilites.data, riskScoreArea === 'on')
	);
</script>

<div class="container">
	<div class="wrapper">
		<GraphErrors errors={$TenantVulnerabilites.errors} />

		<div class="graph">
			<div class="heading">
				<div class="content">
					<Heading level="2" spacing
						>Vulnerabilities for <strong>{page.data.tenantName?.toUpperCase()}</strong></Heading
					>
					<BodyLong>
						This stacked line chart displays the accumulation of image vulnerabilities over time,
						categorized by severity level. Use the interval selector to adjust the time range.
						Enable the Risk Score toggle to weight each severity by its impact.
					</BodyLong>
				</div>
			</div>
			{#if !$TenantVulnerabilites.fetching && $TenantVulnerabilites.data}
				<div class="toggles">
					<ToggleGroup
						label="Interval"
						value={interval}
						onchange={(interval) => changeParams({ interval }, { noScroll: true })}
					>
						{#each ['6m', '30d', '7d'] as interval (interval)}
							<ToggleGroupItem value={interval}>{interval}</ToggleGroupItem>
						{/each}
					</ToggleGroup>
					<ToggleGroup
						label="Risk score"
						value={riskScoreArea}
						onchange={(val) => (riskScoreArea = val)}
					>
						<ToggleGroupItem value="off">Off</ToggleGroupItem>
						<ToggleGroupItem value="on">On</ToggleGroupItem>
					</ToggleGroup>
				</div>
				{#key options}
					<EChart {options} style="height: 500px" />
				{/key}
			{:else}
				<div style="display: flex; justify-content: center; align-items: center; height: 500px;">
					<Loader size="3xlarge" />
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
		margin-top: var(--spacing-layout);
	}
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
	}

	.graph {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-16, --a-spacing-4);
	}

	.heading {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		gap: var(--spacing-layout);
		padding-bottom: var(--spacing-layout);
	}

	.content {
		max-width: 80ch;
	}
	.toggles {
		display: flex;
		gap: var(--spacing-layout);
		flex-direction: row;
		justify-content: flex-end;
	}
</style>
