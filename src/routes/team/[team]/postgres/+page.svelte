<script lang="ts">
	import List from '$lib/components/list/List.svelte';
	import ListItem from '$lib/components/list/ListItem.svelte';
	import WorkloadLink from '$lib/components/WorkloadLink.svelte';

	import { SqlInstanceOrderField } from '$houdini';
	import CircleProgressBar from '$lib/components/CircleProgressBar.svelte';
	import ExternalLink from '$lib/components/ExternalLink.svelte';
	import IconLabel from '$lib/components/IconLabel.svelte';
	import OrderByMenu from '$lib/components/OrderByMenu.svelte';
	import PersistenceCost from '$lib/components/persistence/PersistenceCost.svelte';
	import TooltipAlignHack from '$lib/components/TooltipAlignHack.svelte';
	import { docURL } from '$lib/doc';
	import { envTagVariant } from '$lib/envTagVariant';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { BodyLong, BodyShort, Heading } from '@nais/ds-svelte-community';
	import { CircleFillIcon } from '@nais/ds-svelte-community/icons';
	import { endOfYesterday, startOfMonth, subMonths } from 'date-fns';
	import prettyBytes from 'pretty-bytes';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let { SqlInstances } = $derived(data);
</script>

<GraphErrors errors={$SqlInstances.errors} />

{#if $SqlInstances.data && $SqlInstances.data.team.sqlInstances.pageInfo.totalCount > 0}
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
						orderField={{
							NAME: SqlInstanceOrderField.NAME,
							ENVIRONMENT: SqlInstanceOrderField.ENVIRONMENT,
							STATUS: SqlInstanceOrderField.STATUS,
							VERSION: SqlInstanceOrderField.VERSION
						}}
						defaultOrderField={SqlInstanceOrderField.NAME}
					/>
				{/snippet}
				{#each si.nodes as instance (instance.id)}
					<ListItem>
						<div>
							<IconLabel
								level="4"
								href="/team/{instance.team.slug}/{instance.teamEnvironment.environment
									.name}/postgres/{instance.name}"
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
											UNSPECIFIED: 'UNSPECIFIED'
										}[instance.state] ?? ''}
									>
										<CircleFillIcon
											style="color: var(--ax-text-{{
												RUNNABLE: 'success',
												FAILED: 'danger',
												MAINTENANCE: 'warning',
												PENDING_CREATE: 'info',
												PENDING_DELETE: 'info',
												SUSPENDED: 'info',
												UNSPECIFIED: 'info'
											}[instance.state] ?? 'info'}-decoration); font-size: 0.7rem"
										/>
									</TooltipAlignHack>
								{/snippet}
							</IconLabel>
						</div>

						{#if instance.workload}
							<div class="right">
								<div style:display="flex" style:gap="var(--ax-space-6)">
									Owner: <WorkloadLink workload={instance.workload} hideTeam hideEnv />
								</div>
								<div>Version: <code>{instance.version}</code></div>
							</div>
						{/if}
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
					/>
				</div>
			{/if}

			<div class="utilization">
				<Heading level="2" size="small">Utilization</Heading>
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
</style>
