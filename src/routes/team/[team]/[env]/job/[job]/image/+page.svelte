<script lang="ts">
	import { logEvent } from '$lib/amplitude';
	import Card from '$lib/Card.svelte';
	import { docURL } from '$lib/doc';

	import IconWithText from '$lib/components/IconWithText.svelte';
	import ImageVulnerabilities from '$lib/components/image/ImageVulnerabilities.svelte';
	import ImageWorkloadReferences from '$lib/components/image/ImageWorkloadReferences.svelte';
	import VulnerabilityBadges from '$lib/components/VulnerabilityBadges.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import { parseImage } from '$lib/utils/image';
	import { CopyButton, Heading } from '@nais/ds-svelte-community';
	import { ExclamationmarkTriangleFillIcon, ImageIcon } from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let { JobImageDetails } = $derived(data);

	let authorized = $derived($JobImageDetails.data?.team.viewerIsMember ?? false);

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

	const onclick = () => {
		let props = {};
		props = {
			routeID: '/dependencytrack/app/findings'
		};
		logEvent('pageview', props);
	};
</script>

<GraphErrors errors={$JobImageDetails.errors} />
<div class="header">
	<IconWithText icon={ImageIcon} text="Image" size="large" />
</div>
{#if $JobImageDetails.data}
	{@const image = $JobImageDetails.data.team.environment.workload.image}
	<div class="grid">
		<Card columns={8}>
			<div class="copy">
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

		<Card columns={2}>
			<div class="summary">
				<Heading level="4" size="small" spacing>Summary</Heading>
				{#if image.vulnerabilitySummary}
					<VulnerabilityBadges summary={image.vulnerabilitySummary} />
				{:else if !image.hasSBOM}
					<ExclamationmarkTriangleFillIcon
						size="1rem"
						style="color: var(--a-icon-warning); margin-right: 0.5rem"
					/>
					Data was discovered, but the SBOM was not rendered. Please refer to the
					<a href={docURL('/services/vulnerabilities/')}>NAIS documentation</a>
					for further assistance.
				{:else}
					<ExclamationmarkTriangleFillIcon
						size="1rem"
						style="color: var(--a-icon-warning); margin-right: 0.5rem"
					/>
					No data found.
					<a href={docURL('/services/vulnerabilities/how-to/sbom/')} {onclick}> How to fix</a>
				{/if}
			</div></Card
		>
		<Card columns={12}>
			<ImageVulnerabilities
				team={$JobImageDetails.data?.team.slug}
				environment={$JobImageDetails.data?.team.environment.name}
				workload={$JobImageDetails.data?.team.environment.workload.name}
				{authorized}
			/>
		</Card>

		<Card columns={12}>
			<ImageWorkloadReferences {image} />
		</Card>
	</div>
{/if}

<style>
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		align-self: stretch;
		margin-bottom: var(--a-spacing-3);
	}

	.copy {
		display: flex;
		justify-content: flex-end;
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
	.summary {
		display: flex;
		flex-direction: column;
		gap: var(--a-spacing-1);
	}
</style>
