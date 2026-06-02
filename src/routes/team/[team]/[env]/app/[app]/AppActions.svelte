<script lang="ts">
	import { page } from '$app/state';
	import { graphql, type Manifest as ManifestFragment } from '$houdini';
	import Manifest from '$lib/domain/resources/Manifest.svelte';
	import ActionConfirm from '$lib/ui/ActionConfirm.svelte';
	import HeaderActions from '$lib/ui/HeaderActions.svelte';
	import PageModal, { pageModalClick } from '$lib/ui/PageModal.svelte';
	import { Button, Heading, Modal } from '@nais/ds-svelte-community';
	import EnvPage from './env/+page.svelte';
	import ImagePage from './image/+page.svelte';
	import ResizePage from './resize/+page.svelte';
	import {
		ActionMenu,
		ActionMenuDivider,
		ActionMenuItem
	} from '@nais/ds-svelte-community/experimental';
	import {
		ArrowCirclepathIcon,
		ArrowsUpDownIcon,
		FileTextIcon,
		MenuElipsisVerticalIcon,
		PackageIcon,
		PencilWritingIcon,
		StopIcon,
		TrashIcon
	} from '@nais/ds-svelte-community/icons';

	interface Props {
		viewerIsMember: boolean;
		app: (ManifestFragment & { deletionStartedAt: Date | null }) | null;
	}

	let { viewerIsMember, app }: Props = $props();

	let application = $derived(page.params.app);
	let environment = $derived(page.params.env);
	let teamSlug = $derived(page.params.team);

	const restartAppMutation = graphql(`
		mutation RestartApp($team: Slug!, $environment: String!, $application: String!) {
			restartApplication(
				input: { teamSlug: $team, environmentName: $environment, name: $application }
			) {
				application {
					name
				}
			}
		}
	`);

	const stopAppMutation = graphql(`
		mutation StopApp($team: Slug!, $environment: String!, $application: String!) {
			updateApplication(
				input: {
					teamSlug: $team
					environmentName: $environment
					name: $application
					replicas: { min: 0, max: 0 }
				}
			) {
				application {
					name
				}
			}
		}
	`);

	let restart = $state(false);
	let stop = $state(false);
	let showManifest = $state(false);

	const openRestart = () => {
		restart = true;
	};

	const openStop = () => {
		stop = true;
	};

	const submitRestart = async (): Promise<{ ok: boolean; message: string }> => {
		if (!application || !environment || !teamSlug) {
			return { ok: false, message: 'Application or environment is not defined.' };
		}
		const result = await restartAppMutation.mutate({ application, environment, team: teamSlug });
		if (result.errors) {
			return { ok: false, message: result.errors.map((e) => e.message).join(', ') };
		}
		return { ok: true, message: 'Successfully restarted application.' };
	};

	const submitStop = async (): Promise<{ ok: boolean; message: string }> => {
		if (!application || !environment || !teamSlug) {
			return { ok: false, message: 'Application or environment is not defined.' };
		}
		const result = await stopAppMutation.mutate({ application, environment, team: teamSlug });
		if (result.errors) {
			return { ok: false, message: result.errors.map((e) => e.message).join(', ') };
		}
		return {
			ok: true,
			message:
				'Successfully stopped application. It will not receive traffic until it is resized again.'
		};
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
				onclick={openRestart}
				disabled={app?.deletionStartedAt !== null}
			>
				<ActionMenuItem icon={ArrowCirclepathIcon} disabled={app?.deletionStartedAt !== null}>
					Restart
				</ActionMenuItem>
			</button>
			<button
				class="action-menu-button"
				onclick={openStop}
				disabled={app?.deletionStartedAt !== null}
			>
				<ActionMenuItem icon={StopIcon} disabled={app?.deletionStartedAt !== null}>
					Stop
				</ActionMenuItem>
			</button>
			<a
				class="action-menu-button"
				href="/team/{teamSlug}/{environment}/app/{application}/resize"
				onclick={pageModalClick}
			>
				<ActionMenuItem icon={ArrowsUpDownIcon}>Resize</ActionMenuItem>
			</a>
			<a
				class="action-menu-button"
				href="/team/{teamSlug}/{environment}/app/{application}/env"
				onclick={pageModalClick}
			>
				<ActionMenuItem icon={PencilWritingIcon}>Set environment variables</ActionMenuItem>
			</a>
			<a
				class="action-menu-button"
				href="/team/{teamSlug}/{environment}/app/{application}/image"
				onclick={pageModalClick}
			>
				<ActionMenuItem icon={PackageIcon}>Set image version</ActionMenuItem>
			</a>
		{/if}
		<button class="action-menu-button" onclick={() => (showManifest = true)}>
			<ActionMenuItem icon={FileTextIcon}>View manifest</ActionMenuItem>
		</button>
		{#if viewerIsMember}
			<ActionMenuDivider />
			<a class="action-menu-button" href="/team/{teamSlug}/{environment}/app/{application}/delete">
				<ActionMenuItem icon={TrashIcon} variant="danger">Delete</ActionMenuItem>
			</a>
		{/if}
	</ActionMenu>
</HeaderActions>

<ActionConfirm bind:open={restart} onconfirm={submitRestart}>
	{#snippet header()}
		<Heading as="h2" size="medium">Restart {application}</Heading>
	{/snippet}
	This will restart all instances of
	<strong>{application}</strong> in
	<strong>{environment}</strong>.
	<br />
	Are you sure?
</ActionConfirm>

<ActionConfirm bind:open={stop} onconfirm={submitStop}>
	{#snippet header()}
		<Heading as="h2" size="medium">Stop {application}</Heading>
	{/snippet}
	This will stop
	<strong>{application}</strong> in
	<strong>{environment}</strong> by scaling replicas to 0.
	<br />
	The application will not receive any traffic until it is resized.
	<br /><br />
	Are you sure?
</ActionConfirm>

<Modal bind:open={showManifest} closeButton width="medium">
	{#snippet header()}
		<Heading as="h2" size="small">Manifest &ndash; {application}</Heading>
	{/snippet}
	{#if app}
		<Manifest workload={app} />
	{/if}
</Modal>

{#if page.state.modalHref?.includes('/resize')}
	<PageModal content={ResizePage} header="Resize app" />
{:else if page.state.modalHref?.includes('/env')}
	<PageModal content={EnvPage} header="Set environment variables" />
{:else if page.state.modalHref?.includes('/image')}
	<PageModal content={ImagePage} header="Set image version" />
{/if}

<style>
	.action-menu-button {
		all: unset;
		display: contents;

		:global(*) {
			cursor: pointer;
		}
	}
</style>
