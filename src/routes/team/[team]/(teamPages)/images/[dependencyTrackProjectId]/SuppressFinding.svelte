<script lang="ts" context="module">
	export type FindingType = {
		readonly id: string;
		readonly componentId: string;
		readonly description: string;
		readonly packageUrl: string;
		readonly severity: string;
		readonly vulnerabilityId: string;
		readonly aliases: {
			readonly name: string;
			readonly source: string;
		}[];
	};
</script>

<script lang="ts">
	import { Button, Heading, Modal, Select, TextField } from '@nais/ds-svelte-community';
	import { createEventDispatcher } from 'svelte';

	export let open: boolean;
	export let finding: FindingType;

	export let user: string;

	const dispatcher = createEventDispatcher<{ close: void }>();

	const close = () => {
		open = false;
		dispatcher('close');
	};

	function joinAliases(aliases: { name: string; source: string }[], vulnId: string) {
		return aliases
			.filter((a) => a.name !== vulnId)
			.map((a) => a.name)
			.join(', ');
	}
</script>

<Modal bind:open width="medium" on:close={close}>
	<svelte:fragment slot="header">
		<Heading>Supress finding for {finding.vulnerabilityId}</Heading>
	</svelte:fragment>
	<div class="wrapper">
		<p>Package: {finding.packageUrl}</p>
		<p>Alias(es): {joinAliases(finding.aliases, finding.vulnerabilityId)}</p>
		<p>Description: {finding.description}</p>

		<Select size="small" label="Analysis">
			<option value="">Suppress reason</option>
			<option value={'in_triage'}>In triage</option>
			<option value={'resolved'}>Resolved</option>
			<option value={'false_positive'}>False posistive</option>
			<option value={'not_affected'}>Not affected</option>
		</Select>
		<TextField type="text" />
		<p>Suppressed by: {user}</p>
	</div>
	<svelte:fragment slot="footer">
		<Button variant="primary" size="small" on:click={undefined}>Suppress</Button>
		<Button variant="secondary" size="small" on:click={close}>Cancel</Button>
	</svelte:fragment>
</Modal>
