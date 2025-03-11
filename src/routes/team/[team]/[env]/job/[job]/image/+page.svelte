<script lang="ts">
	import Card from '$lib/Card.svelte';
	import ImageVulnerabilities from '$lib/components/image/ImageVulnerabilities.svelte';
	import ImageWorkloadReferences from '$lib/components/image/ImageWorkloadReferences.svelte';
	import VulnerabilityBadges from '$lib/components/VulnerabilityBadges.svelte';
	import { docURL } from '$lib/doc';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import WarningIcon from '$lib/icons/WarningIcon.svelte';
	import { parseImage } from '$lib/utils/image';
	import { CopyButton, Heading } from '@nais/ds-svelte-community';
	import type { PageProps } from './$houdini';

	let { data }: PageProps = $props();

	let { JobImageDetails, viewerIsMember } = $derived(data);

	let registry: string = $state('');
	let repository: string = $state('');
	let name: string = $state('');

	$effect(() => {
		if ($JobImageDetails.data?.team.environment.workload.image) {
			({ registry, repository, name } = parseImage(
				$JobImageDetails.data.team.environment.workload.image.name
			));
		}
	});
</script>

<GraphErrors errors={$JobImageDetails.errors} />
{#if $JobImageDetails.data}
	{@const image = $JobImageDetails.data.team.environment.workload.image}
	<div class="grid">
		<Card columns={8}>
			<div class="details">
				<Heading level="4" size="small" spacing>Details</Heading>
				<CopyButton
					size="xsmall"
					variant="action"
					text="Copy image name"
					activeText="Image name copied"
					copyText={image.name + ':' + image.tag}
				/>
			</div>
			<div class="imageGrid">
				<div class="registry">
					<h5>Registry</h5>
					<code>{registry}</code>
				</div>
				<div class="repository">
					<h5>Repository</h5>
					<code>{repository}</code>
				</div>
				<div class="imageName">
					<h5>Name</h5>
					<code>{name}</code>
				</div>
				<div class="tag">
					<h5>Tag</h5>
					<code>{image.tag ? image.tag : ''}</code>
				</div>
			</div>
		</Card>

		<Card columns={3}>
			<Heading level="4" size="small" spacing>Summary</Heading>
			{#if image.vulnerabilitySummary}
				<VulnerabilityBadges summary={image.vulnerabilitySummary} />
			{:else if !image.hasSBOM && image.vulnerabilitySummary !== null}
				<WarningIcon class="text-aligned-icon" />
				Data was discovered, but the SBOM was not rendered. Please refer to the
				<a href={docURL('/services/vulnerabilities/')}>NAIS documentation</a>
				for further assistance.
			{:else}
				<WarningIcon class="text-aligned-icon" />
				No data found.
				<a href={docURL('/services/vulnerabilities/how-to/sbom/')}> How to fix</a>
			{/if}
		</Card>
		<Card columns={11}>
			<ImageVulnerabilities
				team={$JobImageDetails.data?.team.slug}
				environment={$JobImageDetails.data?.team.environment.name}
				workload={$JobImageDetails.data?.team.environment.workload.name}
				authorized={viewerIsMember}
			/>
		</Card>

		<Card columns={11}>
			<ImageWorkloadReferences {image} />
		</Card>
	</div>
{/if}

<style>
	.details {
		display: flex;
		justify-content: space-between;
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
