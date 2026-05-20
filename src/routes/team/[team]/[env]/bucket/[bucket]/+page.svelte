<script lang="ts">
	import WorkloadLink from '$lib/domain/workload/WorkloadLink.svelte';
	import WarningIcon from '$lib/icons/WarningIcon.svelte';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import TooltipAlignHack from '$lib/ui/TooltipAlignHack.svelte';
	import { BodyShort, CopyButton, Heading } from '@nais/ds-svelte-community';
	import { CheckmarkIcon, XMarkIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { Bucket } = $derived(data);
</script>

<GraphErrors errors={$Bucket.errors} />
{#if $Bucket.data}
	{@const bucket = $Bucket.data.team.environment.bucket}

	<div class="layout-two-column">
		<div class="content">
			<section aria-labelledby="details-heading">
				<Heading as="h2" id="details-heading" size="medium" spacing>Configuration</Heading>
				<dl class="settings-list">
					<dt>Public access prevention</dt>
					<dd>{bucket.publicAccessPrevention}</dd>
					<dt>Uniform bucket level access</dt>
					<dd>{bucket.uniformBucketLevelAccess}</dd>
					<dt>Cascading delete</dt>
					<dd>
						{#if bucket.cascadingDelete}
							<span class="inline">
								<TooltipAlignHack content="Cascading delete">
									<CheckmarkIcon
										style="color: var(--ax-text-success-subtle)"
										title="Cascading delete: true"
									/>
								</TooltipAlignHack>
								The bucket is deleted with the application only if empty
							</span>
						{:else}
							<span class="inline">
								<TooltipAlignHack content="Cascading delete: false">
									<XMarkIcon style="color: var(--ax-text-danger-decoration);" />
								</TooltipAlignHack>
								Deleting the application will NOT remove the bucket
							</span>
						{/if}
					</dd>
					<dt>Self link</dt>
					<dd class="self-link">
						<span class="self-link-value" title="https://storage.googleapis.com/{bucket.name}"
							>https://storage.googleapis.com/{bucket.name}</span
						>
						<CopyButton
							size="xsmall"
							variant="action"
							copyText="https://storage.googleapis.com/{bucket.name}"
						/>
					</dd>
				</dl>

				<div class="links-section">
					<Heading as="h3" size="small">Console</Heading>
					<BodyShort>
						<ExternalLink href="https://console.cloud.google.com/storage/browser/{bucket.name}"
							>Google Cloud Console</ExternalLink
						>
					</BodyShort>
				</div>
			</section>
		</div>

		<div class="layout-sidebar">
			<SurfaceCard title="Owner">
				{#if bucket.workload}
					<WorkloadLink workload={bucket.workload} hideEnv hideTeam />
				{:else}
					<div class="inline">
						<i>No owner</i>
						<WarningIcon title="This bucket does not belong to any workload" />
					</div>
				{/if}
			</SurfaceCard>
		</div>
	</div>
{/if}

<style>
	.content {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-24);
		min-width: 0;
	}

	.self-link {
		display: flex;
		align-items: center;
		gap: var(--ax-space-4);
	}

	.self-link-value {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.inline {
		display: flex;
		align-items: center;
		gap: var(--ax-space-8);
	}

	.links-section {
		margin-top: var(--ax-space-16);
		display: grid;
		gap: var(--ax-space-4);
	}

	@media (max-width: 767px) {
		.self-link {
			align-items: flex-start;
			flex-wrap: wrap;
		}

		.self-link-value {
			white-space: normal;
			overflow-wrap: anywhere;
		}
	}
</style>
