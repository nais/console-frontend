<script lang="ts">
	import { page } from '$app/stores';
	import { fragment, graphql, type JobErrorFragment } from '$houdini';
	import { Alert } from '@nais/ds-svelte-community';
	import { docURL } from './doc';

	export let error: JobErrorFragment;

	$: data = fragment(
		error,
		graphql(`
			fragment JobErrorFragment on WorkloadStatusError {
				__typename

				... on WorkloadStatusFailedRun {
					level
					detail
					name
				}

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
				... on WorkloadStatusInboundNetwork {
					level
					policy {
						targetWorkload {
							name
							environment {
								name
							}
						}
						targetTeam {
							slug
						}
						targetTeamSlug
						targetWorkloadName
					}
				}
				... on WorkloadStatusOutboundNetwork {
					level
					policy {
						targetWorkload {
							name
							environment {
								name
							}
						}
						targetTeam {
							slug
						}
						targetTeamSlug
						targetWorkloadName
					}
				}
			}
		`)
	);

	$: team = $page.params.team;
	$: env = $page.params.env;
	$: job = $page.params.job;
</script>

{#if $data}
	{@const type = $data.__typename}
	<div class="wrapper">
		{#if type === 'WorkloadStatusDeprecatedRegistry'}
			<Alert variant="warning">
				Deprecated image registry <strong>{$data.registry}</strong> for image
				<strong>{$data.name}</strong>. See
				<a href={docURL('/how-to-guides/github-action/')}> docker-build-push</a> on how to migrate to
				Google Artifact Registry.
			</Alert>
		{:else if type === 'WorkloadStatusInvalidNaisYaml'}
			<Alert variant="error">
				Nais-yaml might be invalid for application <strong>{job}</strong>.
			</Alert>
		{:else if type === 'WorkloadStatusInboundNetwork'}
			<Alert variant="warning">
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
			<Alert variant="warning">
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
		{:else if type === 'WorkloadStatusFailedRun'}
			<Alert variant="error">
				{$data.name} failed. {$data.detail}. Please consult the
				<a href="/team/{team}/{env}/job/{job}/logs?{$data.name}">logs</a> if still available.
			</Alert>
		{:else}
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
