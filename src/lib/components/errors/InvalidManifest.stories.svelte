<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ErrorMessage from './ErrorMessage.svelte';
	import TeamErrorMessage from './TeamErrorMessage.svelte';

	const { Story } = defineMeta({
		title: 'Errors/Invalid Manifest',
		tags: ['autodocs']
	});
</script>

<Story name="Workload">
	<ErrorMessage
		docURL={(p) => p}
		error={{
			__typename: 'WorkloadStatusInvalidNaisYaml',
			level: 'ERROR',
			detail:
				'the domain "roger.com" cannot be used in cluster "dev-gcp"; use one of dev.nav.cloud.nais.io, external.dev.nav.cloud.nais.io, authenticated.dev.nav.cloud.nais.io, .intern.dev.nav.no, .dev-gcp.nav.cloud.nais.io, .ekstern.dev.nav.no, .ansatt.dev.nav.no, .very.intern.dev.nav.no'
		}}
		workloadType="App"
		teamSlug="team-service-management"
		workloadName="ip-lookup-preprod"
		environment="dev-fss"
	/>
</Story>

<Story name="Team">
	<TeamErrorMessage
		teamSlug="team-service-management"
		error={{
			__typename: 'WorkloadStatusInvalidNaisYaml',
			level: 'ERROR'
		}}
		workloads={[
			{
				__typename: 'App',
				name: 'ip-lookup-prod',
				teamEnvironment: { environment: { name: 'prod-fss' } },
				team: { slug: 'team-service-management' }
			}
		]}
	/>
</Story>
