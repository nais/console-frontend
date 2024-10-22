<script lang="ts">
	import { page } from '$app/stores';
	import { PendingValue, fragment, graphql, type JobErrorFragment } from '$houdini';
	import { Alert, Skeleton } from '@nais/ds-svelte-community';
	import { docURL } from './doc';

	export let error: JobErrorFragment;

	$: data = fragment(
		error,
		graphql(`
			fragment JobErrorFragment on StateError {
				revision @loading
				type: __typename

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

				... on InboundAccessError {
					level
					rule {
						application
						cluster
						mutual
						mutualExplanation
						namespace
					}
				}
				... on OutboundAccessError {
					level
					rule {
						application
						cluster
						mutual
						mutualExplanation
						namespace
					}
				}
				... on FailedRunError {
					level
					runMessage
					runName
				}
				... on MissingSbomError {
					level
				}
				... on VulnerableError {
					level
					summary {
						riskScore
					}
				}
			}
		`)
	);

	$: team = $page.params.team;
	$: env = $page.params.env;
	$: job = $page.params.job;
</script>

<div class="wrapper">
	{#if $data.revision == PendingValue}
		<Skeleton variant="rounded" />
	{:else if $data.__typename === 'DeprecatedRegistryError'}
		<Alert variant="warning">
			Deprecated image registry <strong>{$data.registry}</strong> for image
			<strong>{$data.name}</strong>. See
			<a href={docURL('/how-to-guides/github-action/')}> docker-build-push</a> on how to migrate to Google
			Artifact Registry.
		</Alert>
	{:else if $data.__typename === 'InvalidNaisYamlError'}
		<!---->
		<Alert variant="error">
			Nais-yaml might be invalid for application <strong>{job}</strong>.
		</Alert>
	{:else if $data.__typename === 'InboundAccessError'}
		{#if $data.rule.mutualExplanation !== 'NO_ZERO_TRUST'}
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
				<a href="/team/{team}/{env}/job/{job}">{job}.{team}.{env}</a>.
				<br />
				{#if $data.rule.mutualExplanation === 'APP_NOT_FOUND'}
					Verify outbound rules for
					<a
						href="/team/{$data.rule.namespace || team}/{$data.rule.cluster
							? $data.rule.cluster
							: env}/app/{$data.rule.application}/yaml">manifest</a
					>. Are namespace or cluster missing from rule?
				{:else if $data.rule.mutualExplanation === 'RULE_NOT_FOUND'}
					Please add outbound rule for {job}.{team}.{env} to
					<a
						href="/team/{$data.rule.namespace || team}/{$data.rule.cluster
							? $data.rule.cluster
							: env}/app/{$data.rule.application}/yaml">manifest</a
					>.
				{:else}
					<!--Please verify outbound rule for {app}. Check rule in
				<a href="/team/{team}/{env}/app/{app}/manifest">manifest</a>.-->
					{$data.rule.mutualExplanation}
				{/if}
				<br />
				Consult
				<a href={docURL('/how-to-guides/access-policies/')}
					>Nais Application reference - accessPolicy</a
				>.</Alert
			>
		{/if}
	{:else if $data.__typename === 'OutboundAccessError'}
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
			<a href="/team/{team}/{env}/job/{job}">{job}.{team}.{env}</a>.
			<br />
			{#if $data.rule.mutualExplanation == 'APP_NOT_FOUND'}
				Please verify inbound rule for {job}. Check rule in
				<a href="/team/{team}/{env}/app/{job}/yaml">manifest</a>. Are namespace or cluster missing
				from rule?
			{:else if $data.rule.mutualExplanation === 'RULE_NOT_FOUND'}
				Fant ikke
			{:else}
				{$data.rule.mutualExplanation}
			{/if}
			<br />Consult
			<a href={docURL('/how-to-guides/access-policies/')}
				>Nais Application reference - accessPolicy</a
			>.</Alert
		>
	{:else if $data.__typename === 'FailedRunError'}
		<Alert variant="error">
			{$data.runName} failed. {$data.runMessage}. Please consult the
			<a href="/team/{team}/{env}/job/{job}/logs?{$data.runName}">logs</a> if still available.
		</Alert>
	{:else if $data.__typename === 'MissingSbomError'}
		<div class="wrapper">
			<Alert variant="warning">
				<h4>Missing SBOM</h4>
				Application does not have a Software Bill of Materials (SBOM) registered. See<a
					href="https://docs.nais.io/services/salsa/#slsa-in-nais">NAIS documentation</a
				> on how to fix.
			</Alert>
		</div>
	{:else if $data.__typename === 'VulnerableError' && $data.summary}
		<div class="wrapper">
			<Alert variant="warning">
				<h4>Job is vulnerable</h4>
				{#if $data.summary && $data.summary.riskScore > 100}
					Job is considered vulnerable with a risk score of {$data.summary.riskScore} which is higher
					than the acceptable threshold of 100.
				{:else}
					The job is considered vulnerable because it has a critical vulnerability.
				{/if}
				The threshold is determined by either having more than one critical vulnerability or a combined
				risk score of other severities exceeding 100. Please keep your dependencies up to date. See
				<a href="/team/{team}/{env}/job/{job}/image">image details</a> for more details.
			</Alert>
		</div>
	{:else}
		<Alert variant="error">Unkown error</Alert>
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
