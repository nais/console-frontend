<script lang="ts">
	import { page } from '$app/stores';
	import Card from '$lib/Card.svelte';
	import { timeAgo } from '$lib/timeAgo';
	import Footprint from './Footprint.svelte';
	import Network from './Network.svelte';
	import Traffic from './Traffic.svelte';
	import Status from './Status.svelte';
	import Emisions from './Emisions.svelte';
	import Accessories from './Accessories.svelte';
	import Authentications from './Authentications.svelte';
	import type { PageData } from './$houdini';
	import Time from '$lib/Time.svelte';

	export let data: PageData;
	$: ({ App } = data);
	$: app = $App.data?.app;
</script>

{#if app}
	<div class="grid">
		<Card columns="3">
			<h4>Available from</h4>
			{#each app.ingresses as ingress}
				<p><a href="/">{ingress}</a></p>
			{/each}
		</Card>
		<Card columns="1">
			<h4>Image</h4>
			<p>{app.image}</p>
		</Card>
		<Card columns="2"
			><h4>Last deployed</h4>
			{#if app.lastDeployed}
				<Time time={app.lastDeployed} distance={true} />
			{/if}
		</Card>
		<Card columns="4">
			<h4>Status</h4>
			<Status {app} />
		</Card>
		<Card columns="2">
			<h4>Network</h4>
			<Network />
		</Card>
		<Card columns="6"
			><h4>Traffic</h4>
			<Traffic />
		</Card>
		<Card columns="6"
			><h4>App footprint</h4>
			<Footprint /></Card
		>
		<Card columns="6"
			><h4>Team's total emissions</h4>
			<Emisions />
		</Card>
		<Card columns="6"
			><h4>Peripherals</h4>
			<Accessories /></Card
		>
		<Card columns="6"
			><h4>Authentications</h4>
			<Authentications /></Card
		>
	</div>
{/if}

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(6, 1fr);
		grid-gap: 0.5rem;
		row-gap: 0.5rem;
	}
</style>
