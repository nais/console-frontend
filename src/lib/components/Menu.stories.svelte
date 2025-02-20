<script module>
	import {
		BriefcaseClockIcon,
		HouseIcon,
		PackageFillIcon,
		PadlockLockedIcon,
		WalletIcon
	} from '@nais/ds-svelte-community/icons';
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Menu from './Menu.svelte';

	const { Story } = defineMeta({
		component: Menu,
		tags: ['autodocs']
	});
</script>

<script lang="ts">
</script>

<Story name="Team menu">
	<Menu
		items={[
			[{ label: 'Overview', href: '/team/nais', icon: HouseIcon }],
			[
				{
					label: 'Applications',
					href: '/team/nais/applications',
					icon: PackageFillIcon,
					count: 24,
					badge: true,
					active: true
				},
				{ label: 'Jobs', href: '/team/nais/jobs', icon: BriefcaseClockIcon, count: 8 },
				{ label: 'Secrets', href: '/team/nais/secrets', icon: PadlockLockedIcon }
			],
			[{ label: 'Cost', href: '/team/nais/cost', icon: WalletIcon }]
		]}
	/>
</Story>
