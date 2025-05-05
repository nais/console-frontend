<script lang="ts">
	import { page } from '$app/state';
	import { ApplicationOrderField } from '$houdini';
	import AggregatedCostForApplications from '$lib/components/AggregatedCostForApplications.svelte';
	import ExternalLink from '$lib/components/ExternalLink.svelte';
	import AppListItem from '$lib/components/list/AppListItem.svelte';
	import List from '$lib/components/list/List.svelte';
	import OrderByMenu from '$lib/components/OrderByMenu.svelte';
	import { docURL } from '$lib/doc';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { BodyLong, Button, Search } from '@nais/ds-svelte-community';
	import { ActionMenu, ActionMenuCheckboxItem } from '@nais/ds-svelte-community/experimental';
	import { ChevronDownIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$houdini';

	let { data }: PageProps = $props();
	let { Applications } = $derived(data);

	let filter = $state($Applications.variables?.filter?.name ?? '');

	let after: string = $derived($Applications.variables?.after ?? '');
	let before: string = $derived($Applications.variables?.before ?? '');

	const allEnvs = $Applications.data?.team.environments.map((env) => env.environment.name) ?? [];

	let filteredEnvs = $state(
		page.url.searchParams.get('environments') === 'none'
			? []
			: (page.url.searchParams.get('environments')?.split(',') ?? allEnvs)
	);

	$effect(() => {
		const environments =
			filteredEnvs.length === 0
				? 'none'
				: filteredEnvs.length === allEnvs.length
					? ''
					: filteredEnvs.join(',');

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
		changeParams({
			before: params.before ?? before,
			after: params.after ?? after,
			filter: params.newFilter ?? filter,
			environments: params.environments ?? ''
		});
	};
</script>

<GraphErrors errors={$Applications.errors} />

<div class="wrapper">
	<div>
		<BodyLong spacing>
			{#if $Applications.data?.team.totalApplications.pageInfo.totalCount == 0}
				<strong>No applications found.</strong> Applications are long-running processes designed to
				handle continuous workloads and remain active until stopped or restarted.
				<ExternalLink href={docURL('/workloads/application')}
					>Learn more about applications and how to get started.</ExternalLink
				>
			{:else}
				Applications are long-running processes designed to handle continuous workloads and remain
				active until stopped or restarted.
				<ExternalLink href={docURL('/workloads/application')}
					>Learn more about applications.</ExternalLink
				>
			{/if}
		</BodyLong>

		{#if $Applications.data && $Applications.data?.team.totalApplications.pageInfo.totalCount > 0}
			{@const apps = $Applications.data.team.applications}
			<div class="search">
				<form
					onsubmit={(e) => {
						e.preventDefault();
						changeQuery({ newFilter: filter });
					}}
				>
					<Search
						clearButton={false}
						clearButtonLabel="Clear"
						label="filter applications"
						placeholder="Filter by name"
						hideLabel={true}
						size="small"
						variant="simple"
						width="100%"
						autocomplete="off"
						bind:value={filter}
						onclear={() => {
							filter = '';
							changeQuery({ newFilter: '' });
						}}
					/>
				</form>
			</div>
			<List
				title="{apps.pageInfo.totalCount} application{apps.pageInfo.totalCount !== 1 ? 's' : ''}
						{apps.pageInfo.totalCount !== $Applications.data.team.totalApplications.pageInfo.totalCount
					? `(of total ${$Applications.data.team.totalApplications.pageInfo.totalCount})`
					: ''}"
			>
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
							checked={$Applications.data?.team.environments.every((env) =>
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
						{#each $Applications.data?.team.environments ?? [] as { environment, id } (id)}
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
						defaultOrderField={ApplicationOrderField.STATUS}
					/>
				{/snippet}
				{#each apps.nodes as app (app.id)}
					<AppListItem {app} />
				{/each}
			</List>
			<Pagination
				page={apps.pageInfo}
				loaders={{
					loadPreviousPage: () => {
						changeQuery({ before: apps.pageInfo.startCursor ?? '', after: '' });
					},
					loadNextPage: () => {
						changeQuery({ after: apps.pageInfo.endCursor ?? '', before: '' });
					}
				}}
			/>
		{/if}
	</div>
	<div class="right-column">
		{#if $Applications.data?.team.slug}
			{#if $Applications.data?.team.totalApplications.pageInfo.totalCount > 0}
				{@const teamSlug = $Applications.data.team.slug}
				<AggregatedCostForApplications
					{teamSlug}
					totalCount={$Applications.data?.team.totalApplications.pageInfo.totalCount}
				/>
			{/if}
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
		gap: var(--ax-space-24, --a-spacing-6);
	}

	.search {
		display: flex;
		justify-content: flex-end;
		margin-bottom: 1rem;
	}
</style>
