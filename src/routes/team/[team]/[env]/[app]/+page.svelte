<script lang="ts">
	import { page } from '$app/stores';
	import Card from '$lib/Card.svelte';
	import Arrow from '$lib/icons/Arrow.svelte';
	import SuccessIcon from '$lib/icons/SuccessIcon.svelte';
	import { timeAgo } from '$lib/timeAgo';

	$: team = $page.params.team;
	$: app = $page.params.app;
	$: env = $page.params.env;
	$: currentRoute = $page.route.id;

	const appSpec = {
		status: 'status',
		image: 'image',
		version: '1.5.2',
		replicas: 'replicas',
		instances: '3/3',
		last_deployed: Date.now(),
		network: {
			inbound: ['app1.namespace', 'app2.diferentns'],
			outbound: ['app3.namespace', 'www.vg.no']
		},
		cpu: 'cpu',
		memory: 'memory',
		disk: 'disk',
		ingress: ['appname.intern.nav.no', 'appname.nav.no'],
		created: Date.now(),
		updated: 'updated',
		restarts: 'restarts',
		logs: 'logs',
		yaml: 'yaml'
	};
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
		<div style="display: flex; align-items: center; flex-direction: row; gap: 1rem;">
			<SuccessIcon size="1.5rem" style="color: var(--a-icon-success)" />
			{appSpec.instances} running
		</div>
		<p>
			Min. 2 / Max 8 <a href="/">Adjust</a>
		</p>
	</Card>
	<Card columns="2">
		<h4>Network</h4>
		<div style="display: flex; align-items: center; flex-direction: row; gap: 1rem;">
			<Arrow style="transform: rotate(135deg);" size="1.2rem" /> 33.0 kB/s
		</div>
		<div style="display: flex; align-items: center; flex-direction: row; gap: 1rem;">
			<Arrow style="transform: rotate(-45deg);" size="1.2rem" /> 57.5 kB/s
		</div>
	</Card>
	<Card columns="6"
		><h4>Traffic</h4>
		<div />
		<div class="traffic">
			<div class="trafficContent">
				<h5>Inbound:</h5>
				<p>
					{#each appSpec.network.inbound as inbound}
						<a href="/">{inbound}</a><br />
					{/each}
				</p>
			</div>
			<div class="trafficApp">
				{app}
			</div>
			<div class="trafficContent">
				<h5>outbound</h5>
				<p>
					{#each appSpec.network.outbound as outbound}
						<a href="/">{outbound}</a><br />
					{/each}
				</p>
			</div>
		</div>
	</Card>
	<Card columns="6"><h4>App footprint</h4></Card>
	<Card columns="6"><h4>Team's total emissions</h4></Card>
	<Card columns="6"><h4>Accessories</h4></Card>
	<Card columns="6"><h4>Authentications</h4></Card>
</div>

<style>
	.traffic {
		display: flex;
		flex-direction: row;
	}
	.trafficContent {
		display: flex;
		flex-direction: column;
		justify-content: center;
	}
	.trafficApp {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		background-color: #f5f5f5;
		border-radius: 50%;
		padding: 20px;
		height: 60px;
		width: 60px;
		margin: 0 auto;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(6, 1fr);
		grid-gap: 0.5rem;
		row-gap: 0.5rem;
	}
</style>
