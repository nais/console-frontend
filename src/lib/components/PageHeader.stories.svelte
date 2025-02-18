<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import PageHeader from './PageHeader.svelte';

	const { Story } = defineMeta({
		component: PageHeader,
		tags: ['autodocs']
	});
</script>

<Story name="Manifest">
	<PageHeader
		breadcrumbs={[
			{ label: 'nais', href: '/team/nais' },
			{ label: 'dev' },
			{ label: 'Jobs', href: '/team/nais/jobs' },
			{ label: 'slack-teams-notification', href: '/team/nais/dev/job/slack-teams-notification' }
		]}
		heading="Manifest"
	/>
</Story>

<Story name="Job">
	<PageHeader
		breadcrumbs={[
			{ label: 'nais', href: '/team/nais' },
			{ label: 'dev' },
			{ label: 'Jobs', href: '/team/nais/jobs' }
		]}
		heading="slack-teams-notification"
	/>
</Story>

<Story name="Jobs">
	<PageHeader breadcrumbs={[{ label: 'nais', href: '/team/nais' }]} heading="Jobs" />
</Story>

<Story name="Team">
	<PageHeader heading="nais" />
</Story>
