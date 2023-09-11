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
				type: __typename
				... on DeprecatedIngressError {
					level
					ingress
				}
				... on DeprecatedRegistryError {
					level
					name
					registry
					repository
					revision
					tag
				}
				... on InvalidNaisYamlError {
					level
					detail
				}
				... on NewInstancesFailingError {
					level
					failingInstances
				}
				... on NoRunningInstancesError {
					level
				}
			}
		`)
	);

	$: team = $page.params.team;
	$: env = $page.params.env;
	$: app = $page.params.app;
	$: job = $page.params.job;
</script>

<div class="wrapper">
	{#if $data.revision == PendingValue}
		<Loading />
	{:else if $data.__typename === 'DeprecatedRegistryError'}
		<Alert variant="warning">
			Deprecated image registry <strong>{$data.registry}</strong> for image
			<strong>{$data.name}</strong>. See
			<a href="https://github.com/nais/docker-build-push"> docker-build-push</a> on how to migrate to
			Google Artifact Registry.
		</Alert>
	{:else if $data.__typename === 'NoRunningInstancesError'}
		<Alert variant="error">
			No running instances of <strong>{app}</strong> in <strong>{env}</strong>.
		</Alert>
	{:else if $data.__typename === 'DeprecatedIngressError'}
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
	{:else if $data.__typename === 'InvalidNaisYamlError'}
		<Alert variant="error">
			Nais-yaml might be invalid for application <strong>{app}</strong>.
		</Alert>
	{:else if $data.__typename === 'NewInstancesFailingError'}
		<Alert variant="warning">
			{#if app}
				New instances of <strong>{app}</strong> in <strong>{env}</strong> are failing. Check logs
				for one or more of the instances:
				{#each $data.failingInstances as instance}
					<br /><a href="/team/{team}/{env}/app/{app}/logs?name={instance}">{instance}</a>
				{/each}
			{/if}
			{#if job}
				Job runs are failing. Please check <a href="/team/{team}/{env}/job/{job}/logs">logs</a> of new
				runs.
			{/if}
		</Alert>
	{/if}
</div>

<style>
	.wrapper :global(.navds-alert__wrapper) {
		max-width: none;
	}
	.wrapper {
		padding-bottom: 1rem;
	}
</style>
