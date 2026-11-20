<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import type { InstanceGroupDetail$result, ValueEncoding$options } from '$houdini';
	import { ValueEncoding } from '$houdini';
	import Resource from '#lib/domain/resources/Resource.svelte';
	import { applicationInstanceStatus } from '#lib/domain/workload/applicationReadiness.js';
	import { instanceLastExit } from '#lib/domain/workload/instanceLastExit.js';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import Collection from '#lib/ui/Collection.svelte';
	import SurfaceCard from '#lib/ui/SurfaceCard.svelte';
	import Time from '#lib/ui/Time.svelte';
	import { formatImageRef } from '#lib/utils/image.js';
	import {
		Alert,
		CopyButton,
		Heading,
		Loader,
		Table,
		Tag,
		Tbody,
		Td,
		Th,
		Thead,
		ToggleGroup,
		ToggleGroupItem,
		Tr
	} from '#lib/shadcn/ui/index.js';
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
			label="Switch instance group"
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
				{const role = $derived(groupRole(g))}
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

<GraphErrors errors={$InstanceGroupDetail.errors} />

{#if $InstanceGroupDetail.fetching}
	<div class="loading" role="status" aria-label="Loading">
		<Loader size="3xlarge" />
	</div>
{:else if !group}
	<Alert variant="warning">Instance group "{instanceGroupName}" not found.</Alert>
{:else}
	<Heading as="h2" class="sr-only">Instance group</Heading>
	<div class="page-content">
		<div class="page">
			<div class="main-column">
				{#if group.instances.length > 0}
					<section class="section">
						<Collection title="Instances" count={group.instances.length} level="h3">
							<Table size="small" class="instances-table" aria-label="Instances" role="table">
								<Thead class="instances-header" role="rowgroup">
									<Tr role="row">
										<Th scope="col" role="columnheader" class="instance-heading">Instance</Th>
										<Th scope="col" role="columnheader">Status</Th>
										<Th scope="col" role="columnheader" align="right" class="restarts-heading">
											Restarts
										</Th>
										<Th scope="col" role="columnheader" align="right" class="created-heading">
											Created
										</Th>
									</Tr>
								</Thead>
								<Tbody role="rowgroup">
									{#each group.instances as instance (instance.id)}
										{const status = $derived(applicationInstanceStatus(instance.status))}
										{const exit = $derived(instanceLastExit(instance.status))}
										<Tr class="instance-row" role="row" shadeOnHover={false}>
											<Th scope="row" role="rowheader" class="instance-name">
												<a
													href="{baseUrl}/logs?{new URLSearchParams({ instance: instance.name })}"
													aria-label="{instance.name} logs"
													class="instance-link"
												>
													{instance.name}
												</a>
											</Th>
											<Td class="instance-status" role="cell">
												<div class="diagnosis">
													<Tag size="small" variant={status.variant}>{status.label}</Tag>
													{#if instance.status.message}
														<p>{instance.status.message}</p>
													{/if}
													{#if exit}
														<p class="exit-info">
															Last exit: {exit.description}{#if exit.timestamp}{#if exit.description},
																{/if}<Time time={exit.timestamp} distance />{/if}
														</p>
													{/if}
												</div>
											</Td>
											<Td align="right" class="instance-restarts" role="cell">
												{instance.restarts}<span class="mobile-label" aria-hidden="true"
													>{instance.restarts === 1 ? ' restart' : ' restarts'}</span
												>
											</Td>
											<Td align="right" class="instance-created" role="cell">
												<span class="mobile-label" aria-hidden="true">Created </span>
												<Time time={instance.created} distance />
											</Td>
										</Tr>
									{/each}
								</Tbody>
							</Table>
						</Collection>
					</section>
				{/if}

				<section class="section">
					<div class="image-line">
						<Heading as="h3" size="xsmall">Image</Heading>
						<div class="image-url">
							<code>{formatImageRef(group.image)}</code>
							<CopyButton copyText={formatImageRef(group.image)} size="xsmall" variant="action" />
						</div>
					</div>
				</section>

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
							{const scaling = $derived(application.resources.scaling)}
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
	.group-selector {
		margin-bottom: var(--nais-space-16);
	}

	.toggle-label {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--nais-space-2);
	}

	.toggle-role-name {
		display: flex;
		align-items: baseline;
		gap: var(--nais-space-6);
	}

	.toggle-role {
		font-size: var(--sh-font-size-sm);
		font-weight: var(--sh-font-weight-semibold);
	}

	.toggle-name {
		font-size: var(--sh-font-size-sm);
		font-family: monospace;
		opacity: 0.75;
	}

	.toggle-time {
		font-size: var(--sh-font-size-sm);
		opacity: 0.6;
	}

	.page-content {
		display: flex;
		flex-direction: column;
		gap: var(--nais-space-40);
		width: 100%;
	}

	.page {
		width: 100%;
	}

	.image-line {
		display: flex;
		flex-direction: column;
		gap: var(--nais-space-4);
	}

	.image-url {
		display: flex;
		align-items: baseline;
		gap: var(--nais-space-8);
	}

	.image-line code {
		font-family: monospace;
		font-size: var(--sh-font-size-sm);
		word-break: break-all;
	}

	.main-column {
		display: flex;
		flex-direction: column;
		gap: var(--nais-space-24);
	}

	.section {
		display: flex;
		flex-direction: column;
		gap: var(--nais-space-16);
		width: 100%;
	}

	.page :global(code) {
		font-size: var(--sh-font-size-sm);
		color: var(--foreground);
	}

	.resource-cards {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--nais-space-12);
	}

	.kv-label {
		font-size: var(--sh-font-size-sm);
		color: var(--muted-foreground);
	}

	.kv-value {
		font-size: var(--sh-font-size-sm);
	}

	.scaling-stats {
		display: flex;
		flex-wrap: wrap;
		gap: var(--nais-space-24);
	}

	.scaling-stat {
		display: flex;
		flex-direction: column;
		gap: var(--nais-space-4);
	}

	@media (max-width: 767px) {
		.resource-cards {
			grid-template-columns: 1fr;
		}
	}

	:global(.instances-table) {
		table-layout: fixed;
	}

	:global(.instances-table .instance-heading) {
		width: 27%;
	}

	:global(.instances-table .restarts-heading) {
		width: 10ch;
	}

	:global(.instances-table .created-heading) {
		width: 22ch;
	}

	:global(.instances-table .instance-row > *) {
		padding-block: var(--nais-space-12);
		vertical-align: top;
		overflow-wrap: anywhere;
	}

	.diagnosis {
		display: grid;
		justify-items: start;
		gap: var(--nais-space-4);
		line-height: var(--sh-font-line-height-compact);
	}

	.diagnosis p {
		margin: 0;
	}

	.exit-info,
	:global(.instances-table .instance-restarts),
	:global(.instances-table .instance-created) {
		color: var(--muted-foreground);
	}

	:global(.instances-table :is(.instance-restarts, .instance-created)) {
		font-variant-numeric: tabular-nums;
	}

	.instance-link {
		color: var(--link);
		font-weight: var(--sh-font-weight-medium);
		text-decoration: underline;
	}

	.mobile-label {
		display: none;
	}

	@container (max-width: 620px) {
		:global(.instances-table),
		:global(.instances-table tbody) {
			display: block;
		}

		:global(.instances-table .instances-header) {
			position: absolute;
			width: 1px;
			height: 1px;
			padding: 0;
			margin: -1px;
			overflow: hidden;
			clip-path: inset(50%);
			white-space: nowrap;
		}

		:global(.instances-table .instance-row) {
			display: grid;
			grid-template-columns: auto minmax(0, 1fr);
			column-gap: var(--nais-space-12);
			row-gap: var(--nais-space-6);
			padding: var(--nais-space-12);
		}

		:global(.instances-table .instance-row > *) {
			padding: 0;
		}

		:global(.instances-table :is(.instance-name, .instance-status)) {
			grid-column: 1 / -1;
		}

		:global(.instances-table .instance-restarts) {
			text-align: left;
		}

		.mobile-label {
			display: inline;
		}
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
