<script lang="ts">
	import { type NaisJobImage$result } from '$houdini';
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
	import { ExternalLinkIcon } from '@nais/ds-svelte-community/icons';
	import { createEventDispatcher } from 'svelte';
	import type { FindingType } from './SuppressFinding.svelte';
	import { detailsUrl, joinAliases, parseComment } from './imageUtils';

	export let open: boolean;
	export let finding: FindingType;
	export let workloads: NaisJobImage$result['naisjob']['imageDetails']['workloadReferences'];

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
	{#if finding.analysisTrail}
		<div class="info">
			<dl>
				<dt>Package:</dt>
				<dd><code>{finding.packageUrl}</code></dd>

				{#if finding.aliases.length > 0}
					<dt>Alias(es):</dt>
					<dd><code>{joinAliases(finding.aliases, finding.vulnId)}</code></dd>
				{/if}
				{#if finding.description !== ''}
					<dt>Description:</dt>
					<dd>{finding.description}</dd>
				{/if}

				<dt>Details:</dt>
				<dd>
					<a href={detailsUrl(finding.vulnId)} target="_blank"
						>{detailsUrl(finding.vulnId)}<ExternalLinkIcon /></a
					>
				</dd>
			</dl>
		</div>

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
							<Td>{workload.env.name}</Td>
							<Td>{workload.team.slug}</Td>
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
					{#if finding.analysisTrail.comments.nodes}
						{#each finding.analysisTrail.comments.nodes as comment}
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
	<svelte:fragment slot="footer">
		<Button variant="secondary" size="small" on:click={close}>Close</Button>
	</svelte:fragment>
</Modal>

<style>
	.workload {
		margin: 1rem 0;

		overflow: auto;
	}
	.trail {
		display: block;

		overflow: auto;
	}

	code {
		font-size: 0.9rem;
	}
</style>
