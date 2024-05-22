<script lang="ts" xmlns="http://www.w3.org/1999/html">
	import { page } from '$app/stores';
	import Card from '$lib/Card.svelte';
	import Redis from '$lib/icons/Redis.svelte';
	import { Alert, Link, Skeleton } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';
	import { PendingValue } from '$houdini';

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
{:else if redisInstance}
	<div class="grid">
		<Card columns={12}>
			<h3 class="heading">
				<Redis />
				{#if redisInstance.name === PendingValue}
					<Skeleton variant="text" />
				{:else}
					{redisInstance.name}
				{/if}
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
				<p>no access</p>
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
</style>
