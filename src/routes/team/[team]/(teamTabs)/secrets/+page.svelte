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
	import type { Secrets$result } from '$houdini';
	import { page } from '$app/stores';
	import CreateSecret from './CreateSecret.svelte';
	import { PlusIcon } from '@nais/ds-svelte-community/icons';
	import HumanTime from '$lib/HumanTime.svelte';
	import { parseISO } from 'date-fns';

	export let data: PageData;
	let team = $page.params.team;

	let update: {
		env: {
			name: string;
		};
		secrets: {
			name: string;
			lastModifiedAt?: string;
		}[];
	}[] = [];

	$: ({ Secrets } = data);
	$: mkUpdate($Secrets.data?.team.secrets);
	let mkUpdate = (secret: Secrets$result['team']['secrets'] | undefined | null) => {
		if (!secret) {
			return;
		}

		update = JSON.parse(JSON.stringify(secret));
	};

	// (obj: Record<string, any>) => obj[key];
	let createSecretOpen = update
		? update.reduce(
				(acc: Record<string, boolean>, curr) => ({
					...acc,
					[curr.env.name]: false
				}),
				{}
		  )
		: {};
	let openCreateSecretModal = (env: string) => {
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
{:else}
	<div class="grid">
		{#each update as secrets}
			{@const env = secrets.env.name}
			<Card columns={12}>
				<div class="heading">
					<h3>{env}</h3>
					<Tooltip content="Create new secret in environment" arrow={false}>
						<Button variant="tertiary" size="small" on:click={() => openCreateSecretModal(env)}>
							Create Secret
							<svelte:fragment slot="icon-left">
								<PlusIcon />
							</svelte:fragment>
						</Button>
					</Tooltip>
				</div>

				<CreateSecret
					refetch={() => Secrets.fetch({})}
					existingNames={secrets.secrets.map((s) => s.name)}
					bind:open={createSecretOpen[env]}
					bind:team
					{env}
				/>

				<Table size="small">
					<Thead>
						<Th>Name</Th>
						<Th align="right">Last Modified</Th>
					</Thead>
					<Tbody>
						{#each secrets.secrets as secret}
							<Tr>
								<Td>
									<a href="/team/{team}/{env}/secret/{secret.name}">{secret.name}</a>
								</Td>
								<Td align="right">
									{#if secret.lastModifiedAt}
										<HumanTime time={parseISO(secret.lastModifiedAt)} distance />
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
