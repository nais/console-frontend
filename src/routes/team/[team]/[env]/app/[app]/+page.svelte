<script lang="ts">
	import { page } from '$app/stores';
	import { PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';
	import Cost from '$lib/components/Cost.svelte';
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

	$: app = $page.params.app;
	$: env = $page.params.env;
	$: team = $page.params.team;
	$: cpuUtilization = $App.data?.currentResourceUtilizationForApp.cpu;
	$: memoryUtilization = $App.data?.currentResourceUtilizationForApp.memory;
</script>

{#if $App.errors}
	<Alert variant="error">
		{#each $App.errors as error}
			{error.message}
		{/each}
	</Alert>
{:else if $App.data}
	<div class="grid">
		<Status app={$App.data.app} />

		<Card columns={2}>
			<Cost {app} {env} {team} />
		</Card>
		<Card columns={6}>
			<Image app={$App.data.app} />
		</Card>
		<Card columns={12}>
			<h4>Instances</h4>
			<AutoScaling app={$App.data.app} />
			{#if cpuUtilization && cpuUtilization !== PendingValue && memoryUtilization && memoryUtilization !== PendingValue}
				<Instances app={$App.data.app} {cpuUtilization} {memoryUtilization} />
			{/if}
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
