<script lang="ts">
	import IconLabel from '$lib/ui/IconLabel.svelte';
	import ListItem from '$lib/ui/ListItem.svelte';
	import Time from '$lib/ui/Time.svelte';
	import { Detail, Tooltip } from '@nais/ds-svelte-community';
	import { TokenIcon } from '@nais/ds-svelte-community/icons';
	import { format } from 'date-fns';
	import { enGB } from 'date-fns/locale';

	const {
		serviceAccount,
		teamSlug
	}: {
		serviceAccount: {
			id: string;
			name: string;
			description: string;
			createdAt: Date;
			lastUsedAt: Date | null;
		};
		teamSlug?: string;
	} = $props();
</script>

<ListItem
	href={teamSlug ? `/team/${teamSlug}/settings/service_accounts/${serviceAccount.name}` : undefined}
>
	<IconLabel
		as="h4"
		size="large"
		label={serviceAccount.name}
		icon={TokenIcon}
		description={serviceAccount.description}
	/>

	<div class="right">
		{#if serviceAccount.lastUsedAt}
			<Tooltip
				content="Last used - {format(serviceAccount.lastUsedAt, 'PPPP', {
					locale: enGB
				})}"
			>
				<Detail>
					Last used <Time time={serviceAccount.lastUsedAt} distance={true} />
				</Detail>
			</Tooltip>
		{:else}
			<Detail>Never used</Detail>
		{/if}
		<Tooltip
			content="Created - {format(serviceAccount.createdAt, 'PPPP', {
				locale: enGB
			})}"
		>
			<Detail>
				Created <Time time={serviceAccount.createdAt} distance={true} />
			</Detail>
		</Tooltip>
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
