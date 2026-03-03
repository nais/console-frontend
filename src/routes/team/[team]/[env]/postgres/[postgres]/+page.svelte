<script lang="ts">
	import PrometheusUtilizationDonut from '$lib/chart/PrometheusUtilizationDonut.svelte';
	import { docURL } from '$lib/doc';
	import WorkloadLink from '$lib/domain/workload/WorkloadLink.svelte';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
	import { sanitizePromLabel } from '$lib/utils/formatters';
	import { Alert, BodyShort, CopyButton, Heading } from '@nais/ds-svelte-community';
	import { CheckmarkIcon, XMarkIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { PostgresInstance, viewerIsMember } = $derived(data);

	let instance = $derived($PostgresInstance.data?.team.environment.postgresInstance);
	let instanceName = $derived(sanitizePromLabel(instance?.name ?? ''));
	let environmentName = $derived(instance?.teamEnvironment.environment.name ?? '');
	let teamSlug = $derived(sanitizePromLabel($PostgresInstance.data?.team.slug ?? ''));
	let grafanaPostgresOverviewUrl = $derived.by(() => {
		const datasource = encodeURIComponent(environmentName);
		const namespace = encodeURIComponent(`pg-${teamSlug}`);
		const instancePod = encodeURIComponent(`${instanceName}-0`);

		return `https://grafana.nav.cloud.nais.io/d/postgres/postgres-overview?orgId=1&from=now-15m&to=now&timezone=browser&var-datasource=${datasource}&var-namespace=${namespace}&var-instance=${instancePod}&var-datname=$__all&var-mode=$__all&refresh=15m`;
	});

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
    clusterName: ${instance?.name || ''}`);

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

			<div class="details">
				<div class="details-sections">
					<div>
						<Heading as="h3" size="small">State</Heading>
						<BodyShort>{instance.state}</BodyShort>
					</div>

					<div>
						<Heading as="h3" size="small">Settings</Heading>
						<dl class="settings-list">
							<dt>High availability</dt>
							<dd>
								{instance.highAvailability
									? 'Enabled (primary + 2 replicas)'
									: 'Standard (primary + replica)'}
							</dd>
						</dl>
					</div>

					<div>
						<Heading as="h3" size="small">Version</Heading>
						<dl class="settings-list">
							<dt>Postgres major version</dt>
							<dd>{instance.majorVersion}</dd>
						</dl>
					</div>

					<div>
						<Heading as="h3" size="small">Resources</Heading>
						<dl class="settings-list">
							<dt>CPU</dt>
							<dd>{instance.resources.cpu}</dd>
							<dt>Memory</dt>
							<dd>{instance.resources.memory}</dd>
							<dt>Storage</dt>
							<dd>{instance.resources.diskSize}</dd>
						</dl>
					</div>

					<div>
						<Heading as="h3" size="small">Maintenance window</Heading>
						<BodyShort>
							{instance.maintenanceWindow
								? `${instance.maintenanceWindow.day} at ${instance.maintenanceWindow.hour}:00 UTC`
								: 'Not configured (maintenance can run at any time)'}
						</BodyShort>
					</div>

					<div>
						<Heading as="h3" size="small">Audit</Heading>
						{#if instance.audit.enabled}
							<div class="status">
								<CheckmarkIcon style="color: var(--ax-text-success-subtle);" />
								<BodyShort>Audit logging enabled</BodyShort>
							</div>
							<BodyShort>PGAudit statement classes:</BodyShort>
							{#if instance.audit.statementClasses?.length}
								<ul class="statement-classes">
									{#each instance.audit.statementClasses as statementClass (statementClass)}
										<li><span class="mono">{statementClass}</span></li>
									{/each}
								</ul>
							{/if}
							{#if instance.audit.url && viewerIsMember}
								<BodyShort>
									<ExternalLink href={instance.audit.url}>View audit logs</ExternalLink>
								</BodyShort>
							{/if}
						{:else}
							<div class="status">
								<XMarkIcon style="color: var(--ax-text-danger-decoration);" />
								<BodyShort>Audit logging disabled</BodyShort>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>

		<div class="sidebar">
			<div>
				<Heading as="h2" size="medium" spacing>Used by</Heading>
				{#if instance.workloads.nodes.length > 0}
					<ul class="workloads-list">
						{#each instance.workloads.nodes as workload (workload.id)}
							<li><WorkloadLink {workload} hideTeam hideEnv /></li>
						{/each}
					</ul>
					{#if instance.workloads.pageInfo.totalCount > instance.workloads.nodes.length}
						<BodyShort>
							Showing first {instance.workloads.nodes.length} of {instance.workloads.pageInfo
								.totalCount}
							workloads.
						</BodyShort>
					{/if}
				{:else}
					<BodyShort>Not used by any workloads.</BodyShort>
				{/if}
			</div>
			<div>
				<Heading as="h2" size="medium" spacing>Observability</Heading>
				<div class="value">
					<ExternalLink href={grafanaPostgresOverviewUrl}>Grafana dashboard</ExternalLink>
				</div>
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

	.details {
		margin-top: var(--ax-space-12);
	}

	.details-sections {
		display: grid;
		gap: var(--ax-space-12);
		margin: var(--ax-space-8) 0 0;
	}

	.settings-list {
		display: grid;
		grid-template-columns: 18ch minmax(0, 1fr);
		gap: var(--ax-space-4) var(--ax-space-8);
		margin: 0;
		align-items: baseline;
	}

	.settings-list dt {
		font-weight: var(--ax-font-weight-bold);
		color: var(--ax-text-neutral-subtle);
	}

	.settings-list dd {
		margin: 0;
	}

	.status {
		display: inline-flex;
		align-items: center;
		gap: var(--ax-space-4);
	}

	.mono {
		font-family: monospace;
		font-size: 0.95rem;
	}

	.statement-classes {
		margin: 0;
		padding-left: var(--ax-space-16);
	}

	.workloads-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: var(--ax-space-6);
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
