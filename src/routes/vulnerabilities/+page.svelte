<script lang="ts">
	import { page } from '$app/stores';
	import { TeamOrderField } from '$houdini';
	import CveSearch from '$lib/domain/vulnerability/CveSearch.svelte';
	import VulnerabilitySummaryTenant from '$lib/domain/vulnerability/VulnerabilitySummaryTenant.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import IconLabel from '$lib/ui/IconLabel.svelte';
	import List from '$lib/ui/List.svelte';
	import ListItem from '$lib/ui/ListItem.svelte';
	import OrderByMenu from '$lib/ui/OrderByMenu.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import Tab from '$lib/ui/Tab.svelte';
	import Tabs from '$lib/ui/Tabs.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import {
		BodyLong,
		BodyShort,
		Detail,
		Heading,
		Loader,
		Tag,
		Tooltip
	} from '@nais/ds-svelte-community';
	import { CheckmarkIcon, PersonGroupIcon } from '@nais/ds-svelte-community/icons';
	import VulnerabilityHistory from './VulnerabilityHistory.svelte';
	import VulnerabilityLeaderBoard from './VulnerabilityLeaderBoard.svelte';

	export let data;

	$: TenantVulnerabilites = data.TenantVulnerabilites;
	$: CVES = data.CVES;
	$: tab = $page.url.searchParams.get('tab') || 'overview';

	function severityToVariant(severity: string) {
		switch (severity.toLowerCase()) {
			case 'critical':
				return 'error';
			case 'high':
				return 'warning';
			case 'medium':
				return 'warning-moderate';
			case 'low':
				return 'info';
			default:
				return 'neutral';
		}
	}
</script>

<div class="page">
	<div class="container">
		<GraphErrors errors={$TenantVulnerabilites.errors} />

		<Heading level="2" spacing>Vulnerabilities</Heading>
		<BodyLong spacing>
			Overview of security vulnerabilities across all workloads in your tenant. Track CVEs, assess
			risk, and monitor remediation progress.
		</BodyLong>

		<div class="info">
			<CveSearch />
			{#if $TenantVulnerabilites.data?.vulnerabilitySummary}
				<VulnerabilitySummaryTenant
					vulnerabilitySummary={$TenantVulnerabilites.data?.vulnerabilitySummary}
				/>
			{/if}
		</div>

		<Tabs>
			<Tab href="/vulnerabilities?tab=overview" active={tab === 'overview'} title="Overview" />
			<Tab href="/vulnerabilities?tab=teams" active={tab === 'teams'} title="Teams" />
			<Tab href="/vulnerabilities?tab=cves" active={tab === 'cves'} title="CVEs" />
		</Tabs>

		{#if tab === 'overview'}
			<div class="wrapper">
				<VulnerabilityHistory />
				<VulnerabilityLeaderBoard />
			</div>
		{:else if tab === 'teams'}
			<div>
				<Heading level="3" spacing>Team Security Posture</Heading>
				<BodyLong spacing>
					A detailed breakdown of all teams with workloads, showing the number of vulnerabilities by
					severity, total risk score, SBOM coverage, and workload count. Use this table to explore
					and compare security posture across teams.
				</BodyLong>

				<List title="Teams and Vulnerabilities">
					{#snippet menu()}
						<OrderByMenu
							orderField={TeamOrderField}
							defaultOrderField={TeamOrderField.RISK_SCORE}
							defaultOrderDirection="DESC"
							onlyInclude={[
								TeamOrderField.RISK_SCORE,
								TeamOrderField.CRITICAL_VULNERABILITIES,
								TeamOrderField.HIGH_VULNERABILITIES,
								TeamOrderField.MEDIUM_VULNERABILITIES,
								TeamOrderField.LOW_VULNERABILITIES,
								TeamOrderField.UNASSIGNED_VULNERABILITIES,
								TeamOrderField.SBOM_COVERAGE,
								TeamOrderField.SLUG
							]}
						/>
					{/snippet}
					{#if $TenantVulnerabilites.fetching}
						<div
							style="display: flex; justify-content: center; align-items: center; height: 500px;"
						>
							<Loader size="3xlarge" />
						</div>
					{:else if $TenantVulnerabilites.data?.teams.nodes}
						{#each $TenantVulnerabilites.data.teams.nodes as team (team.slug)}
							<ListItem>
								<IconLabel
									label={team.slug}
									href="/team/{team.slug}"
									icon={PersonGroupIcon}
									size="large"
									level="3"
								/>

								<div class="right">
									<div class="grid">
										<div class="vulnerability">
											<div class="vulnerability-summary">
												<Tooltip content="Critical">
													{#if team.vulnerabilitySummary.critical > 0}
														<a
															href={`/team/${team.slug}/vulnerabilities`}
															class="vulnerability-count CRITICAL"
														>
															{team.vulnerabilitySummary.critical}
														</a>
													{:else}
														<CheckmarkIcon
															style="color: var(--ax-text-success-decoration); font-size: 1.75rem;"
														/>
													{/if}
												</Tooltip>
											</div>
										</div>
										<div class="vulnerability">
											<div class="vulnerability-summary">
												<Tooltip content="High">
													{#if team.vulnerabilitySummary.high > 0}
														<a
															href={`/team/${team.slug}/vulnerabilities`}
															class="vulnerability-count HIGH"
														>
															{team.vulnerabilitySummary.high}
														</a>
													{:else}
														<CheckmarkIcon
															style="color: var(--ax-text-success-decoration); font-size: 1.75rem;"
														/>
													{/if}
												</Tooltip>
											</div>
										</div>
										<div class="vulnerability">
											<div class="vulnerability-summary">
												<Tooltip content="Medium">
													{#if team.vulnerabilitySummary.medium > 0}
														<a
															href={`/team/${team.slug}/vulnerabilities`}
															class="vulnerability-count MEDIUM"
														>
															{team.vulnerabilitySummary.medium}
														</a>
													{:else}
														<CheckmarkIcon
															style="color: var(--ax-text-success-decoration); font-size: 1.75rem;"
														/>
													{/if}
												</Tooltip>
											</div>
										</div>
										<div class="vulnerability">
											<div class="vulnerability-summary">
												<Tooltip content="Low">
													{#if team.vulnerabilitySummary.low > 0}
														<a
															href={`/team/${team.slug}/vulnerabilities`}
															class="vulnerability-count LOW"
														>
															{team.vulnerabilitySummary.low}
														</a>
													{:else}
														<CheckmarkIcon
															style="color: var(--ax-text-success-decoration); font-size: 1.75rem;"
														/>
													{/if}
												</Tooltip>
											</div>
										</div>
										<div class="vulnerability">
											<div class="vulnerability-summary">
												<Tooltip content="Unassigned">
													{#if team.vulnerabilitySummary.unassigned > 0}
														<a
															href={`/team/${team.slug}/vulnerabilities`}
															class="vulnerability-count UNASSIGNED"
														>
															{team.vulnerabilitySummary.unassigned}
														</a>
													{:else}
														<CheckmarkIcon
															style="color: var(--ax-text-success-decoration); font-size: 1.75rem;"
														/>
													{/if}
												</Tooltip>
											</div>
										</div>
										<div class="vulnerability">
											<div class="vulnerability-summary">
												<Tooltip content="Risk score">
													{#if team.vulnerabilitySummary.riskScore > 0}
														<a
															href={`/team/${team.slug}/vulnerabilities`}
															class="vulnerability-count RISK_SCORE"
														>
															{team.vulnerabilitySummary.riskScore}
														</a>
													{:else}
														<CheckmarkIcon
															style="color: var(--ax-text-success-decoration); font-size: 1.75rem;"
														/>
													{/if}
												</Tooltip>
											</div>
										</div>
										<div>
											<Detail>
												SBOM coverage: <span
													style="color: {team.vulnerabilitySummary.coverage < 100
														? 'var(--ax-warning-500)'
														: 'inherit'}; font-weight: bold;"
													>{team.vulnerabilitySummary.coverage.toFixed(0)}%</span
												>
											</Detail>
											<Detail
												># of workloads: <span style="font-weight: bold;"
													>{team.workloads.pageInfo.totalCount}</span
												></Detail
											>
										</div>
									</div>
								</div>
							</ListItem>
						{/each}
					{:else}
						<div style="text-align: center; padding: 2rem;">
							<Detail>No teams found</Detail>
						</div>
					{/if}
				</List>

				{#if $TenantVulnerabilites.data?.teams.pageInfo}
					<Pagination
						page={$TenantVulnerabilites.data.teams.pageInfo}
						loaders={{
							loadPreviousPage: () => {
								changeParams({
									before: $TenantVulnerabilites.data?.teams.pageInfo.startCursor ?? '',
									after: ''
								});
							},
							loadNextPage: () => {
								changeParams({
									after: $TenantVulnerabilites.data?.teams.pageInfo.endCursor ?? '',
									before: ''
								});
							}
						}}
						fetching={$TenantVulnerabilites.fetching}
					/>
				{/if}
			</div>
		{:else if tab === 'cves'}
			<div>
				<Heading level="3" spacing>CVE Database</Heading>
				<BodyLong spacing>
					Browse the complete list of Common Vulnerabilities and Exposures (CVEs) affecting your
					workloads. Each CVE entry includes severity rating, CVSS score, description, and the
					number of affected workloads.
				</BodyLong>

				<List title="CVEs">
					{#if $CVES.fetching}
						<div
							style="display: flex; justify-content: center; align-items: center; height: 500px;"
						>
							<Loader size="3xlarge" />
						</div>
					{:else if $CVES.data?.cves.nodes}
						{#each $CVES.data.cves.nodes as cve (cve.identifier)}
							<ListItem href="/vulnerabilities/{cve.identifier}">
								<div class="cve-row">
									<div class="cve-main">
										<div class="cve-id-section">
											<BodyShort weight="semibold">{cve.identifier}</BodyShort>
											<Tag variant={severityToVariant(cve.severity)} size="small"
												>{cve.severity}</Tag
											>
										</div>
										<Detail>{cve.title}</Detail>
									</div>
									<div class="cve-stats">
										<div class="cve-stat">
											<Detail textColor="subtle">CVSS:</Detail>
											<Detail>{cve.cvssScore?.toFixed(1) ?? 'N/A'}</Detail>
										</div>
										<div class="cve-stat">
											<Detail textColor="subtle">Workloads:</Detail>
											<Detail>{cve.workloads.pageInfo.totalCount}</Detail>
										</div>
									</div>
								</div>
							</ListItem>
						{/each}
					{:else}
						<div style="text-align: center; padding: 2rem;">
							<Detail>No CVEs found</Detail>
						</div>
					{/if}
				</List>

				{#if $CVES.data?.cves.pageInfo}
					<Pagination
						page={$CVES.data.cves.pageInfo}
						loaders={{
							loadPreviousPage: () => {
								changeParams({
									cvesBefore: $CVES.data?.cves.pageInfo.startCursor ?? '',
									cvesAfter: ''
								});
							},
							loadNextPage: () => {
								changeParams({
									cvesAfter: $CVES.data?.cves.pageInfo.endCursor ?? '',
									cvesBefore: ''
								});
							}
						}}
						fetching={$CVES.fetching}
					/>
				{/if}
			</div>
		{/if}
	</div>
</div>

<style>
	.page {
		padding: 0 var(--a-spacing-8) var(--a-spacing-8);
	}

	.container {
		max-width: 1440px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: var(--a-spacing-8);
	}

	.info {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--a-spacing-4);
		align-items: start;
	}

	.wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
	}

	.vulnerability-summary {
		display: flex;
		gap: 1px;

		.vulnerability-count {
			border-top-left-radius: 4px;
			border-bottom-left-radius: 4px;

			border-top-right-radius: 4px;
			border-bottom-right-radius: 4px;

			padding: 4px 10px;

			color: inherit;
			text-decoration: none;

			&.CRITICAL {
				background-color: var(--ax-danger-600);
				&:hover {
					background-color: var(--ax-danger-500);
				}
			}
			&.HIGH {
				background-color: color-mix(in oklab, var(--ax-danger-600), var(--ax-warning-200));
				&:hover {
					background-color: color-mix(in oklab, var(--ax-danger-500), var(--ax-warning-100));
				}
			}
			&.MEDIUM {
				background-color: var(--ax-warning-300);
				&:hover {
					background-color: var(--ax-warning-200);
				}
			}
			&.LOW {
				background-color: var(--ax-success-400);
				&:hover {
					background-color: var(--ax-success-300);
				}
			}
			&.UNASSIGNED {
				background-color: var(--ax-neutral-200);
				&:hover {
					background-color: var(--ax-neutral-100);
				}
			}

			&.RISK_SCORE {
				&:hover {
					background-color: var(--ax-neutral-100);
				}
			}
		}
	}
	.vulnerability {
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(6, 88px) 160px;
		gap: var(--ax-space-8);
		align-items: center;
	}

	.right {
		display: flex;
		flex-direction: row;
		align-items: end;
		gap: var(--ax-space-24);
	}

	.cve-row {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
		width: 100%;
	}

	.cve-main {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		flex: 1;
	}

	.cve-id-section {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.cve-stats {
		display: flex;
		gap: 1rem;
		flex-shrink: 0;
	}

	.cve-stat {
		display: flex;
		gap: 0.25rem;
		align-items: center;
	}
</style>
