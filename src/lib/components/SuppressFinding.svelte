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
		TextField
	} from '@nais/ds-svelte-community';
	import { createEventDispatcher } from 'svelte';

	export let open: boolean;
	export let finding: FindingType;
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

	function joinAliases(aliases: { name: string; source: string }[], vulnId: string) {
		return aliases
			.filter((a) => a.name !== vulnId)
			.map((a) => a.name)
			.join(', ');
	}

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
	inputText =
		finding.analysisTrail?.comments?.[finding.analysisTrail?.comments?.length - 1]?.comment ?? '';
	selectedReason = finding.analysisTrail?.state ?? '';
	suppressed = finding.analysisTrail?.isSuppressed ?? false;

	// on click should send a request to analysis endpoint for dependency track
</script>

<Modal bind:open width="medium" on:close={close}>
	<svelte:fragment slot="header">
		<Heading>Suppress finding for {finding.vulnId}</Heading>
	</svelte:fragment>
	<div class="wrapper">
		<p>Package: {finding.packageUrl}</p>
		<p>Alias(es): {joinAliases(finding.aliases, finding.vulnId)}</p>
		<p>Description: {finding.description}</p>

		<Select size="small" label="Analysis" bind:value={selectedReason}>
			{#each SUPPRESS_OPTIONS as option}
				{#if option.value === finding.state}
					<option value={option.value} selected={true}>{option.text} </option>
				{:else}
					<option value={option.value}>{option.text}</option>
				{/if}
			{/each}
		</Select>
		<TextField type="text" bind:value={inputText} />
		<Checkbox bind:checked={suppressed}>Suppress</Checkbox>
		<p>Updated by: {user}</p>
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
