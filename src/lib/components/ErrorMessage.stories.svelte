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
		error={{
			__typename: 'WorkloadStatusInvalidNaisYaml',
			level: 'ERROR',
			detail:
				'the domain "roger.com" cannot be used in cluster "dev-gcp"; use one of dev.nav.cloud.nais.io, external.dev.nav.cloud.nais.io, authenticated.dev.nav.cloud.nais.io, .intern.dev.nav.no, .dev-gcp.nav.cloud.nais.io, .ekstern.dev.nav.no, .ansatt.dev.nav.no, .very.intern.dev.nav.no'
		}}
	/>
</Story>

<Story name="Synchronization Error">
	<ErrorMessage
		error={{
			__typename: 'WorkloadStatusSynchronizationFailing',
			level: 'ERROR',
			detail:
				'persisting SQLInstance to Kubernetes: validation error: refusing to overwrite manually edited resource; please add the correct ownerReference in order to continue'
		}}
	/>
</Story>

<Story name="Deprecated Image Registru">
	<ErrorMessage
		error={{
			__typename: 'WorkloadStatusDeprecatedRegistry',
			level: 'WARNING',
			registry: 'docker.pkg.github.com'
		}}
	/>
</Story>

<Story name="No Running Instances">
	<ErrorMessage
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
			]
		}}
	/>
</Story>
