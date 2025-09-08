<script lang="ts" module>
	export type FindingType = {
		id: string;
		description: string;
		identifier: string;
		package: string;
		severity: ValueOf<typeof ImageVulnerabilitySeverity>;
		state: ValueOf<typeof ImageVulnerabilityState>;
		vulnerabilityDetailsLink: string;
		analysisTrail: {
			state: ValueOf<typeof ImageVulnerabilityAnalysisState>;
			suppressed: boolean;
			comments: {
				nodes: {
					comment: string;
					onBehalfOf: string;
					state: ValueOf<typeof ImageVulnerabilityAnalysisState>;
					suppressed: boolean;
					timestamp: Date;
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
	import {
		Alert,
		BodyShort,
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
	import ExternalLink from '../ExternalLink.svelte';
	import WorkloadLink from '../WorkloadLink.svelte';

	interface Props {
		open: boolean;
		finding: FindingType;
		workloads: {
			readonly id: string;
			readonly __typename: string | null;
			readonly team: {
				readonly slug: string;
			};
			readonly teamEnvironment: { readonly environment: { readonly name: string } };
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
			errormessage += 'Select a suppress reason from the Analysis dropdown.';
			return;
		}

		if (inputText === '') {
			errormessage += 'Provide a comment before suppressing the finding. ';
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

		errormessage = '';
		const vulnerabilityReportUrl =
			'/team/' + team + '/' + env + '/' + workload + '/vulnerability-report';
		close();
		await goto(vulnerabilityReportUrl, { replaceState: true });
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
		<Heading level="1" size="medium">Suppress Finding for {finding.identifier}</Heading>
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
				<ExternalLink href={finding.vulnerabilityDetailsLink}
					>{finding.vulnerabilityDetailsLink}</ExternalLink
				>
			</dd>
		</dl>
	</div>
	<div class="workload">
		<Heading level="2" size="small">Affected Workloads</Heading>
		<Table size="small">
			<Thead>
				<Tr>
					<Th>Team</Th>
					<Th>Workload</Th>
				</Tr>
			</Thead>
			<Tbody>
				{#each workloads as workload (workload.id)}
					<Tr>
						<Td>{workload.team.slug}</Td>
						<Td><WorkloadLink hideTeam {workload} /></Td>
					</Tr>
				{/each}
			</Tbody>
		</Table>
	</div>
	{#if authorized}
		<div class="wrapper">
			{#if errormessage !== ''}
				<Alert variant="error">
					{errormessage}
				</Alert>
			{/if}
			<BodyShort>
				Provide a reason for suppressing this finding. This will be recorded in the analysis audit
				log. Suppression will be in effect for all workloads using this image.
			</BodyShort>
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
	{/if}
	{#snippet footer()}
		{#if authorized}
			<Button variant="primary" size="small" onclick={triggerSuppress} disabled={!authorized}
				>Update</Button
			>
			<Button variant="secondary" size="small" onclick={close}>Cancel</Button>
		{:else}
			<Button variant="secondary" size="small" onclick={close}>Close</Button>
		{/if}
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
