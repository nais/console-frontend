<script lang="ts">
	import { page } from '$app/stores';
	import { PendingValue, fragment, graphql, type JobImage } from '$houdini';
	import Time from '$lib/Time.svelte';
	import { Button, Skeleton, Tooltip } from '@nais/ds-svelte-community';
	import { docURL } from '$lib/doc';
	import { severityToColor } from '$lib/utils/vulnerabilities';
	import WarningIcon from '$lib/icons/WarningIcon.svelte';
	import VulnerabilityBadge from '$lib/icons/VulnerabilityBadge.svelte';
	import type { VulnerabilitiesForAppVariables } from '$houdini/types/src/routes/team/[team]/[env]/app/[app]/$houdini';
	import { logEvent } from '$lib/amplitude';

	export let job: JobImage;
	$: data = fragment(
		job,
		graphql(`
			fragment JobImage on NaisJob {
				imageDetails @loading {
					name
					projectId
				}
				deployInfo @loading {
					timestamp @loading
					deployer
					url
				}
			}
		`)
	);

	$: jobName = $page.params.job;
	$: env = $page.params.env;
	$: team = $page.params.team;

	$: deployInfo = $data?.deployInfo;

	export const _VulnerabilitiesForJobVariables: VulnerabilitiesForAppVariables = () => {
		return { job: jobName, env: env, team: team };
	};

	const vulnerabilities = graphql(`
		query VulnerabilitiesForJob($job: String!, $team: Slug!, $env: String!) @load {
			naisjob(name: $job, team: $team, env: $env) @loading {
				vulnerabilities @loading {
					findingsLink
					hasBom
					summary {
						total
						critical
						high
						medium
						low
						unassigned
					}
				}
			}
		}
	`);

	const notificationBadgeSize = '38px';
	const onClick = () => {
		let props = {};
		props = {
			routeID: '/dependencytrack/job/findings'
		};
		logEvent('pageview', props);
	};

	const isFindings = (summary: {
		readonly total: number;
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

	$: vulnz = $vulnerabilities.data;
</script>

<h4 class="imageHeader">
	Image
	{#if $data?.imageDetails !== PendingValue}
		<Button as="a" variant="secondary" size="small" href="/team/{team}/{env}/job/{jobName}/image"
			>Details</Button
		>
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
			<a href="https://github.com/{deployInfo.deployer}">{deployInfo.deployer}</a>.
		{/if}
	{/if}
</p>

<div class="vulnerabilities">
	<h5>Vulnerabilities</h5>
	{#if $vulnerabilities.errors}
		<WarningIcon size="1rem" style="color: var(--a-icon-warning); margin-right: 0.5rem" />
		Could not fetch vulnerabilities. Please try again, and if the error persists, contact the NAIS team.
	{/if}

	{#if vulnz !== null && vulnz.naisjob !== null && vulnz.naisjob.vulnerabilities !== null}
		{#if vulnz.naisjob.vulnerabilities === PendingValue}
			<div style="display: flex;  gap: 0.5rem">
				<Skeleton variant="circle" width="34px" height="34px" />
				<Skeleton variant="circle" width="34px" height="34px" />
				<Skeleton variant="circle" width="34px" height="34px" />
				<Skeleton variant="circle" width="34px" height="34px" />
				<Skeleton variant="circle" width="34px" height="34px" />
			</div>
		{:else if vulnz.naisjob.vulnerabilities.summary === null}
			<WarningIcon size="1rem" style="color: var(--a-icon-warning); margin-right: 0.5rem" />
			No data found.
			<a href={docURL('/services/salsa/#slsa-in-nais')} on:click={onClick}> How to fix</a>
		{:else if vulnz.naisjob.vulnerabilities.hasBom && isFindings(vulnz.naisjob.vulnerabilities.summary)}
			<Tooltip placement="right" content="severity: CRITICAL">
				<VulnerabilityBadge
					text={String(vulnz.naisjob.vulnerabilities.summary.critical)}
					color={severityToColor('critical')}
					size={notificationBadgeSize}
				/>
			</Tooltip>
			<Tooltip placement="right" content="severity: HIGH">
				<VulnerabilityBadge
					text={String(vulnz.naisjob.vulnerabilities.summary.high)}
					color={severityToColor('high')}
					size={notificationBadgeSize}
				/>
			</Tooltip>
			<Tooltip placement="right" content="severity: MEDIUM">
				<VulnerabilityBadge
					text={String(vulnz.naisjob.vulnerabilities.summary.medium)}
					color={severityToColor('medium')}
					size={notificationBadgeSize}
				/>
			</Tooltip>
			<Tooltip placement="right" content="severity: LOW">
				<VulnerabilityBadge
					text={String(vulnz.naisjob.vulnerabilities.summary.low)}
					color={severityToColor('low')}
					size={notificationBadgeSize}
				/>
			</Tooltip>
			<Tooltip placement="right" content="severity: UNASSIGNED">
				<VulnerabilityBadge
					text={String(vulnz.naisjob.vulnerabilities.summary.unassigned)}
					color={'#6e6e6e'}
					size={notificationBadgeSize}
				/>
			</Tooltip>
		{:else if vulnz.naisjob.vulnerabilities.hasBom}
			<code class="check">&check;</code> No vulnerabilities found. Good work!
		{/if}
		{#if vulnerabilities !== null && vulnz.naisjob !== null && vulnz.naisjob.vulnerabilities !== null}
			{#if vulnz.naisjob.vulnerabilities !== PendingValue && vulnz.naisjob.vulnerabilities.summary !== null}
				{#if !vulnz.naisjob.vulnerabilities.hasBom}
					<WarningIcon size="1rem" style="color: var(--a-icon-warning); margin-right: 0.5rem" />
					Data was discovered, but the SBOM was not rendered. Please refer to the
					<a href={docURL('/services/salsa/#slsa-in-nais')} on:click={onClick}>NAIS documentation</a
					>
					for further assistance.
				{/if}
			{/if}
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
	code {
		font-size: 1rem;
	}
</style>
