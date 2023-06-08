<script lang="ts">
	import { page } from '$app/stores';
	import Card from '$lib/Card.svelte';
	import type { PageData } from './$houdini';
	import { PendingValue } from '$houdini';
	import AutoScaling from './AutoScaling.svelte';
	import Instances from './Instances.svelte';
	import Status from './Status.svelte';
	import Loading from '$lib/Loading.svelte';
	import Time from '$lib/Time.svelte';
	import Traffic from './Traffic.svelte';
	import Storage from './Storage.svelte';
	import Authentications from './Authentications.svelte';

	export let data: PageData;
	$: ({ App } = data);
	$: app = $App.data.app;

	$: env = $page.params.env;
</script>

<div class="grid">
	<Card columns={2}>
		<h3>Status</h3>
		<div>
			<Status {app} />
		</div>
	</Card>
	<Card columns={4}>
		<h3>Image</h3>
		{#if app.image === PendingValue}
			<Loading />
		{:else}
			<div>{app.image}</div>
		{/if}
	</Card>
	<Card columns={4}>
		<h3>Deployed</h3>
		{#if app.deployInfo.timestamp === PendingValue}
			<Loading />
		{:else if app.deployInfo.timestamp === null}
			Never
		{:else}
			<Time time={app.deployInfo.timestamp} distance={true} /><br />
			{#if app.deployInfo.deployer && app.deployInfo.url}
				<a href={app.deployInfo.url}>Workflow</a> triggered by
				<a href="https://github.com/{app.deployInfo.deployer}">{app.deployInfo.deployer}</a>.
			{/if}
		{/if}
	</Card>
	<Card columns={12}>
		<h2>Instances</h2>
		<AutoScaling {app} />
		<Instances {app} />
	</Card>
	<Card columns={8}>
		<h2>Traffic policies</h2>
		<Traffic {app} />
	</Card>
	<div class="storauth">
		<Card>
			<h2>Storage</h2>
			<Storage {app} />
		</Card>
		<Card>
			<h2>Authentications</h2>
			<Authentications {app} />
		</Card>
	</div>
</div>

<style>
	.storauth {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		grid-column: span 4;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
	}
	h3 {
		font-weight: 400;
		margin-bottom: 0.5rem;
	}
</style>
