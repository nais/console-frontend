<script lang="ts">
	import { page } from '$app/state';
	import { ActivityLogActivityType, ConfigOrderField } from '$houdini';
	import { docURL } from '$lib/doc';
	import TeamActivityCard from '$lib/domain/activity/TeamActivityCard.svelte';
	import { envTagVariant } from '$lib/envTagVariant';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import List from '$lib/ui/List.svelte';
	import ListItem from '$lib/ui/ListItem.svelte';
	import OrderByMenu from '$lib/ui/OrderByMenu.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import SearchField from '$lib/ui/SearchField.svelte';
	import Time from '$lib/ui/Time.svelte';
	import { getConfigPermissions } from '$lib/utils/configPermissions';
	import { changeParams } from '$lib/utils/searchparams';
	import { Button, Detail, Tag } from '@nais/ds-svelte-community';
	import { FileTextIcon, PlusIcon } from '@nais/ds-svelte-community/icons';
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

	const allUsages = ['inUse', 'notInUse'];
	let activeUsages: string[] = $derived.by(() => {
		const param = page.url.searchParams.get('filter');
		if (param === 'inUse') return ['inUse'];
		if (param === 'notInUse') return ['notInUse'];
		return allUsages;
	});

	const toggleUsage = (key: string) => {
		const next = activeUsages.includes(key)
			? activeUsages.filter((s) => s !== key)
			: [...activeUsages, key];
		if (next.length === 0) return;
		const filter = next.length === allUsages.length ? '' : next[0];
		changeParams({ filter, after: '', before: '' });
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
			<List title="Configs" count={configs.pageInfo.totalCount}>
				{#snippet search()}
					<SearchField
						value={filter}
						placeholder="Filter by name"
						label="Filter configs"
						oninput={(v) => (filter = v)}
						onsubmit={() => changeQuery({ newFilter: filter })}
						onclear={() => {
							filter = '';
							changeQuery({ newFilter: '' });
						}}
					/>
				{/snippet}
				{#snippet filters()}
					<div class="usage-pills">
						<button
							type="button"
							class="pill"
							class:active={activeUsages.includes('inUse')}
							onclick={() => toggleUsage('inUse')}
						>
							In use
						</button>
						<button
							type="button"
							class="pill"
							class:active={activeUsages.includes('notInUse')}
							onclick={() => toggleUsage('notInUse')}
						>
							Not in use
						</button>
					</div>
				{/snippet}
				{#snippet menu()}
					<OrderByMenu orderField={ConfigOrderField} defaultOrderField={ConfigOrderField.NAME} />
				{/snippet}
				{#if configs.nodes.length > 0}
					{#each configs.nodes as config (config.id)}
						<ListItem interactive>
							<div class="name-group">
								<FileTextIcon style="font-size: 1.25rem; flex-shrink: 0" />
								<a
									href="/team/{teamSlug}/{config.teamEnvironment.environment
										.name}/config/{config.name}"
									class="item-name">{config.name}</a
								>
								<Tag size="xsmall" variant={envTagVariant(config.teamEnvironment.environment.name)}
									>{config.teamEnvironment.environment.name}</Tag
								>
							</div>
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
					<ListItem>
						<p>
							No configs found. Configs are used to store configuration data for your applications.
							<ExternalLink href={docURL('/services/config')}
								>Learn more about configs in Nais and how to get started.</ExternalLink
							>
						</p>
					</ListItem>
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
		<div class="right-column">
			<TeamActivityCard
				{teamSlug}
				viewAllHref="/team/{teamSlug}/activity-log"
				filter={{
					activityTypes: [
						ActivityLogActivityType.CONFIG_CREATED,
						ActivityLogActivityType.CONFIG_UPDATED,
						ActivityLogActivityType.CONFIG_DELETED
					]
				}}
			/>
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
		align-items: start;
	}
	.button {
		display: flex;
		justify-content: flex-end;
		margin-bottom: var(--spacing-layout);
	}
	.right-column {
		display: grid;
		gap: var(--ax-space-16);
		align-content: start;
	}
	.right {
		display: flex;
		flex-direction: column;
		align-items: end;
		gap: var(--ax-space-2);
	}

	.usage-pills {
		display: flex;
		gap: var(--ax-space-8);
		align-items: center;
	}

	.pill {
		display: inline-flex;
		align-items: center;
		gap: var(--ax-space-4);
		padding: var(--ax-space-4) var(--ax-space-8);
		border-radius: 9999px;
		font-size: var(--ax-font-size-small);
		font-weight: 500;
		border: 1px solid var(--ax-border-neutral-subtleA);
		cursor: pointer;
		transition:
			background-color 120ms ease,
			border-color 120ms ease,
			opacity 120ms ease;
		line-height: 1.4;
		color: var(--ax-text-subtle);
		background: color-mix(in srgb, var(--ax-neutral-200) 50%, transparent);
	}

	.pill:hover {
		background: color-mix(in srgb, var(--ax-neutral-200) 80%, transparent);
	}

	.pill:not(.active) {
		opacity: 0.5;
	}

	.pill:not(.active):hover {
		opacity: 0.75;
	}

	.pill.active {
		opacity: 1;
		background: color-mix(in srgb, var(--ax-neutral-200) 80%, transparent);
		border-color: var(--ax-text-subtle);
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

	@media (max-width: 767px), (max-height: 500px) {
		.wrapper {
			grid-template-columns: 1fr;
			gap: var(--ax-space-24);
		}
		.button {
			margin-bottom: var(--ax-space-16);
		}
		.right {
			align-items: flex-end;
			margin-top: var(--ax-space-6);
		}
	}
</style>
