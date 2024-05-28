<script lang="ts">
	import Time from '$lib/Time.svelte';
	import { Button, Heading, Modal } from '@nais/ds-svelte-community';
	import { createEventDispatcher } from 'svelte';
	import type { FindingType } from './SuppressFinding.svelte';

	export let open: boolean;
	export let finding: FindingType;

	function joinAliases(aliases: { name: string; source: string }[], vulnId: string) {
		return aliases
			.filter((a) => a.name !== vulnId)
			.map((a) => a.name)
			.join(', ');
	}

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
		{#if finding.analysisTrail}
			<p>Package: {finding.packageUrl}</p>
			<p>Aliases: {joinAliases(finding.aliases, finding.vulnId)}</p>
			<p>State: {finding.analysisTrail?.state}</p>
			<div>
				{#each finding.analysisTrail?.comments as comment}
					{#if comment}
						<p>
							Suppressed by: {comment.onBehalfOf}@<Time time={comment.timestamp} /> - {comment.comment}
							<br />
						</p>
					{/if}
				{/each}
			</div>
		{/if}
	</div>
	<svelte:fragment slot="footer">
		<Button variant="secondary" size="small" on:click={close}>Close</Button>
	</svelte:fragment>
</Modal>
