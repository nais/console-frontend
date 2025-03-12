<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ErrorMessage from './ErrorMessage.svelte';

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
