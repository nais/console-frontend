<script lang="ts">
	import PersistenceActivityCard from '#lib/domain/activity/PersistenceActivityCard.svelte';
	import { recoveryPending } from '#lib/domain/postgres/recovery.js';
	import Labels from '#lib/domain/labels/Labels.svelte';
	import LabelsEditorModal from '#lib/domain/labels/LabelsEditorModal.svelte';
	import type { Label } from '#lib/domain/labels/labels.js';
	import WorkloadLink from '#lib/domain/workload/WorkloadLink.svelte';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import SectionBoundary from '#lib/ui/SectionBoundary.svelte';
	import SurfaceCard from '#lib/ui/SurfaceCard.svelte';
	import { page } from '$app/state';
	import { graphql } from '$houdini';
	import {
		Accordion,
		AccordionItem,
		Alert,
		BodyShort,
		Heading,
		Loader,
		Table,
		Tbody,
		Td,
		Th,
		Thead,
		Tr
	} from '#lib/shadcn/ui/index.js';
	import { onMount } from 'svelte';
	import type { PageProps } from './$types';
	import BranchStateIndicator from './BranchStateIndicator.svelte';
	import { branchStateLabel } from './branchStateLabel.js';

	let { data }: PageProps = $props();
	let { PostgresOverview } = $derived(data);
	let postgres = $derived($PostgresOverview.data?.team.environment.postgres);
	let parameters = $derived(postgres?.configuration?.parameters);
	const parametersId = $props.id();
	let parametersOpen = $state(false);
	let canManage = $derived(data.viewerIsMember || data.isAdmin);
	let labelsModalOpen = $state(false);
	let labelErrors = $state<{ message: string }[] | null>(null);
	const updateLabels = graphql(`
		mutation UpdatePostgresLabels($input: UpdatePostgresInput!) {
			updatePostgres(input: $input) {
				postgres {
					id
					labels {
						key
						value
					}
				}
			}
		}
	`);

	async function saveLabels(labels: Label[]) {
		labelErrors = null;
		if (!canManage) {
			labelErrors = [{ message: 'You do not have permission to manage Postgres for this team.' }];
			return;
		}
		try {
			const result = await updateLabels.mutate({
				input: {
					teamSlug: data.teamSlug,
					environmentName: page.params.env!,
					name: page.params.postgres!,
					labels
				}
			});
			if (result.errors?.length) {
				labelErrors = result.errors;
				return;
			}
			if (!result.data) {
				labelErrors = [
					{ message: 'The label update could not be confirmed. Check labels before trying again.' }
				];
				return;
			}
			labelsModalOpen = false;
		} catch {
			labelErrors = [
				{ message: 'The label update could not be confirmed. Check labels before trying again.' }
			];
		}
	}
	let workloads = $derived(
		(postgres?.workloads.nodes ?? []).filter(
			(usage) => usage.workload.__typename === 'Application' || usage.workload.__typename === 'Job'
		)
	);
	let branchState = $derived(postgres?.state ?? 'PROGRESSING');

	onMount(() => {
		const interval = window.setInterval(() => {
			if (
				document.visibilityState !== 'visible' ||
				$PostgresOverview.fetching ||
				!postgres ||
				(branchState !== 'PROGRESSING' && !recoveryPending(postgres.recovery))
			) {
				return;
			}
			void PostgresOverview.fetch({ policy: 'NetworkOnly' }).catch(() => {
				// The next interval retries; query errors are rendered by GraphErrors.
			});
		}, 10_000);

		return () => window.clearInterval(interval);
	});
</script>

<GraphErrors errors={$PostgresOverview.errors} />

{#if $PostgresOverview.fetching && !postgres}
	<div class="loading-centered" role="status" aria-label="Loading">
		<Loader size="3xlarge" />
	</div>
{:else if postgres}
	{#if postgres.recovery}
		<div class="provisioning-alert">
			<Alert
				variant={postgres.recovery.failureMessage
					? 'error'
					: postgres.recovery.completed
						? 'success'
						: 'info'}
			>
				{#if postgres.recovery.failureMessage}Restoration failed: {postgres.recovery.failureMessage}
				{:else if postgres.recovery.completed}Restoration completed.
				{:else}Restoration is in progress. Status updates automatically.{/if}
				Source: {postgres.recovery.sourcePostgres}. Target time: {postgres.recovery.targetTime.toISOString()}
				(UTC). The source is unchanged. No applications are automatically moved.
			</Alert>
		</div>
	{/if}
	{#if branchState === 'PROGRESSING'}
		<div class="provisioning-alert">
			<Alert variant="info" size="small">
				Postgres is being prepared. Status updates automatically.
			</Alert>
		</div>
	{/if}
	<div class="layout-two-column">
		<div class="content">
			<section aria-labelledby="configuration-heading">
				<Heading as="h2" id="configuration-heading" size="medium" spacing>Configuration</Heading>
				<dl class="settings-list">
					<dt>State</dt>
					<dd class="state-value">
						<BranchStateIndicator state={branchState} />
						{branchStateLabel(branchState)}
					</dd>
					<dt>High availability</dt>
					<dd>
						{postgres.highAvailability
							? 'Enabled (primary + 2 replicas)'
							: 'Standard (primary + replica)'}
					</dd>
					<dt>Postgres version</dt>
					<dd>{postgres.majorVersion}</dd>
					<dt>Extensions</dt>
					<dd>
						{#if postgres.extensions.length > 0}
							<code class="parameter-text">{postgres.extensions.join(', ')}</code>
						{:else}
							None
						{/if}
					</dd>
					<dt>CPU</dt>
					<dd>{postgres.resources.cpu ?? 'Platform default'}</dd>
					<dt>Memory</dt>
					<dd>{postgres.resources.memory ?? 'Platform default'}</dd>
					<dt>Storage</dt>
					<dd>{postgres.resources.diskSize ?? 'Platform default'}</dd>
				</dl>
				<Accordion size="small" indent={false} class="parameters-accordion">
					<AccordionItem open={parametersOpen} onOpenChange={(open) => (parametersOpen = open)}>
						{#snippet heading()}
							<span id="{parametersId}-heading">PostgreSQL parameters</span>
						{/snippet}
						<div
							id="{parametersId}-panel"
							role="region"
							aria-labelledby="{parametersId}-heading"
							hidden={!parametersOpen}
						>
							{#if !parameters}
								<BodyShort>PostgreSQL parameters are unavailable.</BodyShort>
							{:else if parameters.length === 0}
								<BodyShort>No PostgreSQL parameters explicitly configured.</BodyShort>
							{:else}
								<div class="table-scroll parameters-table">
									<Table size="small" aria-labelledby="{parametersId}-heading">
										<Thead>
											<Tr>
												<Th scope="col">Parameter</Th>
												<Th scope="col">Value</Th>
											</Tr>
										</Thead>
										<Tbody>
											{#each parameters as parameter (parameter.name)}
												<Tr>
													<Td><code class="parameter-text">{parameter.name}</code></Td>
													<Td><code class="parameter-text">{parameter.value}</code></Td>
												</Tr>
											{/each}
										</Tbody>
									</Table>
								</div>
							{/if}
						</div>
					</AccordionItem>
				</Accordion>
			</section>
		</div>
		<div class="layout-sidebar">
			<SurfaceCard title="Used by">
				{#if workloads.length > 0}
					<ul class="workloads-list">
						{#each workloads as usage (usage.workload.id)}
							<li class="workload-usage">
								<WorkloadLink workload={usage.workload} hideTeam hideEnv />
							</li>
						{/each}
					</ul>
					{#if postgres.workloads.pageInfo.totalCount > workloads.length}
						<BodyShort>
							Showing first {workloads.length} of {postgres.workloads.pageInfo.totalCount}
							workloads.
						</BodyShort>
					{/if}
				{:else}
					<BodyShort>Not used by any workloads.</BodyShort>
				{/if}
			</SurfaceCard>
			<Labels
				labels={postgres.labels}
				showEmpty
				onEdit={canManage
					? () => {
							labelErrors = null;
							labelsModalOpen = true;
						}
					: undefined}
			/>
			<SectionBoundary message="Activity failed to render.">
				<PersistenceActivityCard resourceType="postgres" resource={postgres} />
			</SectionBoundary>
		</div>
	</div>
	{#if labelsModalOpen}
		<LabelsEditorModal
			labels={postgres.labels}
			title="Edit Postgres labels"
			errors={labelErrors}
			onsave={saveLabels}
			onclose={() => (labelsModalOpen = false)}
		/>
	{/if}
{/if}

<style>
	.content :global(.parameters-accordion) {
		margin-top: var(--nais-space-24);
	}
	.parameters-table :global(table) {
		width: 100%;
		table-layout: fixed;
	}
	.parameter-text {
		white-space: pre-wrap;
		overflow-wrap: anywhere;
	}
	.provisioning-alert {
		margin-bottom: var(--nais-space-24);
	}
	.state-value {
		display: flex;
		align-items: center;
		gap: var(--nais-space-4);
	}
	.content {
		display: flex;
		flex-direction: column;
		gap: var(--nais-space-24);
		min-width: 0;
	}
	.workloads-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: var(--nais-space-6);
	}
	.workload-usage {
		display: grid;
		justify-items: start;
		gap: var(--nais-space-2);
	}
</style>
