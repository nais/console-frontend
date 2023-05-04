<script lang="ts">
	import { page } from '$app/stores';
	import Card from '$lib/Card.svelte';
	import { timeAgo } from '$lib/timeAgo';
	import Footprint from './Footprint.svelte';
	import Network from './Network.svelte';
	import Traffic from './Traffic.svelte';
	import Status from './Status.svelte';
	import Emisions from './Emisions.svelte';
	import Storage from './Storage.svelte';
	import Authentications from './Authentications.svelte';
	import type { PageData } from './$houdini';
	import Time from '$lib/Time.svelte';
	import Instances from './Instances.svelte';
	import AutoScaling from './AutoScaling.svelte';
	import Variables from './Variables.svelte';

	export let data: PageData;
	$: env = $page.params.env;
	$: ({ App } = data);
	$: app = $App.data?.app;
</script>

{#if app}
	<div class="grid">
		<Card columns={6}>
			<div class="metadata">
				<span>
					<h2>Status</h2>
					<div>
						<Status {app} />
					</div>
				</span>
				<span>
					<h2>Image</h2>
					<div>{app.image}</div>
				</span>
				<span>
					<h2>Deployed</h2>
					{#if app.deployed}
						<Time time={app.deployed} distance={true} />
					{:else}
						<span>Never</span>
					{/if}
				</span>
				<span>
					<h2>AutoScaling</h2>
					<div>
						<AutoScaling {app} />
					</div>
				</span>
				<span>
					<h2>Variables</h2>
					<div>
						<Variables {app} />
					</div>
				</span>
			</div>
		</Card>
		<Card columns={6}>
			<h2>Instances</h2>
			<Instances {app} />
		</Card>
		<Card columns={6}>
			<h2>Traffic</h2>
			<Traffic {app} />
		</Card>
		<Card columns={6}
			><h2>Storage</h2>
			<Storage {app} />
		</Card>
		<Card columns={6}>
			<h2>Authentications</h2>
			<Authentications />
		</Card>
	</div>
{/if}

<style>
	.metadata {
		display: flex;
		justify-content: space-between;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(6, 1fr);
		grid-gap: 0.5rem;
		row-gap: 0.5rem;
	}
	td {
		background-color: var(--a-surface-default);
	}
	h2 {
		font-size: 1.5rem;
		font-weight: 400;
	}
</style>
