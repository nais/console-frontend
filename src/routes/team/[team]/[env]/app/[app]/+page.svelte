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
	import { Alert, Button } from '@nais/ds-svelte-community';
	import { Clipboard } from '@nais/ds-svelte-community/icons';
	import { copyText } from 'svelte-copy';

	export let data: PageData;
	$: ({ App } = data);

	$: env = $page.params.env;
</script>

{#if $App.errors}
	<Alert variant="error">
		{#each $App.errors as error}
			{error.message}
		{/each}
	</Alert>
{:else if $App.data}
	<div class="grid">
		<Card columns={2}>
			<h4>Status</h4>
			<div>
				<Status app={$App.data.app} />
			</div>
		</Card>
		<Card columns={4}>
			<h4>Deployed</h4>
			{#if $App.data.app.deployInfo.timestamp === PendingValue}
				<Loading />
			{:else if $App.data.app.deployInfo.timestamp === null}
				Never
			{:else}
				<Time time={$App.data.app.deployInfo.timestamp} distance={true} /><br />
				{#if $App.data.app.deployInfo.deployer && $App.data.app.deployInfo.url}
					<a href={$App.data.app.deployInfo.url}>Workflow</a> triggered by
					<a href="https://github.com/{$App.data.app.deployInfo.deployer}"
						>{$App.data.app.deployInfo.deployer}</a
					>.
				{/if}
			{/if}
		</Card>
		<Card columns={6}>
			<h4 class="image">
				Image <Button
					size="xsmall"
					on:click={() => {
						if ($App.data?.app.image !== PendingValue) {
							copyText($App.data ? String($App.data.app.image) : '');
						}
					}}
				>
					<svelte:fragment slot="icon-left"><Clipboard /></svelte:fragment>
				</Button>
			</h4>
			{#if $App.data.app.image === PendingValue}
				<Loading />
			{:else}
				<div class="imageBreak">{$App.data.app.image}</div>
			{/if}
		</Card>
		<Card columns={12}>
			<h4>Instances</h4>
			<AutoScaling app={$App.data.app} />
			<Instances app={$App.data.app} />
		</Card>
		<Card columns={8}>
			<h4>Traffic policies</h4>
			<Traffic app={$App.data.app} />
		</Card>
		<div class="storauth">
			<Card>
				<h4>Storage</h4>
				<Storage app={$App.data.app} />
			</Card>
			<Card>
				<h4>Authentications</h4>
				<Authentications app={$App.data.app} />
			</Card>
		</div>
	</div>
{/if}

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
	h4 {
		font-weight: 400;
		margin-bottom: 0.5rem;
	}
	.image {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}

	.imageBreak {
		word-wrap: break-word;
	}
</style>
