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

<Story name="Results with link">
	<Search
		query="wat"
		results={[
			{
				icon: PackageIcon,
				title: 'watson',
				description: 'ibm / prod',
				type: 'link',
				href: '/team/ibm/prod/app/watson'
			},
			{
				icon: PackageIcon,
				title: 'watson',
				description: 'ibm / dev',
				type: 'link',
				href: '/team/ibm/dev/app/watson'
			},
			{
				icon: PersonGroupIcon,
				title: 'ibm',
				description:
					'Builds watson. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.',
				type: 'link',
				href: '/team/ibm'
			},
			{
				icon: DatabaseIcon,
				title: 'watsons-brother',
				description: 'ibm / prod',
				type: 'link',
				href: '/team/ibm/prod/app/watsons-brother'
			},
			{
				icon: DatabaseIcon,
				title: 'watsons-brother',
				description: 'ibm / dev',
				type: 'link',
				href: '/team/ibm/dev/app/watsons-brother'
			}
		]}
		close={() => {}}
	/>
</Story>

<Story name="Results with action">
	<Search
		query="wat"
		results={[
			{
				icon: PersonGroupIcon,
				title: 'aura',
				description: 'Not the Nais platform team any more, check out Nais instead.',
				type: 'button',
				button: {
					onclick: () => console.log('aura'),
					label: 'Add',
					variant: 'primary'
				}
			},
			{
				icon: PersonGroupIcon,
				title: 'detsombetyrnoe',
				description:
					'Rekruttering og profileringssiden for NAV IT - blir liggende på detsombetyrnoe.no. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.',
				type: 'button',
				button: {
					onclick: () => console.log('detsombetyrnoe'),
					label: 'Add',
					variant: 'primary',
					loading: true
				}
			},
			{
				icon: PersonGroupIcon,
				title: 'frontend-golden-path',
				description: 'Teste greier for den gyldne sti',
				type: 'button',
				button: {
					onclick: () => console.log('frontend-golden-path'),
					label: 'Remove',
					variant: 'danger'
				}
			},
			{
				icon: PersonGroupIcon,
				title: 'frontendplattform',
				description: 'Frontendplattform',
				type: 'button',
				button: {
					onclick: () => console.log('frontendplattform'),
					label: 'Add',
					variant: 'primary'
				}
			},
			{
				icon: PersonGroupIcon,
				title: 'nais',
				description: 'The Nais platform team',
				type: 'button',
				button: {
					onclick: () => console.log('nais'),
					label: 'Add',
					variant: 'primary'
				}
			}
		]}
		close={() => {}}
	/>
</Story>
