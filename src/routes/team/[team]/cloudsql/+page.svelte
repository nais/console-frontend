<script lang="ts">
	import WorkloadLink from '$lib/domain/workload/WorkloadLink.svelte';
	import List from '$lib/ui/List.svelte';
	import ListItem from '$lib/ui/ListItem.svelte';

	import { docURL } from '$lib/doc';
	import PersistenceCost from '$lib/domain/cost/PersistenceCost.svelte';
	import IssueSeverityTags from '$lib/domain/issues/IssueSeverityTags.svelte';
	import { envTagVariant } from '$lib/envTagVariant';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import IconLabel from '$lib/ui/IconLabel.svelte';
	import OrderByMenu from '$lib/ui/OrderByMenu.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import TooltipAlignHack from '$lib/ui/TooltipAlignHack.svelte';
	import { OrderDirection, SqlInstanceOrderField } from '$lib/urql/gql/graphql';
	import { countIssuesBySeverity } from '$lib/utils/issueCounts';
	import { changeParams } from '$lib/utils/searchparams';
	import { BodyLong, Loader } from '@nais/ds-svelte-community';
	import { CircleFillIcon } from '@nais/ds-svelte-community/icons';
	import { endOfYesterday, startOfMonth, subMonths } from 'date-fns';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let { SqlInstances } = $derived(data);
	let result = $derived(SqlInstances);
</script>

<GraphErrors errors={result.errors} />

{#if !result.data && !result.errors}
	<div class="loading">
		<Loader size="3xlarge" />
	</div>
{:else if result.data && result.data.team.sqlInstances.pageInfo.totalCount > 0}
	{@const cost = result.data.team.cost}
	{@const si = result.data.team.sqlInstances}

	<div class="content-wrapper">
		<div>
			<BodyLong spacing>
				Cloud SQL instances provide managed relational databases in the cloud.
				<ExternalLink href={docURL('/persistence/cloudsql')}
					>Learn more about Cloud SQL in Nais and how to get started.</ExternalLink
				>
			</BodyLong>

			<List
				title="{si.pageInfo.totalCount} Cloud SQL instance{si.pageInfo.totalCount !== 1 ? 's' : ''}"
			>
				{#snippet menu()}
					<OrderByMenu
						orderField={SqlInstanceOrderField}
						defaultOrderField={SqlInstanceOrderField.ISSUES}
						defaultOrderDirection={OrderDirection.DESC}
					/>
				{/snippet}
				{#each si.nodes as instance (instance.id)}
					<ListItem>
						<div>
							<IconLabel
								as="h4"
								href="/team/{instance.team.slug}/{instance.teamEnvironment.environment
									.name}/cloudsql/{instance.name}"
								size="large"
								label={instance.name}
								tag={{
									label: instance.teamEnvironment.environment.name,
									variant: envTagVariant(instance.teamEnvironment.environment.name)
								}}
							>
								{#snippet icon()}
									<TooltipAlignHack
										content={{
											FAILED: 'FAILED',
											MAINTENANCE: 'MAINTENANCE',
											PENDING_CREATE: 'PENDING_CREATE',
											PENDING_DELETE: 'PENDING_DELETE',
											RUNNABLE: 'RUNNABLE',
											SUSPENDED: 'SUSPENDED',
											UNSPECIFIED: 'UNSPECIFIED',
											STOPPED: 'STOPPED'
										}[instance.state] ?? ''}
									>
										<CircleFillIcon
											style="color: var({{
												RUNNABLE: '--ax-bg-success-strong',
												FAILED: '--ax-bg-danger-strong',
												MAINTENANCE: '--ax-bg-warning-moderate-pressed',
												PENDING_CREATE: '--ax-bg-info-strong',
												PENDING_DELETE: '--ax-bg-info-strong',
												SUSPENDED: '--ax-bg-info-strong',
												UNSPECIFIED: '--ax-bg-info-strong',
												STOPPED: '--ax-bg-info-strong'
											}[instance.state] ?? '--ax-bg-info-strong'}); font-size: 0.7rem"
										/>
									</TooltipAlignHack>
								{/snippet}
							</IconLabel>
						</div>

						<div class="right">
							{#if instance.workload}
								<div style:display="flex" style:gap="var(--ax-space-6)">
									Owner: <WorkloadLink workload={instance.workload} hideTeam hideEnv />
								</div>
							{/if}

							<div>Version: <code>{instance.version}</code></div>
							{#if (instance.issues?.pageInfo.totalCount ?? 0) > 0}
								{@const criticalCount = countIssuesBySeverity(instance.issues?.edges, 'CRITICAL')}
								{@const warningCount = countIssuesBySeverity(instance.issues?.edges, 'WARNING')}
								{@const todoCount = countIssuesBySeverity(instance.issues?.edges, 'TODO')}

								<IssueSeverityTags
									critical={criticalCount}
									warning={warningCount}
									todo={todoCount}
								/>
							{/if}
						</div>
					</ListItem>
				{/each}
			</List>

			<Pagination
				page={si.pageInfo}
				loaders={{
					loadPreviousPage: () =>
						changeParams({ after: '', before: si.pageInfo.startCursor ?? '' }, { noScroll: true }),
					loadNextPage: () =>
						changeParams({ before: '', after: si.pageInfo.endCursor ?? '' }, { noScroll: true })
				}}
			/>
		</div>
		<div class="right-column">
			{#if cost}
				<div>
					<PersistenceCost
						pageName="SQL Instances"
						teamSlug={result.data.team.slug}
						costData={cost}
						from={startOfMonth(subMonths(new Date(), 1))}
						to={endOfYesterday()}
						service="Cloud SQL"
					/>
				</div>
			{/if}
		</div>
	</div>
{:else}
	<div class="content-wrapper">
		<BodyLong>
			<strong>No Cloud SQL instances found.</strong> Cloud SQL instances provide managed relational
			databases in the cloud.
			<ExternalLink href={docURL('/persistence/cloudsql')}
				>Learn more about Cloud SQL in Nais and how to get started.</ExternalLink
			>
		</BodyLong>
	</div>
{/if}

<style>
	.content-wrapper {
		display: grid;
		gap: var(--ax-space-24);
		grid-template-columns: 1fr 300px;
		align-items: start;
	}
	.right {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-6);
		align-items: flex-end;
	}

	.right-column {
		display: grid;
		gap: var(--ax-space-24);
	}
	code {
		font-size: 0.9rem;
	}

	.loading {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 300px;
		width: 100%;
	}
</style>
