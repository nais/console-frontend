<script lang="ts">
	import { page } from '$app/state';
	import {
		fragment,
		graphql,
		WorkloadStatusErrorLevel,
		type AppErrorFragment,
		type ValueOf
	} from '$houdini';
	import { Alert } from '@nais/ds-svelte-community';
	import { docURL } from './doc';

	interface Props {
		error: AppErrorFragment;
	}

	let { error }: Props = $props();

	let data = $derived(
		fragment(
			error,
			graphql(`
				fragment AppErrorFragment on WorkloadStatusError {
					__typename
					... on WorkloadStatusDeprecatedRegistry {
						name
						registry
						repository
						tag
						level
					}
					... on WorkloadStatusInvalidNaisYaml {
						detail
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
					... on WorkloadStatusMissingSBOM {
						level
					}
					... on WorkloadStatusVulnerable {
						level
						summary {
							riskScore
						}
					}
					... on WorkloadStatusSynchronizationFailing {
						detail
						level
					}
					... on WorkloadStatusDeprecatedIngress {
						level
						ingress
					}
					... on WorkloadStatusNewInstancesFailing {
						failingInstances
						level
					}
					... on WorkloadStatusNoRunningInstances {
						level
					}
				}
			`)
		)
	);

	let team = $derived(page.params.team);
	let env = $derived(page.params.env);
	let app = $derived(page.params.app);

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

	const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
</script>

{#if $data}
	{@const type = $data.__typename}
	<div class="wrapper">
		{#if type === 'WorkloadStatusDeprecatedRegistry'}
			<Alert variant={variant($data.level)}>
				<h4>{capitalize($data.level)}</h4>
				Deprecated image registry
				<strong>{$data.registry}</strong> for image
				<strong>{$data.name}</strong>. See
				<a href={docURL('/how-to-guides/github-action/')}>docker-build-push</a> on how to migrate to
				Google Artifact Registry.
			</Alert>
		{:else if type === 'WorkloadStatusNoRunningInstances'}
			<Alert variant={variant($data.level)}>
				No running instances of <strong>{app}</strong> in <strong>{env}</strong>.
			</Alert>
		{:else if type === 'WorkloadStatusDeprecatedIngress'}
			<Alert variant={variant($data.level)}>
				<h4>{capitalize($data.level)}</h4>
				Deprecated ingress
				<strong>{$data.ingress}</strong>. See
				<a href={docURL('/reference/environments/?h=#' + env)}> ingress documentation</a>
				for available ingress domains.
			</Alert>
		{:else if type === 'WorkloadStatusInvalidNaisYaml'}
			<Alert variant={variant($data.level)}>
				The <em>nais.yaml</em> configuration is invalid for application <strong>{app}</strong>:
				<br />{$data.detail}
			</Alert>
		{:else if type === 'WorkloadStatusSynchronizationFailing'}
			<Alert variant={variant($data.level)}>
				Application <strong>{app}</strong> failed to synchronize properly.
				<br />{$data.detail}
			</Alert>
		{:else if type === 'WorkloadStatusNewInstancesFailing'}
			<Alert variant={variant($data.level)}>
				{#if app}
					New instances of <strong>{app}</strong> in <strong>{env}</strong> are failing. Check logs
					for one or more of the instances:
					{#each $data.failingInstances as instance (instance)}
						<br /><a href="/team/{team}/{env}/app/{app}/logs?name={instance}">{instance}</a>
					{/each}
				{/if}
			</Alert>
		{:else if type === 'WorkloadStatusInboundNetwork'}
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
				<a href="/team/{team}/{env}/app/{app}/image">image details</a> for more details.
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
	.wrapper h4 {
		margin-bottom: 0.5rem;
	}
</style>
