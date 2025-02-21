<script lang="ts">
	import GraphErrors from '$lib/GraphErrors.svelte';
	import IconLabel from '$lib/components/IconLabel.svelte';
	import TooltipAlignHack from '$lib/components/TooltipAlignHack.svelte';
	import WorkloadLink from '$lib/components/WorkloadLink.svelte';
	import WarningIcon from '$lib/components/icons/WarningIcon.svelte';
	import { BodyShort, CopyButton, Heading } from '@nais/ds-svelte-community';
	import { CheckmarkIcon, ExternalLinkIcon, XMarkIcon } from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let { Bucket } = $derived(data);
</script>

<GraphErrors errors={$Bucket.errors} />
{#if $Bucket.data}
	{@const bucket = $Bucket.data.team.environment.bucket}

	<div class="wrapper">
		<div>
			<Heading level="2">Bucket details</Heading>
			<dl>
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
				<dt>Cascading delete</dt>
				<dd>
					{#if bucket.cascadingDelete}
						<IconLabel
							label={'Deleting the application will also remove the bucket and all its contents.'}
						>
							{#snippet icon()}
								<TooltipAlignHack content="Cascading delete">
									<CheckmarkIcon
										style="color: var(--a-surface-success)"
										title="Cascading delete: true"
									/>
								</TooltipAlignHack>
							{/snippet}
						</IconLabel>
					{:else}
						<IconLabel label={'Deleting the application will NOT remove the bucket.'}>
							{#snippet icon()}
								<TooltipAlignHack content="Cascading delete: false">
									<XMarkIcon style="color: var(--a-icon-danger);" />
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
			{#if bucket.status.errors.length > 0}
				<div>
					<Heading level="3">Errors</Heading>
					<div>
						{#each bucket.status.errors as error (error)}
							<details>
								<summary>{error.message}</summary>
								<p>{error.details}</p>
							</details>
						{/each}
					</div>
				</div>
			{/if}
		</div>
		<div class="sidebar">
			<div>
				<Heading level="3">Owner</Heading>
				{#if bucket.workload}
					<WorkloadLink workload={bucket.workload} />
				{:else}
					<div class="inline">
						<i>No owner</i>
						<WarningIcon title="This Big Query instance does not belong to any workload" />
					</div>
				{/if}
			</div>
			<div>
				<Heading level="3">Status</Heading>
				<BodyShort>{bucket.status.state}</BodyShort>
			</div>
		</div>
	</div>
{/if}

<style>
	.wrapper {
		display: grid;
		grid-template-columns: 1fr 300px;
		gap: var(--a-spacing-12);
	}

	.sidebar {
		display: flex;
		flex-direction: column;
		gap: var(--a-spacing-10);
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
