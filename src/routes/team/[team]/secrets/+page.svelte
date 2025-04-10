<script lang="ts">
	import { page } from '$app/state';
	import { SecretOrderField } from '$houdini';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import Time from '$lib/Time.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import {
		Button,
		Table,
		Tbody,
		Td,
		Th,
		Thead,
		ToggleGroup,
		ToggleGroupItem,
		Tr
	} from '@nais/ds-svelte-community';
	import { CheckmarkIcon, PlusIcon, XMarkIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$houdini';
	import CreateSecret, { type EnvironmentType } from './CreateSecret.svelte';

	let { data }: PageProps = $props();
	let { Secrets, teamSlug } = $derived(data);

	const handleInUse = (value: string) => {
		if (value === 'all') {
			changeParams({ filter: '' });
			return;
		}
		changeParams({ filter: value });
	};

	let tableSort = $derived({
		orderBy: $Secrets.variables?.orderBy?.field,
		direction: $Secrets.variables?.orderBy?.direction
	});

	let createSecretOpen = $state(false);
	let environments: EnvironmentType[] = $state([]);

	$effect(() => {
		if ($Secrets.data) {
			environments = $Secrets.data?.team.environments
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
				.filter((env) => env !== undefined) as EnvironmentType[];
		}
	});

	const tableSortChange = (key: string) => {
		if (key === tableSort.orderBy) {
			const direction = tableSort.direction === 'ASC' ? 'DESC' : 'ASC';
			tableSort.direction = direction;
		} else {
			tableSort.orderBy = SecretOrderField[key as keyof typeof SecretOrderField];
			tableSort.direction = 'ASC';
		}

		changeParams({
			direction: tableSort.direction ? tableSort.direction : 'ASC',
			field: tableSort.orderBy || SecretOrderField.NAME
		});
	};

	const open = () => {
		createSecretOpen = true;
	};
</script>

{#if $Secrets.errors}
	<GraphErrors errors={$Secrets.errors} />
{:else if $Secrets.data}
	{@const secrets = $Secrets.data.team.secrets}

	<div class="button">
		<Button variant="secondary" size="small" onclick={() => open()} icon={PlusIcon}>
			Create Secret
		</Button>
	</div>
	<div>
		<div style="padding-bottom: 1rem;">
			<ToggleGroup
				value={page.url.searchParams.get('filter') || 'all'}
				size="small"
				onchange={handleInUse}
			>
				<ToggleGroupItem value="all">All</ToggleGroupItem>
				<ToggleGroupItem value="inUse">In use</ToggleGroupItem>
				<ToggleGroupItem value="notInUse">Not in use</ToggleGroupItem>
			</ToggleGroup>
		</div>
		<Table
			size="small"
			sort={{
				orderBy: tableSort.orderBy || SecretOrderField.NAME,
				direction: tableSort.direction === 'ASC' ? 'ascending' : 'descending'
			}}
			onsortchange={tableSortChange}
		>
			<Thead>
				<Tr>
					<Th sortable={true} sortKey={SecretOrderField.NAME}>Name</Th>
					<Th sortable={true} sortKey={SecretOrderField.ENVIRONMENT}>Environment</Th>
					<Th>In Use</Th>
					<Th align="right" sortable={true} sortKey={SecretOrderField.LAST_MODIFIED_AT}
						>Last Modified</Th
					>
				</Tr>
			</Thead>
			<Tbody>
				{#each secrets.nodes as secret (secret.id)}
					<Tr>
						<Td>
							<a
								href="/team/{teamSlug}/{secret.teamEnvironment.environment
									.name}/secret/{secret.name}">{secret.name}</a
							>
						</Td>
						<Td>{secret.teamEnvironment.environment.name}</Td>
						<Td>
							{#if secret.workloads.pageInfo.totalCount > 0}
								<CheckmarkIcon
									style="color: var(--a-surface-success)"
									title="{secret.workloads.pageInfo.totalCount} workloads are using this secret"
								/>
							{:else}
								<XMarkIcon
									style="color: var(--a-surface-danger)"
									title="No workloads are using this secret"
								/>
							{/if}
						</Td>
						<Td align="right">
							{#if secret.lastModifiedAt}
								<Time time={secret.lastModifiedAt} distance />
							{:else}
								<code>n/a</code>
							{/if}
						</Td>
					</Tr>
				{:else}
					<Tr><Td colspan={99}>No secrets for team</Td></Tr>
				{/each}
			</Tbody>
		</Table>
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
	{#if createSecretOpen}
		<CreateSecret team={teamSlug} bind:open={createSecretOpen} {environments} />
	{/if}
{/if}

<style>
	.button {
		display: flex;
		justify-content: flex-end;
	}
</style>
