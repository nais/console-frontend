<script lang="ts">
	import { TeamVulnerabilityState } from '$houdini';
	import Nais from '$lib/icons/Nais.svelte';

	import { page } from '$app/state';
	import VulnerabilitySummaryFinal from '$lib/components/VulnerabilitySummaryFinal.svelte';
	import WorkloadsWithVulnerabilities from '$lib/components/WorkloadsWithVulnerabilities.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import { Alert, BodyLong, BodyShort, Heading, Select } from '@nais/ds-svelte-community';
	import type { PageProps } from './$houdini';

	let { data }: PageProps = $props();
	let { teamSlug } = $derived(data);

	let selectedEnvironment: string = $state(page.url.searchParams.get('environment') || '');

	let { TeamVulnerabilities } = $derived(data);
</script>

<GraphErrors errors={$TeamVulnerabilities.errors} />

{#if $TeamVulnerabilities.data}
	{@const team = $TeamVulnerabilities.data.team}
	<div class="wrapper">
		<div class="columns">
			<div class="status">
				{#if team.vulnerabilitySummary.status.filter((status) => status.state !== TeamVulnerabilityState.OK).length > 0}
					{#if team?.vulnerabilitySummary.bomCount > 0}
						{#each team?.vulnerabilitySummary.status.filter((status) => status.state !== TeamVulnerabilityState.OK) as status (status)}
							<Alert variant="error">
								<Heading level="2" size="small" spacing>{status.title}</Heading>
								<BodyLong>{status.description}</BodyLong>
							</Alert>
						{/each}
					{:else}
						<span>No workloads with vulnerability data found</span>
					{/if}
				{:else}
					<div class="media-object">
						<Nais
							size="80px"
							style="color: var(--a-icon-success)"
							aria-label="Team is nais"
							role="image"
						/>
						<div>
							<BodyShort spacing>
								<strong>Nais!</strong> Your team currently has no workloads with a risk score above 100
								and no critical vulnerabilities. This means your security posture is strong, and your
								dependencies are well-maintained.
							</BodyShort>
							<BodyShort>
								Keep up the good work in monitoring and updating your workloads to maintain this
								status!
							</BodyShort>
						</div>
					</div>
				{/if}
			</div>

			<VulnerabilitySummaryFinal {teamSlug} />
		</div>
		<div>
			<Heading level="3" size="medium" spacing>Workloads with vulnerabilities</Heading>

			<div class="env-filter">
				<Select size="small" hideLabel={true} bind:value={selectedEnvironment} label="Environment">
					<option value="">All environments</option>
					{#if team.environments}
						{#each team.environments as env (env.id)}
							{#if env.name === selectedEnvironment}
								<option value={env.name} selected={true}>{env.name}</option>
							{:else}
								<option value={env.name}>{env.name}</option>
							{/if}
						{/each}
					{/if}
				</Select>
			</div>
			<WorkloadsWithVulnerabilities team={teamSlug} environment={selectedEnvironment} />
		</div>
	</div>
{/if}

<style>
	.media-object {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--a-spacing-4);
		max-width: 75ch;
	}
	.status {
		display: grid;
		gap: var(--a-spacing-2);
	}
	.columns {
		display: grid;
		grid-template-columns: 1fr 350px;
		gap: 1rem;
		align-items: start;
	}

	.wrapper {
		display: grid;
		gap: var(--a-spacing-4);
	}

	.env-filter {
		display: flex;
		margin-bottom: 1rem;
	}
</style>
