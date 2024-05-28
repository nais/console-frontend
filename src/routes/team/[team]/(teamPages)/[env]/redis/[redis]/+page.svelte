<script lang="ts" xmlns="http://www.w3.org/1999/html">
	import { page } from '$app/stores';
	import { PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';
	import Redis from '$lib/icons/Redis.svelte';
	import { Alert, HelpText, Link, Table, Tr, Td, Th } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';
	import CostIcon from '$lib/icons/CostIcon.svelte';

	export let data: PageData;
	$: ({ RedisInstance } = data);
	$: redisInstance = $RedisInstance.data?.team.redisInstance;
	$: teamName = $page.params.team;
	$: envName = $page.params.env;
</script>

{#if $RedisInstance.errors}
	{#each $RedisInstance.errors as error}
		<Alert style="margin-bottom: 1rem;" variant="error">
			{error}
		</Alert>
	{/each}
{:else if redisInstance && redisInstance.name !== PendingValue}
	<div class="grid">
		<Card columns={6}>
			<h3 class="heading">
				<Redis />
				{redisInstance.name}
			</h3>
			
			<dl class="cost">
				<dt>
					Cost
					<CostIcon size="16" />
				</dt>
				<dd>
					€{redisInstance.cost}
					sum of cost last 30 days
				</dd>
			</dl>

			{#if redisInstance.access.length}
				<Table>
					<Tr>
						<Th>Access</Th>
						<Th>Workload</Th>
						<Th>Type</Th>
					</Tr>
					{#each redisInstance.access as access}
						<Tr>
							<Td>{access.role}</Td>
							<Td>
								<Link
									href="/team/{teamName}/{envName}/{access.workload.type === 'App'
										? 'app'
										: 'job'}/{access.workload.name}">{access.workload.name}</Link
								>
							</Td>
							<Td>{access.workload.type}</Td>
						</Tr>
					{/each}
				</Table>
			{:else}
				<p>no workloads with configured access</p>
			{/if}

		</Card>
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
		gap: 1rem;
		align-items: center;
	}

	.cost dt {
		display: flex;
		align-items: center;
		gap: 0.5em;
	}
</style>
