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
	import { Alert, Button, Heading, Modal, Select, TextField } from '@nais/ds-svelte-community';
	import { createEventDispatcher } from 'svelte';

	export let open: boolean;
	export let finding: FindingType;
	export let user: string;

	let selectedReason = '';
	let inputText = '';

	$: projectId = $page.params.dependencyTrackProjectId;
	$: team = $page.params.team;

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
			suppress: true
		});

		if ($suppress.errors) {
			console.log($suppress.errors);
			open = true;
			return;
		}

		const imagePage = '/team/' + team + '/images/' + projectId;
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
		{ value: 'in_triage', text: 'In triage' },
		{ value: 'resolved', text: 'Resolved' },
		{ value: 'false_positive', text: 'False positive' },
		{ value: 'not_affected', text: 'Not affected' }
	];

	const hasSelectedReason = () => {
		const reasons = SUPPRESS_OPTIONS.map((option) => option.value).includes(selectedReason);
		if (!reasons) {
			return 'Please select a suppress reason';
		}
		return '';
	};

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
				<option value={option.value}>{option.text} </option>
			{/each}
		</Select>
		<TextField type="text" bind:value={inputText} />
		<p>Suppressing user: {user}</p>
		{#if $suppress.errors}
			<Alert variant="error">
				{#each $suppress.errors as error}
					{error.message}
				{/each}
			</Alert>
		{/if}
	</div>
	<svelte:fragment slot="footer">
		<Button variant="primary" size="small" on:click={triggerSuppress}>Suppress</Button>
		<Button variant="secondary" size="small" on:click={close}>Cancel</Button>
	</svelte:fragment>
</Modal>
