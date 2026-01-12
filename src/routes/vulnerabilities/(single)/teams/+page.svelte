<script lang="ts">
	import { OrderDirection, TeamOrderField } from '$houdini';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import IconLabel from '$lib/ui/IconLabel.svelte';
	import List from '$lib/ui/List.svelte';
	import ListItem from '$lib/ui/ListItem.svelte';
	import OrderByMenu from '$lib/ui/OrderByMenu.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { BodyLong, Detail, Heading, Loader, Tooltip } from '@nais/ds-svelte-community';
	import { CheckmarkIcon, PersonGroupIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { TenantVulnerabilites } = $derived(data);
</script>

<div class="wrapper">
	<GraphErrors errors={$TenantVulnerabilites.errors} />
	<div>
		<Heading as="h3" spacing>Team Security Posture</Heading>
		<BodyLong>
			A detailed breakdown of all teams with workloads, showing the number of vulnerabilities by
			severity, total risk score, SBOM coverage, and workload count. Use this table to explore and
			compare security posture across teams.
		</BodyLong>
	</div>

	<List title="Teams and Vulnerabilities">
		{#snippet menu()}
			<OrderByMenu
				orderField={TeamOrderField}
				defaultOrderField={TeamOrderField.RISK_SCORE}
				defaultOrderDirection={OrderDirection.DESC}
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
			<div style="display: flex; justify-content: center; align-items: center; height: 500px;">
				<Loader size="3xlarge" />
			</div>
		{:else}
			{#each $TenantVulnerabilites.data?.teams.nodes ?? [] as team (team.slug)}
				<ListItem>
					<IconLabel
						label={team.slug}
						href="/team/{team.slug}"
						icon={PersonGroupIcon}
						size="large"
						as="h3"
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
												{team.vulnerabilitySummary.critical
													? team.vulnerabilitySummary.critical
													: '-'}
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
												{team.vulnerabilitySummary.high ? team.vulnerabilitySummary.high : '-'}
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
												{team.vulnerabilitySummary.medium ? team.vulnerabilitySummary.medium : '-'}
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
												{team.vulnerabilitySummary.low ? team.vulnerabilitySummary.low : '-'}
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
												{team.vulnerabilitySummary.unassigned
													? team.vulnerabilitySummary.unassigned
													: '-'}
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
												{team.vulnerabilitySummary.riskScore
													? team.vulnerabilitySummary.riskScore
													: '-'}
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
		{/if}
	</List>
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
</style>
