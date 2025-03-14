<script lang="ts">
	import { page } from '$app/state';
	import { fragment, graphql, type WorkloadImage } from '$houdini';
	import { docURL } from '$lib/doc';
	import SuccessIcon from '$lib/icons/SuccessIcon.svelte';
	import WarningIcon from '$lib/icons/WarningIcon.svelte';
	import { BodyShort, Heading, Link } from '@nais/ds-svelte-community';
	import VulnerabilityBadges from './VulnerabilityBadges.svelte';

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

		{#if !image.hasSBOM && image.vulnerabilitySummary !== null}
			<BodyShort>
				<WarningIcon class="text-aligned-icon" /> Data was discovered, but the SBOM was not rendered.
				Refer to the <Link href={docURL('/services/vulnerabilities/')}>Nais documentation</Link> for
				further assistance.
			</BodyShort>
		{:else if image.vulnerabilitySummary === null}
			<BodyShort>
				<WarningIcon class="text-aligned-icon" /> No data found. <Link
					href={docURL('/services/vulnerabilities/how-to/sbom/')}
					target="_blank">How to fix</Link
				>
			</BodyShort>
		{:else if image.hasSBOM && image.vulnerabilitySummary && hasFindings}
			<VulnerabilityBadges summary={image.vulnerabilitySummary} />
		{:else if image.hasSBOM}
			<BodyShort>
				<SuccessIcon class="text-aligned-icon" /> No vulnerabilities found. Good work!
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
</style>
