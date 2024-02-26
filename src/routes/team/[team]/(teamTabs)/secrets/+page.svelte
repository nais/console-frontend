<script lang="ts">
	import { page } from '$app/stores';
	import Card from '$lib/Card.svelte';
	import Time from '$lib/Time.svelte';
	import {
		Alert,
		Button,
		Loader,
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

	export let data: PageData;

	$: ({ Secrets } = data);
	$: allSecrets = $Secrets.data?.team.secrets;
	$: environments = $Secrets.data?.team.environments;
	$: team = $page.params.team;

	let createSecretOpen = false;

	const open = () => {
		createSecretOpen = true;
	};
</script>

{#if $Secrets.errors}
	<Alert variant="error">
		{#each $Secrets.errors as error}
			{error.message}
		{/each}
	</Alert>
{:else if $Secrets.fetching}
	<Loader></Loader>
{:else if allSecrets && environments}
	<div class="heading">
		<Button variant="primary" size="small" on:click={open}>
			Create Secret
			<svelte:fragment slot="icon-left">
				<PlusIcon />
			</svelte:fragment>
		</Button>
		<CreateSecret secrets={allSecrets} {environments} {team} bind:open={createSecretOpen} />
	</div>
	<div class="grid">
		{#each environments as environment}
			{@const secrets = allSecrets.filter((s) => s.env.name === environment.name)}
			<Card columns={12}>
				<div class="card-heading">
					<h4>{environment.name}</h4>
				</div>
				<Table size="small" zebraStripes>
					<Thead>
						<Th>Name</Th>
						<Th align="right">Last Modified</Th>
					</Thead>
					<Tbody>
						{#each secrets as secret}
							<Tr>
								<Td>
									<a href="/team/{team}/{environment.name}/secret/{secret.name}">{secret.name}</a>
								</Td>
								<Td align="right">
									{#if secret.lastModifiedAt}
										<Time time={secret.lastModifiedAt} distance />
									{:else}
										<code>n/a</code>
									{/if}
								</Td>
							</Tr>
						{/each}
					</Tbody>
				</Table>
			</Card>
		{/each}
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
