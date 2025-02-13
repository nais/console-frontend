<script lang="ts">
	import { page } from '$app/state';
	import { fragment, graphql, type WorkloadImage } from '$houdini';
	import { docURL } from '$lib/doc';
	import { severityToColor } from '$lib/utils/vulnerabilities';
	import { BodyShort, Heading, Link, Tooltip } from '@nais/ds-svelte-community';
	import {
		CheckmarkCircleFillIcon,
		ExclamationmarkTriangleFillIcon
	} from '@nais/ds-svelte-community/icons';

	interface Props {
		workload: WorkloadImage;
	}

	let { workload }: Props = $props();

	let data = $derived(
		fragment(
			workload,
			graphql(`
				fragment WorkloadImage on Workload {
					__typename
					name
					image {
						name
						hasSBOM
						tag
						vulnerabilitySummary {
							critical
							high
							medium
							low
							unassigned
							riskScore
						}
					}
					deployments(first: 1) {
						nodes {
							deployerUsername
							createdAt
							triggerUrl
						}
					}
				}
			`)
		)
	);

	const imageDetailsUrl = $derived(
		`/team/${page.params.team}/${page.params.env}/${$data.__typename === 'Application' ? 'app' : 'job'}/${$data.name}/image`
	);

	const categories = ['critical', 'high', 'medium', 'low', 'unassigned'] as const;
	const hasFindings = categories.some(
		(severity) => ($data.image.vulnerabilitySummary?.[severity] ?? 0) > 0
	);
</script>

{#if $data.image}
	{@const image = $data.image}
	<div class="wrapper">
		<Heading level="3" size="small">Vulnerabilities</Heading>

		{#if !image.hasSBOM}
			<BodyShort>
				<ExclamationmarkTriangleFillIcon
					class="text-aligned-icon"
					style="color: var(--a-icon-warning)"
				/> Data was discovered, but the SBOM was not rendered. Please refer to the <Link
					href={docURL('/services/vulnerabilities/')}>NAIS documentation</Link
				> for further assistance.
			</BodyShort>
		{:else if image.vulnerabilitySummary === null}
			<BodyShort>
				<ExclamationmarkTriangleFillIcon
					class="text-aligned-icon"
					style="color: var(--a-icon-warning)"
				/> No data found. <Link
					href={docURL('/services/vulnerabilities/how-to/sbom/')}
					target="_blank">How to fix</Link
				>
			</BodyShort>
		{:else if image.hasSBOM && image.vulnerabilitySummary && hasFindings}
			<BodyShort>Risk score: {image.vulnerabilitySummary.riskScore}</BodyShort>
			<div class="vulnerability-summary">
				{#each categories as category (category)}
					<Tooltip content={category}>
						<BodyShort
							class="vulnerability-count"
							style="background-color: {severityToColor(category)}"
						>
							{image.vulnerabilitySummary[category]}
						</BodyShort>
					</Tooltip>
				{/each}
			</div>
		{:else if image.hasSBOM}
			<BodyShort>
				<CheckmarkCircleFillIcon class="text-aligned-icon" style="color: var(--a-icon-success)" /> No
				vulnerabilities found. Good work!
			</BodyShort>
		{/if}

		<Link href={imageDetailsUrl}>View image details</Link>
	</div>
{/if}

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--a-spacing-1);
		align-items: start;
	}

	.vulnerability-summary {
		display: flex;
		gap: 1px;
		margin-bottom: var(--a-spacing-3);

		:global(:first-child > .vulnerability-count) {
			border-top-left-radius: 4px;
			border-bottom-left-radius: 4px;
		}

		:global(:last-child > .vulnerability-count) {
			border-top-right-radius: 4px;
			border-bottom-right-radius: 4px;
		}

		:global(.vulnerability-count) {
			padding: 4px 10px;
		}
	}
</style>
