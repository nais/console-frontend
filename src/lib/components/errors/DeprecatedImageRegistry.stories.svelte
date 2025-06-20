<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ErrorMessage from './ErrorMessage.svelte';
	import TeamErrorMessage from './TeamErrorMessage.svelte';

	const { Story } = defineMeta({
		title: 'Errors/Unsupported Image Registry',
		tags: ['autodocs']
	});
</script>

<Story name="Workload" asChild>
	<ErrorMessage
		docURL={(p) => p}
		error={{
			__typename: 'WorkloadStatusDeprecatedRegistry',
			level: 'ERROR',
			registry: 'docker.pkg.github.com'
		}}
		workloadType="App"
		teamSlug="team-service-management"
		workloadName="ip-lookup-preprod"
		environment="dev-fss"
	/>
</Story>

<Story name="Team" asChild>
	<TeamErrorMessage
		teamSlug="team-service-management"
		error={{
			__typename: 'WorkloadStatusDeprecatedRegistry',
			level: 'ERROR'
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
			},
			{
				__typename: 'App',
				name: 'tsm-dustin-integration',
				teamEnvironment: { environment: { name: 'dev-fss' } },
				team: { slug: 'team-service-management' }
			},
			{
				__typename: 'App',
				name: 'dustin-integration-preprod',
				teamEnvironment: { environment: { name: 'prod-gcp' } },
				team: { slug: 'team-service-management' }
			},
			{
				__typename: 'App',
				name: 'tsm-dustin-preprod',
				teamEnvironment: { environment: { name: 'dev-gcp' } },
				team: { slug: 'team-service-management' }
			},
			{
				__typename: 'App',
				name: 'tsm-integration-preprod',
				teamEnvironment: { environment: { name: 'dev-fss' } },
				team: { slug: 'team-service-management' }
			},
			{
				__typename: 'App',
				name: 'tsm-dust',
				teamEnvironment: { environment: { name: 'dev-fss' } },
				team: { slug: 'team-service-management' }
			}
		]}
	/>
</Story>
