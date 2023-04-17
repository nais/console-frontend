<script lang="ts">
	import { page } from '$app/stores';
	import Card from '$lib/Card.svelte';
	import { timeAgo } from '$lib/timeAgo';
	import Footprint from './Footprint.svelte';
	import Network from './Network.svelte';
	import Traffic from './Traffic.svelte';
	import { appSpec } from '$lib/mock/appSpec';
	import Status from './Status.svelte';
	import Emisions from './Emisions.svelte';
	import Accessories from './Accessories.svelte';
	import Authentications from './Authentications.svelte';

	$: team = $page.params.team;
	$: app = $page.params.app;
	$: env = $page.params.env;
	$: currentRoute = $page.route.id;
</script>

<div class="grid">
	<Card columns="3">
		<h4>Available from</h4>
		{#each appSpec.ingress as ingress}
			<p><a href="/">{ingress}</a></p>
		{/each}
	</Card>
	<Card columns="1">
		<h4>Version</h4>
		<p>{appSpec.version}</p>
	</Card>
	<Card columns="2"
		><h4>Last deployed</h4>
		<p>{timeAgo(appSpec.last_deployed - 60 * 10000)}</p>
	</Card>
	<Card columns="4">
		<h4>Status</h4>
		<Status />
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

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(6, 1fr);
		grid-gap: 0.5rem;
		row-gap: 0.5rem;
	}
</style>
