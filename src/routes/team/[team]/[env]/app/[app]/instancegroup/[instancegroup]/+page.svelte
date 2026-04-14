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
		Button,
		CopyButton,
		Heading,
		Loader,
		Table,
		Tbody,
		Td,
		Th,
		Thead,
		Tr,
		Tag,
		Chips,
		ToggleChip
	} from '@nais/ds-svelte-community';
	import { EyeIcon, EyeSlashIcon, DownloadIcon } from '@nais/ds-svelte-community/icons';
	import { setPageHeaderWarning, setPageHeaderError } from '$lib/ui/pageHeaderState.svelte';
	import type { PageProps } from './$types';
	import type { ValueEncoding$options } from '$houdini';
	import { ValueEncoding } from '$houdini';
	import { parse as parseYaml } from 'yaml';

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

	const hasError = $derived(group?.events.some((e) => e.severity === 'ERROR') ?? false);
	const hasWarning = $derived(group?.events.some((e) => e.severity === 'WARNING') ?? false);

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
		setPageHeaderWarning(hasWarning && !hasError);
		setPageHeaderError(hasError);
		return () => {
			setPageHeaderWarning(false);
			setPageHeaderError(false);
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
				downloadMountedFile(
					pendingFileDownload.fileName,
					match.value,
					match.encoding === ValueEncoding.BASE64
				);
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

	let eventFilter = $state<string | null>(null);

	const filteredEvents = $derived(
		group?.events.filter((e) => {
			if (eventFilter === null) return true;
			return e.sourceInstance === eventFilter;
		}) ?? []
	);

	function severityVariant(severity: string): 'error' | 'warning' | 'info' {
		switch (severity) {
			case 'ERROR':
				return 'error';
			case 'WARNING':
				return 'warning';
			default:
				return 'info';
		}
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
			default:
				return state;
		}
	}

	function downloadMountedFile(filePath: string, content: string, isBinary: boolean) {
		const fileName = filePath.split('/').pop() ?? filePath;
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

	function fileNameFromPath(filePath: string): string {
		return filePath.split('/').pop() ?? filePath;
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
				{#if incoming || hasError || hasWarning}
					<Tr>
						<Th>Status</Th>
						<Td>
							<span class="status-tags">
								{#if hasError}
									<Tag size="small" variant="error">Failing</Tag>
								{/if}
								{#if hasWarning && !hasError}
									<Tag size="small" variant="warning">Warning</Tag>
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
												: 'info'}
									>
										{stateName(instance.status.state)}
									</Tag>
									{#if instance.status.message && instance.status.message.toLowerCase() !== instance.status.state.toLowerCase()}
										<span class="muted">{instance.status.message}</span>
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

		{#if visibleEnvVars.length > 0}
			<section>
				<div class="section-header">
					<Heading as="h3" size="small" spacing>Environment Variables</Heading>
					{#if hasSecrets && viewerIsMember && revealedValues.size > 0}
						<Button size="xsmall" variant="tertiary" icon={EyeSlashIcon} onclick={hideSecretValues}>
							Hide secret values
						</Button>
					{/if}
				</div>
				<Table size="small" zebraStripes>
					<Thead>
						<Tr>
							<Th>Name</Th>
							<Th>Value</Th>
							<Th style="white-space: nowrap; min-width: 400px">Source</Th>
						</Tr>
					</Thead>
					<Tbody>
						{#each visibleEnvVars as env (env.name)}
							<Tr>
								<Td><code>{env.name}</code></Td>
								<Td>
									{#if env.source.kind === 'SECRET' && revealedValues.has(env.name)}
										<span class="env-value">
											<code>{revealedValues.get(env.name)}</code>
											<CopyButton size="xsmall" copyText={revealedValues.get(env.name) ?? ''} />
										</span>
									{:else if env.source.kind === 'SECRET'}
										<span class="env-value">
											<span class="masked">••••••••••••••••</span>
											{#if viewerIsMember}
												<Button
													size="xsmall"
													variant="tertiary-neutral"
													icon={EyeIcon}
													onclick={() => {
														revealSecretName = env.source.name;
														revealModalOpen = true;
													}}
												/>
											{/if}
										</span>
									{:else if env.value !== null}
										<span class="env-value">
											<code>{env.value}</code>
											<CopyButton size="xsmall" copyText={env.value} />
										</span>
									{:else}
										<span class="muted">-</span>
									{/if}
								</Td>
								<Td>
									<span class="source">
										{env.source.kind === 'SPEC'
											? specEnvNames.has(env.name)
												? 'Application manifest'
												: 'Nais'
											: env.source.kind === 'CONFIG_MAP'
												? 'ConfigMap'
												: 'Secret'}
										{#if env.source.kind !== 'SPEC' && env.source.name}/ {env.source.name}{/if}
									</span>
								</Td>
							</Tr>
						{/each}
					</Tbody>
				</Table>
			</section>
		{/if}

		{#if visibleMountedFiles.length > 0}
			<section>
				<Heading as="h3" size="small" spacing>Mounted Files</Heading>
				<Table size="small" zebraStripes>
					<Thead>
						<Tr>
							<Th>Path</Th>
							<Th>Source</Th>
							<Th style="width: 1%"></Th>
						</Tr>
					</Thead>
					<Tbody>
						{#each visibleMountedFiles as file (file.path)}
							<Tr>
								<Td><code>{file.path}</code></Td>
								<Td>
									<span class="source">
										{file.source.kind === 'CONFIG_MAP'
											? 'ConfigMap'
											: file.source.kind === 'SECRET'
												? 'Secret'
												: 'Spec'}
										{#if file.source.name}/ {file.source.name}{/if}
									</span>
								</Td>
								<Td>
									{#if file.source.kind === 'CONFIG_MAP' && file.content !== null}
										<Button
											size="xsmall"
											variant="tertiary-neutral"
											icon={DownloadIcon}
											title="Download {fileNameFromPath(file.path)}"
											onclick={() =>
												downloadMountedFile(file.path, file.content ?? '', file.isBinary)}
										/>
									{:else if file.source.kind === 'SECRET' && viewerIsMember}
										<Button
											size="xsmall"
											variant="tertiary-neutral"
											icon={DownloadIcon}
											title="Download {fileNameFromPath(file.path)}"
											onclick={() => {
												pendingFileDownload = {
													fileName: fileNameFromPath(file.path),
													keyName: fileNameFromPath(file.path)
												};
												revealSecretName = file.source.name;
												revealModalOpen = true;
											}}
										/>
									{/if}
								</Td>
							</Tr>
						{/each}
					</Tbody>
				</Table>
			</section>
		{/if}

		{#if group.events.length > 0}
			<section>
				<Heading as="h3" size="small" spacing>
					Events ({group.events.length})
				</Heading>
				<BodyShort size="small" style="color: var(--ax-text-neutral-subtle)" spacing>
					Events are only available for approximately 30 minutes.
				</BodyShort>
				<Chips>
					<ToggleChip
						value="All"
						selected={eventFilter === null}
						onclick={() => (eventFilter = null)}
					/>
					{#each group.instances as instance (instance.id)}
						<ToggleChip
							value={instance.name}
							selected={eventFilter === instance.name}
							onclick={() => (eventFilter = instance.name)}
						/>
					{/each}
				</Chips>
				<Table size="small" zebraStripes>
					<Thead>
						<Tr>
							<Th>Severity</Th>
							<Th>Message</Th>
							<Th>Instance</Th>
							<Th>Time</Th>
						</Tr>
					</Thead>
					<Tbody>
						{#each filteredEvents as event, i (i)}
							<Tr>
								<Td>
									<Tag size="small" variant={severityVariant(event.severity)}>
										{event.severity}
									</Tag>
								</Td>
								<Td>{event.message}</Td>
								<Td>
									{#if event.sourceInstance}
										<code>{event.sourceInstance}</code>
									{:else}
										<span class="muted">-</span>
									{/if}
								</Td>
								<Td><Time time={event.timestamp} distance /></Td>
							</Tr>
						{/each}
					</Tbody>
				</Table>
			</section>
		{/if}
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

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
	}

	.masked {
		color: var(--ax-text-neutral-subtle);
		user-select: none;
	}

	.page :global(code) {
		font-size: var(--ax-font-size-small);
		color: var(--ax-text-neutral);
	}

	.env-value {
		display: flex;
		align-items: center;
		gap: var(--ax-space-4);
	}

	.source {
		color: var(--ax-text-neutral-subtle);
		font-size: var(--ax-font-size-small);
	}

	.muted {
		color: var(--ax-text-neutral-subtle);
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
