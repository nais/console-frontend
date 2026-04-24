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

<GraphErrors errors={$Bucket.errors} />
{#if $Bucket.data}
	{@const bucket = $Bucket.data.team.environment.bucket}

	<div class="wrapper">
		<div class="content">
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
		grid-template-columns: minmax(0, 1fr) 300px;
		gap: var(--spacing-layout);
		align-items: start;
		min-width: 0;
	}

	.content {
		min-width: 0;
	}

	.sidebar {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
		min-width: 0;
	}

	dl {
		display: grid;
		grid-template-columns: 35% minmax(0, 1fr);
		gap: var(--ax-space-4) var(--ax-space-8);
		min-width: 0;
	}

	dt {
		font-weight: bold;
		display: flex;
		align-items: center;
		gap: 0.5em;
	}

	dd {
		margin-inline-start: 0;
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
		gap: 0.5rem;
	}

	@media (max-width: 767px) {
		.wrapper {
			grid-template-columns: 1fr;
		}

		dl {
			grid-template-columns: 1fr;
		}

		dd {
			margin-bottom: var(--ax-space-4);
		}

		dd:last-child {
			margin-bottom: 0;
		}

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
