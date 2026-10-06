<script lang="ts">
	import { page } from '$app/state';
	import ChartBoundary from '#lib/chart/ChartBoundary.svelte';
	import PrometheusStaticUtilizationDonut from '#lib/chart/PrometheusStaticUtilizationDonut.svelte';
	import Labels from '#lib/domain/labels/Labels.svelte';
	import WorkloadLink from '#lib/domain/workload/WorkloadLink.svelte';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import ManifestCard from '#lib/ui/ManifestCard.svelte';
	import SurfaceCard from '#lib/ui/SurfaceCard.svelte';
	import { exhaustive } from '#lib/utils/houdini.js';
	import { BodyShort, Heading, Loader } from '@nais/ds-svelte-community';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { PostgresOverview } = $derived(data);
	let postgres = $derived($PostgresOverview.data?.team.environment.postgres);
	let activeBranch = $derived(postgres?.activeBranch);
	let state = $derived(
		postgres?.desiredActiveBranch && postgres.desiredActiveBranch !== activeBranch?.name
			? 'PROGRESSING'
			: (activeBranch?.state ?? 'PROGRESSING')
	);
	let workloadManifest = $derived(`spec:
  uses:
    postgres:
      - name: ${page.params.postgres}`);
	let podMatcher = $derived(`pod=~"${activeBranch?.clusterName}-[0-9]+"`);
	let pvcMatcher = $derived(`persistentvolumeclaim=~"${activeBranch?.clusterName}-[0-9]+"`);
	let namespace = $derived(`namespace="${page.params.team}"`);
	let cpuQuery = $derived(
		`sum(rate(container_cpu_usage_seconds_total{${namespace},${podMatcher},container="postgres",image!=""}[5m])) / clamp_min(sum(kube_pod_container_resource_requests{${namespace},${podMatcher},container="postgres",resource="cpu",unit="core"}), 0.001)`
	);
	let memoryQuery = $derived(
		`sum(container_memory_working_set_bytes{${namespace},${podMatcher},container="postgres",image!=""}) / clamp_min(sum(kube_pod_container_resource_requests{${namespace},${podMatcher},container="postgres",resource="memory",unit="byte"}), 1)`
	);
	let diskQuery = $derived(
		`sum(kubelet_volume_stats_used_bytes{${namespace},${pvcMatcher}}) / clamp_min(sum(kubelet_volume_stats_capacity_bytes{${namespace},${pvcMatcher}}), 1)`
	);
</script>

<GraphErrors errors={$PostgresOverview.errors} />

{#if $PostgresOverview.fetching && !postgres}
	<div class="loading-centered" role="status" aria-label="Loading">
		<Loader size="3xlarge" />
	</div>
{:else if postgres}
	<div class="layout-two-column">
		<div class="content">
			{#if activeBranch?.clusterName}
				<section aria-labelledby="utilization-heading">
					<Heading as="h2" id="utilization-heading" size="medium" spacing>Utilization</Heading>
					<div class="summary-grid">
						<ChartBoundary>
							<PrometheusStaticUtilizationDonut
								environmentName={postgres.teamEnvironment.environment.name}
								query={cpuQuery}
								label="CPU"
							/>
						</ChartBoundary>
						<ChartBoundary>
							<PrometheusStaticUtilizationDonut
								environmentName={postgres.teamEnvironment.environment.name}
								query={memoryQuery}
								label="Memory"
							/>
						</ChartBoundary>
						<ChartBoundary>
							<PrometheusStaticUtilizationDonut
								environmentName={postgres.teamEnvironment.environment.name}
								query={diskQuery}
								label="Disk"
							/>
						</ChartBoundary>
					</div>
				</section>
			{/if}
			<section aria-labelledby="configuration-heading">
				<Heading as="h2" id="configuration-heading" size="medium" spacing>Configuration</Heading>
				<dl class="settings-list">
					<dt>State</dt>
					<dd>{state.toLowerCase()}</dd>
					<dt>High availability</dt>
					<dd>
						{postgres.highAvailability
							? 'Enabled (primary + 2 replicas)'
							: 'Standard (primary + replica)'}
					</dd>
					<dt>Postgres version</dt>
					<dd>{postgres.majorVersion}</dd>
					<dt>CPU</dt>
					<dd>{postgres.resources.cpu ?? 'Platform default'}</dd>
					<dt>Memory</dt>
					<dd>{postgres.resources.memory ?? 'Platform default'}</dd>
					<dt>Storage</dt>
					<dd>{postgres.resources.diskSize ?? 'Platform default'}</dd>
				</dl>
			</section>
		</div>
		<div class="layout-sidebar">
			<ManifestCard title="Use this Postgres" manifest={workloadManifest} />
			<Labels labels={postgres.labels} />
			<SurfaceCard title="Used by">
				{#if activeBranch}
					{const workloads = $derived(exhaustive(activeBranch.workloads.nodes))}
					{#if workloads.length > 0}
						<ul class="workloads-list">
							{#each workloads as workload (workload.id)}
								<li><WorkloadLink {workload} hideTeam hideEnv /></li>
							{/each}
						</ul>
						{#if activeBranch.workloads.pageInfo.totalCount > workloads.length}
							<BodyShort>
								Showing first {workloads.length} of {activeBranch.workloads.pageInfo.totalCount}
								workloads.
							</BodyShort>
						{/if}
					{:else}
						<BodyShort>Not used by any workloads.</BodyShort>
					{/if}
				{:else}
					<BodyShort>Usage information is not yet available.</BodyShort>
				{/if}
			</SurfaceCard>
		</div>
	</div>
{/if}

<style>
	.summary-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: var(--ax-space-16);
		min-width: 0;
	}
	@media (max-width: 767px) {
		.summary-grid {
			grid-template-columns: 1fr;
		}
	}
	.content {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-24);
		min-width: 0;
	}

	.workloads-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: var(--ax-space-6);
	}
</style>
