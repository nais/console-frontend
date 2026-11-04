<script lang="ts">
	import Manifest from '#lib/domain/resources/Manifest.svelte';
	import ActionConfirm from '#lib/ui/ActionConfirm.svelte';
	import HeaderActions from '#lib/ui/HeaderActions.svelte';
	import PageModal, { pageModalClick } from '#lib/ui/PageModal.svelte';
	import { generateJobRunName, validateJobRunName } from '#lib/utils/jobRunName.js';
	import { page } from '$app/state';
	import { graphql, type Manifest as ManifestFragment } from '$houdini';
	import EnvPage from './env/+page.svelte';
	import {
		ActionMenu,
		ActionMenuDivider,
		ActionMenuItem,
		Button,
		Heading,
		Modal,
		TextField
	} from '#lib/shadcn/ui/index.js';
	import {
		FileTextIcon,
		MenuElipsisVerticalIcon,
		PencilWritingIcon,
		PlayIcon,
		TrashIcon
	} from '#lib/icons/index.js';

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
					id
					name
					startTime
					completionTime
					duration
					instances {
						pageInfo {
							totalCount
						}
					}
					status {
						message
						state
					}
					trigger {
						type
						actor
					}
					...All_Runs_insert @prepend
				}
			}
		}
	`);

	let triggerOpen = $state(false);
	let showManifest = $state(false);
	let runName = $state('');
	let runNameError = $derived(validateJobRunName(runName));

	const openTrigger = () => {
		runName = generateJobRunName(jobName ?? '');
		triggerOpen = true;
	};

	const submitTrigger = async (): Promise<{ ok: boolean; message: string }> => {
		if (runNameError) {
			return { ok: false, message: runNameError };
		}
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
			<ActionMenuItem
				icon={PlayIcon}
				disabled={job?.deletionStartedAt !== null}
				onselect={openTrigger}
			>
				Trigger run
			</ActionMenuItem>
			<ActionMenuItem
				icon={PencilWritingIcon}
				href="/team/{teamSlug}/{environment}/job/{jobName}/env"
				onselect={pageModalClick}
			>
				Set environment variables
			</ActionMenuItem>
		{/if}
		<ActionMenuItem icon={FileTextIcon} onselect={() => (showManifest = true)}>
			View manifest
		</ActionMenuItem>
		{#if viewerIsMember}
			<ActionMenuDivider />
			<ActionMenuItem
				href="/team/{teamSlug}/{environment}/job/{jobName}/delete"
				icon={TrashIcon}
				variant="danger">Delete job</ActionMenuItem
			>
		{/if}
	</ActionMenu>
</HeaderActions>

<ActionConfirm bind:open={triggerOpen} onconfirm={submitTrigger} confirmDisabled={!!runNameError}>
	{#snippet header()}
		<Heading as="h2" size="medium">Trigger run</Heading>
	{/snippet}
	This will trigger a new run of
	<strong>{jobName}</strong> in
	<strong>{environment}</strong>.
	<TextField
		label="Run name"
		description="Auto-generated name (editable)"
		bind:value={runName}
		error={runNameError}
	/>
</ActionConfirm>

<Modal bind:open={showManifest} closeButton width="medium">
	{#snippet header()}
		<Heading as="h2" size="small">Manifest &ndash; {jobName}</Heading>
	{/snippet}
	{#if job}
		<Manifest workload={job} />
	{/if}
</Modal>

{#if page.state.modalHref?.includes('/env')}
	<PageModal content={EnvPage} header="Set environment variables" />
{/if}
