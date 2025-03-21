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
	import { ExternalLinkIcon } from '@nais/ds-svelte-community/icons';
	import { createEventDispatcher } from 'svelte';
	import type { FindingType } from './SuppressFinding.svelte';
	import { detailsUrl } from './imageUtils';

	interface Props {
		open: boolean;
		finding: FindingType;
		workloads: {
			readonly id: string;
			readonly __typename: string | null;
			readonly team: {
				readonly slug: string;
			};
			readonly teamEnvironment: {
				readonly environment: {
					readonly name: string;
				};
			};
			readonly name: string;
		}[];
	}

	let { open = $bindable(), finding, workloads }: Props = $props();

	const dispatcher = createEventDispatcher<{ close: void }>();

	const close = () => {
		open = false;
		dispatcher('close');
	};
</script>

<Modal bind:open width="medium" onclose={close}>
	{#snippet header()}
		<Heading>Analysis trail for {finding.identifier}</Heading>
	{/snippet}
	{#if finding.analysisTrail}
		<div class="info">
			<dl>
				<dt>Package:</dt>
				<dd><code>{finding.package}</code></dd>
				{#if finding.description !== ''}
					<dt>Description:</dt>
					<dd>{finding.description}</dd>
				{/if}
				<dt>Details:</dt>
				<dd>
					<a href={detailsUrl(finding.identifier)} target="_blank"
						>{detailsUrl(finding.identifier)}<ExternalLinkIcon /></a
					>
				</dd>
			</dl>
		</div>

		<div class="workload">
			<h5>Affected workloads</h5>
			<Table size="small">
				<Thead>
					<Tr>
						<Th>Environment</Th>
						<Th>Team</Th>
						<Th>Workload</Th>
					</Tr>
				</Thead>
				<Tbody>
					{#each workloads as workload (workload.id)}
						<Tr>
							<Td>{workload.teamEnvironment.environment.name}</Td>
							<Td>{workload.team.slug}</Td>
							<Td>{workload.name}</Td>
						</Tr>
					{/each}
				</Tbody>
			</Table>
		</div>
		<h5>Audit log</h5>
		<div class="trail">
			<Table size="small">
				<Thead>
					<Tr>
						<Th>Actor</Th>
						<Th>State</Th>
						<Th>Suppressed</Th>
						<Th>Comment</Th>
						<Th>Timestamp</Th>
					</Tr>
				</Thead>
				<Tbody>
					{#if finding.analysisTrail.comments.nodes}
						{#each finding.analysisTrail.comments.nodes as node (node)}
							{#if node}
								<Tr>
									<Td>{node.onBehalfOf}</Td>
									<Td>{node.state}</Td>
									<Td>{node.suppressed}</Td>
									<Td>{node.comment}</Td>
									<Td><Time time={node.timestamp} distance={true} /></Td>
								</Tr>
							{/if}
						{/each}
					{/if}
				</Tbody>
			</Table>
		</div>
	{/if}
	{#snippet footer()}
		<Button variant="secondary" size="small" onclick={close}>Close</Button>
	{/snippet}
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
