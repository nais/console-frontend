<script module>
	import { DatabaseIcon, PackageIcon, PersonGroupIcon } from '@nais/ds-svelte-community/icons';
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Search from './Search.svelte';

	const { Story } = defineMeta({
		component: Search,
		tags: ['autodocs']
	});
</script>

<Story name="Empty">
	<Search query="" close={() => {}} />
</Story>

<Story name="No results">
	<Search query="wat" results={[]} close={() => {}} />
</Story>

<Story name="No results with ':'">
	<Search query="wat:hmmm" results={[]} close={() => {}} />
</Story>

<Story name="Loading">
	<Search query="wat" loading close={() => {}} />
</Story>

<Story name="Results">
	<Search
		query="wat"
		results={[
			{
				icon: PackageIcon,
				title: 'watson',
				description: 'ibm / prod',
				href: '/team/ibm/prod/app/watson'
			},
			{
				icon: PackageIcon,
				title: 'watson',
				description: 'ibm / dev',
				href: '/team/ibm/dev/app/watson'
			},
			{
				icon: DatabaseIcon,
				title: 'watsons-brother',
				description: 'ibm / prod',
				href: '/team/ibm/prod/app/watsons-brother'
			},
			{
				icon: DatabaseIcon,
				title: 'watsons-brother',
				description: 'ibm / dev',
				href: '/team/ibm/dev/app/watsons-brother'
			},
			{
				icon: PersonGroupIcon,
				title: 'ibm',
				href: '/team/ibm'
			}
		]}
		close={() => {}}
	/>
</Story>
