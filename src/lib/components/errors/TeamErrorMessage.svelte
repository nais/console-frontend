<script lang="ts">
	import { WorkloadStatusErrorLevel, type ValueOf } from '$houdini';
	import { docURL } from '$lib/doc';
	import { Alert, BodyLong, Button, Heading } from '@nais/ds-svelte-community';
	import ExternalLink from '../ExternalLink.svelte';
	import WorkloadLink from '../WorkloadLink.svelte';

	const {
		teamSlug,
		error,
		workloads,
		collapsible = true
	}: {
		collapsible?: boolean;
		teamSlug: string;
		error: {
			level: ValueOf<typeof WorkloadStatusErrorLevel>;
			__typename:
				| 'WorkloadStatusInvalidNaisYaml'
				| 'WorkloadStatusSynchronizationFailing'
				| 'WorkloadStatusDeprecatedRegistry'
				| 'WorkloadStatusNoRunningInstances'
				| 'WorkloadStatusFailedRun'
				| 'WorkloadStatusVulnerable'
				| 'WorkloadStatusMissingSBOM'
				| 'WorkloadStatusUnsupportedCloudSQLVersion';
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
		WorkloadStatusDeprecatedRegistry: 'Unsupported Image Registry',
		WorkloadStatusNoRunningInstances: 'No Running Instances',
		WorkloadStatusFailedRun: 'Job Failed',
		WorkloadStatusVulnerable: 'High Risk: Vulnerabilities Detected',
		WorkloadStatusMissingSBOM: 'Missing Software Bill of Materials',
		WorkloadStatusUnsupportedCloudSQLVersion: 'Deprecated or Unsupported Cloud SQL Version'
	};
	const summary = {
		WorkloadStatusInvalidNaisYaml: 'Workloads with invalid manifests',
		WorkloadStatusSynchronizationFailing: 'Workloads with synchronization errors',
		WorkloadStatusDeprecatedRegistry: 'Workloads with unsupported image registries',
		WorkloadStatusNoRunningInstances: 'Applications with no running instances',
		WorkloadStatusFailedRun: 'Failed jobs',
		WorkloadStatusVulnerable: 'High risk workloads',
		WorkloadStatusMissingSBOM: 'Workloads with missing Software Bill of Materials',
		WorkloadStatusUnsupportedCloudSQLVersion:
			'Workloads with deprecated or unsupported Cloud SQL versions'
	};

	let open = $state(false);
</script>

<Alert variant={levelVariant(error.level)} size="small">
	<div class="content">
		<div style="display: flex; align-items: center; gap: var(--ax-space-8);">
			<Heading level="2" size="small">{heading[error.__typename]}</Heading>
			{#if collapsible}
				<Button variant="tertiary" size="xsmall" onclick={() => (open = !open)}>
					{open ? 'Hide' : 'Show'} details
				</Button>
			{/if}
		</div>
		{#if open || !collapsible}
			{#if error.__typename === 'WorkloadStatusInvalidNaisYaml'}
				<BodyLong>
					The rollout of the following workload{workloads.length === 1 ? '' : 's'} failed because of
					{workloads.length === 1 ? 'an' : ''} invalid manifest{workloads.length === 1 ? '' : 's'}.
				</BodyLong>
			{:else if error.__typename === 'WorkloadStatusSynchronizationFailing'}
				<BodyLong>
					The rollout of the following workload{workloads.length === 1 ? '' : 's'} failed because of
					synchronization errors.
				</BodyLong>
			{:else if error.__typename === 'WorkloadStatusDeprecatedRegistry'}
				<BodyLong>
					Applications and jobs on Nais must use images from Google Artifact Registry (GAR). The
					easiest way to ensure that images are stored in GAR is to use Nais' GitHub Actions in the
					workflow. <ExternalLink href="https://nais.io/log/#2025-02-24-image-policy"
						>Read more in Nais announcement</ExternalLink
					>.
				</BodyLong>
				<BodyLong>
					{teamSlug} currently has <strong>{workloads.length}</strong> workload{workloads.length ===
					1
						? ''
						: 's'} using {workloads.length === 1
						? 'a unsupported image registry'
						: 'unsupported image registries'}. These workloads will not run.
				</BodyLong>
			{:else if error.__typename === 'WorkloadStatusNoRunningInstances'}
				<BodyLong>
					The following application{workloads.length === 1 ? ' has' : 's have'} no running instances.
				</BodyLong>
			{:else if error.__typename === 'WorkloadStatusFailedRun'}
				<BodyLong>
					The following job{workloads.length === 1 ? ' has' : 's have'} failed.
				</BodyLong>
			{:else if error.__typename === 'WorkloadStatusVulnerable'}
				<BodyLong>
					There{workloads.length === 1 ? ' is' : ' are'} <strong>{workloads.length}</strong>
					workload{workloads.length === 1 ? ' ' : 's '} flagged as vulnerable because
					{workloads.length === 1 ? 'its' : 'their'} dependencies have a combined risk score above 100
					or one or more critical vulnerabilities.
				</BodyLong>

				<BodyLong>
					See <a
						href="/team/{teamSlug}/vulnerabilities?direction=DESC&field=VULNERABILITY_RISK_SCORE#most_vulnerable_workloads"
						>Most Vulnerable Workloads</a
					>
					table and review detailed vulnerability information in
					{#if workloads.length === 1}
						{@const workload = workloads[0]}
						your workload's
						<a
							href={`/team/${teamSlug}/${workload.teamEnvironment.environment.name}/${workload.__typename === 'Job' ? 'job' : 'app'}/${workload.name}/vulnerability-report`}
							>Vulnerability Report</a
						>
					{:else}
						each workload's Vulnerability Report
					{/if}, and update affected dependencies to their latest patched versions.
				</BodyLong>
				<BodyLong>
					Ignoring these vulnerabilities can expose your workload{workloads.length === 1 ? '' : 's'}
					to potential security breaches.
				</BodyLong>
			{:else if error.__typename === 'WorkloadStatusMissingSBOM'}
				<BodyLong>
					There are <strong>{workloads.length > 1 ? workloads.length : ''}</strong>
					workload{workloads.length === 1 ? ' ' : 's'}
					without a registered Software Bill of Materials (SBOM). See
					<a
						href="/team/{teamSlug}/vulnerabilities?direction=ASC&field=HAS_SBOM#most_vulnerable_workloads"
						>Most Vulnerable Workloads</a
					>
					table. This can be resolved by utilizing the
					<ExternalLink href="https://github.com/nais/docker-build-push"
						>nais/docker-build-push</ExternalLink
					>
					GitHub action. Read more in the
					<ExternalLink href={docURL('/services/vulnerabilities/how-to/sbom/')}
						>Nais documentation</ExternalLink
					>.
				</BodyLong>
			{:else if error.__typename === 'WorkloadStatusUnsupportedCloudSQLVersion'}
				<BodyLong>
					The following workload{workloads.length === 1 ? ' is' : 's are'} using a Postgres version that
					has reached or is nearing end-of-life, leading to increased costs and potential security vulnerabilities.
				</BodyLong>
			{/if}
			{#if error.__typename !== 'WorkloadStatusVulnerable' && error.__typename !== 'WorkloadStatusMissingSBOM'}
				<div>
					{#if workloads.length < 5}
						{#each workloads as workload (workload)}
							<WorkloadLink {workload} hideTeam />
						{/each}
					{:else}
						<details>
							<summary>{summary[error.__typename]}</summary>
							{#each workloads as workload (workload)}
								<WorkloadLink {workload} hideTeam />
							{/each}
						</details>
					{/if}
				</div>
			{/if}
		{/if}
	</div>
</Alert>

<style>
	.content {
		display: grid;
		gap: var(--ax-space-12);
	}
</style>
