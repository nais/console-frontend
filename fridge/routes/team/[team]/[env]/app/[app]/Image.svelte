<script lang="ts">
	import { page } from '$app/stores';
	import { PendingValue, fragment, graphql, type AppImage } from '$houdini';

	import Time from '$lib/Time.svelte';
	import { docURL } from '$lib/doc';
	import VulnerabilityBadge from '$lib/icons/VulnerabilityBadge.svelte';
	import WarningIcon from '$lib/icons/WarningIcon.svelte';
	import { severityToColor } from '$lib/utils/vulnerabilities';
	import { Button, Skeleton, Tooltip } from '@nais/ds-svelte-community';

	export let app: AppImage;
	$: data = fragment(
		app,
		graphql(`
			fragment AppImage on App {
				imageDetails @loading {
					name
					hasSbom
					projectId
					summary {
						critical
						high
						medium
						low
						unassigned
					}
				}
				deployInfo @loading {
					timestamp @loading
					deployer
					url
				}
			}
		`)
	);

	$: appName = $page.params.app;
	$: env = $page.params.env;
	$: team = $page.params.team;

	$: imageDetails = $data.imageDetails;
	$: deployInfo = $data?.deployInfo;

	const notificationBadgeSize = '38px';

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

<h4 class="imageHeader">
	Image
	{#if $data?.imageDetails !== PendingValue}
		<Button as="a" variant="secondary" size="small" href="/team/{team}/{env}/app/{appName}/image"
			>Details
		</Button>
	{/if}
</h4>

<p class="lastActivity">
	{#if deployInfo?.timestamp === PendingValue}
		<Skeleton variant="text" width="40%" />
	{:else if deployInfo.timestamp !== null}
		{#if deployInfo.url === ''}
			Deployed
		{:else}
			<a href={deployInfo.url}>Deployed</a>
		{/if}
		<Time time={deployInfo.timestamp} distance={true} />
		{#if deployInfo.deployer !== ''}
			by
			<a href="https://github.com/{deployInfo.deployer}" target="_blank">{deployInfo.deployer}</a>.
		{/if}
	{/if}
</p>

<div class="vulnerabilities">
	<h5>Vulnerabilities</h5>

	{#if imageDetails !== null}
		{#if imageDetails === PendingValue}
			<div style="display: flex;  gap: 0.5rem">
				<Skeleton variant="circle" width="34px" height="34px" />
				<Skeleton variant="circle" width="34px" height="34px" />
				<Skeleton variant="circle" width="34px" height="34px" />
				<Skeleton variant="circle" width="34px" height="34px" />
				<Skeleton variant="circle" width="34px" height="34px" />
			</div>
		{:else if !imageDetails.hasSbom && imageDetails.projectId !== ''}
			<WarningIcon size="1rem" style="color: var(--a-icon-warning); margin-right: 0.5rem" />
			Data was discovered, but the SBOM was not rendered. Please refer to the
			<a href={docURL('/security/salsa/#slsa-in-nais')}>NAIS documentation</a>
			for further assistance.
		{:else if imageDetails.summary === null}
			<WarningIcon size="1rem" style="color: var(--a-icon-warning); margin-right: 0.5rem" />
			No data found.
			<a href={docURL('/services/salsa/#slsa-in-nais')} target="_blank">How to fix</a>
		{:else if imageDetails.hasSbom && isFindings(imageDetails.summary)}
			<Tooltip placement="right" content="severity: CRITICAL">
				<VulnerabilityBadge
					text={String(imageDetails.summary.critical)}
					color={severityToColor('critical')}
					size={notificationBadgeSize}
				/>
			</Tooltip>
			<Tooltip placement="right" content="severity: HIGH">
				<VulnerabilityBadge
					text={String(imageDetails.summary.high)}
					color={severityToColor('high')}
					size={notificationBadgeSize}
				/>
			</Tooltip>
			<Tooltip placement="right" content="severity: MEDIUM">
				<VulnerabilityBadge
					text={String(imageDetails.summary.medium)}
					color={severityToColor('medium')}
					size={notificationBadgeSize}
				/>
			</Tooltip>
			<Tooltip placement="right" content="severity: LOW">
				<VulnerabilityBadge
					text={String(imageDetails.summary.low)}
					color={severityToColor('low')}
					size={notificationBadgeSize}
				/>
			</Tooltip>
			<Tooltip placement="right" content="severity: UNASSIGNED">
				<VulnerabilityBadge
					text={String(imageDetails.summary.unassigned)}
					color={'#6e6e6e'}
					size={notificationBadgeSize}
				/>
			</Tooltip>
		{:else if imageDetails.hasSbom}
			<code class="check">&check;</code> No vulnerabilities found. Good work!
		{/if}
	{/if}
</div>

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
</style>
