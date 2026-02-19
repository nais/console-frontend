<script lang="ts">
	import PrometheusUtilizationDonut from '$lib/chart/PrometheusUtilizationDonut.svelte';
	import { Alert, Heading } from '@nais/ds-svelte-community';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { PostgresInstance } = $derived(data);
	let instance = $derived($PostgresInstance.data?.team.environment.postgresInstance);
	let instanceName = $derived(instance?.name ?? '');
	let environmentName = $derived(instance?.teamEnvironment.environment.name ?? '');
	let teamSlug = $derived($PostgresInstance.data?.team.slug ?? '');

	let postgresCpuUtilizationQuery = $derived(`(
		sum(
			rate(container_cpu_usage_seconds_total{
				namespace="pg-${teamSlug}",
				pod=~"${instanceName}-[0-9]+",
				container="postgres",
				image!=""
			}[5m])
			* on (namespace, pod) group_left()
				max by (namespace, pod) (
					1 - pg_replication_is_replica{
						namespace="pg-${teamSlug}",
						pod=~"${instanceName}-[0-9]+"
					}
				)
		)
	)
	/
	clamp_min(
		sum(
			kube_pod_container_resource_requests{
				namespace="pg-${teamSlug}",
				pod=~"${instanceName}-[0-9]+",
				container="postgres",
				resource="cpu",
				unit="core"
			}
			* on (namespace, pod) group_left()
				max by (namespace, pod) (
					1 - pg_replication_is_replica{
						namespace="pg-${teamSlug}",
						pod=~"${instanceName}-[0-9]+"
					}
				)
		),
		0.001
	)`);

	let postgresMemoryUtilizationQuery = $derived(`(
  sum(
    container_memory_working_set_bytes{
      namespace="pg-${teamSlug}",
				pod=~"${instanceName}-[0-9]+",
      container="postgres",
      image!=""
    }
    * on (namespace, pod) group_left()
      max by (namespace, pod) (
        1 - pg_replication_is_replica{
          namespace="pg-${teamSlug}",
						pod=~"${instanceName}-[0-9]+"
        }
      )
  )
)
/
clamp_min(
  sum(
    kube_pod_container_resource_requests{
      namespace="pg-${teamSlug}",
				pod=~"${instanceName}-[0-9]+",
      container="postgres",
      resource="memory",
      unit="byte"
    }
    * on (namespace, pod) group_left()
      max by (namespace, pod) (
        1 - pg_replication_is_replica{
          namespace="pg-${teamSlug}",
						pod=~"${instanceName}-[0-9]+"
        }
      )
  ),
  1
)
`);

	let postgresDiskUtilizationQuery = $derived(`
sum(
  kubelet_volume_stats_used_bytes{namespace="pg-${teamSlug}"}
  * on (namespace, persistentvolumeclaim) group_left(pod)
    kube_pod_spec_volumes_persistentvolumeclaims_info{
      namespace="pg-${teamSlug}",
      pod=~"${instanceName}-[0-9]+"
    }
  * on (namespace, pod) group_left()
    max by (namespace, pod) (
      1 - pg_replication_is_replica{
        namespace="pg-${teamSlug}",
        pod=~"${instanceName}-[0-9]+"
      }
    )
)
/
clamp_min(
  sum(
    kubelet_volume_stats_capacity_bytes{namespace="pg-${teamSlug}"}
    * on (namespace, persistentvolumeclaim) group_left(pod)
      kube_pod_spec_volumes_persistentvolumeclaims_info{
        namespace="pg-${teamSlug}",
        pod=~"${instanceName}-[0-9]+"
      }
    * on (namespace, pod) group_left()
      max by (namespace, pod) (
        1 - pg_replication_is_replica{
          namespace="pg-${teamSlug}",
          pod=~"${instanceName}-[0-9]+"
        }
      )
  ),
  1
)`);

	const distinctErrors = (errors: { message: string }[]) => new Set(errors.map((e) => e.message));
</script>

{#if $PostgresInstance.errors}
	{#each distinctErrors($PostgresInstance.errors) as error (error)}
		<Alert style="margin-bottom: 1rem;" variant="error">
			{error}
		</Alert>
	{/each}
{:else if instance}
	<!-- <pre>{JSON.stringify(instance, null, 2)}</pre> -->
	<Heading as="h2">Utilization</Heading>
	<div class="summary-grid">
		<PrometheusUtilizationDonut
			{environmentName}
			query={postgresCpuUtilizationQuery}
			label="CPU"
			height="200px"
			domainMax={1}
			formatCenterValue={(value) => `${(value * 100).toFixed(1)}%`}
		/>
		<PrometheusUtilizationDonut
			{environmentName}
			query={postgresMemoryUtilizationQuery}
			label="Memory"
			height="200px"
			domainMax={1}
			formatCenterValue={(value) => `${(value * 100).toFixed(1)}%`}
		/>
		<PrometheusUtilizationDonut
			{environmentName}
			query={postgresDiskUtilizationQuery}
			label="Disk"
			height="200px"
			domainMax={1}
			formatCenterValue={(value) => `${(value * 100).toFixed(1)}%`}
		/>
	</div>

	<div class="grid">
		<div>
			<!-- <dl>
				<dt>Instance status:</dt>
				<dd>
					{#if instance.state === 'RUNNABLE'}
						<CheckmarkIcon style="color: var(--ax-text-success-subtle); font-size: 1.5rem" />
					{:else}
						<ErrorIcon class="text-aligned-icon" /> Not healthy. Check status in <ExternalLink
							href="https://console.cloud.google.com/sql/instances/{postgres}/overview?project={instance.projectID}&supportedpurview=project"
						>
							Google Cloud Console
						</ExternalLink>
					{/if}
				</dd>
				<dt>Version:</dt>
				<dd>{instance.version}</dd>
				<dt>Tier:</dt>
				<dd>{instance.tier}</dd>
				{#if viewerIsMember}
					<dt>Console:</dt>
					<dd>
						<ExternalLink
							href="https://console.cloud.google.com/sql/instances/{postgres}/overview?project={instance.projectID}&supportedpurview=project"
						>
							Google Cloud Console
						</ExternalLink>
					</dd>
					{#if instance.auditLog?.logUrl}
						<dt>Audit Logs:</dt>
						<dd>
							<ExternalLink href={instance.auditLog.logUrl}>View Logs</ExternalLink>
						</dd>
					{/if}
				{/if}
			</dl> -->

			<!-- <Heading as="h3" spacing>Issues</Heading>
			<List>
				{#each $SqlInstance.data?.team.environment.sqlInstance.issues.edges ?? [] as edge (edge.node.id)}
					<IssueListItem item={edge.node} />
				{:else}
					<span>No issues found</span>
				{/each}
			</List> -->
		</div>
		<!-- <div>
			<Heading as="h2" size="small">Owner</Heading>
			{#if instance.workload}
				<WorkloadLink workload={instance.workload} />
			{:else}
				<WarningIcon title="The SQL instance does not belong to any workload" />
				Instance does not belong to any workload
			{/if}
		</div> -->
	</div>
{/if}

<style>
	/* dl {
		display: grid;
		gap: var(--ax-space-8);
		grid-template-columns: max-content max-content;

		dd {
			margin: 0;
		}
	} */
	.grid {
		display: grid;
		grid-template-columns: 1fr 300px;
		gap: var(--ax-space-16);
	}
	.summary-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
		margin-bottom: 1rem;
	}
</style>
