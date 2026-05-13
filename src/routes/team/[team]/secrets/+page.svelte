<script lang="ts">
	import { page } from '$app/state';
	import { ActivityLogActivityType, SecretOrderField } from '$houdini';
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
	import { changeParams } from '$lib/utils/searchparams';
	import { getSecretPermissions } from '$lib/utils/secretPermissions';
	import { Button, Detail, Tag } from '@nais/ds-svelte-community';
	import { PadlockLockedIcon, PlusIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';
	import CreateSecret, { type EnvironmentType } from './CreateSecret.svelte';

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
	<div class="wrapper">
		<div>
			{#if canMutate}
				<div class="button">
					<Button variant="secondary" size="small" onclick={() => open()} icon={PlusIcon}>
						Create Secret
					</Button>
				</div>
			{/if}
			<List title="Secrets" count={secrets.pageInfo.totalCount}>
				{#snippet search()}
					<SearchField
						value={filter}
						placeholder="Filter by name"
						label="Filter secrets"
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
					<OrderByMenu orderField={SecretOrderField} defaultOrderField={SecretOrderField.NAME} />
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
		<div class="right-column">
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
