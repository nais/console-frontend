<script lang="ts">
	import type { VariableInput } from '$houdini';
	import { Alert, Table, Tbody, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import KeyValue from './KeyValue.svelte';
	import { added, mergeChanges, type operation } from './state-machinery';

	export let changes: operation[];
	export let initial: VariableInput[];

	const isEmpty = (changes: operation[]) => {
		const initialEmpty = initial.length === 0;
		const mutatedEmpty = changes.reduce(mergeChanges, initial).length === 0;
		const addedEmpty = added(initial, changes).length === 0;

		return (initialEmpty || mutatedEmpty) && addedEmpty;
	};

	const calculateChanges = (changes: operation[]) =>
		changes.reduce(mergeChanges, initial).sort((a, b) => a.name.localeCompare(b.name));
</script>

{#if isEmpty(changes)}
	<Alert variant="info" size="small">No data found. Add a new key to get started.</Alert>
{:else}
	<Table size="small" style="margin-top: 2rem" zebraStripes>
		<Thead>
			<Tr>
				<Th>Key</Th>
				<Th align="right">Actions</Th>
				<Th />
			</Tr>
		</Thead>
		<Tbody>
			{#each calculateChanges(changes) as data (data.name)}
				<KeyValue bind:changes {initial} key={data.name} initialValue={data.value} />
			{/each}
		</Tbody>
	</Table>
{/if}
