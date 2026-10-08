<script lang="ts">
	import { page } from '$app/state';
	import PersistenceActivityCard from '#lib/domain/activity/PersistenceActivityCard.svelte';
	import Labels from '#lib/domain/labels/Labels.svelte';
	import WorkloadLink from '#lib/domain/workload/WorkloadLink.svelte';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import SectionBoundary from '#lib/ui/SectionBoundary.svelte';
	import SurfaceCard from '#lib/ui/SurfaceCard.svelte';
	import { exhaustive } from '#lib/utils/houdini.js';
	import { BodyShort, Button, Heading, Loader } from '@nais/ds-svelte-community';
	import type { PageProps } from './$types';
	import BranchStatus from './BranchStatus.svelte';

	let { data }: PageProps = $props();
	let { PostgresOverview } = $derived(data);
	let postgres = $derived($PostgresOverview.data?.team.environment.postgres);
	let activeBranch = $derived(postgres?.activeBranch);
	let state = $derived(
		postgres?.desiredActiveBranch && postgres.desiredActiveBranch !== activeBranch?.name
			? 'PROGRESSING'
			: (activeBranch?.state ?? 'PROGRESSING')
	);
</script>

<GraphErrors errors={$PostgresOverview.errors} />

{#if $PostgresOverview.fetching && !postgres}
	<div class="loading-centered" role="status" aria-label="Loading">
		<Loader size="3xlarge" />
	</div>
{:else if postgres}
	{#if data.viewerIsMember || data.isAdmin}
		<div class="detail-actions">
			<Button
				as="a"
				variant="secondary"
				size="small"
				href="/team/{page.params.team}/{page.params.env}/postgres/{page.params.postgres}/edit"
			>
				Edit
			</Button>
			<Button
				as="a"
				variant="danger"
				size="small"
				href="/team/{page.params.team}/{page.params.env}/postgres/{page.params.postgres}/delete"
			>
				Delete
			</Button>
		</div>
	{/if}
	<div class="layout-two-column">
		<div class="content">
			<section aria-labelledby="branches-heading">
				<Heading as="h2" id="branches-heading" size="medium" spacing>Branches</Heading>
				<BodyShort>
					Each branch has its own data history. Workloads use the active branch.
				</BodyShort>
				<BodyShort>
					Currently active: <strong>{activeBranch?.name ?? 'None'}</strong>
					{#if postgres.desiredActiveBranch && postgres.desiredActiveBranch !== activeBranch?.name}
						(activation requested for <strong>{postgres.desiredActiveBranch}</strong>)
					{/if}
				</BodyShort>
				<ul class="branches-list">
					{#each postgres.branches.nodes as branch (branch.id)}
						<li>
							<BranchStatus
								{branch}
								activeBranchId={activeBranch?.id}
								requestedBranch={postgres.desiredActiveBranch}
							/>
						</li>
					{:else}
						<li>No branches found.</li>
					{/each}
				</ul>
				{#if postgres.branches.pageInfo.totalCount > postgres.branches.nodes.length}
					<BodyShort>
						Showing first {postgres.branches.nodes.length} of {postgres.branches.pageInfo
							.totalCount}
						branches. See the Branches tab for the full list.
					</BodyShort>
				{/if}
				<BodyShort>
					<a
						href="/team/{page.params.team}/{page.params.env}/postgres/{page.params
							.postgres}/branches">View and manage branches</a
					>
				</BodyShort>
			</section>
			<section aria-labelledby="configuration-heading">
				<Heading as="h2" id="configuration-heading" size="medium" spacing>Configuration</Heading>
				<dl class="settings-list">
					<dt>State</dt>
					<dd>{state.toLowerCase()}</dd>
					<dt>Active branch</dt>
					<dd>{activeBranch?.name ?? 'None'}</dd>
					{#if postgres.desiredActiveBranch && postgres.desiredActiveBranch !== activeBranch?.name}
						<dt>Requested branch</dt>
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
			<Labels labels={postgres.labels} showEmpty />
			<SectionBoundary message="Activity failed to render.">
				<PersistenceActivityCard resourceType="postgres" resource={postgres} />
			</SectionBoundary>
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
	.content {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-24);
		min-width: 0;
	}
	.branches-list {
		list-style: none;
		padding: 0;
		margin: var(--ax-space-8) 0;
		display: grid;
		gap: var(--ax-space-8);
	}

	.workloads-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: var(--ax-space-6);
	}
</style>
