<script lang="ts">
	import { page } from '$app/state';
	import PersistenceActivityCard from '#lib/domain/activity/PersistenceActivityCard.svelte';
	import Labels from '#lib/domain/labels/Labels.svelte';
	import WorkloadLink from '#lib/domain/workload/WorkloadLink.svelte';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import SectionBoundary from '#lib/ui/SectionBoundary.svelte';
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
</script>

<GraphErrors errors={$PostgresOverview.errors} />

{#if $PostgresOverview.fetching && !postgres}
	<div class="loading-centered" role="status" aria-label="Loading">
		<Loader size="3xlarge" />
	</div>
{:else if postgres}
	<div class="layout-two-column">
		<div class="content">
			<section aria-labelledby="configuration-heading">
				<Heading as="h2" id="configuration-heading" size="medium" spacing>Configuration</Heading>
				<dl class="settings-list">
					<dt>State</dt>
					<dd>{state.toLowerCase()}</dd>
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
	.workloads-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: var(--ax-space-6);
	}
</style>
