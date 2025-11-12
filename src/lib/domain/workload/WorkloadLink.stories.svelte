<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import WorkloadLink from '$lib/domain/workload/WorkloadLink.svelte';

	const { Story } = defineMeta({
		component: WorkloadLink,
		tags: ['autodocs']
	});
</script>

<Story name="Application" asChild>
	<WorkloadLink
		workload={{
			name: 'my-app',
			__typename: 'Application',
			teamEnvironment: {
				environment: { name: 'prod-gcp' }
			},
			team: { slug: 'myteam' }
		}}
	/>
</Story>

<Story name="Job" asChild>
	<WorkloadLink
		workload={{
			name: 'data-processor',
			__typename: 'Job',
			teamEnvironment: {
				environment: { name: 'dev-gcp' }
			},
			team: { slug: 'analytics' }
		}}
	/>
</Story>

<Story name="Without team" asChild>
	<WorkloadLink
		hideTeam
		workload={{
			name: 'payment-service',
			__typename: 'Application',
			teamEnvironment: {
				environment: { name: 'prod-gcp' }
			},
			team: { slug: 'platform' }
		}}
	/>
</Story>

<Story name="Without environment" asChild>
	<WorkloadLink
		hideEnv
		workload={{
			name: 'notification-worker',
			__typename: 'Job',
			teamEnvironment: {
				environment: { name: 'prod-gcp' }
			},
			team: { slug: 'notifications' }
		}}
	/>
</Story>

<Story name="With warning" asChild>
	<WorkloadLink
		warning="This workload is missing outbound policy"
		workload={{
			name: 'legacy-api',
			__typename: 'Application',
			teamEnvironment: {
				environment: { name: 'prod-gcp' }
			},
			team: { slug: 'backend' }
		}}
	/>
</Story>
