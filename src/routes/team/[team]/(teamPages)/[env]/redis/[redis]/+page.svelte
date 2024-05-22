<script lang="ts" xmlns="http://www.w3.org/1999/html">
	import { page } from '$app/stores';
	import Card from '$lib/Card.svelte';
	import { Alert } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';

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
{:else}
	<div class="grid">
		<Card columns={12}>
			<h3>Redis instance details</h3>
			<p>ID: {redisInstance?.id}</p>
			<p>Name: {redisInstance?.name}</p>
			<p>{JSON.stringify(redisInstance)}</p>
			{#if redisInstance?.access.length}
				{#each redisInstance?.access as access}
					<li>{JSON.stringify(access)}</li>
				{/each}
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
</style>
