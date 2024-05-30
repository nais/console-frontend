<script lang="ts">
	import Time from '$lib/Time.svelte';
	import {
		Button,
		Heading,
		Modal,
		Table,
		Tbody,
		Td,
		Th,
		Thead,
		Tr
	} from '@nais/ds-svelte-community';
	import { createEventDispatcher } from 'svelte';
	import type { FindingType, WorkloadReferencesType } from './SuppressFinding.svelte';
	import { joinAliases, parseComment } from './imageUtils';

	export let open: boolean;
	export let finding: FindingType;
	export let workloads: WorkloadReferencesType;

	let sortedComments = finding.analysisTrail?.comments.sort((a, b) => {
		if (a && b) {
			return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
		}
		return 0;
	});

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
			<div class="workload">
				<h5>Affected workloads</h5>
				<Table size="small" zebraStripes>
					<Thead>
						<Th>Environment</Th>
						<Th>Team</Th>
						<Th>Workload</Th>
					</Thead>
					<Tbody>
						{#each workloads as workload}
							<Tr>
								<Td>{workload.environment}</Td>
								<Td>{workload.team}</Td>
								<Td>{workload.name}</Td>
							</Tr>
						{/each}
					</Tbody>
				</Table>
			</div>
			<h5>Audit log</h5>
			<div class="trail">
				<Table size="small" zebraStripes>
					<Thead>
						<Th>Actor</Th>
						<Th>State</Th>
						<Th>Suppressed</Th>
						<Th>Comment</Th>
						<Th>Timestamp</Th>
					</Thead>
					<Tbody>
						{#if sortedComments}
							{#each sortedComments as comment}
								{#if comment}
									<Tr>
										<Td>{comment.onBehalfOf}</Td>
										<Td>{parseComment(comment.comment).state}</Td>
										<Td>{parseComment(comment.comment).suppressed}</Td>
										<Td>{parseComment(comment.comment).comment}</Td>
										<Td><Time time={comment.timestamp} /></Td>
									</Tr>
								{/if}
							{/each}
						{/if}
					</Tbody>
				</Table>
			</div>
		{/if}
	</div>
	<svelte:fragment slot="footer">
		<Button variant="secondary" size="small" on:click={close}>Close</Button>
	</svelte:fragment>
</Modal>

<style>
	.wrapper {
		padding: 1rem;
	}
	.workload {
		margin: 1rem 0;
	}
	.trail {
		display: block;

		overflow: auto;
		height: 15vw;
	}
</style>
