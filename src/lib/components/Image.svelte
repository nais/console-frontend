<script lang="ts">
	import { page } from '$app/stores';
	import { fragment, graphql, type WorkloadImage } from '$houdini';
	import { docURL } from '$lib/doc';
	import VulnerabilityBadge from '$lib/icons/VulnerabilityBadge.svelte';
	import WarningIcon from '$lib/icons/WarningIcon.svelte';
	import Time from '$lib/Time.svelte';
	import { severityToColor } from '$lib/utils/vulnerabilities';

	import { Button, Tooltip } from '@nais/ds-svelte-community';

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
					deploymentInfo {
						deployer
						timestamp
						url
					}
				}
			`)
		)
	);

	let workloadName = $derived($data.name);
	let workloadType = $derived($data.__typename === 'Application' ? 'app' : 'job');
	let env = $derived($page.params.env);
	let team = $derived($page.params.team);

	const notificationBadgeSize = '42';

	const isFindings = (summary: {
		readonly critical: number;
		readonly high: number;
		readonly medium: number;
		readonly low: number;
		readonly unassigned: number;
	}): boolean => {
		if (summary.critical > 0) {
			return true;
		}
		if (summary.high > 0) {
			return true;
		}
		if (summary.medium > 0) {
			return true;
		}
		if (summary.low > 0) {
			return true;
		}
		if (summary.unassigned > 0) {
			return true;
		}

		return false;
	};
</script>

{#if $data.image}
	{@const image = $data.image}
	<h4 class="imageHeader">
		Image

		<Button
			as="a"
			variant="secondary"
			size="small"
			href="/team/{team}/{env}/{workloadType}/{workloadName}/image"
			>Details
		</Button>
	</h4>

	<p class="lastActivity">
		{#if $data.deploymentInfo.url}
			<a href={$data.deploymentInfo.url}>Deployed</a>
		{:else}
			Deployed
		{/if}
		{#if $data.deploymentInfo.timestamp}
			<Time time={$data.deploymentInfo.timestamp} distance={true} />
		{/if}
		{#if $data.deploymentInfo.deployer}
			by
			<a href="https://github.com/{$data.deploymentInfo.deployer}" target="_blank"
				>{$data.deploymentInfo.deployer}</a
			>.
		{/if}
	</p>

	<div class="vulnerabilities">
		<h5>
			Vulnerabilities
			<span style="font-weight: normal;">
				(Risk score: {image.vulnerabilitySummary?.riskScore})
			</span>
		</h5>

		{#if image !== null}
			{#if !image.hasSBOM}
				<WarningIcon size="1rem" style="color: var(--a-icon-warning); margin-right: 0.5rem" />
				Data was discovered, but the SBOM was not rendered. Please refer to the
				<a href={docURL('/services/vulnerabilities/')}>NAIS documentation</a>
				for further assistance.
			{:else if image.vulnerabilitySummary === null}
				<WarningIcon size="1rem" style="color: var(--a-icon-warning); margin-right: 0.5rem" />
				No data found.
				<a href={docURL('/services/vulnerabilities/how-to/sbom/')} target="_blank">How to fix</a>
			{:else if image.hasSBOM && image.vulnerabilitySummary && isFindings(image.vulnerabilitySummary)}
				<div class="circles">
					<Tooltip placement="right" content="severity: CRITICAL">
						<VulnerabilityBadge
							text={String(image.vulnerabilitySummary.critical)}
							color={severityToColor('critical')}
							size={notificationBadgeSize}
						/>
					</Tooltip>
					<Tooltip placement="right" content="severity: HIGH">
						<VulnerabilityBadge
							text={String(image.vulnerabilitySummary.high)}
							color={severityToColor('high')}
							size={notificationBadgeSize}
						/>
					</Tooltip>
					<Tooltip placement="right" content="severity: MEDIUM">
						<VulnerabilityBadge
							text={String(image.vulnerabilitySummary.medium)}
							color={severityToColor('medium')}
							size={notificationBadgeSize}
						/>
					</Tooltip>
					<Tooltip placement="right" content="severity: LOW">
						<VulnerabilityBadge
							text={String(image.vulnerabilitySummary.low)}
							color={severityToColor('low')}
							size={notificationBadgeSize}
						/>
					</Tooltip>
					<Tooltip placement="right" content="severity: UNASSIGNED">
						<VulnerabilityBadge
							text={String(image.vulnerabilitySummary.unassigned)}
							color={'#6e6e6e'}
							size={notificationBadgeSize}
						/>
					</Tooltip>
				</div>
			{:else if image.hasSBOM}
				<code class="check">&check;</code> No vulnerabilities found. Good work!
			{/if}
		{/if}
	</div>
{/if}

<style>
	.lastActivity {
		margin-top: 0px;
	}

	.imageHeader {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 8px;
		gap: 0.5rem;
	}

	.vulnerabilities {
		margin-top: 0.5rem;
		grid-column: 1 / span 2;
		grid-row: 3;
	}

	.vulnerabilities h5 {
		margin-bottom: 0.5rem;
	}

	code {
		font-size: 1rem;
	}

	.check {
		font-size: 2rem;
		color: #4dbd74;
		text-align: center;
		padding-left: 4px;
	}
	.circles {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		gap: 0.5rem;
	}
</style>
