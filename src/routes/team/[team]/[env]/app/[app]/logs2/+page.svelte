<script lang="ts">
	import { Heading } from '#lib/shadcn/ui/index.js';
	import type { PageProps } from './$types';
	import Logs2 from './Logs2.svelte';

	let { data }: PageProps = $props();
	let { Instances } = $derived(data);
</script>

<Heading as="h2" size="medium" spacing>Logs (Loki test)</Heading>

{#if $Instances.data}
	<Logs2 team={$Instances.data.team} />
{/if}
