<script lang="ts">
	import { page } from '$app/stores';
	import { PendingValue, fragment, graphql, type AppErrorFragment } from '$houdini';
	import { Alert } from '@nais/ds-svelte-community';
	import Loading from './Loading.svelte';

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
					}
				}
			}
		`)
	);

	$: team = $page.params.team;
	$: env = $page.params.env;
	$: app = $page.params.app;
</script>

{#if $data.revision === PendingValue}
	<div class="wrapper">
		<Loading />
	</div>
{:else if $data.__typename === 'DeprecatedRegistryError'}
	<div class="wrapper">
		<Alert variant="warning">
			Deprecated image registry <strong>{$data.registry}</strong> for image
			<strong>{$data.name}</strong>. See
			<a href="https://github.com/nais/docker-build-push"> docker-build-push</a> on how to migrate to
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
		<Alert variant="warning">
			Deprecated ingress <strong>{$data.ingress}</strong>. See
			{#if env === 'dev-gcp'}
				<a href="https://doc.nais.io/clusters/gcp/#dev-gcp-ingresses"> ingress documentation</a>
			{:else if env === 'prod-gcp'}
				<a href="https://doc.nais.io/clusters/gcp/#prod-gcp-ingresses"> ingress documentation</a>
			{:else if env === 'dev-fss'}
				<a href="https://doc.nais.io/clusters/on-premises/#dev-fss"> ingress documentation</a>
			{:else if env === 'prod-fss'}
				<a href="https://doc.nais.io/clusters/on-premises/#prod-fss"> ingress documentation</a>
			{/if} for available ingress domains.
		</Alert>
	</div>
{:else if $data.__typename === 'InvalidNaisYamlError'}
	<div class="wrapper">
		<Alert variant="error">
			Nais-yaml might be invalid for application <strong>{app}</strong>.
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
	{#if $data.rule.mutualExplanation !== 'NO_ZERO_TRUST' && $data.rule.mutualExplanation !== 'CLUSTER_NOT_FOUND'}
		<div class="wrapper">
			<Alert variant="warning"
				><a
					href="/team/{$data.rule.namespace || team}/{$data.rule.cluster
						? $data.rule.cluster
						: env}/app/{$data.rule.application}"
					>{$data.rule.application}.{$data.rule.namespace || team}.{$data.rule.cluster
						? $data.rule.cluster
						: env}</a
				>
				is missing outbound rule for
				<a href="/team/{team}/{env}/app/{app}">{app}.{team}.{env}</a>.
				<br />
				{#if $data.rule.mutualExplanation === 'APP_NOT_FOUND'}
					Application not found. Verify outbound rules for {$data.rule.application}. Does
					application exist, or are namespace or cluster missing from rule?
				{:else if $data.rule.mutualExplanation === 'RULE_NOT_FOUND'}
					Please add outbound rule for {app}.{team}.{env} to
					<a
						href="/team/{$data.rule.namespace || team}/{$data.rule.cluster
							? $data.rule.cluster
							: env}/app/{$data.rule.application}/yaml">manifest</a
					>.
				{:else}
					<!--Please verify outbound rule for {app}. Check rule in
				<a href="/team/{team}/{env}/app/{app}/yaml">manifest</a>.-->
					{$data.rule.mutualExplanation}
				{/if}
				<br />
				Consult
				<a href="https://docs.nais.io/nais-application/application/?h=#accesspolicy"
					>Nais Application reference - accessPolicy</a
				>.</Alert
			>
		</div>
	{/if}
{:else if $data.__typename === 'OutboundAccessError'}
	<div class="wrapper">
		<Alert variant="warning"
			><a
				href="/team/{$data.rule.namespace || team}/{$data.rule.cluster
					? $data.rule.cluster
					: env}/app/{$data.rule.application}"
				>{$data.rule.application}.{$data.rule.namespace || team}.{$data.rule.cluster
					? $data.rule.cluster
					: env}</a
			>
			is missing inbound rule for
			<a href="/team/{team}/{env}/app/{app}">{app}.{team}.{env}</a>.
			<br />
			{#if $data.rule.mutualExplanation == 'APP_NOT_FOUND'}
				Please verify inbound rule for {app}. Check rule in
				<a href="/team/{team}/{env}/app/{app}/yaml">manifest</a>. Are namespace or cluster missing
				from rule? Does the application exist?
			{:else if $data.rule.mutualExplanation === 'RULE_NOT_FOUND'}
				Please add inbound rule for {app}.{team}.{env} to {$data.rule.application}.{$data.rule
					.namespace || team}.{$data.rule.cluster ? $data.rule.cluster : env}
				<a
					href="/team/{$data.rule.namespace || team}/{$data.rule.cluster
						? $data.rule.cluster
						: env}/app/{$data.rule.application}/yaml">manifest</a
				>.
			{:else}
				{$data.rule.mutualExplanation}
			{/if}
			<br />Consult
			<a href="https://docs.nais.io/nais-application/application/?h=#accesspolicy"
				>Nais Application reference - accessPolicy</a
			>.</Alert
		>
	</div>
{:else}
	<div class="wrapper">
		<Alert variant="error">Unkown error</Alert>
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
