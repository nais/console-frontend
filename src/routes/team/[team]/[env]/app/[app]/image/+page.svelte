<script lang="ts">
	import { run } from 'svelte/legacy';

	import { logEvent } from '$lib/amplitude';
	import Card from '$lib/Card.svelte';
	import { docURL } from '$lib/doc';
	import VulnerabilityBadge from '$lib/icons/VulnerabilityBadge.svelte';
	import WarningIcon from '$lib/icons/WarningIcon.svelte';

	import { PendingValue } from '$houdini';
	import ImageVulnerabilities from '$lib/components/image/ImageVulnerabilities.svelte';
	import ImageWorkloadReferences from '$lib/components/image/ImageWorkloadReferences.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import { parseImage } from '$lib/utils/image';
	import { severityToColor } from '$lib/utils/vulnerabilities';
	import { CopyButton, Skeleton, Tooltip } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let { ApplicationImageDetails } = $derived(data);

	let authorized = $derived($ApplicationImageDetails.data?.team.viewerIsMember ?? false);

	const notificationBadgeSize = '48px';

	let registry: string = $state('');
	let repository: string = $state('');
	let name: string = $state('');

	run(() => {
		if (
			$ApplicationImageDetails.data?.team.environment.workload.image &&
			$ApplicationImageDetails.data?.team.environment.workload.image.name !== PendingValue
		) {
			({ registry, repository, name } = parseImage(
				$ApplicationImageDetails.data.team.environment.workload.image.name
			));
		}
	});

	const onclick = () => {
		let props = {};
		props = {
			routeID: '/dependencytrack/app/findings'
		};
		logEvent('pageview', props);
	};
</script>

<GraphErrors errors={$ApplicationImageDetails.errors} />

{#if $ApplicationImageDetails.data}
	{@const image = $ApplicationImageDetails.data.team.environment.workload.image}
	<div class="grid">
		<Card columns={8}>
			<h4 class="imageHeader">
				Image details
				<CopyButton
					size="xsmall"
					variant="action"
					text="Copy image name"
					disabled={image.name === PendingValue}
					activeText="Image name copied"
					copyText={image.name !== PendingValue ? image.name + ':' + image.tag : ''}
				/>
			</h4>
			<div class="imageGrid">
				<div class="registry">
					<h5>Registry</h5>
					{#if image.name !== PendingValue}
						<code>{registry}</code>
					{:else}
						<Skeleton variant="text" />
					{/if}
				</div>
				<div class="repository">
					<h5>Repository</h5>
					{#if image.name !== PendingValue}
						<code>{repository}</code>
					{:else}
						<Skeleton variant="text" />
					{/if}
				</div>
				<div class="imageName">
					<h5>Name</h5>
					{#if image.name !== PendingValue}
						<code>{name}</code>
					{:else}
						<Skeleton variant="text" />
					{/if}
				</div>
				<div class="tag">
					<h5>Tag</h5>
					{#if image.name !== PendingValue}
						<code>{image.tag ? image.tag : ''}</code>
					{:else}
						<Skeleton variant="text" />
					{/if}
				</div>
			</div>
		</Card>

		<Card columns={4}>
			<h4>Summary</h4>
			{#if image.vulnerabilitySummary}
				<div class="circles">
					{#if image.vulnerabilitySummary !== PendingValue}
						<Tooltip placement="right" content="severity: CRITICAL">
							<VulnerabilityBadge
								text={String(image.vulnerabilitySummary.critical)}
								color={severityToColor('critical')}
								size={notificationBadgeSize}
							/>
						</Tooltip>
					{:else}
						<Skeleton
							variant="circle"
							height={notificationBadgeSize}
							width={notificationBadgeSize}
						/>
					{/if}

					{#if image.vulnerabilitySummary !== PendingValue}
						<Tooltip placement="right" content="severity: HIGH"
							><VulnerabilityBadge
								text={String(image.vulnerabilitySummary.high)}
								color={severityToColor('high')}
								size={notificationBadgeSize}
							/>
						</Tooltip>
					{:else}
						<Skeleton
							variant="circle"
							height={notificationBadgeSize}
							width={notificationBadgeSize}
						/>
					{/if}
					{#if image.vulnerabilitySummary !== PendingValue}
						<Tooltip placement="right" content="severity: MEDIUM">
							<VulnerabilityBadge
								text={String(image.vulnerabilitySummary.medium)}
								color={severityToColor('medium')}
								size={notificationBadgeSize}
							/>
						</Tooltip>
					{:else}
						<Skeleton
							variant="circle"
							height={notificationBadgeSize}
							width={notificationBadgeSize}
						/>
					{/if}
					{#if image.vulnerabilitySummary !== PendingValue}
						<Tooltip placement="right" content="severity: LOW">
							<VulnerabilityBadge
								text={String(image.vulnerabilitySummary.low)}
								color={severityToColor('low')}
								size={notificationBadgeSize}
							/>
						</Tooltip>
					{:else}
						<Skeleton
							variant="circle"
							height={notificationBadgeSize}
							width={notificationBadgeSize}
						/>
					{/if}
					{#if image.vulnerabilitySummary !== PendingValue}
						<Tooltip placement="right" content="severity: UNASSIGNED">
							<VulnerabilityBadge
								text={String(image.vulnerabilitySummary.unassigned)}
								color={severityToColor('unassigned')}
								size={notificationBadgeSize}
							/>
						</Tooltip>
					{:else}
						<Skeleton
							variant="circle"
							height={notificationBadgeSize}
							width={notificationBadgeSize}
						/>
					{/if}
				</div>
				Risk score: {#if image.vulnerabilitySummary !== PendingValue}{image.vulnerabilitySummary
						.riskScore} <br />{:else}
					<Skeleton variant="text" />{/if}
			{:else if !image.hasSBOM}
				<WarningIcon size="1rem" style="color: var(--a-icon-warning); margin-right: 0.5rem" />
				Data was discovered, but the SBOM was not rendered. Please refer to the
				<a href={docURL('/services/vulnerabilities/')}>NAIS documentation</a>
				for further assistance.
			{:else}
				<WarningIcon size="1rem" style="color: var(--a-icon-warning); margin-right: 0.5rem" />
				No data found.
				<a href={docURL('/services/vulnerabilities/how-to/sbom/')} {onclick}> How to fix</a>
			{/if}
		</Card>
		<Card columns={12}>
			<ImageVulnerabilities
				team={$ApplicationImageDetails.data?.team.slug}
				environment={$ApplicationImageDetails.data?.team.environment.name}
				workload={$ApplicationImageDetails.data?.team.environment.workload.name}
				{authorized}
			/>
		</Card>

		<Card columns={12}>
			<ImageWorkloadReferences {image} />
		</Card>
	</div>
{/if}

<style>
	.circles {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin: 2rem;
	}

	.imageHeader {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 8px;
		gap: 0.5rem;
	}

	code {
		font-size: 1rem;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
	}

	.imageGrid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		column-gap: 0.2rem;
		row-gap: 0.2rem;
	}

	code {
		font-size: 0.8rem;
	}

	.registry {
		grid-column: 1;
		grid-row: 2;
	}

	.repository {
		grid-column: 2;
		grid-row: 2;
	}

	.imageName {
		grid-column: 1;
		grid-row: 1;
	}

	.tag {
		grid-column: 2;
		grid-row: 1;
	}
</style>
