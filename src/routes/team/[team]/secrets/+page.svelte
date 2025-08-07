<script lang="ts">
	import { page } from '$app/state';
	import { SecretOrderField } from '$houdini';
	import SidebarActivity from '$lib/components/activity/SidebarActivity.svelte';
	import IconLabel from '$lib/components/IconLabel.svelte';
	import List from '$lib/components/list/List.svelte';
	import ListItem from '$lib/components/list/ListItem.svelte';
	import OrderByMenu from '$lib/components/OrderByMenu.svelte';
	import { envTagVariant } from '$lib/envTagVariant';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import Time from '$lib/Time.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { Button, Detail } from '@nais/ds-svelte-community';
	import {
		ActionMenu,
		ActionMenuRadioGroup,
		ActionMenuRadioItem
	} from '@nais/ds-svelte-community/experimental';
	import { ChevronDownIcon, PadlockLockedIcon, PlusIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';
	import CreateSecret, { type EnvironmentType } from './CreateSecret.svelte';

	let { data }: PageProps = $props();
	let { Secrets, teamSlug } = $derived(data);

	let usage: 'all' | 'inUse' | 'notInUse' = $derived(
		(page.url.searchParams.get('filter') as 'all' | 'inUse' | 'notInUse') || 'all'
	);

	const handleInUse = (value: string) => {
		const allowed: Array<'all' | 'inUse' | 'notInUse'> = ['all', 'inUse', 'notInUse'];
		if (allowed.includes(value as 'all' | 'inUse' | 'notInUse')) {
			if (value === 'all') {
				changeParams({ filter: '' });
				return;
			}
			changeParams({ filter: value });
		}
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
			<div class="button">
				<Button variant="secondary" size="small" onclick={() => open()} icon={PlusIcon}>
					Create Secret
				</Button>
			</div>
			<div>
				<List
					title="{secrets.pageInfo.totalCount} secret{secrets.pageInfo.totalCount > 1
						? 's'
						: ''} {usage === 'inUse'
						? '(showing only secrets in use)'
						: usage === 'notInUse'
							? '(showing only secrets not in use)'
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
						<OrderByMenu orderField={SecretOrderField} defaultOrderField={SecretOrderField.NAME} />
					{/snippet}
					{#if secrets.nodes.length > 0}
						{#each secrets.nodes as secret (secret.id)}
							<ListItem>
								<IconLabel
									icon={PadlockLockedIcon}
									label={secret.name}
									href="/team/{teamSlug}/{secret.teamEnvironment.environment
										.name}/secret/{secret.name}"
									tag={{
										label: secret.teamEnvironment.environment.name,
										variant: envTagVariant(secret.teamEnvironment.environment.name)
									}}
								/>
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
						<ListItem>No secrets found</ListItem>
					{/if}
				</List>
				<Pagination
					page={secrets.pageInfo}
					loaders={{
						loadPreviousPage: () => {
							Secrets.loadPreviousPage();
						},
						loadNextPage: () => {
							Secrets.loadNextPage();
						}
					}}
				/>
			</div>
		</div>
		<div>
			<SidebarActivity activityLog={$Secrets.data.team} direct={$Secrets.data.team.activityLog} />
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
	}
	.button {
		display: flex;
		justify-content: flex-end;
		margin-bottom: var(--spacing-layout);
	}
	.right {
		display: flex;
		flex-direction: column;
		align-items: end;
		gap: var(--ax-space-2);
	}
</style>
