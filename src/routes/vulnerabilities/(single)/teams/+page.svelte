<script lang="ts">
	import { page } from '$app/state';
	import { OrderDirection, TeamOrderField } from '$houdini';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import IconLabel from '$lib/ui/IconLabel.svelte';
	import { urlToOrderDirection, urlToOrderField } from '$lib/ui/OrderByMenu.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import {
		BodyLong,
		Heading,
		Loader,
		Table,
		Tag,
		Tbody,
		Td,
		Th,
		Thead,
		Tr,
		type TableSortState
	} from '@nais/ds-svelte-community';
	import { CheckmarkIcon, PersonGroupIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { TenantVulnerabilites } = $derived(data);

	const currentOrderField = $derived(
		urlToOrderField(TeamOrderField, TeamOrderField.RISK_SCORE, page.url)
	);

	const currentOrderDirection = $derived(urlToOrderDirection(page.url, OrderDirection.DESC));

	const tableSortState = $derived.by((): TableSortState => ({
		orderBy: currentOrderField,
		direction: currentOrderDirection === OrderDirection.ASC ? 'ascending' : 'descending'
	}));

	const handleSortChange = (key: string) => {
		const nextDirection =
			currentOrderField === key
				? currentOrderDirection === OrderDirection.ASC
					? OrderDirection.DESC
					: OrderDirection.ASC
				: key === TeamOrderField.SLUG
					? OrderDirection.ASC
					: OrderDirection.DESC;

		changeParams(
			{
				sort: `${key}-${nextDirection}`,
				after: '',
				before: ''
			},
			{ noScroll: true }
		);
	};

	// Priority-tier counts, not severity: a team can have plenty of High/Critical
	// severity findings while still landing in the Monitor priority tier, so
	// showing severity here would be misleading about what actually needs action.
	const priorityColumns = [
		{ label: 'High', summaryKey: 'highRisk' },
		{ label: 'Elevated', summaryKey: 'elevatedRisk' },
		{ label: 'Monitor', summaryKey: 'monitor' }
	] as const;

	type PriorityCountKey = 'highRisk' | 'elevatedRisk' | 'monitor';
</script>

<div class="wrapper">
	<GraphErrors errors={$TenantVulnerabilites.errors} />
	<div>
		<Heading as="h2" spacing>Team Security Posture</Heading>
		<BodyLong>
			A detailed breakdown of all teams with workloads, showing the number of vulnerabilities by
			severity, total risk score, SBOM coverage, and workload count. Use this table to explore and
			compare security posture across teams.
		</BodyLong>
	</div>

	{#if $TenantVulnerabilites.fetching}
		<div class="loading-centered" role="status" aria-label="Loading">
			<Loader size="3xlarge" />
		</div>
	{:else}
		<div class="table-scroll" role="region" aria-label="Team security posture">
			<Table size="small" sort={tableSortState} onsortchange={handleSortChange}>
				<Thead>
					<Tr>
						<Th sortable={true} sortKey={TeamOrderField.SLUG}>Team</Th>
						<Th class="known-exploited-column">Known exploited</Th>
						{#each priorityColumns as column (column.summaryKey)}
							<Th>{column.label}</Th>
						{/each}
						<Th sortable={true} sortKey={TeamOrderField.RISK_SCORE}>Risk score</Th>
						<Th sortable={true} sortKey={TeamOrderField.SBOM_COVERAGE}>SBOM coverage</Th>
						<Th>Workloads</Th>
					</Tr>
				</Thead>
				<Tbody>
					{#each $TenantVulnerabilites.data?.teams.edges ?? [] as { node: team } (team.slug)}
						<Tr>
							<Td>
								<IconLabel
									label={team.slug}
									href="/team/{team.slug}/vulnerabilities"
									icon={PersonGroupIcon}
								/>
							</Td>
							<Td class="severity-cell">
								{#if team.vulnerabilitySummary.countsByPriority.knownExploited > 0}
									<a href="/team/{team.slug}/vulnerabilities">
										<Tag variant="error" size="small"
											>{team.vulnerabilitySummary.countsByPriority.knownExploited}</Tag
										>
									</a>
								{:else}
									<CheckmarkIcon class="no-vulnerability" />
								{/if}
							</Td>
							{#each priorityColumns as column (column.summaryKey)}
								<Td class="severity-cell">
									{const count = $derived(
										team.vulnerabilitySummary.countsByPriority[
											column.summaryKey as PriorityCountKey
										]
									)}
									{#if count > 0}
										<a href="/team/{team.slug}/vulnerabilities">
											{count}
										</a>
									{:else}
										<CheckmarkIcon class="no-vulnerability" />
									{/if}
								</Td>
							{/each}
							<Td class="severity-cell">
								{#if team.vulnerabilitySummary.riskScore > 0}
									<a href="/team/{team.slug}/vulnerabilities" class="severity-badge RISK_SCORE">
										{team.vulnerabilitySummary.riskScore}
									</a>
								{:else}
									<CheckmarkIcon class="no-vulnerability" />
								{/if}
							</Td>
							<Td class="numeric-cell">
								<span class:low-coverage={team.vulnerabilitySummary.coverage < 100}>
									{team.vulnerabilitySummary.coverage.toFixed(0)}%
								</span>
							</Td>
							<Td class="numeric-cell">{team.workloads.pageInfo.totalCount}</Td>
						</Tr>
					{:else}
						<Tr>
							<Td colspan={999}>No teams found.</Td>
						</Tr>
					{/each}
				</Tbody>
			</Table>
		</div>
	{/if}

	<Pagination
		page={$TenantVulnerabilites.data?.teams.pageInfo}
		fetching={$TenantVulnerabilites.fetching}
		loaders={{
			loadPreviousPage: () =>
				changeParams(
					{
						after: '',
						before: $TenantVulnerabilites.data?.teams.pageInfo.startCursor ?? ''
					},
					{ noScroll: true }
				),
			loadNextPage: () =>
				changeParams(
					{
						after: $TenantVulnerabilites.data?.teams.pageInfo.endCursor ?? '',
						before: ''
					},
					{ noScroll: true }
				)
		}}
	/>
</div>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
		margin-top: var(--spacing-layout);
	}

	:global(.severity-cell) {
		text-align: center;
	}

	:global(.numeric-cell) {
		text-align: right;
	}

	:global(.no-vulnerability) {
		color: var(--ax-text-success-decoration);
		font-size: 1.5rem;
		display: block;
		margin: 0 auto;
	}

	.low-coverage {
		color: var(--ax-text-warning);
		font-weight: var(--ax-font-weight-bold);
	}
</style>
