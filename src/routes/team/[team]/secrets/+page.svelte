<script lang="ts">
	import { page } from '$app/state';
	import { ActivityLogActivityType, OrderDirection, SecretOrderField } from '$houdini';
	import { docURL } from '$lib/doc';
	import TeamActivityCard from '$lib/domain/activity/TeamActivityCard.svelte';
	import { envTagVariant } from '$lib/envTagVariant';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import List from '$lib/ui/List.svelte';
	import ListFilters from '$lib/ui/ListFilters.svelte';
	import ListItem from '$lib/ui/ListItem.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import Time from '$lib/ui/Time.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { getSecretPermissions } from '$lib/utils/secretPermissions';
	import { Button, Detail, Tag } from '@nais/ds-svelte-community';
	import { PadlockLockedIcon, PlusIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';
	import CreateSecret, { type EnvironmentType } from './CreateSecret.svelte';

	type SecretOrderFieldOptions = (typeof SecretOrderField)[keyof typeof SecretOrderField];
	type OrderDirectionOptions = (typeof OrderDirection)[keyof typeof OrderDirection];

	let { data }: PageProps = $props();
	let { Secrets, teamSlug } = $derived(data);
	let viewerIsMember = $derived($Secrets.data?.team.viewerIsMember ?? false);
	let isAdmin = $derived(
		$Secrets.data?.me?.__typename === 'User' ? $Secrets.data.me.isAdmin : false
	);
	let permissions = $derived(getSecretPermissions(viewerIsMember, isAdmin));
	let canMutate = $derived(permissions.canMutate);

	let filter = $state(page.url.searchParams.get('nameFilter') ?? '');

	let after: string = $derived($Secrets.variables?.after ?? '');
	let before: string = $derived($Secrets.variables?.before ?? '');

	const inUseFilter = $derived(page.url.searchParams.get('inUse'));
	const selectedEnvironments: string[] = $derived(
		page.url.searchParams.get('environments')?.split(',').filter(Boolean) ?? []
	);

	const inUseFacets = $derived($Secrets.data?.team.secrets.facets?.inUse ?? []);
	const environmentFacets = $derived($Secrets.data?.team.secrets.facets?.environments ?? []);
	const availableEnvironments = $derived(new Set(environmentFacets.map((f) => f.value)));

	function toggleInUse(value: string) {
		const next = inUseFilter === value ? '' : value;
		changeParams({ inUse: next, after: '', before: '' }, { noScroll: true });
	}

	function toggleEnvironment(env: string) {
		const isSelected = selectedEnvironments.includes(env);
		const next = isSelected
			? selectedEnvironments.filter((e) => e !== env && availableEnvironments.has(e))
			: [...selectedEnvironments.filter((e) => availableEnvironments.has(e)), env];
		changeParams({ environments: next.join(','), after: '', before: '' }, { noScroll: true });
	}

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
			nameFilter: params.newFilter ?? filter,
			environments: selectedEnvironments.join(',')
		});
	};

	const sortFields: { value: SecretOrderFieldOptions; label: string }[] = [
		{ value: SecretOrderField.NAME, label: 'Name' },
		{ value: SecretOrderField.ENVIRONMENT, label: 'Environment' },
		{ value: SecretOrderField.LAST_MODIFIED_AT, label: 'Last modified' }
	];

	const currentSortField: SecretOrderFieldOptions = $derived(
		(Object.values(SecretOrderField).find((f) =>
			page.url.searchParams.get('sort')?.startsWith(f)
		) as SecretOrderFieldOptions | undefined) ?? SecretOrderField.NAME
	);

	const currentSortDirection: OrderDirectionOptions = $derived(
		(Object.values(OrderDirection).find((d) => page.url.searchParams.get('sort')?.endsWith(d)) as
			| OrderDirectionOptions
			| undefined) ?? OrderDirection.ASC
	);

	function setSort(field: SecretOrderFieldOptions) {
		const defaultDirection =
			field === SecretOrderField.NAME || field === SecretOrderField.ENVIRONMENT
				? OrderDirection.ASC
				: OrderDirection.DESC;
		const direction =
			field === currentSortField
				? currentSortDirection === OrderDirection.ASC
					? OrderDirection.DESC
					: OrderDirection.ASC
				: defaultDirection;
		changeParams({ sort: `${field}-${direction}`, after: '', before: '' });
	}

	let createSecretOpen = $state(false);

	const environments = $derived.by(() => {
		return (
			$Secrets.data?.team.environments
				.map((env) => {
					return {
						name: env.environment.name,
						secrets:
							$Secrets.data?.team.secrets.nodes
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
		createSecretOpen = true;
	};
</script>

{#if $Secrets.errors}
	<GraphErrors errors={$Secrets.errors} />
{:else if $Secrets.data}
	{@const secrets = $Secrets.data.team.secrets}
	<div class="layout-two-column">
		<div>
			<List title="Secrets" count={secrets.pageInfo.totalCount}>
				{#snippet actions()}
					{#if canMutate}
						<Button variant="secondary" size="small" onclick={() => open()} icon={PlusIcon}>
							Create Secret
						</Button>
					{/if}
				{/snippet}
				{#if secrets.nodes.length > 0}
					{#each secrets.nodes as secret (secret.id)}
						<ListItem interactive>
							<div class="name-group">
								<PadlockLockedIcon style="font-size: 1.25rem; flex-shrink: 0" />
								<a
									href="/team/{teamSlug}/{secret.teamEnvironment.environment
										.name}/secret/{secret.name}"
									class="item-name">{secret.name}</a
								>
								<Tag size="xsmall" variant={envTagVariant(secret.teamEnvironment.environment.name)}
									>{secret.teamEnvironment.environment.name}</Tag
								>
							</div>
							<div class="right">
								{#if secret.workloads.pageInfo.totalCount > 0}
									<Detail
										>Secret is in use by {secret.workloads.pageInfo.totalCount} workload{secret
											.workloads.pageInfo.totalCount > 1
											? 's'
											: ''}</Detail
									>
								{:else}
									<Detail>Secret is not in use</Detail>
								{/if}
								<Detail
									>Last modified:
									{#if secret.lastModifiedAt}
										<Time time={secret.lastModifiedAt} distance />
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
							No secrets found. Secrets are used to store sensitive data for your applications.
							<ExternalLink href={docURL('/services/secrets')}
								>Learn more about secrets in Nais and how to get started.</ExternalLink
							>
						</p>
					</ListItem>
				{/if}
			</List>
			<Pagination
				page={secrets.pageInfo}
				loaders={{
					loadPreviousPage: () => {
						changeQuery({ before: secrets.pageInfo.startCursor ?? '', after: '' });
					},
					loadNextPage: () => {
						changeQuery({ after: secrets.pageInfo.endCursor ?? '', before: '' });
					}
				}}
			/>
		</div>
		<div class="layout-sidebar" style="gap: var(--ax-space-16)">
			<SurfaceCard title="Filters">
				<ListFilters
					{filter}
					searchPlaceholder="Filter by name"
					searchLabel="Filter secrets"
					{sortFields}
					{currentSortField}
					{currentSortDirection}
					onFilterInput={(v) => (filter = v)}
					onFilterSubmit={() => changeQuery({ newFilter: filter })}
					onFilterClear={() => {
						filter = '';
						changeQuery({ newFilter: '' });
					}}
					onSort={(field) => setSort(field as SecretOrderFieldOptions)}
				>
					{#if environmentFacets.length > 0}
						<details class="filter-section" open>
							<summary class="section-heading">Environments</summary>
							<div class="facet-list">
								{#each environmentFacets as facet (facet.value)}
									<label class="facet-item">
										<input
											type="checkbox"
											checked={selectedEnvironments.includes(facet.value)}
											onchange={() => toggleEnvironment(facet.value)}
										/>
										<span class="facet-label">{facet.value}</span>
										<span class="facet-count">{facet.count}</span>
									</label>
								{/each}
							</div>
						</details>
					{/if}
					{#if inUseFacets.length > 0}
						<details class="filter-section" open>
							<summary class="section-heading">Usage</summary>
							<div class="facet-list">
								{#each inUseFacets as facet (String(facet.value))}
									<label class="facet-item">
										<input
											type="checkbox"
											checked={inUseFilter === String(facet.value)}
											onchange={() => toggleInUse(String(facet.value))}
										/>
										<span class="facet-label">{facet.value ? 'In use' : 'Not in use'}</span>
										<span class="facet-count">{facet.count}</span>
									</label>
								{/each}
							</div>
						</details>
					{/if}
				</ListFilters>
			</SurfaceCard>
			<TeamActivityCard
				{teamSlug}
				viewAllHref="/team/{teamSlug}/activity-log"
				filter={{
					activityTypes: [
						ActivityLogActivityType.SECRET_CREATED,
						ActivityLogActivityType.SECRET_VALUE_ADDED,
						ActivityLogActivityType.SECRET_VALUE_UPDATED,
						ActivityLogActivityType.SECRET_VALUE_REMOVED,
						ActivityLogActivityType.SECRET_DELETED,
						ActivityLogActivityType.SECRET_VALUES_VIEWED
					]
				}}
			/>
		</div>
	</div>
	{#if createSecretOpen}
		<CreateSecret team={teamSlug} bind:open={createSecretOpen} {environments} />
	{/if}
{/if}

<style>
	.right {
		display: flex;
		flex-direction: column;
		align-items: end;
		gap: var(--ax-space-2);
	}

	@media (max-width: 767px), (max-height: 500px) {
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
