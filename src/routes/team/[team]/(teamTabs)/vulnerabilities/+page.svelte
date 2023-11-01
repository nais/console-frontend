<script lang="ts">
	import { page } from '$app/stores';
	import { PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';
	import Loading from '$lib/Loading.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import Status from '$lib/Status.svelte';
	import Cost from '$lib/components/Cost.svelte';
	import {Alert, Table, Tbody, Td, Th, Thead, Tooltip, Tr} from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';
	import VulnerabilitySummary from "../../[env]/app/[app]/VulnerabilitySummary.svelte";

	$: teamName = $page.params.team;
	export let data: PageData;
	$: ({ TeamVulnerabilities } = data);
	$: team = $TeamVulnerabilities.data?.team;
</script>

{#if $TeamVulnerabilities.errors}
	<Alert variant="error">
		{#each $TeamVulnerabilities.errors as error}
			{error.message}
		{/each}
	</Alert>
{:else}
	<div class="grid">
		<Card columns={3}>
			<Cost app="" env="" team={teamName} />
		</Card>
		<Card columns={12}>
			<Table size="small">
				<Thead>
				<Th style="width: 2rem"></Th>
				<Th>Name</Th>
				<Th>Env</Th>
				<Th>Instances</Th>
				<Th>Deployed</Th>
				</Thead>
				<Tbody>
				{#if team !== undefined}
					{#if team.id === PendingValue}
						<Tr>
							{#each new Array(team.apps.edges.length).fill('medium') as size}
								<Td><Loading {size} /></Td>
							{/each}
						</Tr>
					{:else}
						{#each team.apps.edges as edge}
							<Tr>
								<Td>
									<div class="status">
										<a
												href="/team/{teamName}/{edge.node.env.name}/app/{edge.node.name}/status"
												data-sveltekit-preload-data="off"
										>
											<Status size="1.5rem" state={edge.node.appState.state} />
										</a>
									</div>
								</Td>
								<Td>
									<a href="/team/{teamName}/{edge.node.env.name}/app/{edge.node.name}"
									>{edge.node.name}</a
									>
								</Td>
								<Td>{edge.node.env.name}</Td>

								<Td>
									<VulnerabilitySummary app={edge.node} />
								</Td>
							</Tr>
						{:else}
							<Tr>
								<Td colspan={4}>No apps found</Td>
							</Tr>
						{/each}
					{/if}
				{/if}
				</Tbody>
			</Table>
			{#if team !== undefined}
				{#if team.id !== PendingValue}
					<Pagination
							totalCount={team.apps.totalCount}
							pageInfo={team.apps.pageInfo}
							on:nextPage={() => {
							if (!$TeamVulnerabilities.pageInfo.hasNextPage) return;
							TeamVulnerabilities.loadNextPage();
						}}
							on:previousPage={() => {
							if (!$TeamVulnerabilities.pageInfo.hasPreviousPage) return;
							TeamVulnerabilities.loadPreviousPage();
						}}
					/>
				{/if}
			{/if}
		</Card>
	</div>
{/if}

<style>
	.status {
		display: flex;
		align-items: center;
		justify-content: center;
		line-height: 0.6;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
	}
</style>