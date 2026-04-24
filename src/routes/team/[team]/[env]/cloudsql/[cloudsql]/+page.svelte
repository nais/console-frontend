<script lang="ts">
	import { page } from '$app/state';
	import StaticUtilizationDonut from '$lib/chart/StaticUtilizationDonut.svelte';
	import IssueListItem from '$lib/domain/list-items/IssueListItem.svelte';
	import WorkloadLink from '$lib/domain/workload/WorkloadLink.svelte';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
	import IconLabel from '$lib/ui/IconLabel.svelte';
	import List from '$lib/ui/List.svelte';
	import { euroValueFormatter } from '$lib/utils/formatters';
	import { Alert, BodyShort, Heading, HelpText } from '@nais/ds-svelte-community';
	import { WalletIcon } from '@nais/ds-svelte-community/icons';
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
	<div class="wrapper">
		<div class="content">
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

			<div class="details">
				<div class="details-sections">
					<div>
						<Heading as="h3" size="small">State</Heading>
						<BodyShort>
							{#if instance.state === 'RUNNABLE'}
								Runnable
							{:else}
								Not healthy. Check status in
								<ExternalLink
									href="https://console.cloud.google.com/sql/instances/{cloudsql}/overview?project={instance.projectID}&supportedpurview=project"
								>
									Google Cloud Console
								</ExternalLink>
							{/if}
						</BodyShort>
					</div>

					<div>
						<Heading as="h3" size="small">Version</Heading>
						<dl class="settings-list">
							<dt>Postgres version</dt>
							<dd>{instance.version}</dd>
						</dl>
					</div>

					<div>
						<Heading as="h3" size="small">Settings</Heading>
						<dl class="settings-list">
							<dt>Tier</dt>
							<dd>{instance.tier}</dd>
						</dl>
					</div>

					<div>
						<Heading as="h3" size="small">Resources</Heading>
						<dl class="settings-list">
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
					</div>

					{#if viewerIsMember}
						<div>
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

					<div>
						<Heading as="h3" size="small">Issues</Heading>
						<List>
							{#each $SqlInstance.data?.team.environment.sqlInstance.issues.edges ?? [] as edge (edge.node.id)}
								<IssueListItem item={edge.node} />
							{:else}
								<span>No issues found</span>
							{/each}
						</List>
					</div>
				</div>
			</div>
		</div>

		<div class="sidebar">
			<div>
				<div class="cost-heading">
					<IconLabel label="Cost" icon={WalletIcon} size="large" as="h2" />
					<HelpText title="Cost details">Total SQL instance cost for the last 30 days</HelpText>
				</div>
				<div class="cost-content">
					<BodyShort>{euroValueFormatter(instance.cost.sum)}</BodyShort>
				</div>
			</div>

			<div>
				<Heading as="h2" size="medium" spacing>Used by</Heading>
				{#if instance.workload}
					<WorkloadLink workload={instance.workload} />
				{:else}
					<BodyShort>Instance does not belong to any workload</BodyShort>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.wrapper {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 300px;
		gap: var(--spacing-layout);
		align-items: start;
		min-width: 0;
	}

	.content {
		min-width: 0;
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

	.summary-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
		margin-bottom: 1rem;
		min-width: 0;
	}

	.sidebar {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
		min-width: 0;
	}

	.cost-content {
		display: grid;
		gap: var(--ax-space-2);
	}

	.cost-heading {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--ax-space-2);
		flex-wrap: wrap;
	}

	@media (max-width: 767px) {
		.wrapper {
			grid-template-columns: 1fr;
		}

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
