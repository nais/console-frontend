<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ErrorMessage from './ErrorMessage.svelte';
	import TeamErrorMessage from './TeamErrorMessage.svelte';

	const { Story } = defineMeta({
		title: 'Errors/Failed Run',
		tags: ['autodocs']
	});
</script>

<Story name="Workload" asChild>
	<ErrorMessage
		docURL={(p) => p}
		error={{
			__typename: 'WorkloadStatusFailedRun',
			level: 'WARNING',
			name: 'aareg-sync-konkurser-q4-29028365',
			detail: 'Run failed after 7 attempts'
		}}
		workloadType="Job"
		teamSlug="team-service-management"
		workloadName="aareg-sync-konkurser-q4-29028365"
		environment="dev-fss"
	/>
</Story>

<Story name="Team" asChild>
	<TeamErrorMessage
		teamSlug="team-service-management"
		error={{
			__typename: 'WorkloadStatusFailedRun',
			level: 'WARNING'
		}}
		workloads={[
			{
				__typename: 'Job',
				name: 'ip-lookup-preprod',
				teamEnvironment: { environment: { name: 'dev-fss' } },
				team: { slug: 'team-service-management' }
			},
			{
				__typename: 'Job',
				name: 'tsm-dustin-integration-preprod',
				teamEnvironment: { environment: { name: 'dev-fss' } },
				team: { slug: 'team-service-management' }
			}
		]}
	/>
</Story>
