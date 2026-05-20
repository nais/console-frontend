<script lang="ts">
	import { Heading } from '@nais/ds-svelte-community';
	import type { PageProps } from './$types';
	import Logs from './Logs.svelte';

	let { data }: PageProps = $props();
	let { Instances } = $derived(data);
</script>

<Heading as="h2" size="medium" spacing>Logs</Heading>

{#if $Instances.data}
	<Logs team={$Instances.data.team} />
{/if}
