<script lang="ts">
	import { page } from '$app/state';
	import AggregatedCostForTeam from '$lib/components/AggregatedCostForTeam.svelte';
	import TeamUtilizationAndOverage from '$lib/components/TeamUtilizationAndOverage.svelte';
	import { Alert, BodyShort, Heading, Tag } from '@nais/ds-svelte-community';

	import ActivityLogItem from '$lib/components/ActivityLogItem.svelte';
	import { supportedErrorTypes } from '$lib/components/errors/ErrorMessage.svelte';
	import TeamErrorMessage from '$lib/components/errors/TeamErrorMessage.svelte';
	import VulnerabilitySummaryFinal from '$lib/components/VulnerabilitySummaryFinal.svelte';
	import { envTagVariant } from '$lib/envTagVariant';
	import type { PageProps } from './$houdini';

	let { data }: PageProps = $props();
	let { TeamOverview, teamSlug, viewerIsMember } = $derived(data);

	const getWorkloadsWithError = (errorType: (typeof supportedErrorTypes)[number]) => {
		const workloads = $TeamOverview.data?.team.workloads.nodes.filter((workload) =>
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

	let workloadsVulnerable = $derived(
		$TeamOverview.data?.team.workloads.nodes.filter((node) =>
			node.status.errors.some((error) => error.__typename === 'WorkloadStatusVulnerable')
		)
	);

	let workloadWithoutSbom = $derived(
		$TeamOverview.data?.team.workloads.nodes.filter((node) =>
			node.status.errors.some(
				(error: { __typename: string }) => error.__typename === 'WorkloadStatusMissingSBOM'
			)
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
<div class="alerts-wrapper">
	{#each supportedErrorTypes.map(getWorkloadsWithError) as errors (errors.__typename)}
		{#if errors.workloads?.length && errors.level}
			<TeamErrorMessage
				error={{
					__typename: errors.__typename,
					level: errors.level
				}}
				{teamSlug}
				workloads={errors.workloads}
			/>
		{/if}
	{/each}
</div>
<div class="grid">
	<!-- <div class="card"><TeamVulnerabilitySummary {teamSlug} /></div> -->
	<div class="card"><TeamUtilizationAndOverage {teamSlug} /></div>
	<div class="card"><AggregatedCostForTeam {teamSlug} /></div>
	{#if viewerIsMember}
		<div class="card activity">
			<Heading size="small" level="2" spacing>Latest activity</Heading>
			{#if $TeamOverview.data}
				<div class="raised">
					<ActivityLogItem item={$TeamOverview.data.team.activityLog.nodes[0]} />
				</div>
			{/if}
			<a href="/team/{teamSlug}/activity-log">View all activity</a>
		</div>
	{/if}
</div>
<div class="wrapper">
	<div>
		<Heading level="2" size="medium" spacing>Vulnerabilities</Heading>

		<div class="two-columns">
			<VulnerabilitySummaryFinal {teamSlug} />
			<div class="todo">
				<Heading level="4" size="small" spacing>Todos</Heading>
				{#if workloadsVulnerable?.length}
					<BodyShort>
						{workloadsVulnerable?.length} of your workload's risk scores exceed{workloadsVulnerable?.length ===
						0
							? ''
							: 's'} the acceptable threshold of 100 and/or has one or more critical vulnerabilites.
						Keep your dependencies up to date.
					</BodyShort>
					<ul>
						{#each workloadsVulnerable as workload (workload.id)}
							{@const vulnError = workload.status.errors.find((error) => {
								return error.__typename === 'WorkloadStatusVulnerable';
							})}
							<li>
								{workload.__typename === 'Job' ? 'Job' : 'Application'}
								<a
									href="/team/{teamSlug}/{workload.teamEnvironment.environment
										.name}/{workload.__typename === 'Job' ? 'job' : 'app'}/{workload.name}"
									>{workload.name}</a
								>
								<Tag size="small" variant={envTagVariant(workload.teamEnvironment.environment.name)}
									>{workload.teamEnvironment.environment.name}</Tag
								>
								has a risk score of {vulnError?.summary.riskScore} and {vulnError?.summary.critical}
								critical vulnerabilit{(vulnError?.summary?.critical ?? 0) > 1 ? 'ies' : 'y'}.
								<a
									href="/team/{teamSlug}/{workload.teamEnvironment.environment
										.name}/{workload.__typename === 'Job'
										? 'job'
										: 'app'}/{workload.name}/vulnerability-report">View vulnerability report</a
								>
							</li>
						{/each}
					</ul>
				{/if}

				{#if workloadWithoutSbom?.length}
					<BodyShort>
						{workloadWithoutSbom?.length} of your workloads {workloadWithoutSbom?.length === 1
							? 'does'
							: 'do'}
						not have a registered Software Bill of Materials (SBOM). Refer to the
						<a href="https://docs.nais.io/services/vulnerabilities/">Nais documentation</a>
						for instructions on how to resolve this.
						<ul>
							{#each workloadWithoutSbom as workload (workload.id)}
								<li>
									<a
										href="/team/{teamSlug}/{workload.teamEnvironment.environment
											.name}/{workload.__typename === 'Job' ? 'job' : 'app'}/{workload.name}"
										>{workload.name}</a
									>
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
</div>

<style>
	.raised {
		padding: var(--a-spacing-4) var(--a-spacing-5);
		background-color: var(--a-surface-default);
		border-radius: 8px;
	}
	.activity {
		word-wrap: break-word;

		> a {
			margin-top: var(--a-spacing-4);
		}
	}
	.card {
		background-color: var(--a-surface-subtle);
		padding: var(--a-spacing-4) var(--a-spacing-5);
		border-radius: 12px;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		grid-auto-rows: 350px;
		gap: 1rem;
	}
	.grid:not(:first-child) {
		margin-top: 1rem;
	}

	.alerts-wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--a-spacing-2);
	}
	.two-columns {
		display: grid;
		align-items: start;
		grid-template-columns: 270px 1fr;
		gap: var(--spacing-layout);
	}
</style>
