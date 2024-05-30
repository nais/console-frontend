<script lang="ts" context="module">
	export type FindingType = {
		readonly id: string;
		readonly componentId: string;
		readonly description: string;
		readonly packageUrl: string;
		readonly severity: string;
		readonly vulnerabilityId: string;
		readonly isSuppressed: boolean;
		readonly vulnId: string;
		readonly state: string;
		readonly aliases: {
			readonly name: string;
			readonly source: string;
		}[];
		readonly analysisTrail: {
			readonly comments: ({
				readonly comment: string;
				readonly onBehalfOf: string | null;
				readonly timestamp: Date;
			} | null)[];
			readonly isSuppressed: boolean;
			readonly state: string;
		} | null;
	};

	export type WorkloadReferencesType = {
		readonly id: string;
		readonly name: string;
		readonly team: string;
		readonly workloadType: string;
		readonly environment: string;
		readonly deployInfo: {
			readonly deployer: string;
			readonly timestamp: Date | null;
			readonly commitSha: string;
			readonly url: string;
		};
	}[];
</script>

<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { graphql } from '$houdini';
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
	import { createEventDispatcher } from 'svelte';
	import { joinAliases } from './imageUtils';

	export let open: boolean;
	export let finding: FindingType;
	export let workloads: WorkloadReferencesType;

	export let user: string;

	export let projectId: string;

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
		dispatcher('close');
	};

	const triggerSuppress = async () => {
		if (hasSelectedReason().length > 0 && selectedReason.length > 0) {
			console.log('no reason');
			return;
		}

		await suppress.mutate({
			analysisState: selectedReason.toUpperCase(),
			comment: inputText,
			componentId: finding.componentId,
			projectId: projectId,
			vulnerabilityId: finding.vulnerabilityId,
			suppressedBy: user,
			suppress: suppressed
		});

		if ($suppress.errors) {
			console.log($suppress.errors);
			open = true;
			return;
		}

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
		) {
			suppressFinding(
				analysisState: $analysisState
				comment: $comment
				componentId: $componentId
				projectId: $projectId
				vulnerabilityId: $vulnerabilityId
				suppressedBy: $suppressedBy
				suppress: $suppress
			) {
				id
				isSuppressed
				state
				comments {
					comment
					timestamp
					onBehalfOf
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

	const hasSelectedReason = () => {
		const reasons = SUPPRESS_OPTIONS.map((option) => option.value).includes(selectedReason);
		if (!reasons) {
			return 'Please select a suppress reason';
		}
		return '';
	};

	// TODO: Trenger hjelp av Thomas...
	/*inputText = parseComment(
			finding.analysisTrail?.comments?.[finding.analysisTrail?.comments?.length - 1]?.comment ?? ''
		).comment;*/
	if (finding.analysisTrail) {
		console.log('hei hei');
		selectedReason = finding.analysisTrail.state;
		suppressed = finding.analysisTrail.isSuppressed;
	}
	// on click should send a request to analysis endpoint for dependency track
</script>

<Modal bind:open width="medium" on:close={close}>
	<svelte:fragment slot="header">
		<Heading>Suppress finding for {finding.vulnId}</Heading>
	</svelte:fragment>
	<Alert variant="info">
		Please provide a reason for suppressing this finding. This will be recorded in the analysis
		trail. Suppression will be effective for all workloads using this image.
	</Alert>
	<div class="info">
		Package: <code>{finding.packageUrl}</code><br />
		{#if finding.aliases.length > 0}
			Alias(es): <code>{joinAliases(finding.aliases, finding.vulnId)}</code><br />
		{/if}
		Description: {finding.description !== '' ? finding.description : 'No description'}
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
						<Td>{workload.environment}</Td>
						<Td>{workload.team}</Td>
						<Td>{workload.name}</Td>
					</Tr>
				{/each}
			</Tbody>
		</Table>
	</div>

	<div class="wrapper">
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
		{#if $suppress.errors}
			<Alert variant="error">
				{#each $suppress.errors as error}
					{error.message}
				{/each}
			</Alert>
		{/if}
	</div>
	<svelte:fragment slot="footer">
		<Button variant="primary" size="small" on:click={triggerSuppress}>Update</Button>
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
</style>
