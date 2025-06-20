<script module>
	import { envTagVariant } from '$lib/envTagVariant';
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import PageHeader from './PageHeader.svelte';

	const { Story } = defineMeta({
		component: PageHeader,
		tags: ['autodocs']
	});
</script>

<Story name="Manifest" asChild>
	<PageHeader
		breadcrumbs={[
			{ label: 'nais', href: '/team/nais' },
			{ label: 'Jobs', href: '/team/nais/jobs' },
			{ label: 'slack-teams-notification', href: '/team/nais/dev/job/slack-teams-notification' }
		]}
		heading="Manifest"
		tag={{ label: 'dev-gcp', variant: envTagVariant('dev-gcp') }}
	/>
</Story>

<Story name="Job" asChild>
	<PageHeader
		breadcrumbs={[
			{ label: 'nais', href: '/team/nais' },
			{ label: 'Jobs', href: '/team/nais/jobs' }
		]}
		heading="slack-teams-notification"
		tag={{ label: 'prod-gcp', variant: envTagVariant('prod-gcp') }}
	/>
</Story>

<Story name="Jobs" asChild>
	<PageHeader breadcrumbs={[{ label: 'nais', href: '/team/nais' }]} heading="Jobs" />
</Story>

<Story name="Team" asChild>
	<PageHeader heading="nais" />
</Story>
