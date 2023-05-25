<script lang="ts">
	import { page } from '$app/stores';
	import Card from '$lib/Card.svelte';
	import Traffic from './Traffic.svelte';
	import Status from './Status.svelte';
	import Storage from './Storage.svelte';
	import Authentications from './Authentications.svelte';
	import type { PageData } from './$houdini';
	import Time from '$lib/Time.svelte';
	import Instances from './Instances.svelte';
	import AutoScaling from './AutoScaling.svelte';
	import { Alert } from '@nais/ds-svelte';

	export let data: PageData;
	$: env = $page.params.env;
	$: ({ App } = data);
	$: app = $App.data?.app;
</script>

{#if app}
	<div class="grid">
		<Card columns={1}>
			<h3>Status</h3>
			<div>
				<Status {app} />
			</div>
		</Card>
		<Card columns={2}>
			<h3>Image</h3>
			<div>{app.image}</div>
		</Card>
		<Card columns={1}>
			<h3>Deployed</h3>
			{#if app.deployed}
				<Time time={app.deployed} distance={true} />
			{:else}
				Never
			{/if}
		</Card>
		<Card columns={6}>
			<h2>Instances</h2>
			<AutoScaling {app} />
			<Instances {app} />
		</Card>
		<Card columns={6}>
			<h2>Traffic</h2>
			<Traffic {app} />
		</Card>
		<Card columns={3}>
			<h2>Storage</h2>
			<Storage {app} />
		</Card>
		<Card columns={3}>
			<h2>Authentications</h2>
			<Authentications {app} />
		</Card>
	</div>
{:else}
	<Alert variant="error">
		<p>App not found</p>
	</Alert>
{/if}

<style>
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
