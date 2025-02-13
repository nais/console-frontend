<script lang="ts" module>
	export type FindingType = {
		readonly id: string;
		readonly description: string;
		readonly identifier: string;
		readonly package: string;
		readonly severity: ValueOf<typeof ImageVulnerabilitySeverity>;
		readonly state: ValueOf<typeof ImageVulnerabilityState>;
		readonly analysisTrail: {
			readonly state: ValueOf<typeof ImageVulnerabilityAnalysisState>;
			readonly suppressed: boolean;
			readonly comments: {
				readonly nodes: {
					readonly comment: string;
					readonly onBehalfOf: string;
					readonly state: ValueOf<typeof ImageVulnerabilityAnalysisState>;
					readonly suppressed: boolean;
					readonly timestamp: Date;
				}[];
			};
		};
	};
</script>

<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import {
		graphql,
		ImageVulnerabilityAnalysisState,
		type ImageVulnerabilitySeverity,
		type ImageVulnerabilityState,
		type ValueOf
	} from '$houdini';
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
			readonly environment: {
				readonly name: string;
			};
			readonly name: string;
		}[];
		authorized: boolean;
	}

	let { open = $bindable(), finding, workloads, authorized }: Props = $props();

	let errormessage = $state('');

	let selectedReason: ValueOf<typeof ImageVulnerabilityAnalysisState> | '' = $state('');
	let inputText = $state('');
	let suppressed: boolean = $state(false);

	let team = page.params.team;
	let env = page.params.env;
	let workload = page.params.app ?? page.params.job;

	// check if route contains app or job
	if (page.route.id && page.route.id.includes('app')) {
		workload = 'app/' + page.params.app;
	} else {
		workload = 'job/' + page.params.job;
	}

	const dispatcher = createEventDispatcher<{ close: void }>();

	const close = () => {
		open = false;
		errormessage = '';
		dispatcher('close');
	};

	const triggerSuppress = async () => {
		errormessage = '';

		if (selectedReason === '') {
			errormessage += 'Please select a suppress reason from the Analysis dropdown.';
			return;
		}

		if (inputText === '') {
			errormessage += 'Please provide a comment before suppressing the finding. ';
			return;
		}

		await suppress.mutate({
			analysisState: selectedReason,
			comment: inputText,
			vulnerabilityID: finding.id,
			suppress: suppressed
		});

		if ($suppress.errors) {
			if (errormessage === '') {
				errormessage = $suppress.errors[0].message;
			}
			open = true;
			return;
		}

		logEvent('suppressFinding');
		errormessage = '';
		const imagePage = '/team/' + team + '/' + env + '/' + workload + '/image';
		close();
		await goto(imagePage, { replaceState: true });
	};

	// TODO: needs refresh
	const suppress = graphql(`
		mutation SuppressFinding(
			$analysisState: ImageVulnerabilityAnalysisState!
			$comment: String!
			$suppress: Boolean!
			$vulnerabilityID: ID!
		) {
			updateImageVulnerability(
				input: {
					analysisState: $analysisState
					comment: $comment
					suppress: $suppress
					vulnerabilityID: $vulnerabilityID
				}
			) {
				vulnerability {
					analysisTrail {
						state
						suppressed
						comments {
							nodes {
								comment
								onBehalfOf
								state
								suppressed
								timestamp
							}
						}
					}
				}
			}
		}
	`);

	const SUPPRESS_OPTIONS = [
		{ value: '', text: 'Suppress reason' },
		{ value: ImageVulnerabilityAnalysisState.IN_TRIAGE, text: 'In triage' },
		{ value: ImageVulnerabilityAnalysisState.RESOLVED, text: 'Resolved' },
		{ value: ImageVulnerabilityAnalysisState.FALSE_POSITIVE, text: 'False positive' },
		{ value: ImageVulnerabilityAnalysisState.NOT_AFFECTED, text: 'Not affected' }
	];

	const init = (finding: FindingType) => {
		inputText = finding.analysisTrail?.comments?.nodes[0]?.comment ?? '';
		selectedReason = finding.analysisTrail?.state ?? '';
		suppressed = finding.analysisTrail?.suppressed ?? false;
	};

	$effect(() => {
		init(finding);
	});
</script>

<Modal bind:open width="medium" onclose={close}>
	{#snippet header()}
		<Heading>Suppress finding for {finding.identifier}</Heading>
	{/snippet}

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
		<Table size="small" zebraStripes>
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
						<Td>{workload.environment.name}</Td>
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
			{#each SUPPRESS_OPTIONS as option (option)}
				{#if option.value === finding.state}
					<option value={option.value}>{option.text} </option>
				{:else}
					<option value={option.value}>{option.text}</option>
				{/if}
			{/each}
		</Select>

		<TextField type="text" bind:value={inputText}>
			{#snippet label()}
				Comment
			{/snippet}
		</TextField>
		<Checkbox bind:checked={suppressed}>Suppress</Checkbox>
	</div>
	{#snippet footer()}
		<Button variant="primary" size="small" onclick={triggerSuppress} disabled={!authorized}
			>Update</Button
		>
		<Button variant="secondary" size="small" onclick={close}>Cancel</Button>
	{/snippet}
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
