<script lang="ts">
	import { page } from '$app/state';
	import { Alert, BodyShort, Heading, Tag } from '@nais/ds-svelte-community';

	import AggregatedCostForTeam from '$lib/components/AggregatedCostForTeam.svelte';
	import TeamInfo from '$lib/components/TeamInfo.svelte';
	import TeamUtilizationAndOverage from '$lib/components/TeamUtilizationAndOverage.svelte';
	import VulnerabilitySummary from '$lib/components/VulnerabilitySummary.svelte';
	import { envTagVariant } from '$lib/envTagVariant';
	import { capitalizeFirstLetter } from '$lib/utils/formatters';
	import type { PageData } from './$houdini';

	function numberToWords(num: number): string {
		if (num < 0 || num > 999) throw new Error('Number out of range (0–999)');

		const ones = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
		const teens = [
			'eleven',
			'twelve',
			'thirteen',
			'fourteen',
			'fifteen',
			'sixteen',
			'seventeen',
			'eighteen',
			'nineteen'
		];
		const tens = [
			'ten',
			'twenty',
			'thirty',
			'forty',
			'fifty',
			'sixty',
			'seventy',
			'eighty',
			'ninety'
		];

		if (num < 10) return ones[num];
		if (num > 10 && num < 20) return teens[num - 11];
		if (num >= 10 && num < 100) {
			return num % 10 === 0
				? tens[Math.floor(num / 10) - 1]
				: `${tens[Math.floor(num / 10) - 1]}-${ones[num % 10]}`;
		}

		// Handling 100–999
		const hundredPart = ones[Math.floor(num / 100)] + ' hundred';
		const remainder = num % 100;

		if (remainder === 0) return hundredPart;
		return `${hundredPart} and ${numberToWords(remainder)}`;
	}

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let { TeamOverview, teamSlug, viewerIsMember } = $derived(data);

	let workloadWithoutSbom = $derived(
		$TeamOverview.data?.team.workloads.edges
			.map((workload) => workload.node)
			.filter((node) =>
				node.status.errors.some(
					(error: { __typename: string }) => error.__typename === 'WorkloadStatusMissingSBOM'
				)
			)
	);

	let workloadsVulnerable = $derived(
		$TeamOverview.data?.team.workloads.edges
			.map((workload) => workload.node)
			.filter((node) =>
				node.status.errors.some((error) => error.__typename === 'WorkloadStatusVulnerable')
			)
	);

	$inspect(workloadWithoutSbom, 'workloadWithoutSbom');
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
			<VulnerabilitySummary {teamSlug} />
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
								<Tag size="small" variant={envTagVariant(workload.environment.name)}
									>{workload.environment.name}</Tag
								>
								has a risk score of {workload.status.errors.map((error) =>
									error.__typename === 'WorkloadStatusVulnerable' ? error.summary.riskScore : 0
								)}.
								<a href="/">Go to image details</a>
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
									<Tag size="small" variant={envTagVariant(workload.environment.name)}
										>{workload.environment.name}</Tag
									>
								</li>
							{/each}
						</ul>
					</BodyShort>
				{/if}
				<!--{#if $TeamOverview.data?.team.workloads.edges}
				{#each $TeamOverview.data.team.workloads.edges as workload (workload.node.id)}
					{#if workload.node.status.errors.length > 0}
						<div>
							{#each workload.node.status.errors as error, i (workload.node.id + error.__typename + i)}
								<AppErrorTypeToMessage {error} />
							{/each}
						</div>
					{/if}
				{/each}
			{/if}-->
			</div>
		</div>
	</div>
	<!--div class="workloads-grid">
		{#if $TeamOverview.data?.team.workloads.edges}
			{#each $TeamOverview.data.team.workloads.edges as workload (workload.node.id)}
				{#if workload.node.status.errors.length > 0}
					<div class="workload-card">
						<WorkloadLink hideTeam workload={workload.node} />
						{#each workload.node.status.errors as error, i (workload.node.id + error.__typename + i)}
							<AppErrorTypeToMessage {error} />
						{/each}
					</div>
				{/if}
			{/each}
		{/if}
	</div-->
	<!--div class="todos">
		<Heading level="4" size="small" spacing>Todos</Heading>
		{#if $TeamOverview.data?.team.workloads.edges}
			{#each $TeamOverview.data.team.workloads.edges as workload (workload.node.id)}
				{#if workload.node.status.errors.length > 0}
					<div>
						{#each workload.node.status.errors as error, i (workload.node.id + error.__typename + i)}
							<AppErrorTypeToMessage {error} />
						{/each}
					</div>
				{/if}
			{/each}
		{/if}
	</div-->
	<!--List>
		{#if $TeamOverview.data?.team.workloads.edges}
			{#each $TeamOverview.data.team.workloads.edges as workload (workload.node.id)}
				{#if workload.node.__typename === 'Application'}
					<AppListItem app={workload.node} />
				{:else}
					<JobListItem job={workload.node} />
				{/if}
			{/each}
		{/if}
	</List-->
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
		grid-template-columns: 200px 1fr;
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
