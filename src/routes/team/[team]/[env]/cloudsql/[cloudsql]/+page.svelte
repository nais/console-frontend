<script lang="ts">
	import { page } from '$app/state';
	import StaticUtilizationDonut from '$lib/chart/StaticUtilizationDonut.svelte';
	import IssueListItem from '$lib/domain/list-items/IssueListItem.svelte';
	import WorkloadLink from '$lib/domain/workload/WorkloadLink.svelte';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
	import List from '$lib/ui/List.svelte';
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import { euroValueFormatter } from '$lib/utils/formatters';
	import { Alert, BodyShort, Heading, HelpText } from '@nais/ds-svelte-community';
	import prettyBytes from 'pretty-bytes';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { SqlInstance, viewerIsMember } = $derived(data);
	let instance = $derived($SqlInstance.data?.team.environment.sqlInstance);
	let cloudsql = $derived(page.params.cloudsql);

	const distinctErrors = (errors: { message: string }[]) => new Set(errors.map((e) => e.message));
</script>

{#if $SqlInstance.errors}
	{#each distinctErrors($SqlInstance.errors) as error (error)}
		<Alert style="margin-bottom: 1rem;" variant="error">
			{error}
		</Alert>
	{/each}
{:else if instance}
	<div class="layout-two-column">
		<div class="content">
			<section aria-labelledby="utilization-heading">
				<Heading as="h2" id="utilization-heading" size="medium" spacing>Utilization</Heading>
				<div class="summary-grid">
					<StaticUtilizationDonut
						value={instance.metrics.cpu.utilization}
						label="CPU"
						height="200px"
						domainMax={100}
					/>
					<StaticUtilizationDonut
						value={instance.metrics.memory.utilization}
						label="Memory"
						height="200px"
						domainMax={100}
					/>
					<StaticUtilizationDonut
						value={instance.metrics.disk.utilization}
						label="Disk"
						height="200px"
						domainMax={100}
					/>
				</div>
			</section>

			<section aria-labelledby="configuration-heading">
				<Heading as="h2" id="configuration-heading" size="medium" spacing>Configuration</Heading>
				<dl class="settings-list">
					<dt>State</dt>
					<dd>
						{#if instance.state === 'RUNNABLE'}
							Runnable
						{:else}
							Not healthy
						{/if}
					</dd>
					<dt>Postgres version</dt>
					<dd>{instance.version}</dd>
					<dt>Tier</dt>
					<dd>{instance.tier}</dd>
					<dt>CPU</dt>
					<dd>
						{instance.metrics.cpu.cores.toLocaleString()}
						core{instance.metrics.cpu.cores > 1 ? 's' : ''}
					</dd>
					<dt>Memory</dt>
					<dd>{prettyBytes(instance.metrics.memory.quotaBytes)}</dd>
					<dt>Disk</dt>
					<dd>{prettyBytes(instance.metrics.disk.quotaBytes)}</dd>
				</dl>

				{#if instance.state !== 'RUNNABLE'}
					<BodyShort>
						Check status in
						<ExternalLink
							href="https://console.cloud.google.com/sql/instances/{cloudsql}/overview?project={instance.projectID}&supportedpurview=project"
						>
							Google Cloud Console
						</ExternalLink>
					</BodyShort>
				{/if}

				{#if viewerIsMember}
					<div class="links-section">
						<Heading as="h3" size="small">Console</Heading>
						<BodyShort>
							<ExternalLink
								href="https://console.cloud.google.com/sql/instances/{cloudsql}/overview?project={instance.projectID}&supportedpurview=project"
							>
								Google Cloud Console
							</ExternalLink>
						</BodyShort>
						{#if instance.auditLog?.logUrl}
							<BodyShort>
								<ExternalLink href={instance.auditLog.logUrl}>View audit logs</ExternalLink>
							</BodyShort>
						{/if}
					</div>
				{/if}
			</section>

			<section aria-labelledby="issues-heading">
				<Heading as="h2" id="issues-heading" size="medium" spacing>Issues</Heading>
				<List>
					{#each $SqlInstance.data?.team.environment.sqlInstance.issues.edges ?? [] as edge (edge.node.id)}
						<IssueListItem item={edge.node} />
					{:else}
						<span>No issues found</span>
					{/each}
				</List>
			</section>
		</div>

		<div class="layout-sidebar">
			<SurfaceCard title="Cost">
				{#snippet headerAside()}
					<HelpText title="Cost details">Total SQL instance cost for the last 30 days</HelpText>
				{/snippet}
				<BodyShort>{euroValueFormatter(instance.cost.sum)}</BodyShort>
			</SurfaceCard>

			<SurfaceCard title="Used by">
				{#if instance.workload}
					<WorkloadLink workload={instance.workload} hideTeam hideEnv />
				{:else}
					<BodyShort>Instance does not belong to any workload</BodyShort>
				{/if}
			</SurfaceCard>
		</div>
	</div>
{/if}

<style>
	.content {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-24);
		min-width: 0;
	}

	.summary-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--ax-space-16);
		min-width: 0;
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

	.links-section {
		margin-top: var(--ax-space-16);
		display: grid;
		gap: var(--ax-space-4);
	}

	@media (max-width: 767px) {
		.summary-grid {
			grid-template-columns: 1fr;
		}

		.settings-list {
			grid-template-columns: 1fr;
			gap: var(--ax-space-2);
		}

		.settings-list dd {
			margin-bottom: var(--ax-space-4);
		}

		.settings-list dd:last-child {
			margin-bottom: 0;
		}
	}
</style>
