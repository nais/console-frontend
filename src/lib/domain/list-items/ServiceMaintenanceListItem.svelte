<script lang="ts">
	import ListItem from '$lib/ui/ListItem.svelte';
	import ServiceMaintenanceStatus from '$lib/ui/ServiceMaintenanceStatus.svelte';
	import Time from '$lib/ui/Time.svelte';
	import { BodyShort, Heading } from '@nais/ds-svelte-community';
	interface Props {
		title: string;
		description: string;
		start_at: Date | null | undefined;
		deadline: boolean;
	}

	let { title, description, start_at, deadline }: Props = $props();
</script>

<ListItem>
	<div>
		<Heading level="4" size="xsmall">{title}</Heading>
		<BodyShort>{description}</BodyShort>
		{#if !!start_at}
			<BodyShort
				>Maintenance is scheduled for: <Time time={start_at} dateFormat="PPPPp" /></BodyShort
			>
		{/if}
	</div>
	<div class="status">
		<ServiceMaintenanceStatus status={deadline} />
	</div>
</ListItem>

<style>
	.status {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--ax-space-4);
		font-size: 16px;
	}
</style>
