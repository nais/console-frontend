<script lang="ts">
	import { page } from '$app/stores';
	import { PendingValue, fragment, graphql, type AppErrorFragment } from '$houdini';
	import { Alert, Skeleton } from '@nais/ds-svelte-community';
	import { docURL } from './doc';

	export let error: AppErrorFragment;

	$: data = fragment(
		error,
		graphql(`
			fragment AppErrorFragment on StateError {
				revision @loading
				level
				type: __typename
				... on DeprecatedIngressError {
					ingress
				}
				... on DeprecatedRegistryError {
					name
					registry
					repository
					revision
					tag
				}
				... on InvalidNaisYamlError {
					detail
				}
				... on SynchronizationFailingError {
					detail
				}
				... on NewInstancesFailingError {
					failingInstances
				}
				... on InboundAccessError {
					rule {
						application
						cluster
						mutual
						mutualExplanation
						namespace
						isJob
					}
				}
				... on NoRunningInstancesError {
					level
				}
				... on OutboundAccessError {
					rule {
						application
						cluster
						mutual
						mutualExplanation
						namespace
						isJob
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
	{#if $data.revision === PendingValue}
		<div class="wrapper">
			<Skeleton variant="rounded" />
		</div>
	{:else if $data.__typename === 'DeprecatedRegistryError'}
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
	{:else if $data.__typename === 'NoRunningInstancesError'}
		<div class="wrapper">
			<Alert variant="error">
				No running instances of <strong>{app}</strong> in <strong>{env}</strong>.
			</Alert>
		</div>
	{:else if $data.__typename === 'DeprecatedIngressError'}
		<div class="wrapper">
			<Alert variant="info">
				<h4>Todo</h4>
				Deprecated ingress<strong>{$data.ingress}</strong>. See
				<a href={docURL('/reference/environments/?h=#' + env)}> ingress documentation</a>
				for available ingress domains.
			</Alert>
		</div>
	{:else if $data.__typename === 'InvalidNaisYamlError'}
		<div class="wrapper">
			<Alert variant="error">
				The <em>nais.yaml</em> configuration is invalid for application <strong>{app}</strong>:
				<br />{$data.detail}
			</Alert>
		</div>
	{:else if $data.__typename === 'SynchronizationFailingError'}
		<div class="wrapper">
			<Alert variant="error">
				Application <strong>{app}</strong> failed to synchronize properly.
				<br />{$data.detail}
			</Alert>
		</div>
	{:else if $data.__typename === 'NewInstancesFailingError'}
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
	{:else if $data.__typename === 'InboundAccessError'}
		{#if $data.rule.mutualExplanation !== 'NO_ZERO_TRUST'}
			<div class="wrapper">
				<Alert variant="warning">
					{#if $data.rule.isJob}
						{$data.rule.mutualExplanation}
						<a
							href="/team/{$data.rule.namespace || team}/{$data.rule.cluster
								? $data.rule.cluster
								: env}/job/{$data.rule.application}">{$data.rule.application}</a
						>
					{:else if $data.rule.mutualExplanation === 'APP_NOT_FOUND'}
						Traffic from {$data.rule.application} in namespace {$data.rule.namespace || team} ({$data
							.rule.cluster
							? $data.rule.cluster
							: env}) is allowed by access policy, but application is not found.
					{:else}
						Traffic from <a
							href="/team/{$data.rule.namespace || team}/{$data.rule.cluster
								? $data.rule.cluster
								: env}/app/{$data.rule.application}">{$data.rule.application}</a
						>
						in namespace {$data.rule.namespace || team} ({$data.rule.cluster
							? $data.rule.cluster
							: env}) is allowed by access policy, but
						<a
							href="/team/{$data.rule.namespace || team}/{$data.rule.cluster
								? $data.rule.cluster
								: env}/app/{$data.rule.application}">{$data.rule.application}</a
						>
						does not have an outbound rule for {app}.
					{/if}
					<br />
					Consult
					<a href={docURL('/how-to-guides/access-policies/')}
						>Nais Application reference - accessPolicy</a
					>.</Alert
				>
			</div>
		{/if}
	{:else if $data.__typename === 'OutboundAccessError'}
		<div class="wrapper">
			<Alert variant="warning">
				{#if $data.rule.isJob}
					{$data.rule.mutualExplanation}
					<a
						href="/team/{$data.rule.namespace || team}/{$data.rule.cluster
							? $data.rule.cluster
							: env}/job/{$data.rule.application}"
						>{$data.rule.application}.{$data.rule.namespace || team}.{$data.rule.cluster
							? $data.rule.cluster
							: env}</a
					>
				{:else if $data.rule.mutualExplanation === 'APP_NOT_FOUND'}
					Traffic to {$data.rule.application} in namespace {$data.rule.namespace || team} ({$data
						.rule.cluster
						? $data.rule.cluster
						: env}) is allowed by access policy, but application is not found.
				{:else}
					Traffic to <a
						href="/team/{$data.rule.namespace || team}/{$data.rule.cluster
							? $data.rule.cluster
							: env}/app/{$data.rule.application}">{$data.rule.application}</a
					>
					in namespace {$data.rule.namespace || team} ({$data.rule.cluster
						? $data.rule.cluster
						: env}) is allowed by access policy, but
					<a
						href="/team/{$data.rule.namespace || team}/{$data.rule.cluster
							? $data.rule.cluster
							: env}/app/{$data.rule.application}">{$data.rule.application}</a
					>
					does not have an inbound rule for {app}.
				{/if}
				<br />
				Consult
				<a href={docURL('/how-to-guides/access-policies/')}
					>Nais Application reference - accessPolicy</a
				>.</Alert
			>
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
