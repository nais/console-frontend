<script lang="ts">
	import { page } from '$app/state';
	import { ApplicationOrderField, OrderDirection, graphql } from '$houdini';
	import { docURL } from '$lib/doc';
	import AggregatedCostForApplications from '$lib/domain/cost/AggregatedCostForApplications.svelte';
	import AppListItem from '$lib/domain/list-items/AppListItem.svelte';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import ListV2 from '$lib/ui/ListV2.svelte';
	import OrderByMenu from '$lib/ui/OrderByMenu.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import SearchField from '$lib/ui/SearchField.svelte';
	import StatusFilterPills from '$lib/ui/StatusFilterPills.svelte';
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { BodyLong, Button } from '@nais/ds-svelte-community';
	import { ActionMenu, ActionMenuCheckboxItem } from '@nais/ds-svelte-community/experimental';
	import { ChevronDownIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { Applications, ApplicationsListMetadata, teamSlug } = $derived(data);

	let filter = $state($Applications.variables?.filter?.name ?? '');

	let after: string = $derived($Applications.variables?.after ?? '');
	let before: string = $derived($Applications.variables?.before ?? '');

	const totalApplications = $derived(
		$ApplicationsListMetadata.data?.team.totalApplications.pageInfo.totalCount ?? 0
	);

	const allEnvs = $derived(
		$ApplicationsListMetadata.data?.team.environments.map((env) => env.environment.name) ?? []
	);

	let filteredEnvs = $derived(page.url.searchParams.get('environments')?.split(',') ?? allEnvs);

	$effect(() => {
		const environments = filteredEnvs.length === allEnvs.length ? '' : filteredEnvs.join(',');

		if (environments !== (page.url.searchParams.get('environments') ?? '')) {
			changeQuery({ environments });
		}
	});

	const changeQuery = (
		params: {
			after?: string;
			before?: string;
			newFilter?: string;
			environments?: string;
		} = {}
	) => {
		const currentEnvironments =
			filteredEnvs.length === allEnvs.length ? '' : filteredEnvs.join(',');
		changeParams({
			before: params.before ?? before,
			after: params.after ?? after,
			filter: params.newFilter ?? filter,
			environments: params.environments ?? currentEnvironments
		});
	};

	// TODO: Replace client-side state filtering with server-side filtering once
	// nais/api#429 adds `states` to TeamApplicationsFilter.
	const stateQuery = graphql(`
		query ApplicationStateOverviewV2($team: Slug!) @cache(policy: CacheAndNetwork) {
			team(slug: $team) {
				applications(first: 500) {
					nodes {
						state
					}
					pageInfo {
						totalCount
					}
				}
			}
		}
	`);

	$effect(() => {
		stateQuery.fetch({ variables: { team: teamSlug } });
	});

	let states = $derived.by(() => {
		const nodes = $stateQuery.data?.team?.applications?.nodes ?? [];
		const running = nodes.filter((n) => n.state === 'RUNNING').length;
		const notRunning = nodes.filter((n) => n.state === 'NOT_RUNNING').length;
		const unknown = nodes.filter((n) => n.state === 'UNKNOWN').length;
		return { running, notRunning, unknown };
	});

	let activeStatuses = $state<string[]>(['running', 'not-running', 'unknown']);
</script>

<GraphErrors errors={$Applications.errors} />

<div class="wrapper">
	<div>
		{#if totalApplications > 0}
			{@const apps = $Applications.data?.team.applications}

			<ListV2 title="Apps" count={apps?.pageInfo.totalCount ?? 0}>
				{#snippet search()}
					<SearchField
						value={filter}
						placeholder="Search apps..."
						label="Search applications"
						oninput={(v) => (filter = v)}
						onsubmit={() => changeQuery({ newFilter: filter })}
						onclear={() => {
							filter = '';
							changeQuery({ newFilter: '' });
						}}
					/>
				{/snippet}
				{#snippet filters()}
					<StatusFilterPills
						running={states.running}
						notRunning={states.notRunning}
						unknown={states.unknown}
						{activeStatuses}
						onchange={(s) => (activeStatuses = s)}
					/>
				{/snippet}
				{#snippet menu()}
					<ActionMenu>
						{#snippet trigger(props)}
							<Button
								variant="tertiary-neutral"
								size="small"
								iconPosition="right"
								{...props}
								icon={ChevronDownIcon}
							>
								<span style="font-weight: normal">Environment</span>
							</Button>
						{/snippet}
						<ActionMenuCheckboxItem
							checked={$ApplicationsListMetadata.data?.team.environments.every((env) =>
								filteredEnvs.includes(env.environment.name)
							)
								? true
								: filteredEnvs.length > 0
									? 'indeterminate'
									: false}
							onchange={(checked) => (filteredEnvs = checked ? allEnvs : [])}
						>
							All environments
						</ActionMenuCheckboxItem>
						{#each $ApplicationsListMetadata.data?.team.environments ?? [] as { environment, id } (id)}
							<ActionMenuCheckboxItem
								checked={filteredEnvs.includes(environment.name)}
								onchange={(checked) =>
									(filteredEnvs = checked
										? [...filteredEnvs, environment.name]
										: filteredEnvs.filter((env) => env !== environment.name))}
							>
								{environment.name}
							</ActionMenuCheckboxItem>
						{/each}
					</ActionMenu>
					<OrderByMenu
						orderField={ApplicationOrderField}
						defaultOrderField={ApplicationOrderField.ISSUES}
						defaultOrderDirection={OrderDirection.DESC}
					/>
				{/snippet}
				{#each apps?.nodes ?? [] as app (app.id)}
					{@const stateKey =
						{ RUNNING: 'running', NOT_RUNNING: 'not-running', UNKNOWN: 'unknown' }[app.state] ??
						'unknown'}
					{#if activeStatuses.includes(stateKey)}
						<AppListItem {app} />
					{/if}
				{/each}
			</ListV2>
			<Pagination
				page={apps?.pageInfo}
				loaders={{
					loadPreviousPage: () => {
						changeQuery({ before: apps?.pageInfo.startCursor ?? '', after: '' });
					},
					loadNextPage: () => {
						changeQuery({ after: apps?.pageInfo.endCursor ?? '', before: '' });
					}
				}}
			/>
		{:else}
			<BodyLong><strong>No applications found.</strong></BodyLong>
		{/if}
	</div>
	<div class="right-column">
		<SurfaceCard title="About">
			<BodyLong>
				Applications are long-running processes designed to handle continuous workloads and remain
				active until stopped or restarted.
				<ExternalLink href={docURL('/workloads/application')}
					>Learn more about applications and how to get started.</ExternalLink
				>
			</BodyLong>
		</SurfaceCard>
		{#if totalApplications > 0}
			<SurfaceCard title="Cost">
				<AggregatedCostForApplications {teamSlug} totalCount={totalApplications} />
			</SurfaceCard>
		{/if}
	</div>
</div>

<style>
	.wrapper {
		display: grid;
		grid-template-columns: 1fr 300px;
		gap: var(--spacing-layout);
	}

	.right-column {
		display: grid;
		gap: var(--ax-space-24);
		align-content: start;
	}

	/* Mobile responsive layout */
	@media (max-width: 767px) {
		.wrapper {
			grid-template-columns: 1fr;
			gap: var(--ax-space-24);
		}
	}

	/* Landscape on mobile phones: keep single column despite wider viewport */
	@media (max-height: 500px) {
		.wrapper {
			grid-template-columns: 1fr;
			gap: var(--ax-space-24);
		}
	}
</style>
