<script lang="ts" context="module">
	export type AnalysisTrailType = {
		readonly state: string;
		readonly comments: {
			readonly comment: string;
			readonly timestamp: string;
			readonly commenter: string;
			readonly onBehalfOf: string;
		}[];
		readonly isSuppressed: boolean;
	};
</script>

<script lang="ts">
	import { Button, Heading, Modal } from '@nais/ds-svelte-community';
	import { createEventDispatcher } from 'svelte';
	import { graphql } from '$houdini';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import type { FindingType } from './SuppressFinding.svelte';
	import type { AnalysisTrailVariables } from '$houdini/types/src/routes/team/[team]/(teamPages)/images/[dependencyTrackProjectId]/$houdini';

	export let open: boolean;
	export let finding: FindingType;
	export let analysisTrail: AnalysisTrailType;

	$: projectId = $page.params.dependencyTrackProjectId;
	$: team = $page.params.team;

	const dispatcher = createEventDispatcher<{ close: void }>();

	const close = () => {
		open = false;
		dispatcher('close');
	};

	export const _AnalysisTrailVariables: AnalysisTrailVariables = () => {
		return {
			componentId: finding.componentId,
			projectId: projectId,
			vulnerabilityId: finding.vulnerabilityId
		};
	};

	const triggerTrail = async () => {
		await trail.fetch({
			componentId: finding.componentId,
			projectId: projectId,
			vulnerabilityId: finding.vulnerabilityId
		});

		if ($trail.errors) {
			open = true;
			return;
		}
		close();
		await goto(`/team/${team}/images/${projectId}`);
	};

	const trail = graphql(`
		query AnalysisTrail($componentId: String!, $projectId: String!, $vulnerabilityId: String!)
		@load {
			analysisTrail(
				componentId: $componentId
				projectId: $projectId
				vulnerabilityId: $vulnerabilityId
			) {
				state
				comments {
					comment
					timestamp
					commenter
					onBehalfOf
				}
				isSuppressed
			}
		}
	`);

	// on click should send a request to analysis endpoint for dependency track
</script>

<Modal bind:open width="medium" on:close={close}>
	<svelte:fragment slot="header">
		<Heading>Analysis trail for {finding.vulnId}</Heading>
	</svelte:fragment>
	<div class="wrapper">
		<p>Package: {finding.packageUrl}</p>
		<p>State: {analysisTrail.state}</p>
	</div>
	<svelte:fragment slot="footer">
		<Button variant="primary" size="small" on:click={triggerTrail}>Suppress</Button>
		<Button variant="secondary" size="small" on:click={close}>Cancel</Button>
	</svelte:fragment>
</Modal>
