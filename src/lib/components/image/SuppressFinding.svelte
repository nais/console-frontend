<script lang="ts" context="module">
	export type FindingType = {
		readonly id: string;
		readonly componentId: string;
		readonly description: string;
		readonly packageUrl: string;
		readonly severity: string;
		readonly vulnerabilityId: string;
		readonly vulnId: string;
		readonly aliases: {
			readonly name: string;
			readonly source: string;
		}[];
		readonly isSuppressed: boolean;
		readonly state: string;
		readonly analysisTrail: {
			readonly id: string;
			readonly comments: {
				readonly pageInfo: {
					readonly totalCount: number;
					readonly hasNextPage: boolean;
					readonly hasPreviousPage: boolean;
				};
				readonly nodes: ({
					readonly comment: string;
					readonly onBehalfOf: string;
					readonly timestamp: Date;
				} | null)[];
			};
			readonly isSuppressed: boolean;
			readonly state: string;
		};
	};
</script>

<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { graphql, type NaisJobImage$result } from '$houdini';
	import { logEvent } from '$lib/amplitude';
	import {
		Alert,
		Button,
		Checkbox,
		Heading,
		Modal,
		Select,
		Table,
		Tbody,
		Td,
		TextField,
		Th,
		Thead,
		Tr
	} from '@nais/ds-svelte-community';
	import { ExternalLinkIcon } from '@nais/ds-svelte-community/icons';
	import { createEventDispatcher } from 'svelte';
	import { detailsUrl, joinAliases, parseComment } from './imageUtils';

	export let open: boolean;
	export let finding: FindingType;
	export let workloads: NaisJobImage$result['naisjob']['imageDetails']['workloadReferences'];

	export let user: string;
	export let auth: boolean;

	export let projectId: string;

	let errormessage = '';

	let selectedReason = '';
	let inputText = '';
	let suppressed: boolean = false;

	let team = $page.params.team;
	let env = $page.params.env;
	let workload = $page.params.app;

	// check if route contains app or job
	if ($page.route.id && $page.route.id.includes('app')) {
		workload = 'app/' + $page.params.app;
	} else {
		workload = 'job/' + $page.params.job;
	}

	const dispatcher = createEventDispatcher<{ close: void }>();

	const close = () => {
		open = false;
		errormessage = '';
		dispatcher('close');
	};

	const triggerSuppress = async () => {
		errormessage = '';

		if (selectedReason === 'Suppress reason' || selectedReason === '') {
			errormessage += 'Please select a suppress reason from the Analysis dropdown.';
			return;
		}

		if (inputText === '') {
			errormessage += 'Please provide a comment before suppressing the finding. ';
			return;
		}

		await suppress.mutate({
			analysisState: selectedReason.toUpperCase(),
			comment: inputText,
			componentId: finding.componentId,
			projectId: projectId,
			vulnerabilityId: finding.vulnerabilityId,
			suppressedBy: user,
			suppress: suppressed,
			team: team
		});

		if ($suppress.errors) {
			if (errormessage === '') {
				errormessage = $suppress.errors[0].message;
			}
			open = true;
			return;
		}

		logEvent('suppressFinding')
		errormessage = '';
		const imagePage = '/team/' + team + '/' + env + '/' + workload + '/image';
		close();
		await goto(imagePage, { replaceState: true });
	};

	const suppress = graphql(`
		mutation SuppressFinding(
			$analysisState: String!
			$comment: String!
			$componentId: String!
			$projectId: String!
			$vulnerabilityId: String!
			$suppressedBy: String!
			$suppress: Boolean!
			$team: Slug!
		) {
			suppressFinding(
				analysisState: $analysisState
				comment: $comment
				componentId: $componentId
				projectId: $projectId
				vulnerabilityId: $vulnerabilityId
				suppressedBy: $suppressedBy
				suppress: $suppress
				team: $team
			) {
				id
				isSuppressed
				state
				comments(limit: 20, offset: 0) {
					pageInfo {
						hasNextPage
						hasPreviousPage
						totalCount
					}
					nodes {
						comment
						timestamp
						onBehalfOf
					}
				}
			}
		}
	`);

	const SUPPRESS_OPTIONS = [
		{ value: '', text: 'Suppress reason' },
		{ value: 'IN_TRIAGE', text: 'In triage' },
		{ value: 'RESOLVED', text: 'Resolved' },
		{ value: 'FALSE_POSITIVE', text: 'False positive' },
		{ value: 'NOT_AFFECTED', text: 'Not affected' }
	];

	const init = (finding: FindingType) => {
		inputText = parseComment(finding.analysisTrail?.comments?.nodes[0]?.comment ?? '').comment;
		selectedReason = finding.analysisTrail?.state ?? '';
		suppressed = finding.analysisTrail?.isSuppressed ?? false;
	};
	$: init(finding);
</script>

<Modal bind:open width="medium" on:close={close}>
	<svelte:fragment slot="header">
		<Heading>Suppress finding for {finding.vulnId}</Heading>
	</svelte:fragment>

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

	<div class="wrapper">
		{#if errormessage !== ''}
			<Alert variant="error">
				{errormessage}
			</Alert>
		{/if}
		<p>
			Please provide a reason for suppressing this finding. This will be recorded in the analysis
			audit log. Suppression will be in effect for all workloads using this image.
		</p>
		<Select size="small" label="Analysis" bind:value={selectedReason}>
			{#each SUPPRESS_OPTIONS as option}
				{#if option.value === finding.state}
					<option value={option.value}>{option.text} </option>
				{:else}
					<option value={option.value}>{option.text}</option>
				{/if}
			{/each}
		</Select>

		<TextField type="text" bind:value={inputText}>
			<svelte:fragment slot="label">Comment</svelte:fragment>
		</TextField>
		<Checkbox bind:checked={suppressed}>Suppress</Checkbox>
		Updated by: {user}<br />
	</div>
	<svelte:fragment slot="footer">
		<Button variant="primary" size="small" on:click={triggerSuppress} disabled={!auth}
			>Update</Button
		>
		<Button variant="secondary" size="small" on:click={close}>Cancel</Button>
	</svelte:fragment>
</Modal>

<style>
	.wrapper {
		border: 1px solid #d6d8db;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		gap: 1rem;
	}
	code {
		font-size: 0.9rem;
	}

	.workload {
		margin: 1rem 0;
	}
	.info {
		margin: 1rem 0;
	}
	dt {
		font-weight: bold;
	}
</style>
