<script module>
	import { envTagVariant } from '$lib/envTagVariant';
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
				label: 'watson',
				tag: {
					label: 'prod',
					variant: envTagVariant('prod')
				},
				description: 'ibm',
				type: 'link',
				href: '/team/ibm/prod/app/watson'
			},
			{
				icon: PackageIcon,
				label: 'watson',
				tag: {
					label: 'dev',
					variant: envTagVariant('dev')
				},
				description: 'ibm',
				type: 'link',
				href: '/team/ibm/dev/app/watson'
			},
			{
				icon: DatabaseIcon,
				label: 'watsons-brother',
				tag: {
					label: 'prod',
					variant: envTagVariant('prod')
				},
				description: 'ibm',
				type: 'link',
				href: '/team/ibm/prod/app/watsons-brother'
			},
			{
				icon: DatabaseIcon,
				label: 'watsons-brother',
				tag: {
					label: 'dev',
					variant: envTagVariant('dev')
				},
				description: 'ibm',
				type: 'link',
				href: '/team/ibm/dev/app/watsons-brother'
			},
			{
				icon: PersonGroupIcon,
				label: 'ibm',
				description:
					'Builds watson. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.',
				type: 'link',
				href: '/team/ibm'
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
				label: 'aura',
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
				label: 'detsombetyrnoe',
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
				label: 'frontend-golden-path',
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
				label: 'frontendplattform',
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
				label: 'nais',
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
