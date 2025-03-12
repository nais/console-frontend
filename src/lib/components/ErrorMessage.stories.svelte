<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ErrorMessage from './ErrorMessage.svelte';
	import TeamErrorMessage from './TeamErrorMessage.svelte';

	const { Story } = defineMeta({
		component: ErrorMessage,
		tags: ['autodocs']
	});
</script>

<Story name="Invalid Manifest">
	<ErrorMessage
		docURL={(p) => p}
		error={{
			__typename: 'WorkloadStatusInvalidNaisYaml',
			level: 'ERROR',
			detail:
				'the domain "roger.com" cannot be used in cluster "dev-gcp"; use one of dev.nav.cloud.nais.io, external.dev.nav.cloud.nais.io, authenticated.dev.nav.cloud.nais.io, .intern.dev.nav.no, .dev-gcp.nav.cloud.nais.io, .ekstern.dev.nav.no, .ansatt.dev.nav.no, .very.intern.dev.nav.no',
			workloadType: 'App'
		}}
	/>
</Story>

<Story name="Team - Invalid Manifest">
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

<Story name="Synchronization Error">
	<ErrorMessage
		docURL={(p) => p}
		error={{
			__typename: 'WorkloadStatusSynchronizationFailing',
			level: 'ERROR',
			detail:
				'persisting SQLInstance to Kubernetes: validation error: refusing to overwrite manually edited resource; please add the correct ownerReference in order to continue',
			workloadType: 'Job'
		}}
	/>
</Story>

<Story name="Team - Synchronization Error">
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

<Story name="Deprecated Image Registry">
	<ErrorMessage
		docURL={(p) => p}
		error={{
			__typename: 'WorkloadStatusDeprecatedRegistry',
			level: 'WARNING',
			registry: 'docker.pkg.github.com',
			workloadType: 'App'
		}}
	/>
</Story>

<Story name="Team - Deprecated Image Registry">
	<TeamErrorMessage
		teamSlug="team-service-management"
		error={{
			__typename: 'WorkloadStatusDeprecatedRegistry',
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

<Story name="No Running Instances">
	<ErrorMessage
		docURL={(p) => p}
		error={{
			__typename: 'WorkloadStatusNoRunningInstances',
			level: 'ERROR',
			instances: [
				{
					name: 'bidrag-sak-675cdddb5-vcffp',
					status: { message: 'ImagePullBackOff' }
				},
				{
					name: 'bidrag-sak-675cdddb5-vpc6m',
					status: { message: 'ImagePullBackOff' }
				}
			],
			workloadType: 'App'
		}}
	/>
</Story>

<Story name="Team - No Running Instances">
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

<Story name="Failed Run">
	<ErrorMessage
		docURL={(p) => p}
		error={{
			__typename: 'WorkloadStatusFailedRun',
			level: 'WARNING',
			name: 'aareg-sync-konkurser-q4-29028365',
			detail: 'Run failed after 7 attempts',
			workloadType: 'Job'
		}}
	/>
</Story>

<Story name="Team - Failed Run">
	<TeamErrorMessage
		teamSlug="team-service-management"
		error={{
			__typename: 'WorkloadStatusFailedRun',
			level: 'ERROR'
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
