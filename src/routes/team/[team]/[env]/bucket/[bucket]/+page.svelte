<script lang="ts">
	import WorkloadLink from '$lib/domain/workload/WorkloadLink.svelte';
	import WarningIcon from '$lib/icons/WarningIcon.svelte';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import IconLabel from '$lib/ui/IconLabel.svelte';
	import TooltipAlignHack from '$lib/ui/TooltipAlignHack.svelte';
	import { CopyButton, Heading } from '@nais/ds-svelte-community';
	import { CheckmarkIcon, XMarkIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { Bucket } = $derived(data);
</script>

<GraphErrors errors={Bucket.errors} />
{#if Bucket.data}
	{@const bucket = Bucket.data.team.environment.bucket}

	<div class="wrapper">
		<div>
			<Heading as="h2">Bucket Details</Heading>
			<dl>
				<dt>Bucket</dt>
				<dd>
					<ExternalLink href="https://console.cloud.google.com/storage/browser/{bucket.name}"
						>Google Cloud Console</ExternalLink
					>
				</dd>
				<dt>Public access prevention</dt>
				<dd>{bucket.publicAccessPrevention}</dd>
				<dt>Uniform bucket level access</dt>
				<dd>{bucket.uniformBucketLevelAccess}</dd>
				<dt>Cascading delete</dt>
				<dd>
					{#if bucket.cascadingDelete}
						<IconLabel
							label="The bucket is deleted with the application only if empty — otherwise it must be removed manually."
						>
							{#snippet icon()}
								<TooltipAlignHack content="Cascading delete">
									<CheckmarkIcon
										style="color: var(--ax-text-success-subtle)"
										title="Cascading delete: true"
									/>
								</TooltipAlignHack>
							{/snippet}
						</IconLabel>
					{:else}
						<IconLabel label="Deleting the application will NOT remove the bucket.">
							{#snippet icon()}
								<TooltipAlignHack content="Cascading delete: false">
									<XMarkIcon style="color: var(--ax-text-danger-decoration);" />
								</TooltipAlignHack>
							{/snippet}
						</IconLabel>
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
		<div class="sidebar">
			<div>
				<Heading as="h3" size="small">Owner</Heading>
				{#if bucket.workload}
					<WorkloadLink workload={bucket.workload} />
				{:else}
					<div class="inline">
						<i>No owner</i>
						<WarningIcon title="This bucket does not belong to any workload" />
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.wrapper {
		display: grid;
		grid-template-columns: 1fr 300px;
		gap: var(--spacing-layout);
	}

	.sidebar {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
	}

	dl {
		display: grid;
		grid-template-columns: 35% 65%;
	}

	dt {
		font-weight: bold;
		display: flex;
		align-items: center;
		gap: 0.5em;
	}

	dd {
		margin-inline-start: 0;
	}
	.inline {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
</style>
