<script lang="ts">
	import { page } from '$app/stores';
	import Card from '$lib/Card.svelte';
	import Time from '$lib/Time.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import {
		Alert,
		Button,
		Loader,
		Skeleton,
		Table,
		Tbody,
		Td,
		Th,
		Thead,
		Tr
	} from '@nais/ds-svelte-community';
	import { PlusIcon } from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';
	import CreateSecret from './CreateSecret.svelte';
	import { PendingValue } from '$houdini';

	export let data: PageData;

	$: ({ Secrets } = data);
	$: environments = $Secrets.data?.team.environments;
	$: team = $page.params.team;

	let createSecretOpen = false;

	const open = () => {
		createSecretOpen = true;
	};
</script>

{#if $Secrets.errors}
	<GraphErrors errors={$Secrets.errors} />
{:else}
	<div class="heading">
		<Button variant="primary" size="small" on:click={open}>
			Create Secret
			<svelte:fragment slot="icon-left">
				<PlusIcon />
			</svelte:fragment>
		</Button>
	</div>
	<div class="grid">
		{#if environments !== undefined}
			{#each environments as environment}
				<Card columns={12}>
					<div class="card-heading">
						<h4>
							{#if environment.name === PendingValue}
								<Skeleton variant="text" />
							{:else}
								{environment.name}
							{/if}
						</h4>
					</div>
					<Table size="small" zebraStripes>
						<Thead>
							<Th>Name</Th>
							<Th align="right">Last Modified</Th>
						</Thead>
						<Tbody>
							{#each environment.secrets as secret}
								<Tr>
									<Td>
										{#if secret === PendingValue || environment.name === PendingValue}
											<Skeleton variant="text" />
										{:else}
											<a href="/team/{team}/{environment.name}/secret/{secret.name}"
												>{secret.name}</a
											>
										{/if}
									</Td>
									<Td align="right">
										{#if secret === PendingValue}
											<Skeleton variant="text" />
										{:else if secret.lastModifiedAt}
											<Time time={secret.lastModifiedAt} distance />
										{:else}
											<code>n/a</code>
										{/if}
									</Td>
								</Tr>
							{:else}
								<Tr><Td colspan={99}>No secrets in this environment</Td></Tr>
							{/each}
						</Tbody>
					</Table>
				</Card>
				<!-- {#if allSecrets && environments && allSecrets[0].name !== PendingValue && environments[0].name !== PendingValue}
					<CreateSecret secrets={allSecrets} {environments} {team} bind:open={createSecretOpen} />
				{/if} -->
			{/each}
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

	.card-heading {
		display: flex;
		justify-content: space-between;
	}

	.heading {
		display: flex;
		justify-content: flex-end;
		margin-bottom: 1rem;
	}
</style>
