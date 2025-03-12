<script lang="ts">
	import { WorkloadStatusErrorLevel, type ValueOf } from '$houdini';
	import { Alert, BodyLong, Heading } from '@nais/ds-svelte-community';
	import WorkloadLink from '../WorkloadLink.svelte';

	const {
		teamSlug,
		error,
		workloads
	}: {
		teamSlug: string;
		error: {
			level: ValueOf<typeof WorkloadStatusErrorLevel>;
			__typename:
				| 'WorkloadStatusInvalidNaisYaml'
				| 'WorkloadStatusSynchronizationFailing'
				| 'WorkloadStatusDeprecatedRegistry'
				| 'WorkloadStatusNoRunningInstances'
				| 'WorkloadStatusFailedRun';
		};
		workloads: {
			__typename: string | null;
			name: string;
			teamEnvironment: { environment: { name: string } };
			team: { slug: string };
		}[];
	} = $props();

	const levelVariant = (level?: ValueOf<typeof WorkloadStatusErrorLevel>) => {
		switch (level) {
			case 'ERROR':
				return 'error';
			case 'WARNING':
				return 'warning';
			case 'TODO':
			default:
				return 'info';
		}
	};

	const heading = {
		WorkloadStatusInvalidNaisYaml: 'Rollout Failed - Invalid Manifest',
		WorkloadStatusSynchronizationFailing: 'Rollout Failed - Synchronization Error',
		WorkloadStatusDeprecatedRegistry: 'Deprecated Image Registry',
		WorkloadStatusNoRunningInstances: 'No Running Instances',
		WorkloadStatusFailedRun: 'Job Failed'
	};
	const summary = {
		WorkloadStatusInvalidNaisYaml: 'Workloads with invalid manifests',
		WorkloadStatusSynchronizationFailing: 'Workloads with synchronization errors',
		WorkloadStatusDeprecatedRegistry: 'Workloads with deprecated image registries',
		WorkloadStatusNoRunningInstances: 'Applications with no running instances',
		WorkloadStatusFailedRun: 'Failed jobs'
	};
</script>

<Alert variant={levelVariant(error.level)}>
	<div class="content">
		<Heading level="2" size="small">{heading[error.__typename]}</Heading>
		{#if error.__typename === 'WorkloadStatusInvalidNaisYaml'}
			<BodyLong>
				The rollout of the following workload{workloads.length === 1 ? '' : 's'} failed because of {workloads.length ===
				1
					? 'an'
					: ''} invalid manifest{workloads.length === 1 ? '' : 's'}.
			</BodyLong>
		{:else if error.__typename === 'WorkloadStatusSynchronizationFailing'}
			<BodyLong>
				The rollout of the following workload{workloads.length === 1 ? '' : 's'} failed because of synchronization
				errors.
			</BodyLong>
		{:else if error.__typename === 'WorkloadStatusDeprecatedRegistry'}
			<BodyLong>
				Starting April 1st, applications and jobs on Nais must use images from Google Artifact
				Registry (GAR). The easiest way to ensure that images are stored in GAR is to use Nais'
				GitHub Actions in the workflow. <a
					href="https://nais.io/log/#2025-02-24-image-policy"
					target="_blank"
					rel="noopener noreferrer">Read more in Nais announcement</a
				>.
			</BodyLong>
			<BodyLong>
				{teamSlug} currently has <strong>{workloads.length}</strong> workload{workloads.length === 1
					? ''
					: 's'} using {workloads.length === 1
					? 'a deprecated image registry'
					: 'deprecated image registries'}.
			</BodyLong>
		{:else if error.__typename === 'WorkloadStatusNoRunningInstances'}
			<BodyLong>
				The following application{workloads.length === 1 ? ' has' : 's have'} no running instances.
			</BodyLong>
		{:else if error.__typename === 'WorkloadStatusFailedRun'}
			<BodyLong>
				The following job{workloads.length === 1 ? ' has' : 's have'} failed.
			</BodyLong>
		{/if}
		<div>
			{#if workloads.length < 5}
				{#each workloads as workload (workload)}
					<WorkloadLink {workload} />
				{/each}
			{:else}
				<details>
					<summary>{summary[error.__typename]}</summary>
					{#each workloads as workload (workload)}
						<WorkloadLink {workload} />
					{/each}
				</details>
			{/if}
		</div>
	</div></Alert
>

<style>
	.content {
		display: grid;
		gap: var(--a-spacing-3);
	}
</style>
