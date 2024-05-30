<script lang="ts" xmlns="http://www.w3.org/1999/html">
	import { PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import Time from '$lib/Time.svelte';
	import { CopyButton, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import {
		BucketIcon,
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
	<GraphErrors errors={$Bucket.errors} />
{:else if bucket && bucket.name !== PendingValue}
	<div class="grid">
		<Card columns={7}>
			<h3 class="heading">
				<BucketIcon />
				{bucket.name}
			</h3>
			<div>
				<dl class="config">
					<dt>Bucket</dt>
					<dd>
						<a href="https://console.cloud.google.com/storage/browser/{bucket.name}"
							>Google Cloud Console<ExternalLinkIcon title="Google Cloud Console" /></a
						>
					</dd>
					<dt>Public access prevention</dt>
					<dd>{bucket.publicAccessPrevention}</dd>
					<dt>Uniform bucket level access</dt>
					<dd>{bucket.uniformBucketLevelAccess}</dd>

					{#if bucket.status.selfLink}
						<dt>Self link</dt>
						<dd style="display: flex; align-items: center;">
							<span
								style="text-overflow: ellipsis; white-space: nowrap; overflow: hidden"
								title="https://storage.googleapis.com/{bucket.name}"
								>https://storage.googleapis.com/{bucket.name}</span
							>
							<CopyButton
								size="xsmall"
								variant="action"
								copyText="https://storage.googleapis.com/{bucket.name}"
							/>
						</dd>
					{/if}
				</dl>

				{#if bucket.cors && bucket.cors.length}
					<h4>CORS</h4>
					<Table size="small">
						<Thead>
							<Tr>
								<Th>Host</Th>
								<Th>Method(s)</Th>
							</Tr>
						</Thead>
						<Tbody>
							{#each bucket.cors as rule}
								{#each rule.origins as origin}
									<Tr>
										<Td>{origin === '*' ? 'Any host' : origin}</Td>
										<Td>{rule.methods.map((m) => (m === '*' ? 'Any method' : m)).join(', ')}</Td>
									</Tr>
								{/each}
							{/each}
						</Tbody>
					</Table>
				{/if}
			</div>
		</Card>
		<Card columns={5}>
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
							<p style="width: 25em;">{cond.message}</p>
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

	dl {
		display: grid;
		align-items: center;
	}

	dl.config {
		grid-template-columns: 35% 65%;
	}

	dl.conditions {
		grid-template-columns: 20% 80%;
	}

	dt {
		font-weight: bold;
	}

	.status {
		display: flex;
		align-items: center;
		gap: 0.5em;
	}

	div dl.conditions:not(:first-child) {
		margin-top: 3em;
	}
</style>
