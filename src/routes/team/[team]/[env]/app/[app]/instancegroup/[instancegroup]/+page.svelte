<script lang="ts">
	import type { InstanceGroupDetail$result } from '$houdini';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import Time from '$lib/ui/Time.svelte';
	import ViewSecretModal from '../../../../secret/[secret]/ViewSecretModal.svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import prettyBytes from 'pretty-bytes';
	import {
		Alert,
		BodyShort,
		Heading,
		Loader,
		Table,
		Tbody,
		Td,
		Th,
		Thead,
		Tr,
		Tag
	} from '@nais/ds-svelte-community';
	import { pageHeaderState } from '$lib/stores/pageHeaderState.svelte';
	import type { PageProps } from './$types';
	import type { ValueEncoding$options } from '$houdini';
	import { ValueEncoding } from '$houdini';
	import { parse as parseYaml } from 'yaml';
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

	// Parse manifest to extract user-defined env var names from spec.env
	const specEnvNames = $derived.by(() => {
		const content = application?.manifest?.content;
		if (!content) return new Set<string>();
		try {
			const doc = parseYaml(content);
			const envList = doc?.spec?.env;
			if (!Array.isArray(envList)) return new Set<string>();
			return new Set<string>(
				envList
					.map((e: { name?: string }) => e.name)
					.filter((n): n is string => typeof n === 'string')
			);
		} catch {
			return new Set<string>();
		}
	});

	// Determine if this group is "current" or "incoming"
	const incoming = $derived(
		allGroups.length > 1
			? allGroups.reduce((newest, g) =>
					new Date(g.created) > new Date(newest.created) ? g : newest
				)
			: null
	);
	const role = $derived(incoming && group?.id === incoming.id ? 'incoming' : 'current');

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

	$effect(() => {
		pageHeaderState.error = hasFailing;
		return () => {
			pageHeaderState.error = false;
		};
	});

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

<GraphErrors errors={$InstanceGroupDetail.errors} />

{#if $InstanceGroupDetail.fetching}
	<div style="display: flex; justify-content: center; align-items: center; height: 500px;">
		<Loader size="3xlarge" />
	</div>
{:else if !group}
	<Alert variant="warning">Instance group "{instanceGroupName}" not found.</Alert>
{:else}
	<div class="page">
		<Table size="small">
			<Tbody>
				<Tr>
					<Th>Image</Th>
					<Td><code>{group.image.name}:{group.image.tag}</code></Td>
				</Tr>
				{#if incoming || hasFailing}
					<Tr>
						<Th>Status</Th>
						<Td>
							<span class="status-tags">
								{#if hasFailing}
									<Tag size="small" variant="error">Failing</Tag>
								{/if}
								{#if incoming}
									<Tag size="small" variant={role === 'incoming' ? 'alt1' : 'neutral'}>
										{role === 'incoming' ? 'Incoming' : 'Current'}
									</Tag>
								{/if}
							</span>
						</Td>
					</Tr>
				{/if}
			</Tbody>
		</Table>

		{#if group.instances.length > 0}
			<section>
				<Heading as="h3" size="small" spacing>
					Instances ({group.instances.length})
				</Heading>
				<Table size="small" zebraStripes>
					<Thead>
						<Tr>
							<Th>Name</Th>
							<Th>Status</Th>
							<Th>Message</Th>
							<Th>Restarts</Th>
							<Th>Created</Th>
						</Tr>
					</Thead>
					<Tbody>
						{#each group.instances as instance (instance.id)}
							<Tr>
								<Td>
									<a href="{baseUrl}/logs?instance={instance.name}">{instance.name}</a>
								</Td>
								<Td>
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
								</Td>
								<Td>
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
										<span class="muted">-</span>
									{/if}
								</Td>
								<Td>{instance.restarts}</Td>
								<Td><Time time={instance.created} distance /></Td>
							</Tr>
						{/each}
					</Tbody>
				</Table>
			</section>
		{/if}

		{#if application}
			<section>
				{#if !isIn50PercentRange(cpuReq, cpuReqRecommendation) || !isIn50PercentRange(memReq, memReqRecommendation)}
					<Alert variant="info" size="small" style="margin-bottom: var(--ax-space-8);">
						CPU and/or memory requests differ by more than 50% from the recommended values. Consider
						adjusting the requested resources. See the <a href="{baseUrl}/utilization"
							>utilization</a
						> page for details.
					</Alert>
				{/if}

				<Heading as="h3" size="small" spacing>Resources</Heading>
				<BodyShort
					size="small"
					style="color: var(--ax-text-neutral-subtle); margin-bottom: var(--ax-space-4)"
				>
					Request is the guaranteed amount of resources allocated to the application. Limit is the
					maximum it can use before being throttled (CPU) or terminated (memory).
				</BodyShort>
				<Table size="small" zebraStripes>
					<Thead>
						<Tr>
							<Th>Resource</Th>
							<Th>Request</Th>
							<Th>Limit</Th>
							<Th>Usage</Th>
						</Tr>
					</Thead>
					<Tbody>
						<Tr>
							<Td>CPU</Td>
							<Td>
								<code>
									{#if application.resources.requests.cpu}
										{application.resources.requests.cpu.toFixed(3)} CPUs
									{:else if application.utilization.requested_cpu}
										{application.utilization.requested_cpu.toFixed(3)} CPUs (default)
									{:else}
										Not set
									{/if}
								</code>
							</Td>
							<Td>
								<code>
									{#if application.resources.limits.cpu}
										{application.resources.limits.cpu.toFixed(3)} CPUs
									{:else if application.utilization.limit_cpu}
										{application.utilization.limit_cpu.toFixed(3)} CPUs (default)
									{:else}
										Not set
									{/if}
								</code>
							</Td>
							<Td><code>{usage_cpu_percent.toFixed(1)}%</code></Td>
						</Tr>
						<Tr>
							<Td>Memory</Td>
							<Td>
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
							</Td>
							<Td>
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
							</Td>
							<Td><code>{usage_memory_percent.toFixed(1)}%</code></Td>
						</Tr>
					</Tbody>
				</Table>
			</section>

			{#if application.resources.scaling}
				{@const scaling = application.resources.scaling}
				{#if scaling.minInstances !== scaling.maxInstances}
					<section>
						<Heading as="h3" size="small" spacing>Scaling</Heading>
						<Table size="small" zebraStripes>
							<Thead>
								<Tr>
									<Th>Strategy</Th>
									<Th>Threshold</Th>
									<Th>Min instances</Th>
									<Th>Max instances</Th>
								</Tr>
							</Thead>
							<Tbody>
								{#if scaling.strategies && scaling.strategies.length > 0}
									{#each scaling.strategies as strategy (strategy)}
										<Tr>
											<Td>{renameStrategy(strategy.__typename)}</Td>
											<Td>
												<code>
													{#if strategy.__typename === 'KafkaLagScalingStrategy'}
														{strategy.threshold}
													{:else}
														{strategy.threshold}%
													{/if}
												</code>
											</Td>
											<Td><code>{scaling.minInstances}</code></Td>
											<Td><code>{scaling.maxInstances}</code></Td>
										</Tr>
									{/each}
								{:else}
									<Tr>
										<Td>CPU usage</Td>
										<Td><code>50%</code></Td>
										<Td><code>{scaling.minInstances}</code></Td>
										<Td><code>{scaling.maxInstances}</code></Td>
									</Tr>
								{/if}
							</Tbody>
						</Table>
					</section>
				{/if}
			{/if}
		{/if}

		<EnvironmentVariables
			envVars={visibleEnvVars}
			{specEnvNames}
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
	.page {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
	}

	section {
		display: flex;
		flex-direction: column;
	}

	.page :global(code) {
		font-size: var(--ax-font-size-small);
		color: var(--ax-text-neutral);
	}

	.muted {
		color: var(--ax-text-neutral-subtle);
	}

	.exit-info {
		font-size: var(--ax-font-size-small);
	}

	.status-tags {
		display: flex;
		gap: var(--ax-space-4);
	}

	a {
		color: inherit;
		text-decoration: none;
	}

	a:hover {
		text-decoration: underline;
	}
</style>
