<script lang="ts" xmlns="http://www.w3.org/1999/html">
	import { PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';
	import Time from '$lib/Time.svelte';
	import BucketIcon from '$lib/icons/Bucket.svelte';
	import {
		Accordion,
		AccordionItem,
		Alert,
		Link,
		Skeleton,
		Table,
		Tbody,
		Td,
		Th,
		Thead,
		Tr
	} from '@nais/ds-svelte-community';
	import { ExternalLinkIcon } from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';
	import prettyBytes from 'pretty-bytes';
	import { euroValueFormatter } from '$lib/utils/formatters';

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
					<dt>UniformBucketLevelAccess</dt>
					<dd>{bucket.uniformBucketLevelAccess}</dd>
					{#if bucket.cors}
						<dt>Cors</dt>
						<dd>
							<dl>
								{#each bucket.cors as c}
									<dt>methods</dt>
									<dd>
										{#each c.methods as m}
											<span style="margin-right: .5em;">{m}</span>
										{/each}
									</dd>
									<dt>origins</dt>
									<dd>
										<ul>
											{#each c.origins as o}
												<li>{o}</li>
											{/each}
										</ul>
									</dd>
								{/each}
							</dl>
						</dd>
					{/if}
					{#if bucket.status.selfLink}
						<dt>SelfLink</dt>
						<dd>
							<Link href="https://storage.googleapis.com/{bucket.name}"
								>https://storage.googleapis.com/{bucket.name}</Link
							>
						</dd>
					{/if}
				</dl>
			</div>
		</Card>
		<Card columns={6}>
			<h3>Status</h3>
			{#each bucket.status.conditions as cond}
				<p>Reason: {cond.reason}</p>
				<p>Status: {cond.status}</p>
				<p>Type: {cond.type}</p>
				<p>Last transition time: <Time time={cond.lastTransitionTime} /></p>
				<Accordion>
					<AccordionItem heading="Status message" open={false}>
						<p>{cond.message}</p>
					</AccordionItem>
				</Accordion>
			{:else}
				<p>No conditions</p>
			{/each}
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
