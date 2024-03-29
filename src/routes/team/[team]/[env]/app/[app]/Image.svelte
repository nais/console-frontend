<script lang="ts">
	import { page } from '$app/stores';
	import { PendingValue, fragment, graphql, type AppImage } from '$houdini';

	import Time from '$lib/Time.svelte';
	import { logEvent } from '$lib/amplitude';
	import VulnerabilityBadge from '$lib/icons/VulnerabilityBadge.svelte';
	import WarningIcon from '$lib/icons/WarningIcon.svelte';
	import { parseImage } from '$lib/utils/image';
	import { severityToColor } from '$lib/utils/vulnerabilities';
	import { CopyButton, Skeleton, Tooltip } from '@nais/ds-svelte-community';
	import type { VulnerabilitiesForAppVariables } from './$houdini';

	export let app: AppImage;
	$: data = fragment(
		app,
		graphql(`
			fragment AppImage on App {
				image @loading
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

	export const _VulnerabilitiesForAppVariables: VulnerabilitiesForAppVariables = () => {
		return { app: appName, env: env, team: team };
	};

	const vulnerabilities = graphql(`
		query VulnerabilitiesForApp($app: String!, $team: Slug!, $env: String!) @load {
			app(name: $app, team: $team, env: $env) @loading {
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

	$: appVulnerabilities = $vulnerabilities.data;

	$: image = $data?.image;
	$: deployInfo = $data?.deployInfo;

	let registry: string;
	let repository: string;
	let name: string;
	let tag: string;

	$: {
		if (image !== PendingValue) {
			({ registry, repository, name, tag } = parseImage(image));
		}
	}

	const notificationBadgeSize = '38px';
	const onClick = () => {
		let props = {};
		props = {
			routeID: '/dependencytrack/app/findings'
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
</script>

<h4 class="imageHeader">
	Image
	{#if image !== PendingValue}
		<CopyButton
			size="xsmall"
			variant="action"
			text="Copy image name"
			activeText="Image name copied"
			copyText={image}
		/>
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

<div class="imageGrid">
	<div class="registry">
		<h5>Registry</h5>
		{#if image === PendingValue}
			<Skeleton variant="text" width="80%" />
		{:else}
			<code>{registry}</code>
		{/if}
	</div>
	<div class="repository">
		<h5>Repository</h5>
		{#if image === PendingValue}
			<Skeleton variant="text" width="80%" />
		{:else}
			<code>{repository}</code>
		{/if}
	</div>
	<div class="imageName">
		<h5>Name</h5>
		{#if image === PendingValue}
			<Skeleton variant="text" width="80%" />
		{:else}
			<code>{name}</code>
		{/if}
	</div>
	<div class="tag">
		<h5>Tag</h5>
		{#if image === PendingValue}
			<Skeleton variant="text" width="80%" />
		{:else}
			<code>{tag}</code>
		{/if}
	</div>
	<div class="vulnerabilities">
		<h5>Vulnerabilities</h5>
		{#if $vulnerabilities.errors}
			<WarningIcon size="1rem" style="color: var(--a-icon-warning); margin-right: 0.5rem" />
			Could not fetch vulnerabilities. Please try again, and if the error persists, contact the NAIS
			team.
		{/if}

		{#if appVulnerabilities !== null && appVulnerabilities.app !== null && appVulnerabilities.app.vulnerabilities !== null}
			{#if appVulnerabilities.app.vulnerabilities === PendingValue}
				<div style="display: flex;  gap: 0.5rem">
					<Skeleton variant="circle" width="34px" height="34px" />
					<Skeleton variant="circle" width="34px" height="34px" />
					<Skeleton variant="circle" width="34px" height="34px" />
					<Skeleton variant="circle" width="34px" height="34px" />
					<Skeleton variant="circle" width="34px" height="34px" />
				</div>
			{:else if appVulnerabilities.app.vulnerabilities.summary === null}
				<WarningIcon size="1rem" style="color: var(--a-icon-warning); margin-right: 0.5rem" />
				No data found in dependencytrack.
				<a
					href="https://doc.nav.cloud.nais.io/security/salsa/salsa/#slsa-in-nais"
					on:click={onClick}>How to fix</a
				>
			{:else if appVulnerabilities.app.vulnerabilities.hasBom && isFindings(appVulnerabilities.app.vulnerabilities.summary)}
				<Tooltip placement="right" content="severity: CRITICAL">
					<VulnerabilityBadge
						text={String(appVulnerabilities.app.vulnerabilities.summary.critical)}
						color={severityToColor('critical')}
						size={notificationBadgeSize}
					/>
				</Tooltip>
				<Tooltip placement="right" content="severity: HIGH">
					<VulnerabilityBadge
						text={String(appVulnerabilities.app.vulnerabilities.summary.high)}
						color={severityToColor('high')}
						size={notificationBadgeSize}
					/>
				</Tooltip>
				<Tooltip placement="right" content="severity: MEDIUM">
					<VulnerabilityBadge
						text={String(appVulnerabilities.app.vulnerabilities.summary.medium)}
						color={severityToColor('medium')}
						size={notificationBadgeSize}
					/>
				</Tooltip>
				<Tooltip placement="right" content="severity: LOW">
					<VulnerabilityBadge
						text={String(appVulnerabilities.app.vulnerabilities.summary.low)}
						color={severityToColor('low')}
						size={notificationBadgeSize}
					/>
				</Tooltip>
				<Tooltip placement="right" content="severity: UNASSIGNED">
					<VulnerabilityBadge
						text={String(appVulnerabilities.app.vulnerabilities.summary.unassigned)}
						color={'#6e6e6e'}
						size={notificationBadgeSize}
					/>
				</Tooltip>
			{:else if appVulnerabilities.app.vulnerabilities.hasBom}
				<code class="check">&check;</code> No vulnerabilities found. Keep up the good work!
			{/if}
			{#if appVulnerabilities !== null && appVulnerabilities.app !== null && appVulnerabilities.app.vulnerabilities !== null}
				{#if appVulnerabilities.app.vulnerabilities !== PendingValue && appVulnerabilities.app.vulnerabilities.summary !== null}
					{#if !appVulnerabilities.app.vulnerabilities.hasBom}
						<WarningIcon size="1rem" style="color: var(--a-icon-warning); margin-right: 0.5rem" />
						Data was discovered, but the SBOM was not rendered. Please refer to the
						<a
							href="https://doc.nav.cloud.nais.io/security/salsa/salsa/#slsa-in-nais"
							on:click={onClick}>NAIS documentation</a
						>
						for further assistance.
					{/if}
					<p>
						<a href={appVulnerabilities.app.vulnerabilities.findingsLink} on:click={onClick}
							>View findings in DependencyTrack</a
						>
					</p>
				{/if}
			{/if}
		{/if}
	</div>
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

	.imageGrid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		column-gap: 0rem;
		row-gap: 0rem;
	}

	.registry {
		grid-column: 1;
		grid-row: 1;
	}

	.repository {
		grid-column: 2;
		grid-row: 1;
	}

	.imageName {
		grid-column: 1;
		grid-row: 2;
	}

	.tag {
		grid-column: 2;
		grid-row: 2;
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
