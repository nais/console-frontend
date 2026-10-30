<script lang="ts">
	import { Heading } from '#lib/shadcn/ui/index.js';
	import type { PageProps } from './$types';
	import Logs from './Logs.svelte';

	let { data }: PageProps = $props();
	let { Instances } = $derived(data);
</script>

<Heading as="h2" size="medium" spacing>Logs</Heading>

{#if $Instances.data}
	<Logs team={$Instances.data.team} />
{/if}
