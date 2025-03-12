<script lang="ts">
	import { WorkloadStatusErrorLevel, type ValueOf } from '$houdini';
	import { Alert, BodyLong, Heading } from '@nais/ds-svelte-community';

	const {
		error,
		docURL = (p) => p
	}: {
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
							instances: {
								name: string;
								status: { message: string };
							}[];
					  }
			  ))
			| { __typename: "non-exhaustive; don't match this" };
		docURL?: (path: string) => string;
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
		WorkloadStatusNoRunningInstances: 'No Running Instances'
	};
</script>

{#if error.__typename !== "non-exhaustive; don't match this"}
	<Alert variant={levelVariant(error.level)}>
		<div class="content">
			<Heading level="2" size="small">{heading[error.__typename]}</Heading>
			{#if error.__typename === 'WorkloadStatusInvalidNaisYaml'}
				<BodyLong>
					The rollout of your application has failed due to an error in the application manifest.
				</BodyLong>

				<Heading level="3" size="xsmall">Error details</Heading>
				<code>{error.detail}</code>

				<BodyLong>
					To resolve this issue, review the application manifest and correct any errors. Consult the <a
						target="_blank"
						rel="noopener noreferrer"
						href={docURL('/workloads/application/reference/application-spec/')}
						>Nais application reference</a
					> for manifest requirements.
				</BodyLong>
			{:else if error.__typename === 'WorkloadStatusSynchronizationFailing'}
				<BodyLong>
					The rollout of the application is failing, meaning it is not in sync with the latest
					deployment. This may be due to a misconfiguration or a temporary issue, so try again in a
					few minutes. If the problem persists, contact the Nais team.
				</BodyLong>

				<Heading level="3" size="xsmall">Error details</Heading>
				<code>{error.detail}</code>
			{:else if error.__typename === 'WorkloadStatusDeprecatedRegistry'}
				<BodyLong>
					This application is using a deprecated image registry ({error.registry}).
				</BodyLong>

				<BodyLong
					>Starting April 1st, applications and jobs on Nais must use images from Google Artifact
					Registry (GAR). The easiest way to ensure that images are stored in GAR is to use Nais'
					GitHub Actions in the workflow. <a
						href="https://nais.io/log/#2025-02-24-image-policy"
						target="_blank"
						rel="noopener noreferrer">Read more in Nais announcement</a
					>.
				</BodyLong>
			{:else if error.__typename === 'WorkloadStatusNoRunningInstances'}
				<BodyLong>The application has no running instances.</BodyLong>

				{#if error.instances.length}
					<Heading level="3" size="xsmall">Failing instances:</Heading>
					<ul style="margin: 0;">
						{#each error.instances as instance (instance.name)}
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
			{/if}
		</div>
	</Alert>
{/if}

<style>
	.content {
		display: grid;
		gap: var(--a-spacing-3);
	}

	code {
		font-size: 0.8rem;
		line-height: 1.75;
	}
</style>
