<script lang="ts">
	import { page } from '$app/state';
	import EChart from '$lib/chart/EChart.svelte';
	import { transformVulnerabilities } from '$lib/chart/transformVulnerabilities';
	import TeamErrorMessage from '$lib/components/errors/TeamErrorMessage.svelte';
	import VulnerabilitySummary from '$lib/components/VulnerabilitySummary.svelte';
	import WorkloadsWithVulnerabilities from '$lib/components/WorkloadsWithVulnerabilities.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import Nais from '$lib/icons/Nais.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import {
		BodyLong,
		BodyShort,
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

	const supportedErrorTypes = ['WorkloadStatusVulnerable', 'WorkloadStatusMissingSBOM'] as const;

	const getWorkloadsWithError = (errorType: (typeof supportedErrorTypes)[number]) => {
		const workloads = $TeamVulnerabilities.data?.team.workloads.nodes.filter((workload) =>
			workload.status.errors.some((error) => error.__typename === errorType)
		);
		if (workloads?.length) {
			return {
				__typename: errorType,
				level: workloads[0].status.errors.find((error) => error.__typename === errorType)?.level,
				workloads
			};
		} else {
			return {
				__typename: errorType
			};
		}
	};
</script>

<GraphErrors errors={$TeamVulnerabilities.errors} />

{#if $TeamVulnerabilities.data}
	{@const team = $TeamVulnerabilities.data.team}
	<div class="wrapper">
		<div class="columns">
			<div class="status">
				<div class="alerts-wrapper">
					{#each supportedErrorTypes
						.map(getWorkloadsWithError)
						.filter((error) => error.workloads?.length && error.level) as errors (errors.__typename)}
						<TeamErrorMessage
							collapsible={false}
							error={{
								__typename: errors.__typename,
								level: errors.level ?? 'ERROR'
							}}
							{teamSlug}
							workloads={errors.workloads ?? []}
						/>
					{:else}
						<div class="media-object">
							<Nais
								size="80px"
								style="color: var(--ax-text-success-decoration)"
								aria-label="Team is nais"
								role="image"
							/>
							<div>
								<BodyShort spacing>
									<strong>Nais!</strong> Your team currently has no workloads with a risk score above
									100 and no critical vulnerabilities. This means your security posture is strong, and
									your dependencies are well-maintained.
								</BodyShort>
								<BodyShort>
									Keep up the good work in monitoring and updating your workloads to maintain this
									status!
								</BodyShort>
							</div>
						</div>
					{/each}
				</div>
			</div>

			<VulnerabilitySummary
				workloads={team.workloads}
				vulnerabilitySummary={team.vulnerabilitySummary}
			/>
		</div>
		{#if $TeamVulnerabilities.data?.team.imageVulnerabilityHistory?.samples.length > 0}
			<div class="graph">
				<div class="heading">
					<div class="content">
						<Heading level="2" spacing
							>Vulnerability History for <strong>{teamSlug}</strong></Heading
						>
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
		{/if}

		<div>
			<div class="heading">
				<div class="content">
					<Heading level="3" size="medium" spacing>Most Vulnerable Workloads</Heading>
					<BodyLong spacing>
						A list of this team's workloads with the highest security risk, based on Risk Score
						(default sorting). Use this list to focus remediation efforts where they’ll have the
						greatest impact.
					</BodyLong>
				</div>
			</div>

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
		gap: var(--ax-space-32);
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
	.alerts-wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-8);
	}
	.media-object {
		padding: var(--ax-space-8);
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--ax-space-16);
		max-width: 75ch;
	}
	.status {
		display: grid;
		gap: var(--ax-space-8);
	}
	.columns {
		display: grid;
		grid-template-columns: 1fr 350px;
		gap: 1rem;
		align-items: start;
	}
</style>
