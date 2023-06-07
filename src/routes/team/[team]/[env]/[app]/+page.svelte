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
	<Card columns={1}>
		<h3>Status</h3>
		<div>
			<Status {app} />
		</div>
	</Card>
	<Card columns={2}>
		<h3>Image</h3>
		{#if app.image === PendingValue}
			<Loading />
		{:else}
			<div>{app.image}</div>
		{/if}
	</Card>
	<Card columns={1}>
		<h3>Deployed</h3>
		{#if app.deployed === PendingValue}
			<Loading />
		{:else if app.deployed === null}
			Never
		{:else}
			<Time time={app.deployed} distance={true} />
			<ul>
				<li>Commit SHA: {app.commitSha}</li>
				<li>Workflow run: {app.workflowRun}</li>
				<li>Workflow actor: {app.actor}</li>
			</ul>
		{/if}
	</Card>
	<Card columns={6}>
		<h2>Instances</h2>
		<AutoScaling {app} />
		<Instances {app} />
	</Card>
	<Card columns={4}>
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
		grid-column: span 2;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(6, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
	}
	h3 {
		font-weight: 400;
		margin-bottom: 0px;
	}
</style>
