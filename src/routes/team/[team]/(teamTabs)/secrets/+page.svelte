<script lang="ts">
	import Card from '$lib/Card.svelte';
	import {
		Table,
		Thead,
		Tbody,
		Td,
		Th,
		Button,
		Alert,
		Loader,
		Tooltip,
		Tr
	} from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';
	import { page } from '$app/stores';
	import CreateSecret from './CreateSecret.svelte';
	import { PlusIcon } from '@nais/ds-svelte-community/icons';
	import HumanTime from '$lib/HumanTime.svelte';

	export let data: PageData;

	$: ({ Secrets } = data);
	$: allSecrets = $Secrets.data?.team.secrets;
	$: environments = $Secrets.data?.team.environments;
	$: team = $page.params.team;

	// (obj: Record<string, any>) => obj[key];
	const createSecretOpen: Record<string, boolean> = environments
		? environments.reduce((acc, curr) => ({ ...acc, [curr.name]: false }), {})
		: {};
	const openCreateSecretModal = (env: string) => {
		createSecretOpen[env] = true;
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
	<div class="grid">
		{#each environments as environment}
			{@const secrets = allSecrets.filter((s) => s.env.name === environment.name)}
			<Card columns={12}>
				<div class="heading">
					<h3>{environment.name}</h3>
					<Tooltip content="Create new secret in environment" arrow={false}>
						<Button
							variant="primary"
							size="small"
							on:click={() => openCreateSecretModal(environment.name)}
						>
							Create Secret
							<svelte:fragment slot="icon-left">
								<PlusIcon />
							</svelte:fragment>
						</Button>
					</Tooltip>
				</div>

				<CreateSecret
					refetch={() => Secrets.fetch({})}
					existingNames={secrets.map((s) => s.name)}
					bind:open={createSecretOpen[environment.name]}
					env={environment.name}
					{team}
				/>

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
										<HumanTime time={secret.lastModifiedAt} distance />
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

	.heading {
		display: flex;
		justify-content: space-between;
	}
</style>
