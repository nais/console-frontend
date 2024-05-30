<script lang="ts" xmlns="http://www.w3.org/1999/html">
	import { page } from '$app/stores';
	import { PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import Time from '$lib/Time.svelte';
	import CostIcon from '$lib/icons/CostIcon.svelte';
	import Redis from '$lib/icons/Redis.svelte';
	import { Link, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import { CheckmarkIcon, ExclamationmarkTriangleFillIcon } from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';

	export let data: PageData;
	$: ({ RedisInstance } = data);
	$: redisInstance = $RedisInstance.data?.team.redisInstance;
	$: teamName = $page.params.team;
	$: envName = $page.params.env;
</script>

{#if $RedisInstance.errors}
	<GraphErrors errors={$RedisInstance.errors} />
{:else if redisInstance && redisInstance.name !== PendingValue}
	<div class="grid">
		<Card columns={7}>
			<h3 class="heading">
				<Redis />
				{redisInstance.name}
			</h3>

			<h4>Cost</h4>
			<CostIcon size="16" />
			€{redisInstance.cost}
			sum of cost last 30 days

			<h4 class="access">Access</h4>
			{#if redisInstance.access.length}
				<Table size="small">
					<Thead>
						<Tr>
							<Th>Access level</Th>
							<Th>Workload</Th>
							<Th>Type</Th>
						</Tr>
					</Thead>
					<Tbody>
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
					</Tbody>
				</Table>
			{:else}
				<p>No workloads with configured access</p>
			{/if}
		</Card>
		<Card columns={5}>
			<h3>Status</h3>
			<div>
				{#if redisInstance.status.conditions.length}
					{#each redisInstance.status.conditions as cond}
						<dl class="conditions">
							<dt>Status</dt>
							<dd class="status">
								{#if cond.status === 'True'}
									{cond.type}
									<CheckmarkIcon
										style="color: var(--a-surface-success); font-size: 1.5rem"
										title={cond.type}
									/>
								{:else}
									{cond.type}
									<ExclamationmarkTriangleFillIcon
										style="color: var(--a-icon-info)"
										title={cond.type}
									/>
								{/if}
							</dd>
							<dt>Reason</dt>
							<dd>{cond.reason} (<Time time={cond.lastTransitionTime} />)</dd>
						</dl>
						<details>
							<summary>Status message</summary>
							<p style="width: 30em;">{cond.message}</p>
						</details>
					{/each}
				{:else}
					<p>No conditions</p>
				{/if}
			</div>
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

	dl.conditions {
		display: grid;
		align-items: center;
		grid-template-columns: 20% 80%;
	}
	.status {
		display: flex;
		align-items: center;
		gap: 0.5em;
	}

	div dl.conditions:not(:first-child) {
		margin-top: 3em;
	}

	dt {
		font-weight: bold;
		display: flex;
		gap: 1em;
		align-items: center;
	}

	h4.access {
		margin-top: 1em;
		margin-bottom: 0;
	}
</style>