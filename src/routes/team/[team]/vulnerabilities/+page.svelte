<script lang="ts">
	import { page } from '$app/state';
	import VulnerabilitiesOverview from '$lib/components/VulnerabilityOverview.svelte';
	import WorkloadsWithVulnerabilities from '$lib/components/WorkloadsWithVulnerabilities.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import { Heading, Select } from '@nais/ds-svelte-community';
	import type { PageProps } from './$houdini';

	let { data }: PageProps = $props();
	let { teamSlug } = $derived(data);

	let selectedEnvironment: string = $state(page.url.searchParams.get('environment') || '');

	let { TeamVulnerabilities } = $derived(data);

	export const supportedErrorTypes = ['WorkloadStatusVulnerable'] as const;

	const getWorkloadsWithError = (errorType: (typeof supportedErrorTypes)[number]) => {
		const workloads = $TeamVulnerabilities.data?.team.workloads.nodes.filter((workload) =>
			workload.status.errors.some((error) => error.__typename === errorType)
		);
		if (workloads?.length) {
			return {
				__typename: errorType,
				level: workloads[0].status.errors.find((error) => error.__typename === errorType)?.level,
				workloads
			};
		} else {
			return {
				__typename: errorType
			};
		}
	};
</script>

<GraphErrors errors={$TeamVulnerabilities.errors} />

{#if $TeamVulnerabilities.data}
	{@const team = $TeamVulnerabilities.data.team}
	<div class="wrapper">
		<VulnerabilitiesOverview {teamSlug} />
		<div>
			<Heading level="3" size="medium" spacing>Workloads with vulnerabilities</Heading>

			<div class="env-filter">
				<Select size="small" hideLabel={true} bind:value={selectedEnvironment} label="Environment">
					<option value="">All environments</option>
					{#if team.environments}
						{#each team.environments as teamEnvironment (teamEnvironment.id)}
							<option
								value={teamEnvironment.environment.name}
								selected={teamEnvironment.environment.name === selectedEnvironment}
								>{teamEnvironment.environment.name}</option
							>
						{/each}
					{/if}
				</Select>
			</div>
			<WorkloadsWithVulnerabilities team={teamSlug} environment={selectedEnvironment} />
		</div>
	</div>
{/if}

<style>
	.wrapper {
		display: grid;
		gap: var(--a-spacing-4);
	}

	.env-filter {
		display: flex;
		margin-bottom: 1rem;
	}
</style>
