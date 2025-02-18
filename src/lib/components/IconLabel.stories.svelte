<script module>
	import {
		GlobeIcon,
		PackageIcon,
		PersonGroupIcon,
		RocketIcon,
		WalletIcon
	} from '@nais/ds-svelte-community/icons';
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import IconLabel from './IconLabel.svelte';
	import TooltipAlignHack from './TooltipAlignHack.svelte';

	const { Story } = defineMeta({
		component: IconLabel,
		tags: ['autodocs']
	});
</script>

<Story name="Menu item">
	<IconLabel label="Cost" icon={WalletIcon} />
</Story>

<Story name="Ingress">
	<IconLabel
		size="medium"
		label="https://storageapp.eksternius.example.com"
		href="https://storageapp.eksternius.example.com"
	>
		{#snippet icon()}
			<TooltipAlignHack content="External ingress">
				<GlobeIcon />
			</TooltipAlignHack>
		{/snippet}
	</IconLabel>
</Story>

<Story name="Team without desc">
	<IconLabel label="nais" href="/team/nais" icon={PersonGroupIcon} size="large" level="3" />
</Story>

<Story name="Team">
	<IconLabel
		label="nais"
		href="/team/nais"
		icon={PersonGroupIcon}
		description="The Nais platform team"
		size="large"
		level="3"
	/>
</Story>

<Story name="Team long desc">
	<IconLabel
		label="nais"
		href="/team/nais"
		icon={PersonGroupIcon}
		description="The Nais platform team lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
		size="large"
		level="3"
	/>
</Story>

<Story name="Workload link">
	<IconLabel
		label="dataprodukt-annulleringer"
		href="/team/tbd/dev-gcp/app/dataprodukt-annulleringer"
		icon={PackageIcon}
		description="tbd / dev-gcp"
	/>
</Story>

<Story name="Last deploy">
	<IconLabel label="22 days ago" icon={RocketIcon} size="small" />
</Story>
