<script lang="ts">
	import { page } from '$app/stores';
	import Card from '$lib/Card.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import Time from '$lib/Time.svelte';
	import { Button, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';
	import CreateSecret, { type EnvironmentType } from './CreateSecret.svelte';

	export let data: PageData;

	$: ({ Secrets } = data);
	$: team = $page.params.team;

	let createSecretOpen = false;
	let environments: EnvironmentType[]; // = $Secrets.data?.team.environments;

	$: if ($Secrets.data) {
		environments = $Secrets.data?.team.environments.map((env) => {
			return {
				name: env.name,
				secrets:
					$Secrets.data?.team.secrets.edges
						.filter((edge) => edge.node.environment.name === env.name)
						.map((edge) => ({
							name: edge.node.name,
							lastModifiedAt: edge.node.lastModifiedAt ? new Date(edge.node.lastModifiedAt) : null
						})) || []
			};
		});
	}

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
			<Table size="small" zebraStripes>
				<Thead>
					<Th>Name</Th>
					<Th>Environment</Th>
					<Th align="right">Last Modified</Th>
				</Thead>
				<Tbody>
					{#each secrets.edges as secret}
						<Tr>
							<Td>
								<a href="/team/{team}/{secret.node.environment.name}/secret/{secret.node.name}"
									>{secret.node.name}</a
								>
							</Td>
							<Td>{secret.node.environment.name}</Td>
							<Td align="right">
								{#if secret.node.lastModifiedAt}
									<Time time={secret.node.lastModifiedAt} distance />
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
			{#if secrets.pageInfo.hasPreviousPage || secrets.pageInfo.hasNextPage}
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
		</Card>
		{#if createSecretOpen}
			<CreateSecret {team} bind:open={createSecretOpen} {environments} />
		{/if}
		<!--ActivityLog teamName={team} resourceType={AuditEventResourceType.SECRET} columns={12} /-->
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
