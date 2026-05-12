<script lang="ts">
	import List from '$lib/ui/List.svelte';
	import ListItem from '$lib/ui/ListItem.svelte';

	import { OrderDirection, PostgresInstanceOrderField } from '$houdini';
	import { docURL } from '$lib/doc';
	import { envTagVariant } from '$lib/envTagVariant';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import OrderByMenu from '$lib/ui/OrderByMenu.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import TooltipAlignHack from '$lib/ui/TooltipAlignHack.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { Alert, Loader, Tag } from '@nais/ds-svelte-community';
	import { CircleFillIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let { PostgresInstances } = $derived(data);
	let hasCloudSql = $derived(
		($PostgresInstances.data?.team.inventoryCounts.sqlInstances.total ?? 0) > 0
	);
	let cloudSqlTeamSlug = $derived($PostgresInstances.data?.team.slug ?? data.teamSlug);
</script>

<GraphErrors errors={$PostgresInstances.errors} />

{#snippet cloudSqlRelocationAlert()}
	{#if hasCloudSql}
		<Alert variant="info" size="small" style="margin-bottom: 1rem;">
			Postgres instances running in Cloud SQL have moved to a new page. You can find them on
			<a href="/team/{cloudSqlTeamSlug}/cloudsql">Cloud SQL</a>.
		</Alert>
	{/if}
{/snippet}

{#if $PostgresInstances.fetching}
	<div class="loading">
		<Loader size="3xlarge" />
	</div>
{:else if $PostgresInstances.data}
	{@const si = $PostgresInstances.data.team.postgresInstances}

	<div class="content-wrapper">
		<div>
			{@render cloudSqlRelocationAlert()}

			<List title="Postgres" count={si.pageInfo.totalCount}>
				{#snippet menu()}
					<OrderByMenu
						orderField={PostgresInstanceOrderField}
						defaultOrderField={PostgresInstanceOrderField.NAME}
						defaultOrderDirection={OrderDirection.ASC}
					/>
				{/snippet}
				{#if si.nodes.length > 0}
					{#each si.nodes as instance (instance.id)}
						<ListItem interactive>
							<div class="name-group">
								<TooltipAlignHack
									content={{
										DEGRADED: 'DEGRADED',
										PROGRESSING: 'PROGRESSING',
										AVAILABLE: 'AVAILABLE'
									}[instance.state] ?? ''}
								>
									<CircleFillIcon
										style="color: var({{
											AVAILABLE: '--ax-bg-success-strong',
											DEGRADED: '--ax-bg-danger-strong',
											PROGRESSING: '--ax-bg-warning-moderate-pressed'
										}[instance.state] ?? '--ax-bg-info-strong'}); font-size: 0.7rem"
									/>
								</TooltipAlignHack>
								<a
									href="/team/{instance.team.slug}/{instance.teamEnvironment.environment
										.name}/postgres/{instance.name}"
									class="item-name">{instance.name}</a
								>
								<Tag
									size="xsmall"
									variant={envTagVariant(instance.teamEnvironment.environment.name)}
									>{instance.teamEnvironment.environment.name}</Tag
								>
							</div>

							<div class="right">
								<div>Version: <code>{instance.majorVersion}</code></div>
							</div>
						</ListItem>
					{/each}
				{:else}
					<ListItem>
						<p>
							No Postgres instances found. Postgres instances provide managed relational databases
							in the cloud.
							<ExternalLink href={docURL('/persistence/postgresql')}
								>Learn more about Postgres in Nais and how to get started.</ExternalLink
							>
						</p>
					</ListItem>
				{/if}
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

	/* Mobile responsive layout */
	@media (max-width: 767px), (max-height: 500px) {
		.content-wrapper {
			grid-template-columns: 1fr;
		}
		.right {
			align-items: flex-end;
			margin-top: var(--ax-space-6);
		}
	}

	.name-group {
		display: flex;
		align-items: center;
		gap: var(--ax-space-8);
		min-width: 0;
	}
	.name-group :global(.aksel-tag) {
		white-space: nowrap;
		flex-shrink: 0;
	}
	.item-name {
		color: var(--ax-text-neutral);
		text-decoration: none;
		font-weight: 500;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		min-width: 0;
		flex: 0 1 auto;
	}
	.item-name:hover {
		text-decoration: underline;
	}
</style>
