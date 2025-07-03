<script lang="ts">
	import type { PageProps } from './$types';
	import Logs from './Logs.svelte';

	let { data }: PageProps = $props();
	let { Instances } = $derived(data);
</script>

{#if $Instances.data}
	<Logs team={$Instances.data.team} />
{/if}
