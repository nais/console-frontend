<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ErrorMessage from './ErrorMessage.svelte';
	import TeamErrorMessage from './TeamErrorMessage.svelte';

	const { Story } = defineMeta({
		title: 'Errors/Vulnerable Image',
		tags: ['autodocs']
	});
</script>

<Story name="Risk Score - Workload" asChild>
	<ErrorMessage
		docURL={(p) => p}
		error={{
			__typename: 'WorkloadStatusVulnerable',
			level: 'WARNING',
			summary: {
				riskScore: 276,
				critical: 0
			}
		}}
		teamSlug="team-service-management"
		workloadName="ip-lookup-preprod"
		environment="dev-fss"
		workloadType="App"
	/>
</Story>

<Story name="Critical - Workload" asChild>
	<ErrorMessage
		docURL={(p) => p}
		error={{
			__typename: 'WorkloadStatusVulnerable',
			level: 'WARNING',
			summary: {
				riskScore: 70,
				critical: 7
			}
		}}
		teamSlug="team-service-management"
		workloadName="ip-lookup-preprod"
		environment="dev-fss"
		workloadType="App"
	/>
</Story>

<Story name="Both - Workload" asChild>
	<ErrorMessage
		docURL={(p) => p}
		error={{
			__typename: 'WorkloadStatusVulnerable',
			level: 'WARNING',
			summary: {
				riskScore: 276,
				critical: 1
			}
		}}
		teamSlug="team-service-management"
		workloadName="ip-lookup-preprod"
		environment="dev-fss"
		workloadType="App"
	/>
</Story>

<Story name="Team - Singular" asChild>
	<TeamErrorMessage
		teamSlug="team-service-management"
		error={{
			__typename: 'WorkloadStatusVulnerable',
			level: 'WARNING'
		}}
		workloads={[
			{
				__typename: 'App',
				name: 'ip-lookup-preprod',
				teamEnvironment: { environment: { name: 'dev-fss' } },
				team: { slug: 'team-service-management' }
			}
		]}
	/>
</Story>

<Story name="Team - Multiple" asChild>
	<TeamErrorMessage
		teamSlug="team-service-management"
		error={{
			__typename: 'WorkloadStatusVulnerable',
			level: 'WARNING'
		}}
		workloads={[
			{
				__typename: 'App',
				name: 'ip-lookup-preprod',
				teamEnvironment: { environment: { name: 'dev-fss' } },
				team: { slug: 'team-service-management' }
			},
			{
				__typename: 'App',
				name: 'tsm-dustin-integration-preprod',
				teamEnvironment: { environment: { name: 'prod-fss' } },
				team: { slug: 'team-service-management' }
			},
			{
				__typename: 'App',
				name: 'tsm-dustin-integration-preprod',
				teamEnvironment: { environment: { name: 'prod-fss' } },
				team: { slug: 'team-service-management' }
			}
		]}
	/>
</Story>
