<script lang="ts">
	import { page } from '$app/stores';
	import { AuditEventResourceType, PendingValue, type Secrets$result } from '$houdini';
	import Card from '$lib/Card.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import Time from '$lib/Time.svelte';
	import { Button, Skeleton, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import { PlusIcon } from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';
	import CreateSecret, { type EnvironmentType } from './CreateSecret.svelte';
	import ActivityLog from '$lib/components/ActivityLog.svelte';

	export let data: PageData;

	$: ({ Secrets } = data);
	$: environments = $Secrets.data?.team.environments;
	$: team = $page.params.team;

	let createSecretOpen = false;
	let selectedEnvironment: EnvironmentType;

	const open = (env: Secrets$result['team']['environments'][0]) => {
		if (env.name === PendingValue) return;
		selectedEnvironment = env;
		createSecretOpen = true;
	};
</script>

{#if $Secrets.errors}
	<GraphErrors errors={$Secrets.errors} />
{:else}
	<div class="grid">
		{#if environments !== undefined}
			{#each environments as environment}
				<Card columns={12}>
					<div class="card-heading">
						<h4>
							{#if environment.name === PendingValue}
								<Skeleton variant="text" style="width: 100px" />
							{:else}
								{environment.name}
							{/if}
						</h4>
						<Button
							variant="secondary"
							size="small"
							on:click={() => open(environment)}
							disabled={environment.name === PendingValue}
						>
							Create Secret
							<svelte:fragment slot="icon-left">
								<PlusIcon />
							</svelte:fragment>
						</Button>
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
				{#if createSecretOpen}
					<CreateSecret environment={selectedEnvironment} {team} bind:open={createSecretOpen} />
				{/if}
			{/each}
		{/if}
		<ActivityLog teamName={team} resourceType={AuditEventResourceType.SECRET} columns={12} />
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
</style>
