<script lang="ts">
	import TeamsGroupedByUrgency from '#lib/domain/vulnerability/TeamsGroupedByUrgency.svelte';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import { changeParams } from '#lib/utils/searchparams.js';
	import { BodyLong, Heading, Loader } from '@nais/ds-svelte-community';
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
</script>

<div class="wrapper">
	<GraphErrors errors={$TenantTeamPriorityGroups.errors} />
	<div>
		<Heading as="h2" spacing>Team Security Posture</Heading>
		<BodyLong>
			A detailed breakdown of all teams with workloads, showing vulnerabilities by priority and
			severity, total risk score, SBOM coverage, and workload count. Vulnerability counts are the
			number of vulnerabilities, not the number of workloads affected. Use this overview to explore
			and compare security posture across teams.
		</BodyLong>
	</div>

	{#if $TenantTeamPriorityGroups.fetching && !$TenantTeamPriorityGroups.data}
		<div class="loading-centered" role="status" aria-label="Loading">
			<Loader size="3xlarge" />
		</div>
	{:else if hasTeams && $TenantTeamPriorityGroups.data}
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
		/>
	{:else if !$TenantTeamPriorityGroups.errors?.length}
		<BodyLong>No teams found.</BodyLong>
	{/if}
</div>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
		margin-top: var(--spacing-layout);
	}
</style>
