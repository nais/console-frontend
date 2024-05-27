<script lang="ts">
	import { Button, Heading, Modal } from '@nais/ds-svelte-community';
	import { createEventDispatcher } from 'svelte';
	import type { FindingType } from './SuppressFinding.svelte';

	export let open: boolean;
	export let finding: FindingType;

	const dispatcher = createEventDispatcher<{ close: void }>();

	const close = () => {
		open = false;
		dispatcher('close');
	};
</script>

<Modal bind:open width="medium" on:close={close}>
	<svelte:fragment slot="header">
		<Heading>Analysis trail for {finding.vulnId}</Heading>
	</svelte:fragment>
	<div class="wrapper">
		<p>Package: {finding.packageUrl}</p>
		<p>State: {finding.analysisTrail?.state}</p>
	</div>
	<svelte:fragment slot="footer">
		<Button variant="primary" size="small" on:click={undefined}>Suppress</Button>
		<Button variant="secondary" size="small" on:click={close}>Cancel</Button>
	</svelte:fragment>
</Modal>
