<script lang="ts">
	import { page } from '$app/state';
	import { ConfigOrderField } from '$houdini';
	import SidebarActivity from '$lib/domain/activity/sidebar/SidebarActivity.svelte';
	import { envTagVariant } from '$lib/envTagVariant';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import IconLabel from '$lib/ui/IconLabel.svelte';
	import List from '$lib/ui/List.svelte';
	import ListItem from '$lib/ui/ListItem.svelte';
	import OrderByMenu from '$lib/ui/OrderByMenu.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import Time from '$lib/ui/Time.svelte';
	import { getConfigPermissions } from '$lib/utils/configPermissions';
	import { changeParams } from '$lib/utils/searchparams';
	import { Button, Detail, Search } from '@nais/ds-svelte-community';
	import {
		ActionMenu,
		ActionMenuRadioGroup,
		ActionMenuRadioItem
	} from '@nais/ds-svelte-community/experimental';
	import { ChevronDownIcon, FileTextIcon, PlusIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';
	import CreateConfig, { type EnvironmentType } from './CreateConfig.svelte';

	let { data }: PageProps = $props();
	let { Configs, teamSlug } = $derived(data);
	let viewerIsMember = $derived($Configs.data?.team.viewerIsMember ?? false);
	let isAdmin = $derived(
		$Configs.data?.me?.__typename === 'User' ? $Configs.data.me.isAdmin : false
	);
	let permissions = $derived(getConfigPermissions(viewerIsMember, isAdmin));
	let canMutate = $derived(permissions.canMutate);

	let filter = $state(page.url.searchParams.get('nameFilter') ?? '');

	let after: string = $derived($Configs.variables?.after ?? '');
	let before: string = $derived($Configs.variables?.before ?? '');

	let usage: 'all' | 'inUse' | 'notInUse' = $derived(
		(page.url.searchParams.get('filter') as 'all' | 'inUse' | 'notInUse') || 'all'
	);

	const handleInUse = (value: string) => {
		const allowed: Array<'all' | 'inUse' | 'notInUse'> = ['all', 'inUse', 'notInUse'];
		if (allowed.includes(value as 'all' | 'inUse' | 'notInUse')) {
			if (value === 'all') {
				changeParams({ filter: '', before: '', after: '' });
				return;
			}
			changeParams({ filter: value, before: '', after: '' });
		}
	};

	const changeQuery = (
		params: {
			after?: string;
			before?: string;
			newFilter?: string;
		} = {}
	) => {
		changeParams({
			before: params.before ?? before,
			after: params.after ?? after,
			nameFilter: params.newFilter ?? filter
		});
	};

	let createConfigOpen = $state(false);

	const environments = $derived.by(() => {
		return (
			$Configs.data?.team.environments
				.map((env) => {
					return {
						name: env.environment.name,
						configs:
							$Configs.data?.team.configs.nodes
								.filter((node) => node.teamEnvironment.environment.name === env.environment.name)
								.map((node) => {
									return {
										name: node.name,
										lastModifiedAt: node.lastModifiedAt ? new Date(node.lastModifiedAt) : null
									};
								}) || []
					};
				})
				.filter((env) => env !== undefined) ?? ([] as EnvironmentType[])
		);
	});

	const open = () => {
		createConfigOpen = true;
	};
</script>

{#if $Configs.errors}
	<GraphErrors errors={$Configs.errors} />
{:else if $Configs.data}
	{@const configs = $Configs.data.team.configs}
	<div class="wrapper">
		<div>
			{#if canMutate}
				<div class="button">
					<Button variant="secondary" size="small" onclick={() => open()} icon={PlusIcon}>
						Create Config
					</Button>
				</div>
			{/if}
			<div class="search">
				<form
					onsubmit={(e) => {
						e.preventDefault();
						changeQuery({ newFilter: filter });
					}}
				>
					<Search
						clearButton={true}
						clearButtonLabel="Clear"
						label="filter configs"
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
			<div>
				<List
					title="{configs.pageInfo.totalCount} config{configs.pageInfo.totalCount > 1
						? 's'
						: ''} {usage === 'inUse'
						? '(showing only configs in use)'
						: usage === 'notInUse'
							? '(showing only configs not in use)'
							: ''}"
				>
					{#snippet menu()}
						<div class="configs-list-menu">
							<ActionMenu>
								{#snippet trigger(props)}
									<Button
										variant="tertiary-neutral"
										size="small"
										iconPosition="right"
										{...props}
										icon={ChevronDownIcon}
									>
										<span style="font-weight: normal">Usage</span>
									</Button>
								{/snippet}
								<ActionMenuRadioGroup label="Filter by usage" value={usage}>
									<ActionMenuRadioItem value="all" onselect={() => handleInUse('all')}
										>All</ActionMenuRadioItem
									>
									<ActionMenuRadioItem value="inUse" onselect={() => handleInUse('inUse')}
										>In use</ActionMenuRadioItem
									>
									<ActionMenuRadioItem value="notInUse" onselect={() => handleInUse('notInUse')}
										>Not in use</ActionMenuRadioItem
									>
								</ActionMenuRadioGroup>
							</ActionMenu>
							<OrderByMenu
								orderField={ConfigOrderField}
								defaultOrderField={ConfigOrderField.NAME}
							/>
						</div>
					{/snippet}
					{#if configs.nodes.length > 0}
						{#each configs.nodes as config (config.id)}
							<ListItem>
								<IconLabel
									icon={FileTextIcon}
									label={config.name}
									href="/team/{teamSlug}/{config.teamEnvironment.environment
										.name}/config/{config.name}"
									tag={{
										label: config.teamEnvironment.environment.name,
										variant: envTagVariant(config.teamEnvironment.environment.name)
									}}
								/>
								<div class="right">
									{#if config.workloads.pageInfo.totalCount > 0}
										<Detail
											>Config is in use by {config.workloads.pageInfo.totalCount} workload{config
												.workloads.pageInfo.totalCount > 1
												? 's'
												: ''}</Detail
										>
									{:else}
										<Detail>Config is not in use</Detail>
									{/if}
									<Detail
										>Last modified:
										{#if config.lastModifiedAt}
											<Time time={config.lastModifiedAt} distance />
										{:else}
											<code>n/a</code>
										{/if}
									</Detail>
								</div>
							</ListItem>
						{/each}
					{:else}
						<ListItem>No configs found</ListItem>
					{/if}
				</List>
				<Pagination
					page={configs.pageInfo}
					loaders={{
						loadPreviousPage: () => {
							changeQuery({ before: configs.pageInfo.startCursor ?? '', after: '' });
						},
						loadNextPage: () => {
							changeQuery({ after: configs.pageInfo.endCursor ?? '', before: '' });
						}
					}}
				/>
			</div>
		</div>
		<div style="margin-top: var(--spacing-layout);">
			<SidebarActivity activityLog={$Configs.data.team} direct={$Configs.data.team.activityLog} />
		</div>
	</div>
	{#if createConfigOpen}
		<CreateConfig team={teamSlug} bind:open={createConfigOpen} {environments} />
	{/if}
{/if}

<style>
	.wrapper {
		display: grid;
		grid-template-columns: 1fr 300px;
		gap: var(--spacing-layout);
	}
	.button {
		display: flex;
		justify-content: flex-end;
		margin-bottom: var(--spacing-layout);
	}
	.search {
		display: flex;
		justify-content: flex-end;
		margin-bottom: 1rem;
	}
	.right {
		display: flex;
		flex-direction: column;
		align-items: end;
		gap: var(--ax-space-2);
	}

	/* Mobile responsive layout */
	@media (max-width: 767px), (max-height: 500px) {
		.wrapper {
			grid-template-columns: 1fr;
			gap: var(--ax-space-24);
		}
		.search {
			justify-content: stretch;
		}
		.button {
			margin-bottom: var(--ax-space-16);
		}
		.right {
			align-items: flex-end;
			margin-top: var(--ax-space-6);
		}

		.configs-list-menu {
			display: flex;
			gap: var(--ax-space-8);
			flex-wrap: nowrap;
			overflow-x: auto;
			max-width: 100%;
		}

		.configs-list-menu > * {
			flex: 0 0 auto;
		}
	}
</style>
