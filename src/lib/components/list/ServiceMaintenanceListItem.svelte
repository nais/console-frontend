<script lang="ts">
	import ListItem from '$lib/components/list/ListItem.svelte';
	import ServiceMaintenanceStatus from '$lib/ServiceMaintenanceStatus.svelte';
	import Time from '$lib/Time.svelte';
	import { Heading } from '@nais/ds-svelte-community';
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
		<Heading level="4" size="small">{title}</Heading>
		<p>{description}</p>
		{#if !!start_at}
			<p>Maintenance is scheduled for: <Time time={start_at} dateFormat="PPPPp" /></p>
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
