<script lang="ts">
	import { page } from '$app/stores';
	import { fragment, graphql, type AppErrorFragment } from '$houdini';
	import { Alert } from '@nais/ds-svelte-community';
	import { docURL } from './doc';

	export let error: AppErrorFragment;

	$: data = fragment(
		error,
		graphql(`
			fragment AppErrorFragment on WorkloadStatusError {
				level
				__typename
				... on WorkloadStatusDeprecatedIngress {
					ingress
				}
				... on WorkloadStatusDeprecatedRegistry {
					name
					registry
					repository
					tag
				}
				... on WorkloadStatusNoRunningInstances {
					level
				}
				... on WorkloadStatusInvalidNaisYaml {
					detail
					level
				}
				... on WorkloadStatusSynchronizationFailing {
					detail
					level
				}
				... on WorkloadStatusNewInstancesFailing {
					failingInstances
					level
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
	$: app = $page.params.app;
</script>

{#if $data}
	{@const type = $data.__typename}
	{#if type === 'WorkloadStatusDeprecatedRegistry'}
		<div class="wrapper">
			<Alert variant="info">
				<h4>Todo</h4>
				Deprecated image registry
				<strong>{$data.registry}</strong> for image
				<strong>{$data.name}</strong>. See
				<a href={docURL('/how-to-guides/github-action/')}>docker-build-push</a> on how to migrate to
				Google Artifact Registry.
			</Alert>
		</div>
	{:else if type === 'WorkloadStatusNoRunningInstances'}
		<div class="wrapper">
			<Alert variant="error">
				No running instances of <strong>{app}</strong> in <strong>{env}</strong>.
			</Alert>
		</div>
	{:else if type === 'WorkloadStatusDeprecatedIngress'}
		<div class="wrapper">
			<Alert variant="info">
				<h4>Todo</h4>
				Deprecated ingress<strong>{$data.ingress}</strong>. See
				<a href={docURL('/reference/environments/?h=#' + env)}> ingress documentation</a>
				for available ingress domains.
			</Alert>
		</div>
	{:else if type === 'WorkloadStatusInvalidNaisYaml'}
		<div class="wrapper">
			<Alert variant="error">
				The <em>nais.yaml</em> configuration is invalid for application <strong>{app}</strong>:
				<br />{$data.detail}
			</Alert>
		</div>
	{:else if type === 'WorkloadStatusSynchronizationFailing'}
		<div class="wrapper">
			<Alert variant="error">
				Application <strong>{app}</strong> failed to synchronize properly.
				<br />{$data.detail}
			</Alert>
		</div>
	{:else if type === 'WorkloadStatusNewInstancesFailing'}
		<div class="wrapper">
			<Alert variant="warning">
				{#if app}
					New instances of <strong>{app}</strong> in <strong>{env}</strong> are failing. Check logs
					for one or more of the instances:
					{#each $data.failingInstances as instance}
						<br /><a href="/team/{team}/{env}/app/{app}/logs?name={instance}">{instance}</a>
					{/each}
				{/if}
			</Alert>
		</div>
	{:else if type === 'WorkloadStatusInboundNetwork'}
		<div class="wrapper">
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
					does not have an outbound rule for {app}.
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
		</div>
	{:else if type === 'WorkloadStatusOutboundNetwork'}
		<div class="wrapper">
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
					does not have an inbound rule for {app}.
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
		</div>
	{:else}
		<div class="wrapper">
			<Alert variant="error">Unkown error</Alert>
		</div>
	{/if}
{/if}

<style>
	.wrapper :global(.navds-alert__wrapper) {
		max-width: none;
	}
	.wrapper {
		padding-bottom: 1rem;
	}
	.wrapper h4 {
		margin-bottom: 0.5rem;
	}
</style>
