<script lang="ts">
	import PrometheusUtilizationDonut from '$lib/chart/PrometheusUtilizationDonut.svelte';
	import { docURL } from '$lib/doc';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
	import { Alert, BodyShort, CopyButton, Heading } from '@nais/ds-svelte-community';
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

	const workloadManifest = $derived(`spec:
  postgres:
    clusterName: ${instanceName}`);

	const distinctErrors = (errors: { message: string }[]) => new Set(errors.map((e) => e.message));
</script>

{#if $PostgresInstance.errors}
	{#each distinctErrors($PostgresInstance.errors) as error (error)}
		<Alert style="margin-bottom: 1rem;" variant="error">
			{error}
		</Alert>
	{/each}
{:else if instance}
	<div class="wrapper">
		<div>
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
			{#if instance.audit.enabled && instance.audit.url}
				<BodyShort
					>Audit enabled - <ExternalLink href={instance.audit.url}>View audit logs</ExternalLink
					></BodyShort
				>
			{/if}
		</div>

		<div class="sidebar">
			<div>
				<Heading as="h3">Resources</Heading>
				<BodyShort>CPU: {instance.resources.cpu}</BodyShort>
				<BodyShort>Memory: {instance.resources.memory}</BodyShort>
				<BodyShort>Storage: {instance.resources.diskSize}</BodyShort>
			</div>
			<div>
				<Heading as="h3">Postgres Major Version</Heading>
				<BodyShort>{instance.majorVersion}</BodyShort>
			</div>
			<div>
				<Heading as="h2" size="medium" spacing>Use this Postgres</Heading>

				<Heading as="h3" size="xsmall">Documentation</Heading>
				<div class="value">
					<ExternalLink href={docURL('/persistence/postgresql/explanations/postgres-cluster/')}
						>How-to guide</ExternalLink
					>
				</div>

				<Heading as="h3" size="xsmall">
					Manifest
					<CopyButton
						activeText="Manifest copied"
						title="Copy manifest to clipboard"
						variant="neutral"
						copyText={workloadManifest}
						size="xsmall"
					/>
				</Heading>
				<pre class="manifest">{workloadManifest}</pre>
			</div>
		</div>
	</div>
{/if}

<style>
	.wrapper {
		display: grid;
		grid-template-columns: 1fr 300px;
		gap: var(--spacing-layout);
	}

	.summary-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
		margin-bottom: 1rem;
	}
	.sidebar {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
	}

	.manifest {
		display: block;
		font-size: var(--ax-font-size-small);
		word-break: break-word;
		white-space: pre-wrap;
		margin: 0.5rem 1rem;
	}
</style>
