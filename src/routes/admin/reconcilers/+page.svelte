<script lang="ts">
	import { Heading } from '@nais/ds-svelte-community';
	import type { PageProps } from './$houdini';
	import Reconciler from './Reconciler.svelte';

	let { data }: PageProps = $props();

	let { AdminReconcilers } = $derived(data);
	let reconcilers = $derived($AdminReconcilers.data?.reconcilers.nodes);
</script>

<Heading level="2" size="medium" spacing>Reconcilers</Heading>
{#each reconcilers || [] as r (r.id)}
	<Reconciler reconciler={r} />
{:else}
	<p>No reconcilers registered</p>
{/each}
