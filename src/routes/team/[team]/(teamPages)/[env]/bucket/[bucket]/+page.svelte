<script lang="ts" xmlns="http://www.w3.org/1999/html">
	import { page } from '$app/stores';
	import Card from '$lib/Card.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import WorkloadLink from '$lib/components/WorkloadLink.svelte';
	import { CopyButton } from '@nais/ds-svelte-community';
	import {
		BucketIcon,
		ExclamationmarkTriangleFillIcon,
		ExternalLinkIcon
	} from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';

	export let data: PageData;
	$: ({ Bucket } = data);

	$: teamName = $page.params.team;
</script>

{#if $Bucket.errors}
	<GraphErrors errors={$Bucket.errors} />
{:else if $Bucket.data}
	{@const bucket = $Bucket.data.team.bucket}
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
					<dt>Owner</dt>
					<dd>
						{#if bucket.workload}
							<WorkloadLink
								workload={bucket.workload}
								env={bucket.environment.name}
								team={teamName}
							/>
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
					<!-- TODO: opprinnelig en sjekk på bucket.status.selfLink - usikker på hvorfor -->
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
		<Card columns={5}>
			<h3>Status</h3>
			<div>
				TODO
				{bucket.status.state}
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

	dt {
		font-weight: bold;
	}

	.inline {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
</style>
