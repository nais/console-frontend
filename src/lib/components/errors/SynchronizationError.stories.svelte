<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ErrorMessage from './ErrorMessage.svelte';
	import TeamErrorMessage from './TeamErrorMessage.svelte';

	const { Story } = defineMeta({
		title: 'Errors/Synchronization Error',
		tags: ['autodocs']
	});
</script>

<Story name="Workload">
	<ErrorMessage
		docURL={(p) => p}
		error={{
			__typename: 'WorkloadStatusSynchronizationFailing',
			level: 'ERROR',
			detail:
				'persisting SQLInstance to Kubernetes: validation error: refusing to overwrite manually edited resource; please add the correct ownerReference in order to continue'
		}}
		workloadType="Job"
	/>
</Story>

<Story name="Team">
	<TeamErrorMessage
		teamSlug="team-service-management"
		error={{
			__typename: 'WorkloadStatusSynchronizationFailing',
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
