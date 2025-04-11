<script lang="ts">
	import type { PageProps } from './$houdini';
	import Logs from './Logs.svelte';

	let { data }: PageProps = $props();
	let { NewLogs } = $derived(data);
</script>

{#if $NewLogs.data}
	<Logs team={$NewLogs.data.team} />
{/if}
