<script lang="ts">
	import TeamsGroupedByUrgency from '#lib/domain/vulnerability/TeamsGroupedByUrgency.svelte';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import OrderByMenu from '#lib/ui/OrderByMenu.svelte';
	import { changeParams } from '#lib/utils/searchparams.js';
	import { BodyLong, Button, Heading, Loader } from '#lib/shadcn/ui/index.js';
	import { OrderDirection, TeamOrderField } from '$houdini';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { TenantTeamPriorityGroups } = $derived(data);
	const hasTeams = $derived.by(() => {
		const groups = $TenantTeamPriorityGroups.data;
		return (
			groups &&
			(['high', 'elevated', 'monitor', 'none'] as const).some(
				(group) => groups[group].pageInfo.totalCount > 0
			)
		);
	});

	const paginationParams = ['high', 'elevated', 'monitor', 'none'].flatMap((group) => [
		`${group}After`,
		`${group}Before`
	]);
</script>

<div class="wrapper">
	<GraphErrors errors={$TenantTeamPriorityGroups.errors} />
	<div>
		<Heading as="h2" spacing>Team Security Posture</Heading>
		<BodyLong>
			A detailed breakdown of teams with workloads, grouped by vulnerability priority. Not
			prioritized includes teams without SBOMs and teams with no prioritized findings. Complete SBOM
			coverage does not mean a team has no vulnerabilities. For teams with scan data, you can also
			see risk score, SBOM coverage, and workload count. Vulnerability counts are the number of
			vulnerabilities, not the number of workloads affected.
		</BodyLong>
	</div>

	{#if $TenantTeamPriorityGroups.fetching && !$TenantTeamPriorityGroups.data}
		<div class="loading-centered" role="status" aria-label="Loading">
			<Loader size="3xlarge" />
		</div>
	{:else if $TenantTeamPriorityGroups.data}
		<TeamsGroupedByUrgency
			groups={$TenantTeamPriorityGroups.data}
			fetching={$TenantTeamPriorityGroups.fetching}
			loadPage={(group, direction) => {
				const page = $TenantTeamPriorityGroups.data?.[group].pageInfo;
				return changeParams(
					{
						[`${group}After`]: direction === 'next' ? (page?.endCursor ?? '') : '',
						[`${group}Before`]: direction === 'previous' ? (page?.startCursor ?? '') : ''
					},
					{ noScroll: true }
				);
			}}
		>
			<div class="team-controls">
				<Button
					size="small"
					variant={data.onlyMyTeams ? 'primary' : 'secondary'}
					aria-pressed={data.onlyMyTeams}
					onclick={() =>
						changeParams(
							{
								myTeams: data.onlyMyTeams ? '' : 'true',
								...Object.fromEntries(paginationParams.map((param) => [param, '']))
							},
							{ noScroll: true }
						)}
				>
					My teams
				</Button>
				<OrderByMenu
					orderField={TeamOrderField}
					defaultOrderField={TeamOrderField.SBOM_COVERAGE}
					defaultOrderDirection={OrderDirection.ASC}
					onlyInclude={[
						TeamOrderField.RISK_SCORE,
						TeamOrderField.SLUG,
						TeamOrderField.SBOM_COVERAGE,
						TeamOrderField.VULNERABILITY_SUMMARY_WORKLOAD_COUNT
					]}
					resetParams={paginationParams}
				/>
			</div>
		</TeamsGroupedByUrgency>
		{#if !hasTeams && !$TenantTeamPriorityGroups.errors?.length}
			<BodyLong
				>{data.onlyMyTeams ? 'None of your teams have workloads.' : 'No teams found.'}</BodyLong
			>
		{/if}
	{:else if !$TenantTeamPriorityGroups.errors?.length}
		<BodyLong>No teams found.</BodyLong>
	{/if}
</div>

<style>
	.team-controls {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: flex-end;
		gap: var(--nais-space-8);
	}

	.wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
		margin-top: var(--spacing-layout);
	}
</style>
