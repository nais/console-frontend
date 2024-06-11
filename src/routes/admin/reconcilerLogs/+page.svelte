<script lang="ts">
	import { type ReconcilerLogs$result } from '$houdini';
	import Time from '$lib/Time.svelte';
	import { Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';

	export let data: PageData;

	$: ({ ReconcilerLogs } = data);
	$: reconcilers = $ReconcilerLogs.data?.reconcilers.nodes;

	type Error = {
		reconcilerName: string;
		errorMessage: string;
		createdAt: Date;
		teamSlug: string;
	};

	const transformErrors = (reconcilers: ReconcilerLogs$result['reconcilers']['nodes']): Error[] =>
		reconcilers.flatMap((reconciler) =>
			reconciler.errors.nodes.map((error) => ({
				reconcilerName: reconciler.displayName,
				errorMessage: error.message,
				createdAt: error.createdAt,
				teamSlug: error.team.slug
			}))
		);
</script>

<Table>
	<Thead>
		<Tr>
			<Th>Message</Th>
			<Th>Team</Th>
			<Th>Reconciler</Th>
			<Th>Timestamp</Th>
		</Tr>
	</Thead>
	<Tbody>
		{#each transformErrors(reconcilers || []) as error}
			<Tr>
				<Td><span class="message">{error.errorMessage}</span></Td>
				<Td>{error.teamSlug}</Td>
				<Td>{error.reconcilerName}</Td>
				<Td><Time time={error.createdAt} distance={true} /></Td>
			</Tr>
		{:else}
			<Tr><Td colspan={999}><em>No reconciler errors at the moment.</em></Td></Tr>
		{/each}
	</Tbody>
</Table>

<style>
	.message {
		word-break: break-word;
		white-space: pre-line;
	}
</style>
