<script module lang="ts">
	export const supportedErrorTypes = [
		'WorkloadStatusInvalidNaisYaml',
		'WorkloadStatusSynchronizationFailing',
		'WorkloadStatusNoRunningInstances',
		'WorkloadStatusFailedRun',
		'WorkloadStatusDeprecatedRegistry',
		'WorkloadStatusVulnerable'
	] as const;
</script>

<script lang="ts">
	import { WorkloadStatusErrorLevel, type ValueOf } from '$houdini';
	import { Alert, BodyLong, Button, Heading } from '@nais/ds-svelte-community';
	import ExternalLink from '../ExternalLink.svelte';

	const {
		error,
		workloadType,
		instances,
		teamSlug,
		workloadName,
		environment,
		docURL
	}: {
		workloadType: 'App' | 'Job';
		teamSlug: string;
		workloadName: string;
		environment: string;
		instances?: {
			name: string;
			status: { message: string };
		}[];
		error:
			| ({
					level: ValueOf<typeof WorkloadStatusErrorLevel>;
			  } & (
					| {
							__typename: 'WorkloadStatusInvalidNaisYaml' | 'WorkloadStatusSynchronizationFailing';
							detail: string;
					  }
					| {
							__typename: 'WorkloadStatusDeprecatedRegistry';
							registry: string;
					  }
					| {
							__typename: 'WorkloadStatusNoRunningInstances';
					  }
					| {
							__typename: 'WorkloadStatusFailedRun';
							name: string;
							detail: string;
					  }
					| {
							__typename: 'WorkloadStatusVulnerable';
							summary: {
								riskScore: number;
								critical: number;
							};
					  }
			  ))
			| { __typename: "non-exhaustive; don't match this" };
		docURL: (path: string) => string;
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
		WorkloadStatusVulnerable: 'High Risk: Vulnerabilities Detected'
	};

	let open = $state(false);
</script>

{#if error.__typename !== "non-exhaustive; don't match this"}
	<Alert variant={levelVariant(error.level)} size="small">
		<div class="content">
			<div style="display: flex; align-items: center; gap: var(--ax-space-8, --a-spacing-2);">
				<Heading level="2" size="small">{heading[error.__typename]}</Heading>
				<Button variant="tertiary" size="xsmall" onclick={() => (open = !open)}>
					{open ? 'Hide' : 'Show'} details
				</Button>
			</div>
			{#if open}
				{#if error.__typename === 'WorkloadStatusInvalidNaisYaml'}
					<BodyLong>
						The rollout of your {workloadType === 'Job' ? 'job' : 'application'} has failed due to an
						error in the {workloadType === 'Job' ? 'job' : 'application'} manifest.
					</BodyLong>

					<Heading level="3" size="xsmall">Error Details</Heading>
					<code>{error.detail}</code>

					<BodyLong>
						To resolve this issue, review the {workloadType === 'Job' ? 'job' : 'application'} manifest
						and correct any errors. Consult the
						<ExternalLink
							href={docURL(
								workloadType === 'Job'
									? '/workloads/job/reference/naisjob-spec/'
									: '/workloads/application/reference/application-spec/'
							)}>Nais {workloadType === 'Job' ? 'job' : 'application'} reference</ExternalLink
						> for manifest requirements.
					</BodyLong>
				{:else if error.__typename === 'WorkloadStatusSynchronizationFailing'}
					<BodyLong>
						The rollout of the {workloadType === 'Job' ? 'job' : 'application'} is failing, meaning it
						is not in sync with the latest deployment. This may be due to a misconfiguration or a temporary
						issue, so try again in a few minutes. If the problem persists, contact the Nais team.
					</BodyLong>

					<Heading level="3" size="xsmall">Error Details</Heading>
					<code>{error.detail}</code>
				{:else if error.__typename === 'WorkloadStatusDeprecatedRegistry'}
					<BodyLong>
						This {workloadType === 'Job' ? 'job' : 'application'} is using an unsupported image registry
						({error.registry}) and will not run.
					</BodyLong>

					<BodyLong
						>Applications and jobs on Nais must use images from Google Artifact Registry (GAR). The
						easiest way to ensure that images are stored in GAR is to use Nais' GitHub Actions in
						the workflow. <ExternalLink href="https://nais.io/log/#2025-02-24-image-policy"
							>Read more in Nais announcement</ExternalLink
						>
						.
					</BodyLong>
				{:else if error.__typename === 'WorkloadStatusNoRunningInstances'}
					<BodyLong>The application has no running instances.</BodyLong>

					{#if instances?.length}
						<Heading level="3" size="xsmall">Failing Instances</Heading>
						<ul style="margin: 0;">
							{#each instances as instance (instance.name)}
								<li>
									<code style="font-size: 1rem; line-height: 1.75;">{instance.name}</code>:
									<strong>{instance.status.message}</strong>
								</li>
							{/each}
						</ul>
					{/if}

					<BodyLong>
						Check logs if available. If this is unexpected and you cannot resolve the issue, contact
						the Nais team.
					</BodyLong>
				{:else if error.__typename === 'WorkloadStatusFailedRun'}
					<BodyLong>The last run of this job failed.</BodyLong>

					<div>
						<code>{error.name}</code>:
						{error.detail}
					</div>

					<BodyLong>
						Check logs if available. If you're unable to resolve the issue, contact the Nais team.
					</BodyLong>
				{:else if error.__typename === 'WorkloadStatusVulnerable'}
					<BodyLong>
						{#if error.summary.riskScore > 100}
							<strong>Risk Score:</strong>
							{error.summary.riskScore} (Exceeds threshold of 100)<br />
						{/if}
						{#if error.summary.critical > 0}
							<strong>Critical Vulnerabilities:</strong>
							{error.summary.critical}
						{/if}
					</BodyLong>
					<BodyLong>
						Workloads are flagged as vulnerable if their dependencies have a high risk score or
						critical vulnerabilities.
					</BodyLong>
					<BodyLong>
						Review detailed vulnerability information in the <a
							href="/team/{teamSlug}/{environment}/{workloadType === 'Job'
								? 'job'
								: 'app'}/{workloadName}/vulnerability-report">Vulnerability Report</a
						>, and update affected dependencies to their latest patched versions.
					</BodyLong>
					<BodyLong>
						Ignoring these vulnerabilities can expose your {workloadType === 'Job'
							? 'job'
							: 'application'} to potential security breaches.
					</BodyLong>
				{/if}
			{/if}
		</div>
	</Alert>
{/if}

<style>
	.content {
		display: grid;
		gap: var(--ax-space-12, --a-spacing-3);
	}

	code {
		font-size: 0.8rem;
		line-height: 1.75;
	}
</style>
