<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import type { InstanceGroupDetail$result, ValueEncoding$options } from '$houdini';
	import { ValueEncoding } from '$houdini';
	import WorkloadImageCard from '$lib/domain/workload/WorkloadImageCard.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import List from '$lib/ui/List.svelte';
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import Time from '$lib/ui/Time.svelte';
	import { Alert, Heading, Loader, Select, Tag } from '@nais/ds-svelte-community';
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
	const role = $derived(incoming && group?.id === incoming.id ? 'incoming' : 'current');

	function groupLabel(g: InstanceGroup) {
		const r = incoming && g.id === incoming.id ? 'Incoming' : 'Current';
		return allGroups.length > 1 ? `${g.name} (${r})` : g.name;
	}

	function handleGroupChange(e: Event) {
		const target = e.target as HTMLSelectElement;
		const name = target.value;
		if (name && name !== page.params.instancegroup) {
			goto(
				`/team/${page.params.team}/${page.params.env}/app/${page.params.app}/instancegroup/${name}`
			);
		}
	}

	const hasFailing = $derived(group?.instances.some((i) => i.status.state === 'FAILING') ?? false);

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

<div class="heading-row">
	<Heading as="h2" size="medium">{instanceGroupName}</Heading>
	{#if hasFailing}
		<Tag size="small" variant="error">Failing</Tag>
	{/if}
	{#if allGroups.length > 1}
		<Tag size="small" variant={role === 'incoming' ? 'alt1' : 'neutral'}>
			{role === 'incoming' ? 'Incoming' : 'Current'}
		</Tag>
	{/if}
</div>

{#if allGroups.length > 1}
	<div class="group-selector">
		<Select
			label="Switch instance group"
			size="small"
			value={instanceGroupName}
			onchange={handleGroupChange}
		>
			{#each allGroups as g (g.id)}
				<option value={g.name}>{groupLabel(g)}</option>
			{/each}
		</Select>
	</div>
{/if}

<GraphErrors errors={$InstanceGroupDetail.errors} />

{#if $InstanceGroupDetail.fetching}
	<div class="loading">
		<Loader size="3xlarge" />
	</div>
{:else if !group}
	<Alert variant="warning">Instance group "{instanceGroupName}" not found.</Alert>
{:else}
	<div class="page-content">
		<div class="page layout-two-column">
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
							<SurfaceCard title="CPU" level="h4">
								<dl class="resource-kv">
									<div class="kv-row">
										<dt class="kv-label">Request</dt>
										<dd class="kv-value">
											<code>
												{#if application.resources.requests.cpu}
													{application.resources.requests.cpu.toFixed(3)} CPUs
												{:else if application.utilization.requested_cpu}
													{application.utilization.requested_cpu.toFixed(3)} CPUs (default)
												{:else}
													Not set
												{/if}
											</code>
										</dd>
									</div>
									<div class="kv-row">
										<dt class="kv-label">Limit</dt>
										<dd class="kv-value">
											<code>
												{#if application.resources.limits.cpu}
													{application.resources.limits.cpu.toFixed(3)} CPUs
												{:else if application.utilization.limit_cpu}
													{application.utilization.limit_cpu.toFixed(3)} CPUs (default)
												{:else}
													Not set
												{/if}
											</code>
										</dd>
									</div>
									<div class="kv-row">
										<dt class="kv-label">Usage</dt>
										<dd class="kv-value"><code>{usage_cpu_percent.toFixed(1)}%</code></dd>
									</div>
								</dl>
							</SurfaceCard>

							<SurfaceCard title="Memory" level="h4">
								<dl class="resource-kv">
									<div class="kv-row">
										<dt class="kv-label">Request</dt>
										<dd class="kv-value">
											<code>
												{#if application.resources.requests.memory !== null}
													{prettyBytes(application.resources.requests.memory, {
														locale: 'en',
														minimumFractionDigits: 2,
														maximumFractionDigits: 2,
														binary: true
													})}
												{:else}
													{prettyBytes(application.utilization.requested_memory, {
														locale: 'en',
														minimumFractionDigits: 2,
														maximumFractionDigits: 2,
														binary: true
													})} (default)
												{/if}
											</code>
										</dd>
									</div>
									<div class="kv-row">
										<dt class="kv-label">Limit</dt>
										<dd class="kv-value">
											<code>
												{#if application.resources.limits.memory}
													{prettyBytes(application.resources.limits.memory, {
														locale: 'en',
														minimumFractionDigits: 2,
														maximumFractionDigits: 2,
														binary: true
													})}
												{:else if application.utilization.limit_memory}
													{prettyBytes(application.utilization.limit_memory, {
														locale: 'en',
														minimumFractionDigits: 2,
														maximumFractionDigits: 2,
														binary: true
													})} (default)
												{:else}
													Not set
												{/if}
											</code>
										</dd>
									</div>
									<div class="kv-row">
										<dt class="kv-label">Usage</dt>
										<dd class="kv-value"><code>{usage_memory_percent.toFixed(1)}%</code></dd>
									</div>
								</dl>
							</SurfaceCard>
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

			<div class="layout-sidebar">
				<WorkloadImageCard imageName={group.image.name} tag={group.image.tag} />
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
	.group-selector {
		max-width: 20rem;
		margin-bottom: var(--ax-space-16);
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

	.main-column {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-24);
	}

	.heading-row {
		display: flex;
		align-items: center;
		gap: var(--ax-space-8);
		margin-bottom: var(--ax-space-8);
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

	.resource-kv {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-4);
		margin: 0;
	}

	.kv-row {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: var(--ax-space-8);
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
		--instancegroup-list-columns: minmax(0, 2.5fr) 7.5rem minmax(0, 2fr) auto;
	}

	.instances-item {
		align-items: center;
	}

	.meta-text {
		color: var(--ax-text-neutral-subtle);
		white-space: nowrap;
	}

	.exit-info {
		font-size: var(--ax-font-size-small);
		overflow-wrap: anywhere;
	}

	.instance-link {
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
