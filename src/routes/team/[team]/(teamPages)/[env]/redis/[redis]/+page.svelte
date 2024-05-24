<script lang="ts" xmlns="http://www.w3.org/1999/html">
	import { page } from '$app/stores';
	import { PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';
	import Redis from '$lib/icons/Redis.svelte';
	import { Alert, HelpText, Link, Skeleton } from '@nais/ds-svelte-community';
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
		<Card columns={2}>
			<div class="cost">
				<div class="summaryIcon" style="--bg-color: #91dc75">
					<CostIcon size="32" color="#91dc75" />
				</div>
				<div class="summary">
					<h4>
						Cost
						<HelpText title="">Total SQL instance cost for the last 30 days.</HelpText>
					</h4>
					<p class="metric">
						€{redisInstance.cost}
					</p>
				</div>
			</div>
		</Card>
		<Card columns={6}>
			<h3 class="heading">
				<Redis />
				{redisInstance.name}
			</h3>
			<h4>Access</h4>

			{#if redisInstance.access.length}
				<ul>
					{#each redisInstance.access as access}
						<li>
							<Link
								href="/team/{teamName}/{envName}/{access.workload.type === 'App'
									? 'app'
									: 'job'}/{access.workload.name}">{access.workload.name}</Link
							> - {access.role}
						</li>
					{/each}
				</ul>
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

	.cost {
		display: flex;
		align-items: center;
		gap: 20px;
	}

	.summary > h4 {
		display: flex;
		gap: 0.5rem;
		margin: 0;
		font-size: 1rem;
		color: var(--color-text-secondary);
	}
</style>
