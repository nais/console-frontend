<script lang="ts">
	import { PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';
	import Loading from '$lib/Loading.svelte';
	import Time from '$lib/Time.svelte';
	import { Alert } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';
	import Authentications from './Authentications.svelte';
	import AutoScaling from './AutoScaling.svelte';
	import Image from './Image.svelte';
	import Instances from './Instances.svelte';
	import Status from './Status.svelte';
	import Storage from './Storage.svelte';
	import Traffic from './Traffic.svelte';

	export let data: PageData;
	$: ({ App } = data);
</script>

{#if $App.errors}
	<Alert variant="error">
		{#each $App.errors as error}
			{error.message}
		{/each}
	</Alert>
{:else if $App.data}
	<div class="grid">
		<!--Card columns={2}>
			<Status app={$App.data.app} />
		</Card-->

		<Status app={$App.data.app} />

		<Card columns={4}>
			<h4>Last activity</h4>
			{#if $App.data.app.deployInfo.timestamp === PendingValue}
				<Loading />
			{:else if $App.data.app.deployInfo.timestamp === null}
				Not available
			{:else}
				<a href={$App.data.app.deployInfo.url}>Deployed</a>
				<Time time={$App.data.app.deployInfo.timestamp} distance={true} />
				{#if $App.data.app.deployInfo.deployer && $App.data.app.deployInfo.url}
					by
					<a href="https://github.com/{$App.data.app.deployInfo.deployer}"
						>{$App.data.app.deployInfo.deployer}</a
					>.
				{/if}
			{/if}
		</Card>
		<Card columns={6}>
			<Image app={$App.data.app} />
		</Card>
		<Card columns={12}>
			<h4>Instances</h4>
			<AutoScaling app={$App.data.app} />
			<Instances app={$App.data.app} />
		</Card>
		<Card columns={12}>
			<h4>Traffic policies</h4>
			<Traffic app={$App.data.app} />
		</Card>
		<Card columns={4}>
			<h4>Storage</h4>
			<Storage app={$App.data.app} />
		</Card>
		<Card columns={4}>
			<h4>Authentications</h4>
			<Authentications app={$App.data.app} />
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
	h4 {
		font-weight: 400;
		margin-bottom: 0.5rem;
	}
</style>
