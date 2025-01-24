<script lang="ts">
	import Card from '$lib/Card.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import PersistenceIcon from '$lib/PersistenceIcon.svelte';
	import WorkloadLink from '$lib/components/WorkloadLink.svelte';
	import { CopyButton } from '@nais/ds-svelte-community';
	import {
		ArrowLeftIcon,
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
	<div class="resource-header-wrapper">
		<div class="header">
			<span>
				<a href="/team/{$Bucket.data.team.slug}/buckets"><ArrowLeftIcon /> All buckets</a>
			</span>
			<div class="icon-and-name-wrapper">
				<div class="icon">
					{#if bucket.__typename}
						<PersistenceIcon size={'32px'} type={bucket.__typename} />
					{/if}
				</div>
				<div>
					<h3>{bucket.name}</h3>
					<span class="environment">
						{bucket.environment.name}
					</span>
				</div>
			</div>
		</div>
	</div>
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
	.resource-header-wrapper {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		margin-bottom: 1rem;
		.header {
			display: flex;
			flex-direction: column;
			align-items: left;
		}
		.icon-and-name-wrapper {
			display: flex;
			align-items: center;
			gap: 4px;

			.icon {
				display: flex;
				flex-direction: row;
			}
			h3 {
				margin: 0;
			}
			.environment {
				color: var(--a-text-subtle);
				font-size: 1rem;
			}
		}
	}
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
