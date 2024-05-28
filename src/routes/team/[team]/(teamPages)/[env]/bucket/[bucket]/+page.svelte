<script lang="ts" xmlns="http://www.w3.org/1999/html">
	import { PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';
	import Time from '$lib/Time.svelte';
	import BucketIcon from '$lib/icons/Bucket.svelte';
	import { Alert, CopyButton, HelpText } from '@nais/ds-svelte-community';
	import {
		CheckmarkIcon,
		ExclamationmarkTriangleFillIcon,
		ExternalLinkIcon
	} from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';

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
		<Card columns={6}>
			<h3 class="heading">
				<BucketIcon />
				{bucket.name}
			</h3>
			<div>
				<dl>
					<dt>Bucket</dt>
					<dd>
						<a href="https://console.cloud.google.com/storage/browser/{bucket.name}"
							>Google Cloud Console<ExternalLinkIcon
								title="Google Cloud Console"
								font-size="1.5rem"
							/></a
						>
					</dd>
					<dt>Public access prevention</dt>
					<dd>{bucket.publicAccessPrevention}</dd>
					<dt>Uniform bucket level access</dt>
					<dd>{bucket.uniformBucketLevelAccess}</dd>
					{#if bucket.cors}
						<dt>CORS</dt>
						<dd>
							<dl>
								{#each bucket.cors as c}
									{#each c.origins as o}
										<li>
											{o === '*' ? 'any host' : o}: {c.methods
												.map((m) => (m === '*' ? 'any method' : m))
												.join(', ')}
										</li>
									{/each}
								{/each}
							</dl>
						</dd>
					{/if}
					{#if bucket.status.selfLink}
						<dt>Self link</dt>
						<dd >
							<p style="display: flex; align-items: center;">
								<span
									style="text-overflow: ellipsis; white-space: nowrap; overflow: hidden"
									title="https://storage.googleapis.com/{bucket.name}"
									>https://storage.googleapis.com/{bucket.name}</span
								>
								<CopyButton
									size="small"
									variant="action"
									copyText="https://storage.googleapis.com/{bucket.name}"
								/>
							</p>
						</dd>
					{/if}
				</dl>
			</div>
		</Card>
		<Card columns={6}>
			<h3>Status</h3>
			<div>
				{#if bucket.status.conditions.length}
					{#each bucket.status.conditions as cond}
						<dl class="conditions">
							<dt>Status</dt>
							<dd class="status">
								{#if cond.status === 'True'}
									{cond.type}
									<CheckmarkIcon
										style="color: var(--a-surface-success); font-size: 1.5rem"
										title={cond.type}
									/>
								{:else}
									{cond.type}
									<ExclamationmarkTriangleFillIcon
										style="color: var(--a-icon-info)"
										title={cond.type}
									/>
								{/if}
							</dd>
							<dt>Reason</dt>
							<dd>{cond.reason} (<Time time={cond.lastTransitionTime} />)</dd>
						</dl>
						<details>
							<summary>Status message</summary>
							<p style="width: 30em;">{cond.message}</p>
						</details>
					{/each}
				{:else}
					<p>No conditions</p>
				{/if}
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

	dl.conditions {
		display: grid;
		align-items: center;
		grid-template-columns: 20% 80%;
	}
	.status {
		display: flex;
		align-items: center;
		gap: 0.5em;
	}

	div dl.conditions:not(:first-child) {
		margin-top: 3em;
	}

	dt {
		font-weight: bold;
		display: flex;
		gap: 1em;
		align-items: center;
	}
</style>
