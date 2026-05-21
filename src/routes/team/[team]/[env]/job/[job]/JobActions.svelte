<script lang="ts">
	import { page } from '$app/state';
	import { graphql, type Manifest as ManifestFragment } from '$houdini';
	import Manifest from '$lib/domain/resources/Manifest.svelte';
	import ActionConfirm from '$lib/ui/ActionConfirm.svelte';
	import HeaderActions from '$lib/ui/HeaderActions.svelte';
	import { pageModalClick } from '$lib/ui/PageModal.svelte';
	import { generateJobRunName } from '$lib/utils/jobRunName';
	import { Button, Heading, Modal, TextField } from '@nais/ds-svelte-community';
	import {
		ActionMenu,
		ActionMenuDivider,
		ActionMenuItem
	} from '@nais/ds-svelte-community/experimental';
	import {
		FileTextIcon,
		MenuElipsisVerticalIcon,
		PencilWritingIcon,
		PlayIcon,
		TrashIcon
	} from '@nais/ds-svelte-community/icons';

	interface Props {
		viewerIsMember: boolean;
		job: (ManifestFragment & { deletionStartedAt: Date | null }) | null;
	}

	let { viewerIsMember, job }: Props = $props();

	let jobName = $derived(page.params.job);
	let environment = $derived(page.params.env);
	let teamSlug = $derived(page.params.team);

	const triggerRunMutation = graphql(`
		mutation TriggerJobFromActions(
			$teamSlug: Slug!
			$environment: String!
			$jobName: String!
			$runName: String!
		) {
			triggerJob(
				input: {
					environmentName: $environment
					teamSlug: $teamSlug
					runName: $runName
					name: $jobName
				}
			) {
				jobRun {
					name
				}
			}
		}
	`);

	let triggerOpen = $state(false);
	let showManifest = $state(false);
	let runName = $state('');

	const openTrigger = () => {
		runName = generateJobRunName(jobName ?? '');
		triggerOpen = true;
	};

	const submitTrigger = async (): Promise<{ ok: boolean; message: string }> => {
		if (!jobName || !environment || !teamSlug) {
			return { ok: false, message: 'Job name or environment is not defined.' };
		}
		const result = await triggerRunMutation.mutate({
			jobName,
			environment,
			teamSlug,
			runName
		});
		if (result.errors) {
			return { ok: false, message: result.errors.map((e) => e.message).join(', ') };
		}
		return { ok: true, message: `Successfully triggered run "${runName}".` };
	};
</script>

<HeaderActions>
	<ActionMenu>
		{#snippet trigger(props)}
			<Button
				variant="secondary"
				size="small"
				icon={MenuElipsisVerticalIcon}
				iconPosition="right"
				{...props}
			>
				Actions
			</Button>
		{/snippet}
		{#if viewerIsMember}
			<button
				class="action-menu-button"
				disabled={job?.deletionStartedAt !== null}
				onclick={openTrigger}
			>
				<ActionMenuItem icon={PlayIcon} disabled={job?.deletionStartedAt !== null}>
					Trigger run
				</ActionMenuItem>
			</button>
			<a
				class="action-menu-button"
				href="/team/{teamSlug}/{environment}/job/{jobName}/env"
				onclick={pageModalClick}
			>
				<ActionMenuItem icon={PencilWritingIcon}>Set environment variables</ActionMenuItem>
			</a>
		{/if}
		<button class="action-menu-button" onclick={() => (showManifest = true)}>
			<ActionMenuItem icon={FileTextIcon}>View manifest</ActionMenuItem>
		</button>
		{#if viewerIsMember}
			<ActionMenuDivider />
			<a class="action-menu-button" href="/team/{teamSlug}/{environment}/job/{jobName}/delete">
				<ActionMenuItem icon={TrashIcon} variant="danger">Delete job</ActionMenuItem>
			</a>
		{/if}
	</ActionMenu>
</HeaderActions>

<ActionConfirm bind:open={triggerOpen} onconfirm={submitTrigger}>
	{#snippet header()}
		<Heading as="h2" size="medium">Trigger run</Heading>
	{/snippet}
	This will trigger a new run of
	<strong>{jobName}</strong> in
	<strong>{environment}</strong>.
	<TextField label="Run name" description="Auto-generated name (editable)" bind:value={runName} />
</ActionConfirm>

<Modal bind:open={showManifest} closeButton width="medium">
	{#snippet header()}
		<Heading as="h2" size="small">Manifest &ndash; {jobName}</Heading>
	{/snippet}
	{#if job}
		<Manifest workload={job} />
	{/if}
</Modal>

<style>
	.action-menu-button {
		all: unset;
		display: contents;

		:global(*) {
			cursor: pointer;
		}
	}
</style>
