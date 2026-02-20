<script lang="ts">
	import List from '$lib/ui/List.svelte';
	import ListItem from '$lib/ui/ListItem.svelte';

	import { OrderDirection, PostgresInstanceOrderField } from '$houdini';
	import { docURL } from '$lib/doc';
	import { envTagVariant } from '$lib/envTagVariant';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import IconLabel from '$lib/ui/IconLabel.svelte';
	import OrderByMenu from '$lib/ui/OrderByMenu.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import TooltipAlignHack from '$lib/ui/TooltipAlignHack.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { BodyLong, Loader } from '@nais/ds-svelte-community';
	import { CircleFillIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let { PostgresInstances } = $derived(data);
</script>

<GraphErrors errors={$PostgresInstances.errors} />

{#if $PostgresInstances.fetching}
	<div class="loading">
		<Loader size="3xlarge" />
	</div>
{:else if $PostgresInstances.data && $PostgresInstances.data.team.postgresInstances.pageInfo.totalCount > 0}
	{@const si = $PostgresInstances.data.team.postgresInstances}

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
						orderField={PostgresInstanceOrderField}
						defaultOrderField={PostgresInstanceOrderField.NAME}
						defaultOrderDirection={OrderDirection.ASC}
					/>
				{/snippet}
				{#each si.nodes as instance (instance.id)}
					<ListItem>
						<div>
							<IconLabel
								as="h4"
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
								{/snippet}
							</IconLabel>
						</div>

						<div class="right">
							<div>Version: <code>{instance.majorVersion}</code></div>
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
