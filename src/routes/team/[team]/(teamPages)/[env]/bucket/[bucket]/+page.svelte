<script lang="ts">
	import Card from '$lib/Card.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import PersistenceHeader from '$lib/PersistenceHeader.svelte';
	import WorkloadLink from '$lib/components/WorkloadLink.svelte';
	import { CopyButton } from '@nais/ds-svelte-community';
	import {
		ExclamationmarkTriangleFillIcon,
		ExternalLinkIcon
	} from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let { Bucket } = $derived(data);
</script>

{#if $Bucket.errors}
	<GraphErrors errors={$Bucket.errors} />
{:else if $Bucket.data}
	{@const bucket = $Bucket.data.team.environment.bucket}
	<PersistenceHeader
		environment={bucket.environment.name}
		type={bucket.__typename}
		name={bucket.name}
		path={`/team/${$Bucket.data.team.slug}/buckets`}
		text="All buckets"
	/>
	<div class="grid">
		<Card columns={12}>
			<div>
				<h3>Bucket details</h3>
				<dl class="config">
					<dt>Status</dt>
					<dd>{bucket.status.state}</dd>
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
					<dt>Owner</dt>
					<dd>
						{#if bucket.workload}
							<WorkloadLink workload={bucket.workload} showIcon={true} />
						{:else}
							<div class="inline">
								<i>No owner</i>
								<ExclamationmarkTriangleFillIcon
									style="color: var(--a-icon-warning)"
									title="The bucket does not belong to any workload"
								/>
							</div>
						{/if}
					</dd>
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
				</dl>
			</div>
		</Card>

		{#if bucket.status.errors.length > 0}
			<Card columns={12}>
				<h3>Errors</h3>
				<div>
					{#each bucket.status.errors as error}
						<details>
							<summary>{error.message}</summary>
							<p>{error.details}</p>
						</details>
					{/each}
				</div>
			</Card>
		{/if}
	</div>
{/if}

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
	}

	dl {
		display: grid;
		align-items: center;
	}

	dl.config {
		grid-template-columns: 35% 65%;
	}

	dt {
		font-weight: bold;
	}

	.inline {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
</style>
