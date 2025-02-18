<script module>
	import { urlToBreadcrumbs } from '$lib/urlToBreadcrumbs';
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import PageHeader from './PageHeader.svelte';

	const { Story } = defineMeta({
		component: PageHeader,
		tags: ['autodocs']
	});
</script>

<Story name="Manifest">
	<PageHeader
		breadcrumbs={urlToBreadcrumbs(
			new URL('http://localhost/team/nais/dev/app/app-w-all-storage/manifest')
		)}
		heading="Manifest"
	/>
</Story>

<Story name="Job">
	<PageHeader
		breadcrumbs={urlToBreadcrumbs(
			new URL('http://localhost/team/nais/dev/job/slack-teams-notification')
		)}
		heading="slack-teams-notification"
	/>
</Story>

<Story name="Jobs">
	<PageHeader
		breadcrumbs={urlToBreadcrumbs(new URL('http://localhost/team/nais/jobs'))}
		heading="Jobs"
	/>
</Story>

<Story name="Team">
	<PageHeader
		breadcrumbs={urlToBreadcrumbs(new URL('http://localhost/team/nais'))}
		heading="nais"
	/>
</Story>
