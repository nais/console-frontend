<script lang="ts">
	import { PendingValue, fragment, graphql, type AppImage } from '$houdini';
	import Loading from '$lib/Loading.svelte';
	import Time from '$lib/Time.svelte';
	import { logEvent } from '$lib/amplitude';
	import NotificationBadge from '$lib/icons/NotificationBadge.svelte';
	import WarningIcon from '$lib/icons/WarningIcon.svelte';
	import { CopyButton, Tooltip } from '@nais/ds-svelte-community';

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
		`)
	);

	function severityToColor(severity: string) {
		switch (severity) {
			case 'critical':
				return '#f86c6b';
			case 'high':
				return 'orange';
			case 'medium':
				return '#ffc107';
			case 'low':
				return '#6e6e6e';
			default:
				return '#6e6e6e';
		}
	}

	const parseImage = (image: string) => {
		const tag = image.split(':')[1];
		const name = image.split(':')[0].split('/').pop();
		const registry = image.split('/')[0];
		const repository = image.split('/').slice(1, -1).join('/');
		return { registry, repository, name, tag };
	};

	$: image = $data?.image;
	$: deployInfo = $data?.deployInfo;

	const notificationBadgeSize = '38px';
	const onClick = () => {
		let props = {};
		props = {
			routeID: '/dependencytrack/app/findings'
		};
		logEvent('pageview', props);
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
{#if deployInfo?.timestamp === PendingValue}
	<Loading />
{:else if deployInfo.timestamp !== null}
	<p class="lastActivity">
		<a href={deployInfo.url}>Deployed</a>
		<Time time={deployInfo.timestamp} distance={true} />
		{#if deployInfo.deployer && deployInfo.url}
			by
			<a href="https://github.com/{deployInfo.deployer}">{deployInfo.deployer}</a>.
		{/if}
	</p>
{/if}
{#if image === PendingValue}
	<Loading />
{:else}
	{@const { registry, repository, name, tag } = parseImage(image)}
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
			<code>{tag}</code>
		</div>
		{#if $data !== null && $data?.vulnerabilities !== null}
			<div class="vulnerabilities">
				<h5>Vulnerabilities</h5>
				{#if $data.vulnerabilities === PendingValue}
					<Loading />
				{:else if $data.vulnerabilities.summary === null}
					<WarningIcon size="1rem" style="color: var(--a-icon-warning); margin-right: 0.5rem" />
					No data found in dependencytrack.
				{:else}
					{#if $data.vulnerabilities.summary.critical > 0}
						<Tooltip placement="right" content="severity: CRITICAL">
							<NotificationBadge
								text={String($data.vulnerabilities.summary.critical)}
								color={severityToColor('critical')}
								size={notificationBadgeSize}
							/>
						</Tooltip>
					{/if}
					{#if $data.vulnerabilities.summary.high > 0}
						<Tooltip placement="right" content="severity: HIGH">
							<NotificationBadge
								text={String($data.vulnerabilities.summary.high)}
								color={severityToColor('high')}
								size={notificationBadgeSize}
							/>
						</Tooltip>
					{/if}
					{#if $data.vulnerabilities.summary.medium > 0}
						<Tooltip placement="right" content="severity: MEDIUM">
							<NotificationBadge
								text={String($data.vulnerabilities.summary.medium)}
								color={severityToColor('medium')}
								size={notificationBadgeSize}
							/>
						</Tooltip>
					{/if}
					{#if $data.vulnerabilities.summary.low > 0}
						<Tooltip placement="right" content="severity: LOW">
							<NotificationBadge
								text={String($data.vulnerabilities.summary.low)}
								color={severityToColor('low')}
								size={notificationBadgeSize}
							/>
						</Tooltip>
					{/if}
					{#if $data.vulnerabilities.summary.total === 0}
						<Tooltip placement="right" content="No vulnerabilities found, keep up the good work!">
							<NotificationBadge
								text={'0'}
								color={'--var(--a-icon-success)'}
								size={notificationBadgeSize}
							/>
						</Tooltip>
					{:else if !$data.vulnerabilities.hasBom}
						<WarningIcon size="1rem" style="color: var(--a-icon-warning); margin-right: 0.5rem" />
						<span class="small-text"
							>Data was discovered, but the SBOM was not rendered. Please refer to the NAIS
							documentation for further assistance</span
						>
					{:else if $data.vulnerabilities.summary.unassigned > 0}
						<Tooltip placement="right" content="severity: UNASSIGNED">
							<NotificationBadge
								text={String($data.vulnerabilities.summary.unassigned)}
								color={'#6e6e6e'}
								size={notificationBadgeSize}
							/>
						</Tooltip>
					{/if}
					<p>
						<a href={$data.vulnerabilities.findingsLink} on:click={onClick}
							>View findings in DependencyTrack</a
						>
					</p>
				{/if}
			</div>
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

	.small-text {
		font-size: 0.8rem;
	}
</style>
