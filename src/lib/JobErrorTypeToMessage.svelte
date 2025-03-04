<script lang="ts">
	import { page } from '$app/state';
	import {
		fragment,
		graphql,
		type JobErrorFragment,
		type ValueOf,
		WorkloadStatusErrorLevel
	} from '$houdini';
	import { Alert } from '@nais/ds-svelte-community';
	import { docURL } from './doc';

	interface Props {
		error: JobErrorFragment;
	}

	let { error }: Props = $props();

	let data = $derived(
		fragment(
			error,
			graphql(`
				fragment JobErrorFragment on WorkloadStatusError {
					__typename
					... on WorkloadStatusDeprecatedRegistry {
						level
						name
						registry
						repository
						tag
					}
					... on WorkloadStatusInvalidNaisYaml {
						level
						detail
					}
					... on WorkloadStatusMissingSBOM {
						level
					}
					... on WorkloadStatusVulnerable {
						level
						summary {
							riskScore
						}
					}
					... on WorkloadStatusFailedRun {
						level
						detail
						name
					}
					... on WorkloadStatusOutboundNetwork {
						level
					}
					... on WorkloadStatusInboundNetwork {
						level
					}
				}
			`)
		)
	);

	let team = $derived(page.params.team);
	let env = $derived(page.params.env);
	let job = $derived(page.params.job);

	const variant = (level: ValueOf<typeof WorkloadStatusErrorLevel>) => {
		switch (level) {
			case 'WARNING':
				return 'warning';
			case 'ERROR':
				return 'error';
			case 'TODO':
			default:
				return 'info';
		}
	};
</script>

{#if $data}
	{@const type = $data.__typename}
	<div class="wrapper">
		{#if type === 'WorkloadStatusDeprecatedRegistry'}
			<Alert variant={variant($data.level)}>
				Deprecated image registry <strong>{$data.registry}</strong> for image
				<strong>{$data.name}</strong>. See
				<a href={docURL('/how-to-guides/github-action/')}> docker-build-push</a> on how to migrate to
				Google Artifact Registry.
			</Alert>
		{:else if type === 'WorkloadStatusInvalidNaisYaml'}
			<Alert variant={variant($data.level)}>
				The manifest for <strong>{job}</strong> includes invalid configuration:
				<br />{$data.detail}
			</Alert>
			<!--{:else if type === 'WorkloadStatusInboundNetwork'}
			<Alert variant={variant($data.level)}>
				{#if $data.policy.targetWorkload}
					Traffic from <a
						href="/team/{$data.policy.targetTeamSlug || team}/{$data.policy.targetWorkload
							.environment
							? $data.policy.targetWorkload.environment.name
							: env}/app/{$data.policy.targetWorkloadName}">{$data.policy.targetWorkloadName}</a
					>
					in namespace {$data.policy.targetTeamSlug || team} ({$data.policy.targetWorkload
						.environment
						? $data.policy.targetWorkload.environment.name
						: env}) is allowed by access policy, but
					<a
						href="/team/{$data.policy.targetTeamSlug || team}/{$data.policy.targetWorkload
							.environment
							? $data.policy.targetWorkload.environment.name
							: env}/app/{$data.policy.targetWorkloadName}">{$data.policy.targetWorkloadName}</a
					>
					does not have an outbound rule for {job}.
				{:else}
					Traffic from <strong>{$data.policy.targetWorkloadName}</strong> from team
					<strong>{$data.policy.targetTeamSlug}</strong>
					({env}) is allowed by access policy, but application is not found.
				{/if}
				<br />
				Consult
				<a href={docURL('/how-to-guides/access-policies/')}
					>Nais Application reference - accessPolicy</a
				>.
			</Alert>
		{:else if type === 'WorkloadStatusOutboundNetwork'}
			<Alert variant={variant($data.level)}>
				{#if $data.policy.targetWorkload}
					Traffic to <a
						href="/team/{$data.policy.targetTeamSlug || team}/{$data.policy.targetWorkload
							.environment
							? $data.policy.targetWorkload.environment.name
							: env}/app/{$data.policy.targetWorkloadName}">{$data.policy.targetWorkloadName}</a
					>
					in namespace {$data.policy.targetTeamSlug || team} ({$data.policy.targetWorkload
						.environment
						? $data.policy.targetWorkload.environment.name
						: env}) is allowed by access policy, but
					<a
						href="/team/{$data.policy.targetTeamSlug || team}/{$data.policy.targetWorkload
							.environment
							? $data.policy.targetWorkload.environment.name
							: env}/app/{$data.policy.targetWorkloadName}">{$data.policy.targetWorkloadName}</a
					>
					does not have an inbound rule for {job}.
				{:else}
					Traffic to <strong>{$data.policy.targetWorkloadName}</strong> from team
					<strong>{$data.policy.targetTeamSlug}</strong>
					({env}) is allowed by access policy, but application is not found.
				{/if}
				<br />
				Consult
				<a href={docURL('/how-to-guides/access-policies/')}
					>Nais Application reference - accessPolicy</a
				>.
			</Alert>
		-->
		{:else if type === 'WorkloadStatusMissingSBOM'}
			<Alert variant={variant($data.level)}>
				<h4>Missing SBOM</h4>
				The workload does not have a registered Software Bill of Materials (SBOM). Refer to the
				<a href={docURL('/services/vulnerabilities/how-to/sbom/')}>NAIS documentation</a>
				for instructions on how to resolve this.
			</Alert>
		{:else if type === 'WorkloadStatusVulnerable'}
			<Alert variant={variant($data.level)}>
				<h4>Workload is vulnerable</h4>
				{#if $data.summary && $data.summary.riskScore > 100}
					The workload is considered vulnerable with a risk score of {$data.summary.riskScore},
					which exceeds the acceptable threshold of 100.
				{:else}
					The workload is considered vulnerable because it has a critical vulnerability.
				{/if}
				The threshold is determined by either having more than one critical vulnerability or a combined
				risk score of other severities exceeding 100. Please keep your dependencies up to date. See
				<a href="/team/{team}/{env}/app/{job}/image">image details</a> for more details.
			</Alert>
		{:else if type === 'WorkloadStatusFailedRun'}
			<Alert variant={variant($data.level)}>
				<h4>Failed to run job</h4>
				{$data.detail}
			</Alert>
		{:else if type !== 'WorkloadStatusOutboundNetwork' && type !== 'WorkloadStatusInboundNetwork'}
			<Alert variant="error">Unkown error</Alert>
		{/if}
	</div>
{/if}

<style>
	.wrapper :global(.navds-alert__wrapper) {
		max-width: none;
	}
	.wrapper {
		padding-bottom: 1rem;
	}
</style>
