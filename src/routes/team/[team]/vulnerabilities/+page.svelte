<script lang="ts">
	import { page } from '$app/state';
	import EChart from '$lib/chart/EChart.svelte';
	import { transformVulnerabilities } from '$lib/chart/transformVulnerabilities';
	import VulnerabilitiesOverview from '$lib/components/VulnerabilityOverview.svelte';
	import WorkloadsWithVulnerabilities from '$lib/components/WorkloadsWithVulnerabilities.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import {
		BodyLong,
		Heading,
		Loader,
		Select,
		ToggleGroup,
		ToggleGroupItem
	} from '@nais/ds-svelte-community';
	import type { PageProps } from './$houdini';

	let { data }: PageProps = $props();
	let { TeamVulnerabilities, interval, teamSlug } = $derived(data);

	let selectedEnvironment: string = $state(page.url.searchParams.get('environment') || '');
	let riskScoreToggle = $state('off');

	let options = $derived(
		transformVulnerabilities(
			$TeamVulnerabilities.data?.team.imageVulnerabilityHistory,
			riskScoreToggle === 'on'
		)
	);
</script>

<GraphErrors errors={$TeamVulnerabilities.errors} />

{#if $TeamVulnerabilities.data}
	{@const team = $TeamVulnerabilities.data.team}
	<div class="wrapper">
		<VulnerabilitiesOverview team={$TeamVulnerabilities.data.team} />
		<div class="graph">
			<div class="heading">
				<div class="content">
					<Heading level="2" spacing>Vulnerability History for <strong>{teamSlug}</strong></Heading>
					<BodyLong>
						This stacked line chart displays the accumulation of image vulnerabilities over time,
						categorized by severity level. Use the interval selector to adjust the time range.
						Enable the Risk Score toggle to weight each severity by its impact.
					</BodyLong>
				</div>
			</div>
			{#if !$TeamVulnerabilities.fetching}
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
						value={riskScoreToggle}
						onchange={(val) => (riskScoreToggle = val)}
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
		<div>
			<Heading level="3" size="medium" spacing>Workloads with Vulnerabilities</Heading>

			<div class="env-filter">
				<Select size="small" hideLabel={true} bind:value={selectedEnvironment} label="Environment">
					<option value="">All environments</option>
					{#if team.environments}
						{#each team.environments as teamEnvironment (teamEnvironment.id)}
							<option
								value={teamEnvironment.environment.name}
								selected={teamEnvironment.environment.name === selectedEnvironment}
								>{teamEnvironment.environment.name}</option
							>
						{/each}
					{/if}
				</Select>
			</div>

			<WorkloadsWithVulnerabilities team={teamSlug} environment={selectedEnvironment} />
		</div>
	</div>
{/if}

<style>
	.wrapper {
		display: grid;
		gap: var(--ax-space-16, --a-spacing-4);
	}

	.env-filter {
		display: flex;
		margin-bottom: 1rem;
	}

	.graph {
		display: flex;
		flex-direction: column;
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
