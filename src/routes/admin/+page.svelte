<script lang="ts">
	import Confirm from '$lib/components/Confirm.svelte';
	import {
		Heading
	} from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';
	import Reconciler from './Reconciler.svelte';
	export let data: PageData;
	$: ({ AdminReconcilers } = data);
	$: reconcilers = $AdminReconcilers.data?.reconcilers;
	let confirm = false;
</script>

<Heading size="large">Admin</Heading>
<br />

{#each reconcilers || [] as r}
<Reconciler reconciler={r} />
{/each}
