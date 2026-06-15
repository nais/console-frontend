<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import type { InstanceGroupDetail$result, ValueEncoding$options } from '$houdini';
	import { ValueEncoding } from '$houdini';
	import Resource from '$lib/domain/resources/Resource.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import List from '$lib/ui/List.svelte';
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import Time from '$lib/ui/Time.svelte';
	import {
		Alert,
		CopyButton,
		Heading,
		Loader,
		Tag,
		ToggleGroup,
		ToggleGroupItem
	} from '@nais/ds-svelte-community';
	import prettyBytes from 'pretty-bytes';
	import { SvelteMap } from 'svelte/reactivity';
	import ViewSecretModal from '../../../../secret/[secret]/ViewSecretModal.svelte';
	import type { PageProps } from './$types';
	import EnvironmentVariables from './EnvironmentVariables.svelte';
	import MountedFiles from './MountedFiles.svelte';

	type InstanceGroup =
		InstanceGroupDetail$result['team']['environment']['application']['instanceGroups'][number];

	let { data }: PageProps = $props();
	let { InstanceGroupDetail, instanceGroupName } = $derived(data);

	const group = $derived(
		$InstanceGroupDetail.data?.team.environment.application.instanceGroups.find(
			(g: InstanceGroup) => g.name === instanceGroupName
		)
	);

	const application = $derived($InstanceGroupDetail.data?.team.environment.application);
	const allGroups = $derived(application?.instanceGroups ?? []);
	const viewerIsMember = $derived($InstanceGroupDetail.data?.team.viewerIsMember ?? false);

	// Determine if this group is "current" or "incoming"
	const incoming = $derived(
		allGroups.length > 1
			? allGroups.reduce((newest, g) =>
					new Date(g.created) > new Date(newest.created) ? g : newest
				)
			: null
	);
	const oldest = $derived(
		allGroups.length > 1
			? allGroups.reduce((o, g) => (new Date(g.created) < new Date(o.created) ? g : o))
			: null
	);

	function groupRole(g: InstanceGroup): string {
		if (allGroups.length === 1) return '';
		if (incoming && g.id === incoming.id) return 'Incoming';
		if (oldest && g.id === oldest.id) return 'Current';
		return 'Stalled';
	}

	function groupShortName(g: InstanceGroup): string {
		const prefix = application?.name ? `${application.name}-` : '';
		return prefix && g.name.startsWith(prefix) ? g.name.slice(prefix.length) : g.name;
	}

	function groupHasFailing(g: InstanceGroup) {
		return g.instances.some((i) => i.status.state === 'FAILING');
	}

	const hasFailing = $derived(group ? groupHasFailing(group) : false);

	const baseUrl = $derived(
		application
			? `/team/${application.team.slug}/${application.teamEnvironment.environment.name}/app/${application.name}`
			: ''
	);

	const teamSlug = $derived(application?.team.slug ?? '');
	const environmentName = $derived(application?.teamEnvironment.environment.name ?? '');

	// Secret reveal state
	let revealedValues = new SvelteMap<string, string>();
	let revealModalOpen = $state(false);
	let revealSecretName = $state('');
	// When set, the reveal was triggered for a file download — auto-download on success
	let pendingFileDownload = $state<{ fileName: string; keyName: string } | null>(null);

	const mountErrors = $derived(group?.mountedFiles.filter((f) => f.error !== null) ?? []);

	// Collect source names that have errors — used to filter out env vars and files from broken sources
	const erroredSourceNames = $derived(
		new Set(mountErrors.map((f) => f.source.name).filter(Boolean))
	);

	const visibleEnvVars = $derived(
		group?.environmentVariables.filter((e) => !erroredSourceNames.has(e.source.name)) ?? []
	);

	const visibleMountedFiles = $derived(group?.mountedFiles.filter((f) => f.error === null) ?? []);

	const secretNames = $derived(
		[
			...new Set(
				visibleEnvVars.filter((e) => e.source.kind === 'SECRET').map((e) => e.source.name) ?? []
			)
		].filter(Boolean) as string[]
	);

	const hasSecrets = $derived(secretNames.length > 0);
	const hasSecretFiles = $derived(visibleMountedFiles.some((f) => f.source.kind === 'SECRET'));
	const needsSecretModal = $derived(hasSecrets || hasSecretFiles);

	function handleRevealSuccess(
		values: { name: string; value: string; encoding: ValueEncoding$options }[]
	) {
		if (pendingFileDownload) {
			// Triggered for file download — find matching key and download
			const match = values.find((v) => v.name === pendingFileDownload!.keyName);
			if (match) {
				downloadMountedFile(pendingFileDownload.fileName, match.value, match.encoding);
			}
			pendingFileDownload = null;
		} else {
			// Triggered for env var reveal
			for (const v of values) {
				revealedValues.set(v.name, v.value);
			}
		}
	}

	function hideSecretValues() {
		revealedValues.clear();
	}

	// Resources & scaling
	const cpu_usage = $derived(application?.utilization.current_cpu ?? 0);
	const memory_usage = $derived(application?.utilization.current_memory ?? 0);

	const usage_cpu_percent = $derived(
		application?.utilization.requested_cpu
			? (cpu_usage / application.utilization.requested_cpu) * 100
			: 0
	);

	const usage_memory_percent = $derived(
		application?.utilization.requested_memory
			? (memory_usage / application.utilization.requested_memory) * 100
			: 0
	);

	const cpuReqRecommendation = $derived(
		application?.utilization.recommendations.cpuRequestCores ?? 0
	);
	const cpuReq = $derived(application?.resources.requests.cpu ?? 0);
	const memReqRecommendation = $derived(
		application?.utilization.recommendations.memoryRequestBytes ?? 0
	);
	const memReq = $derived(application?.resources.requests.memory ?? 0);

	const cpuRequestDisplay = $derived.by(() => {
		if (application?.resources.requests.cpu) {
			return `${application.resources.requests.cpu.toFixed(3)} CPUs`;
		}

		if (application?.utilization.requested_cpu) {
			return `${application.utilization.requested_cpu.toFixed(3)} CPUs (default)`;
		}

		return 'Not set';
	});

	const cpuLimitDisplay = $derived.by(() => {
		if (application?.resources.limits.cpu) {
			return `${application.resources.limits.cpu.toFixed(3)} CPUs`;
		}

		if (application?.utilization.limit_cpu) {
			return `${application.utilization.limit_cpu.toFixed(3)} CPUs (default)`;
		}

		return 'Not set';
	});

	const memoryRequestDisplay = $derived.by(() => {
		if (application?.resources.requests.memory != null) {
			return prettyBytes(application!.resources.requests.memory, {
				locale: 'en',
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
				binary: true
			});
		}

		if (application?.utilization.requested_memory) {
			return `${prettyBytes(application.utilization.requested_memory, {
				locale: 'en',
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
				binary: true
			})} (default)`;
		}

		return 'Not set';
	});

	const memoryLimitDisplay = $derived.by(() => {
		if (application?.resources.limits.memory) {
			return prettyBytes(application.resources.limits.memory, {
				locale: 'en',
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
				binary: true
			});
		}

		if (application?.utilization.limit_memory) {
			return `${prettyBytes(application.utilization.limit_memory, {
				locale: 'en',
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
				binary: true
			})} (default)`;
		}

		return 'Not set';
	});

	const cpuUsageDisplay = $derived(`${usage_cpu_percent.toFixed(1)}%`);
	const memoryUsageDisplay = $derived(`${usage_memory_percent.toFixed(1)}%`);

	function renameStrategy(type: string) {
		if (type === 'CPUScalingStrategy') return 'CPU usage';
		if (type === 'KafkaLagScalingStrategy') return 'Kafka Lag';
		return 'Unknown';
	}

	function isIn50PercentRange(n: number, target: number): boolean {
		const lowerBound = target * 0.5;
		const upperBound = target * 1.5;
		return n >= lowerBound && n <= upperBound;
	}

	function stateName(state: string): string {
		switch (state) {
			case 'RUNNING':
				return 'Running';
			case 'FAILING':
				return 'Failing';
			case 'STARTING':
				return 'Starting';
			case 'TERMINATED':
				return 'Terminated';
			default:
				return state;
		}
	}

	function downloadMountedFile(filePath: string, content: string, encoding: string) {
		const fileName = filePath.split('/').pop() ?? filePath;
		const isBinary = encoding === ValueEncoding.BASE64;
		let blob: Blob;
		if (isBinary) {
			const binaryString = atob(content);
			const bytes = new Uint8Array(binaryString.length);
			for (let i = 0; i < binaryString.length; i++) {
				bytes[i] = binaryString.charCodeAt(i);
			}
			blob = new Blob([bytes], { type: 'application/octet-stream' });
		} else {
			blob = new Blob([content], { type: 'application/octet-stream' });
		}
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = fileName;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}
</script>

{#if allGroups.length > 1}
	<div class="group-selector">
		<ToggleGroup
			size="small"
			value={instanceGroupName}
			onchange={(v) => {
				if (v && v !== page.params.instancegroup) {
					goto(
						`/team/${page.params.team}/${page.params.env}/app/${page.params.app}/instancegroup/${v}`
					);
				}
			}}
		>
			{#each allGroups as g (g.id)}
				{@const role = groupRole(g)}
				<ToggleGroupItem value={g.name}>
					<span class="toggle-label">
						<span class="toggle-role-name"
							><span class="toggle-role">{role}</span>
							<span class="toggle-name">{groupShortName(g)}</span></span
						>
						<span class="toggle-time"><Time time={g.created} distance /></span>
					</span>
				</ToggleGroupItem>
			{/each}
		</ToggleGroup>
	</div>
{/if}

{#if hasFailing}
	<div class="status-row">
		<Tag size="small" variant="error">Failing</Tag>
	</div>
{/if}

<GraphErrors errors={$InstanceGroupDetail.errors} />

{#if $InstanceGroupDetail.fetching}
	<div class="loading" role="status" aria-label="Loading">
		<Loader size="3xlarge" />
	</div>
{:else if !group}
	<Alert variant="warning">Instance group "{instanceGroupName}" not found.</Alert>
{:else}
	<div class="page-content">
		<div class="page">
			<div class="main-column">
				{#if group.instances.length > 0}
					<section class="section">
						<List title="Instances" count={group.instances.length} level="h3">
							<ul class="instancegroup-list instances-list">
								{#each group.instances as instance (instance.id)}
									<li class="instancegroup-list-item instances-item">
										<div class="instancegroup-list-cell">
											<span class="instancegroup-list-label">Name</span>
											<a href="{baseUrl}/logs?instance={instance.name}" class="instance-link">
												{instance.name}
											</a>
										</div>

										<div class="instancegroup-list-cell">
											<span class="instancegroup-list-label">Status</span>
											<Tag
												size="small"
												variant={instance.status.state === 'RUNNING'
													? 'success'
													: instance.status.state === 'FAILING'
														? 'error'
														: instance.status.state === 'TERMINATED'
															? 'neutral'
															: 'info'}
											>
												{stateName(instance.status.state)}
											</Tag>
										</div>

										<div class="instancegroup-list-cell">
											<span class="instancegroup-list-label">Message</span>
											{#if instance.status.lastExitReason && instance.restarts > 0}
												<span class="exit-info">
													Last exit: {instance.status
														.lastExitReason}{#if instance.status.lastExitCode !== null && instance.status.lastExitCode !== undefined}
														(code {instance.status
															.lastExitCode}){/if}{#if instance.status.lastExitTimestamp}, <Time
															time={instance.status.lastExitTimestamp}
															distance
														/>{/if}
												</span>
											{:else if instance.status.message && instance.status.message.toLowerCase() !== instance.status.state.toLowerCase()}
												{instance.status.message}
											{:else}
												<span class="muted">—</span>
											{/if}
										</div>

										<div class="instancegroup-list-cell instance-meta">
											<span class="instancegroup-list-label">Restarts &amp; age</span>
											<span class="meta-text">
												{#if instance.restarts > 0}{instance.restarts}
													{instance.restarts === 1 ? 'restart' : 'restarts'} ·{/if}
												Started <Time time={instance.created} distance />
											</span>
										</div>
									</li>
								{/each}
							</ul>
						</List>
						<div class="image-line">
							<Heading as="h3" size="xsmall">Image</Heading>
							<div class="image-url">
								<code>{group.image.name}:{group.image.tag}</code>
								<CopyButton
									copyText={`${group.image.name}:${group.image.tag}`}
									size="xsmall"
									variant="action"
								/>
							</div>
						</div>
					</section>
				{/if}

				{#if application}
					<section class="section">
						<Heading as="h3" size="small">
							{#if application.resources.scaling && application.resources.scaling.minInstances !== application.resources.scaling.maxInstances}
								Resources and Scaling
							{:else}
								Resources
							{/if}
						</Heading>
						{#if !isIn50PercentRange(cpuReq, cpuReqRecommendation) || !isIn50PercentRange(memReq, memReqRecommendation)}
							<Alert variant="info" size="small">
								CPU and/or memory requests differ by more than 50% from the recommended values.
								Consider adjusting the requested resources. See the <a href="{baseUrl}/utilization"
									>utilization</a
								> page for details.
							</Alert>
						{/if}

						<div class="resource-cards">
							<Resource
								title="CPU"
								request={cpuRequestDisplay}
								limit={cpuLimitDisplay}
								usage={cpuUsageDisplay}
							/>

							<Resource
								title="Memory"
								request={memoryRequestDisplay}
								limit={memoryLimitDisplay}
								usage={memoryUsageDisplay}
							/>
						</div>

						{#if application.resources.scaling}
							{@const scaling = application.resources.scaling}
							{#if scaling.minInstances !== scaling.maxInstances}
								<SurfaceCard level="h4">
									<div class="scaling-stats">
										{#if scaling.strategies && scaling.strategies.length > 0}
											{#each scaling.strategies as strategy (strategy)}
												<div class="scaling-stat">
													<span class="kv-label">Strategy</span>
													<span class="kv-value">{renameStrategy(strategy.__typename)}</span>
												</div>
												<div class="scaling-stat">
													<span class="kv-label">Threshold</span>
													<span class="kv-value">
														<code>
															{#if strategy.__typename === 'KafkaLagScalingStrategy'}
																{strategy.threshold}
															{:else}
																{strategy.threshold}%
															{/if}
														</code>
													</span>
												</div>
											{/each}
										{:else}
											<div class="scaling-stat">
												<span class="kv-label">Strategy</span>
												<span class="kv-value">CPU usage</span>
											</div>
											<div class="scaling-stat">
												<span class="kv-label">Threshold</span>
												<span class="kv-value"><code>50%</code></span>
											</div>
										{/if}
										<div class="scaling-stat">
											<span class="kv-label">Instances</span>
											<span class="kv-value"
												><code>{scaling.minInstances} – {scaling.maxInstances}</code></span
											>
										</div>
									</div>
								</SurfaceCard>
							{/if}
						{/if}
					</section>
				{/if}
			</div>
		</div>

		<EnvironmentVariables
			envVars={visibleEnvVars}
			{viewerIsMember}
			{revealedValues}
			onReveal={(secretName) => {
				revealSecretName = secretName;
				revealModalOpen = true;
			}}
			onHideAll={hideSecretValues}
		/>

		<MountedFiles
			files={visibleMountedFiles}
			{viewerIsMember}
			onDownloadConfigMap={downloadMountedFile}
			onDownloadSecret={(fileName, secretName) => {
				pendingFileDownload = { fileName, keyName: fileName };
				revealSecretName = secretName;
				revealModalOpen = true;
			}}
		/>
	</div>

	{#if needsSecretModal && viewerIsMember}
		<ViewSecretModal
			bind:open={revealModalOpen}
			{teamSlug}
			{environmentName}
			secretName={revealSecretName}
			onSuccess={handleRevealSuccess}
		/>
	{/if}
{/if}

<style>
	.status-row {
		display: flex;
		gap: var(--ax-space-8);
		margin-bottom: var(--ax-space-4);
	}

	.group-selector {
		margin-bottom: var(--ax-space-16);
	}

	.toggle-label {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--ax-space-2);
	}

	.toggle-role-name {
		display: flex;
		align-items: baseline;
		gap: var(--ax-space-6);
	}

	.toggle-role {
		font-size: var(--ax-font-size-small);
		font-weight: var(--ax-font-weight-bold);
	}

	.toggle-name {
		font-size: var(--ax-font-size-small);
		font-family: monospace;
		opacity: 0.75;
	}

	.toggle-time {
		font-size: var(--ax-font-size-small);
		opacity: 0.6;
	}

	.page-content {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-40);
		width: 100%;
	}

	.page {
		width: 100%;
	}

	.image-line {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-4);
	}

	.image-url {
		display: flex;
		align-items: baseline;
		gap: var(--ax-space-8);
	}

	.image-line code {
		font-family: monospace;
		font-size: var(--ax-font-size-small);
		word-break: break-all;
	}

	.main-column {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-24);
	}

	.section {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-16);
		width: 100%;
	}

	.page :global(code) {
		font-size: var(--ax-font-size-small);
		color: var(--ax-text-neutral);
	}

	.resource-cards {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--ax-space-12);
	}

	.kv-label {
		font-size: var(--ax-font-size-small);
		color: var(--ax-text-neutral-subtle);
	}

	.kv-value {
		font-size: var(--ax-font-size-small);
	}

	.scaling-stats {
		display: flex;
		flex-wrap: wrap;
		gap: var(--ax-space-24);
	}

	.scaling-stat {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-4);
	}

	@media (max-width: 767px) {
		.resource-cards {
			grid-template-columns: 1fr;
		}
	}

	.muted {
		color: var(--ax-text-neutral-subtle);
	}

	.instances-list {
		--instancegroup-list-columns: 22rem 7.5rem 1fr 14rem;
		font-size: var(--ax-font-size-small);
		color: var(--ax-text-neutral-subtle);
	}

	.instances-item {
		align-items: center;
	}

	.meta-text {
		white-space: nowrap;
	}

	.exit-info {
		overflow-wrap: anywhere;
	}

	.instance-link {
		color: var(--ax-text-neutral);
		overflow-wrap: anywhere;
		word-break: break-word;
	}

	.loading {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 500px;
	}

	a {
		color: inherit;
		text-decoration: none;
	}

	a:hover {
		text-decoration: underline;
	}
</style>
