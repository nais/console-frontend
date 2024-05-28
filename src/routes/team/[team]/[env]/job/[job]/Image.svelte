<script lang="ts">
	import { page } from '$app/stores';
	import { PendingValue, fragment, graphql, type JobImage } from '$houdini';
	import Time from '$lib/Time.svelte';
	import { parseImage } from '$lib/utils/image';
	import { Button, Skeleton } from '@nais/ds-svelte-community';

	export let job: JobImage;
	$: data = fragment(
		job,
		graphql(`
			fragment JobImage on NaisJob {
				image @loading
				deployInfo @loading {
					timestamp @loading
					deployer
					url
				}
			}
		`)
	);

	let registry: string;
	let repository: string;
	let name: string;
	let tag: string;

	$: jobName = $page.params.job;
	$: env = $page.params.env;
	$: team = $page.params.team;

	$: {
		if (image !== PendingValue) {
			({ registry, repository, name, tag } = parseImage(image));
		}
	}

	$: image = $data?.image;
	$: deployInfo = $data?.deployInfo;
</script>

<h4 class="imageHeader">
	Image
	{#if $data?.image !== PendingValue}
		<Button as="a" variant="secondary" size="small" href="/team/{team}/{env}/job/{jobName}/image"
			>Details</Button
		>
	{/if}
</h4>
<p class="lastActivity">
	{#if deployInfo?.timestamp === PendingValue}
		<Skeleton variant="text" width="40%" />
	{:else if deployInfo.timestamp !== null}
		{#if deployInfo.url === ''}
			Deployed
		{:else}
			<a href={deployInfo.url}>Deployed</a>
		{/if}
		<Time time={deployInfo.timestamp} distance={true} />
		{#if deployInfo.deployer !== ''}
			by
			<a href="https://github.com/{deployInfo.deployer}">{deployInfo.deployer}</a>.
		{/if}
	{/if}
</p>

<div class="imageGrid">
	<div class="registry">
		<h5>Registry</h5>
		{#if image === PendingValue}
			<Skeleton variant="text" width="80%" />
		{:else}
			<code>{registry}</code>
		{/if}
	</div>
	<div class="repository">
		<h5>Repository</h5>
		{#if image === PendingValue}
			<Skeleton variant="text" width="80%" />
		{:else}
			<code>{repository}</code>
		{/if}
	</div>
	<div class="imageName">
		<h5>Name</h5>
		{#if image === PendingValue}
			<Skeleton variant="text" width="80%" />
		{:else}
			<code>{name}</code>
		{/if}
	</div>
	<div class="tag">
		<h5>Tag</h5>
		{#if image === PendingValue}
			<Skeleton variant="text" width="80%" />
		{:else}
			<code>{tag}</code>
		{/if}
	</div>
</div>

<style>
	.lastActivity {
		margin-top: 0px;
	}
	.imageHeader {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 8px;
		gap: 0.5rem;
	}
	.imageGrid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		column-gap: 0rem;
		row-gap: 0rem;
	}
	.registry {
		grid-column: 1;
		grid-row: 1;
	}
	.repository {
		grid-column: 2;
		grid-row: 1;
	}
	.imageName {
		grid-column: 1;
		grid-row: 2;
	}
	.tag {
		grid-column: 2;
		grid-row: 2;
	}
	code {
		font-size: 1rem;
	}
</style>
