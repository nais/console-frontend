<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ErrorMessage from './ErrorMessage.svelte';
	import TeamErrorMessage from './TeamErrorMessage.svelte';

	const { Story } = defineMeta({
		title: 'Errors/No Running Instances',
		tags: ['autodocs']
	});
</script>

<Story name="Workload" asChild>
	<ErrorMessage
		docURL={(p) => p}
		error={{
			__typename: 'WorkloadStatusNoRunningInstances',
			level: 'ERROR'
		}}
		instances={[
			{
				node: {
					name: 'bidrag-sak-675cdddb5-vcffp',
					status: { message: 'ImagePullBackOff' },
					restarts: 0
				}
			},
			{
				node: {
					name: 'bidrag-sak-675cdddb5-vpc6m',
					status: { message: 'ImagePullBackOff' },
					restarts: 1
				}
			}
		]}
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
			__typename: 'WorkloadStatusNoRunningInstances',
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
				teamEnvironment: { environment: { name: 'dev-fss' } },
				team: { slug: 'team-service-management' }
			}
		]}
	/>
</Story>
