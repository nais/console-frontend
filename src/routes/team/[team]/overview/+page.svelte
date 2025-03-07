<script lang="ts">
	import { page } from '$app/state';
	import { Alert, BodyShort, Heading, Tag } from '@nais/ds-svelte-community';

	import AggregatedCostForTeam from '$lib/components/AggregatedCostForTeam.svelte';
	import TeamInfo from '$lib/components/TeamInfo.svelte';
	import TeamUtilizationAndOverage from '$lib/components/TeamUtilizationAndOverage.svelte';
	import VulnerabilitySummaryNew from '$lib/components/VulnerabilitySummaryNew.svelte';
	import { envTagVariant } from '$lib/envTagVariant';
	import { capitalizeFirstLetter, numberToWords } from '$lib/utils/formatters';
	import type { PageData } from './$houdini';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let { TeamOverview2, teamSlug, viewerIsMember } = $derived(data);

	let workloadWithoutSbom = $derived(
		$TeamOverview2.data?.team.workloads.edges
			.map((workload) => workload.node)
			.filter((node) =>
				node.status.errors.some(
					(error: { __typename: string }) => error.__typename === 'WorkloadStatusMissingSBOM'
				)
			)
	);

	let workloadsVulnerable = $derived(
		$TeamOverview2.data?.team.workloads.edges
			.map((workload) => workload.node)
			.filter((node) =>
				node.status.errors.some((error) => error.__typename === 'WorkloadStatusVulnerable')
			)
	);
</script>

{#if page.url.searchParams.has('deleted')}
	{@const msgParts = (page.url.searchParams.get('deleted') || '').split('/')}
	<Alert variant="success" size="small">
		Successfully deleted {msgParts[0]}
		{msgParts[1]}.
	</Alert>
{/if}

<div class="wrapper">
	<div>
		<Heading level="2" size="medium" spacing>Vulnerabilities</Heading>

		<div class="two-columns">
			<VulnerabilitySummaryNew {teamSlug} />
			<div class="todo">
				<Heading level="4" size="small" spacing>Todos</Heading>
				{#if workloadsVulnerable?.length}
					<BodyShort>
						{capitalizeFirstLetter(numberToWords(workloadsVulnerable?.length))} of your workload's risk
						score exceeds the acceptable threshold of 100. Please keep your dependencies up to date.
					</BodyShort>
					<ul>
						{#each workloadsVulnerable as workload (workload.id)}
							<li>
								{workload.__typename === 'Job' ? 'Job' : 'Application'}
								{workload.name}
								<Tag size="small" variant={envTagVariant(workload.teamEnvironment.environment.name)}
									>{workload.teamEnvironment.environment.name}</Tag
								>
								has a risk score of {workload.status.errors.find((error) => {
									return error.__typename === 'WorkloadStatusVulnerable';
								})?.summary.riskScore}.
								<a
									href="/team/{teamSlug}/{workload.teamEnvironment.environment
										.name}/{workload.__typename === 'Job' ? 'job' : 'app'}/{workload.name}/image"
									>Go to image details</a
								>
							</li>
						{/each}
					</ul>
				{/if}

				{#if workloadWithoutSbom?.length}
					<BodyShort>
						{capitalizeFirstLetter(numberToWords(workloadWithoutSbom?.length))} of your workloads does
						not have a registered Software Bill of Materials (SBOM). Refer to the Nais documentation
						for instructions on how to resolve this.
						<ul>
							{#each workloadWithoutSbom as workload (workload.id)}
								<li>
									{workload.name}
									<Tag
										size="small"
										variant={envTagVariant(workload.teamEnvironment.environment.name)}
										>{workload.teamEnvironment.environment.name}</Tag
									>
								</li>
							{/each}
						</ul>
					</BodyShort>
				{/if}

				{#if workloadsVulnerable?.length === 0 && workloadWithoutSbom?.length === 0}
					<BodyShort>All workloads have a registered SBOM and an acceptable risk score.</BodyShort>
				{/if}
			</div>
		</div>
	</div>

	<div class="sidebar">
		<TeamInfo {teamSlug} {viewerIsMember} />

		<TeamUtilizationAndOverage {teamSlug} />
		<AggregatedCostForTeam {teamSlug} />
	</div>
</div>

<!--div class="grid">
	<Card rows={1} columns={3}>

	</Card>

	<Card rows={1} columns={3}>

	</Card>

	<Card rows={1} columns={3}>

	</Card>
	<Card rows={1} columns={3}>

	</Card>

	<div class="deployments">
		<Heading level="4" size="small" spacing>Last team deployments</Heading>
		{#if $TeamOverview.data}
			<Deploys team={$TeamOverview.data.team} />
		{/if}
	</div>
</div-->

<style>
	.wrapper {
		display: grid;
		grid-template-columns: 1fr 300px;
		gap: var(--spacing-layout);
	}
	.two-columns {
		display: grid;
		grid-template-columns: 270px 1fr;
		gap: var(--spacing-layout);
	}
	/*.workloads-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
	}

	.workload-card {
		background-color: var(--a-background-surface);
		border: 1px solid var(--a-gray-200);
		border-radius: var(--a-border-radius-1);
		padding: var(--a-spacing-2);
	}*/

	.sidebar {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
	}
	/*.grid {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
	}
	.grid:not(:first-child) {
		margin-top: 1rem;
	}
	.deployments {
		grid-column: span 12;
		grid-row: span 1;
	}*/
</style>
