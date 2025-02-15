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
			{ label: 'devteam', href: '#' },
			{ label: 'Applications', href: '#' },
			{ label: 'app-w-all-storage', href: '#' }
		]}
		heading="Manifest"
		subheading="dev"
	/>
</Story>

<Story name="Job">
	<PageHeader
		breadcrumbs={[
			{ label: 'nais', href: '#' },
			{ label: 'jobs', href: '#' }
		]}
		heading="slack-teams-notification"
		subheading="prod-gcp"
	/>
</Story>

<Story name="Jobs">
	<PageHeader breadcrumbs={[{ label: 'nais', href: '#' }]} heading="Jobs" />
</Story>

<Story name="Team">
	<PageHeader breadcrumbs={[]} heading="nais" />
</Story>
