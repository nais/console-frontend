<script lang="ts">
	import PersistenceActivityCard from '#lib/domain/activity/PersistenceActivityCard.svelte';
	import Labels from '#lib/domain/labels/Labels.svelte';
	import LabelsEditorModal from '#lib/domain/labels/LabelsEditorModal.svelte';
	import type { Label } from '#lib/domain/labels/labels.js';
	import WorkloadLink from '#lib/domain/workload/WorkloadLink.svelte';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import SectionBoundary from '#lib/ui/SectionBoundary.svelte';
	import SurfaceCard from '#lib/ui/SurfaceCard.svelte';
	import { page } from '$app/state';
	import { graphql } from '$houdini';
	import { Alert, BodyShort, Detail, Heading, Loader } from '@nais/ds-svelte-community';
	import { onMount } from 'svelte';
	import type { PageProps } from './$types';
	import BranchStateIndicator from './BranchStateIndicator.svelte';
	import { branchStateLabel } from './branchStateLabel.js';

	let { data }: PageProps = $props();
	let { PostgresOverview } = $derived(data);
	let postgres = $derived($PostgresOverview.data?.team.environment.postgres);
	let activeBranch = $derived(postgres?.activeBranch);
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
	let visibleErrors = $derived(
		$PostgresOverview.errors?.filter(
			(error) =>
				activeBranch ||
				!error.path?.includes('activeBranch') ||
				!error.message.startsWith('Resource not found: ') ||
				!error.message.endsWith('/main')
		)
	);
	let workloads = $derived(
		(postgres?.workloads.nodes ?? []).filter(
			(usage) => usage.workload.__typename === 'Application' || usage.workload.__typename === 'Job'
		)
	);
	let branchState = $derived(
		postgres?.desiredActiveBranch && postgres.desiredActiveBranch !== activeBranch?.name
			? 'PROGRESSING'
			: (activeBranch?.state ?? 'PROGRESSING')
	);

	onMount(() => {
		const interval = window.setInterval(() => {
			if (
				document.visibilityState !== 'visible' ||
				$PostgresOverview.fetching ||
				!postgres ||
				branchState !== 'PROGRESSING'
			) {
				return;
			}
			PostgresOverview.fetch({ policy: 'NetworkOnly' });
		}, 10_000);

		return () => window.clearInterval(interval);
	});
</script>

<GraphErrors errors={visibleErrors} />

{#if $PostgresOverview.fetching && !postgres}
	<div class="loading-centered" role="status" aria-label="Loading">
		<Loader size="3xlarge" />
	</div>
{:else if postgres}
	{#if !activeBranch}
		<div class="provisioning-alert">
			<Alert variant="info" size="small">
				Postgres is being created. The main branch will appear when it is ready.
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
					<dt>Active branch</dt>
					<dd>
						{#if activeBranch}
							<a
								href="/team/{page.params.team}/{page.params.env}/postgres/{page.params
									.postgres}/branches"
							>
								<strong>{activeBranch.name}</strong>
							</a>
						{:else}
							None
						{/if}
					</dd>
					{#if postgres.desiredActiveBranch && postgres.desiredActiveBranch !== activeBranch?.name}
						<dt>Activation requested</dt>
						<dd>{postgres.desiredActiveBranch}</dd>
					{/if}
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
			<SurfaceCard title="Used by">
				{#if workloads.length > 0}
					<ul class="workloads-list">
						{#each workloads as usage (usage.workload.id)}
							<li class="workload-usage">
								<WorkloadLink workload={usage.workload} hideTeam hideEnv />
								<div class="branch-label">
									<Detail>
										Branch:
										<a
											href="/team/{page.params.team}/{page.params.env}/postgres/{page.params
												.postgres}/branches">{usage.branch.name}</a
										>
									</Detail>
								</div>
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
	.provisioning-alert {
		margin-bottom: var(--ax-space-24);
	}
	.state-value {
		display: flex;
		align-items: center;
		gap: var(--ax-space-4);
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
	.workload-usage {
		display: grid;
		justify-items: start;
		gap: var(--ax-space-2);
	}
	.branch-label {
		margin-inline-start: var(--ax-space-32);
		color: var(--ax-text-subtle);
	}
</style>
