<script lang="ts">
	import { page } from '$app/stores';
	import { PendingValue, SecretOrderField } from '$houdini';
	import Card from '$lib/Card.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import Time from '$lib/Time.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import {
		Button,
		Skeleton,
		Table,
		Tbody,
		Td,
		Th,
		Thead,
		ToggleGroup,
		ToggleGroupItem,
		Tr
	} from '@nais/ds-svelte-community';
	import {
		CheckmarkIcon,
		ChevronLeftIcon,
		ChevronRightIcon,
		PlusIcon,
		XMarkIcon
	} from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';
	import CreateSecret, { type EnvironmentType } from './CreateSecret.svelte';

	export let data: PageData;
	$: ({ Secrets } = data);

	$: team = $page.params.team;

	const varToInUse = (inUse: boolean | undefined | null) => {
		console.log(inUse);
		if (inUse === true) {
			return 'inUse';
		} else if (inUse === false) {
			return 'notInUse';
		}
		return 'all';
	};

	let inUse = varToInUse($Secrets?.variables?.filter?.inUse);
	console.log(inUse);

	const handleInUse = (e: CustomEvent<string>) => {
		changeParams({ filter: e.detail });
	};

	$: tableSort = {
		orderBy: $Secrets.variables?.orderBy?.field,
		direction: $Secrets.variables?.orderBy?.direction
	};

	let createSecretOpen = false;
	let environments: EnvironmentType[];

	$: if ($Secrets.data) {
		environments = $Secrets.data?.team.environments
			.map((env) => {
				if (env == PendingValue) {
					return;
				}
				return {
					name: env.name,
					secrets:
						$Secrets.data?.team.secrets.nodes
							.filter((node) => node !== PendingValue && node.environment.name === env.name)
							.map((node) => {
								if (node === PendingValue) {
									return;
								}
								return {
									name: node.name,
									lastModifiedAt: node.lastModifiedAt ? new Date(node.lastModifiedAt) : null
								};
							}) || []
				};
			})
			.filter((env) => env !== undefined) as EnvironmentType[];
	}

	const tableSortChange = (e: CustomEvent<{ key: string }>) => {
		const { key } = e.detail;
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
	<div class="grid">
		<Card columns={12}>
			<div class="card-heading">
				<h4>Secrets</h4>
				<Button variant="secondary" size="small" on:click={() => open()}>
					Create Secret
					<svelte:fragment slot="icon-left">
						<PlusIcon />
					</svelte:fragment>
				</Button>
			</div>
			<div>
				<div style="padding-bottom: 1rem;">
					<ToggleGroup bind:value={inUse} variant="neutral" size="small" on:change={handleInUse}>
						<ToggleGroupItem value="all">All</ToggleGroupItem>
						<ToggleGroupItem value="inUse">In use</ToggleGroupItem>
						<ToggleGroupItem value="notInUse">Not in use</ToggleGroupItem>
					</ToggleGroup>
				</div>
				<Table
					size="small"
					zebraStripes
					sort={{
						orderBy: tableSort.orderBy || SecretOrderField.NAME,
						direction: tableSort.direction === 'ASC' ? 'ascending' : 'descending'
					}}
					on:sortChange={tableSortChange}
				>
					<Thead>
						<Th sortable={true} sortKey={SecretOrderField.NAME}>Name</Th>
						<Th sortable={true} sortKey={SecretOrderField.ENVIRONMENT}>Environment</Th>
						<Th>In Use</Th>
						<Th align="right" sortable={true} sortKey={SecretOrderField.LAST_MODIFIED_AT}
							>Last Modified</Th
						>
					</Thead>
					<Tbody>
						{#each secrets.nodes as secret}
							{#if secret === PendingValue}
								<Tr>
									<Td><Skeleton variant="text" /></Td>
									<Td>
										<Skeleton variant="text" />
									</Td>
									<Td><Skeleton variant="circle" /></Td>
									<Td>
										<Skeleton variant="text" />
									</Td>
								</Tr>
							{:else}
								<Tr>
									<Td>
										<a href="/team/{team}/{secret.environment.name}/secret/{secret.name}"
											>{secret.name}</a
										>
									</Td>
									<Td>{secret.environment.name}</Td>
									<Td>
										{#if secret.workloads.pageInfo.totalCount > 0}
											<CheckmarkIcon
												style="color: var(--a-surface-success)"
												title="{secret.workloads.pageInfo
													.totalCount} workloads are using this secret"
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
							{/if}
						{:else}
							<Tr><Td colspan={99}>No secrets in this environment</Td></Tr>
						{/each}
					</Tbody>
				</Table>
				{#if secrets.pageInfo !== PendingValue && (secrets.pageInfo.hasPreviousPage || secrets.pageInfo.hasNextPage)}
					<div class="pagination">
						<span>
							{#if secrets.pageInfo.pageStart !== secrets.pageInfo.pageEnd}
								{secrets.pageInfo.pageStart} - {secrets.pageInfo.pageEnd}
							{:else}
								{secrets.pageInfo.pageStart}
							{/if}

							of {secrets.pageInfo.totalCount}
						</span>

						<span style="padding-left: 1rem;">
							<Button
								size="small"
								variant="secondary"
								disabled={!secrets.pageInfo.hasPreviousPage}
								on:click={async () => {
									return await Secrets.loadPreviousPage();
								}}><ChevronLeftIcon /></Button
							>
							<Button
								size="small"
								variant="secondary"
								disabled={!secrets.pageInfo.hasNextPage}
								on:click={async () => {
									return await Secrets.loadNextPage();
								}}
							>
								<ChevronRightIcon /></Button
							>
						</span>
					</div>
				{/if}
			</div></Card
		>
		{#if createSecretOpen}
			<CreateSecret {team} bind:open={createSecretOpen} {environments} />
		{/if}
	</div>
{/if}

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
	}
	h4 {
		margin: 0;
	}

	.card-heading {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.75rem;
	}

	.pagination {
		text-align: right;
		padding: 0.5rem;
	}
</style>
