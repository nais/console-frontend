<script lang="ts" xmlns="http://www.w3.org/1999/html">
	import { page } from '$app/stores';
	import Card from '$lib/Card.svelte';
	import BucketIcon from '$lib/icons/Bucket.svelte';
	import { Alert, Link, Skeleton } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';
	import { PendingValue } from '$houdini';

	export let data: PageData;
	$: ({ Bucket } = data);
	$: bucket = $Bucket.data?.team.bucket;
</script>

{#if $Bucket.errors}
	{#each $Bucket.errors as error}
		<Alert style="margin-bottom: 1rem;" variant="error">
			{error}
		</Alert>
	{/each}
{:else if bucket && bucket.name !== PendingValue}
	<div class="grid">
		<Card columns={12}>
			<h3 class="heading">
				<BucketIcon />
				{bucket.name}
			</h3>
			<div>
				<dl>
					<dt>PublicAccessPrevention</dt>
					<dd>{bucket.publicAccessPrevention}</dd>
					<dt>UniformBucketLevelAccess</dt>
					<dd>{bucket.uniformBucketLevelAccess}</dd>
					{#if bucket.cors}
						<dt>Cors</dt>
						<dd>{bucket.cors}</dd>
					{/if}
					{#if bucket.selfLink}
						<dt>SelfLink</dt>
						<dd><Link href={bucket.selfLink}>{bucket.selfLink}</Link></dd>
					{/if}
				</dl>
			</div>
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
	.heading {
		display: flex;
		gap: 1rem;
		align-items: center;
	}
</style>
