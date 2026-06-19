<script lang="ts">
	import IconLabel from '$lib/ui/IconLabel.svelte';
	import ListItem from '$lib/ui/ListItem.svelte';
	import Time from '$lib/ui/Time.svelte';
	import { Detail } from '@nais/ds-svelte-community';
	import { RobotIcon } from '@nais/ds-svelte-community/icons';

	const {
		serviceAccount,
		href
	}: {
		serviceAccount: {
			id: string;
			name: string;
			description: string;
			createdAt: Date;
			lastUsedAt: Date | null;
		};
		href?: string;
	} = $props();
</script>

<ListItem {href}>
	<IconLabel
		as="h4"
		size="large"
		label={serviceAccount.name}
		icon={RobotIcon}
		description={serviceAccount.description}
	/>

	<div class="right">
		{#if serviceAccount.lastUsedAt}
			<Detail>
				Last used <Time time={serviceAccount.lastUsedAt} distance={true} />
			</Detail>
		{:else}
			<Detail>Never used</Detail>
		{/if}
		<Detail>
			Created <Time time={serviceAccount.createdAt} distance={true} />
		</Detail>
	</div>
</ListItem>

<style>
	.right {
		display: flex;
		flex-direction: column;
		align-items: end;
		gap: var(--ax-space-2);
	}

	@media (max-width: 767px) {
		.right {
			align-items: flex-end;
		}
	}
</style>
