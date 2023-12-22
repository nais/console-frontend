<script lang="ts">
	import { Heading } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';
	import Reconciler from './Reconciler.svelte';
	export let data: PageData;
	$: ({ AdminReconcilers } = data);
	$: reconcilers = $AdminReconcilers.data?.reconcilers;
</script>

<Heading size="large">Admin</Heading>
<br />

{#each reconcilers || [] as r}
	<Reconciler reconciler={r} />
{/each}
