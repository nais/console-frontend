<script module>
	import IconLabel from '$lib/ui/IconLabel.svelte';
	import Time from '$lib/ui/Time.svelte';
	import { Loader } from '@nais/ds-svelte-community';
	import {
		GlobeIcon,
		PackageIcon,
		PersonGroupIcon,
		RocketIcon,
		WalletIcon
	} from '@nais/ds-svelte-community/icons';
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import TooltipAlignHack from './TooltipAlignHack.svelte';

	const { Story } = defineMeta({
		component: IconLabel,
		tags: ['autodocs']
	});
</script>

<Story name="Job run" asChild>
	<IconLabel
		label="dataproduct-apps-topics-28896705"
		href="/team/devteam/dev/job/dataproduct-apps-topics/logs?name=dataproduct-apps-topics-28896705"
		size="large"
		as="h4"
	>
		{#snippet description()}
			Manually triggered <Time time={new Date()} distance={true} /> by Roger Bjørnstad
		{/snippet}
		{#snippet icon()}
			<TooltipAlignHack content="Job is running">
				<Loader size="small" variant="interaction" />
			</TooltipAlignHack>
		{/snippet}
	</IconLabel>
</Story>

<Story name="Menu item" asChild>
	<IconLabel label="Cost" icon={WalletIcon} />
</Story>

<Story name="Ingress" asChild>
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

<Story name="Team without desc" asChild>
	<IconLabel label="nais" href="/team/nais" icon={PersonGroupIcon} size="large" as="h3" />
</Story>

<Story name="Team" asChild>
	<IconLabel
		label="nais"
		href="/team/nais"
		icon={PersonGroupIcon}
		description="The Nais platform team"
		size="large"
		as="h3"
	/>
</Story>

<Story name="Team long desc" asChild>
	<IconLabel
		label="nais"
		href="/team/nais"
		icon={PersonGroupIcon}
		description="The Nais platform team lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
		size="large"
		as="h3"
	/>
</Story>

<Story name="Workload link" asChild>
	<IconLabel
		label="dataprodukt-annulleringer"
		href="/team/tbd/dev-gcp/app/dataprodukt-annulleringer"
		icon={PackageIcon}
		description="tbd / dev-gcp"
	/>
</Story>

<Story name="Last deploy" asChild>
	<IconLabel label="22 days ago" icon={RocketIcon} size="small" />
</Story>
