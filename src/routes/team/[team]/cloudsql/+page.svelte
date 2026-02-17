<script lang="ts">
	import WorkloadLink from '$lib/domain/workload/WorkloadLink.svelte';
	import List from '$lib/ui/List.svelte';
	import ListItem from '$lib/ui/ListItem.svelte';

	import { OrderDirection, SqlInstanceOrderField } from '$houdini';
	import { docURL } from '$lib/doc';
	import PersistenceCost from '$lib/domain/cost/PersistenceCost.svelte';
	import { envTagVariant } from '$lib/envTagVariant';
	import CircleProgressBar from '$lib/ui/CircleProgressBar.svelte';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import IconLabel from '$lib/ui/IconLabel.svelte';
	import OrderByMenu from '$lib/ui/OrderByMenu.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import TooltipAlignHack from '$lib/ui/TooltipAlignHack.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { BodyLong, BodyShort, Heading, Loader, Tag } from '@nais/ds-svelte-community';
	import { CircleFillIcon } from '@nais/ds-svelte-community/icons';
	import { endOfYesterday, startOfMonth, subMonths } from 'date-fns';
	import prettyBytes from 'pretty-bytes';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let { SqlInstances } = $derived(data);
</script>

<GraphErrors errors={$SqlInstances.errors} />

{#if $SqlInstances.fetching}
	<div class="loading">
		<Loader size="3xlarge" />
	</div>
{:else if $SqlInstances.data && $SqlInstances.data.team.sqlInstances.pageInfo.totalCount > 0}
	{@const cost = $SqlInstances.data.team.cost}
	{@const si = $SqlInstances.data.team.sqlInstances}
	{@const u = $SqlInstances.data.team.serviceUtilization.sqlInstances}

	<div class="content-wrapper">
		<div>
			<BodyLong spacing>
				Postgres instances provide managed relational databases in the cloud.
				<ExternalLink href={docURL('/persistence/postgres')}
					>Learn more about Postgres in Nais and how to get started.</ExternalLink
				>
			</BodyLong>

			<List
				title="{si.pageInfo.totalCount} Postgres instance{si.pageInfo.totalCount !== 1 ? 's' : ''}"
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
								{@const criticalCount = instance.issues?.edges.filter(
									(e) => e.node.severity === 'CRITICAL'
								).length}
								{@const warningCount = instance.issues?.edges.filter(
									(e) => e.node.severity === 'WARNING'
								).length}
								{@const todoCount = instance.issues?.edges.filter(
									(e) => e.node.severity === 'TODO'
								).length}

								<div class="issues-container">
									{#if criticalCount ?? 0 > 0}
										<Tag variant="error" size="xsmall"
											>{criticalCount ?? 0} critical issue{(criticalCount ?? 0) > 1 ? 's' : ''}</Tag
										>
									{/if}
									{#if warningCount ?? 0 > 0}
										<Tag variant="warning" size="xsmall"
											>{warningCount ?? 0} warning{(warningCount ?? 0) > 1 ? 's' : ''}</Tag
										>
									{/if}
									{#if todoCount ?? 0 > 0}
										<Tag variant="info" size="xsmall"
											>{todoCount ?? 0} todo{(todoCount ?? 0) > 1 ? 's' : ''}</Tag
										>
									{/if}
								</div>
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
						teamSlug={$SqlInstances.data.team.slug}
						costData={cost}
						from={startOfMonth(subMonths(new Date(), 1))}
						to={endOfYesterday()}
						service="Cloud SQL"
					/>
				</div>
			{/if}

			<div class="utilization">
				<Heading as="h2" size="small">Utilization</Heading>
				<BodyShort>Current utilization for all Postgres instances owned by the team.</BodyShort>

				<div>
					<BodyShort>Storage</BodyShort>
					<div>
						<CircleProgressBar size="1.5rem" progress={u.disk.utilization} />
						{(u.disk.utilization * 100).toFixed(1)}% of
						{prettyBytes(u.disk.requested)}
					</div>
				</div>
				<div>
					<BodyShort>CPU</BodyShort>
					<div>
						<CircleProgressBar size="1.5rem" progress={u.cpu.utilization} />
						{(u.cpu.utilization * 100).toFixed(1)}% of
						{u.cpu.requested.toFixed(0)} CPU{$SqlInstances.data.team.serviceUtilization.sqlInstances
							.cpu.requested > 1
							? 's'
							: ''}
					</div>
				</div>
				<div>
					<BodyShort>Memory</BodyShort>
					<div>
						<CircleProgressBar size="1.5rem" progress={u.memory.utilization} />
						{(u.memory.utilization * 100).toFixed(1)}% of
						{prettyBytes(u.memory.requested)}
					</div>
				</div>
			</div>
		</div>
	</div>
{:else}
	<div class="content-wrapper">
		<BodyLong>
			<strong>No Postgres instances found.</strong> Postgres instances provide managed relational
			databases in the cloud.
			<ExternalLink href={docURL('/persistence/postgres')}
				>Learn more about Postgres in Nais and how to get started.</ExternalLink
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

	.utilization {
		display: grid;
		gap: var(--ax-space-6);
		div {
			display: grid;
			gap: var(--ax-space-6);
			div {
				display: flex;
				gap: var(--ax-space-6);
				align-items: center;
			}
		}
	}

	.loading {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 300px;
		width: 100%;
	}
</style>
