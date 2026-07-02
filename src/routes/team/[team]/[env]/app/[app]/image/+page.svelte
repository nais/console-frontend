<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { isPossiblyInModal } from '$lib/ui/PageModal.svelte';
	import Time from '$lib/ui/Time.svelte';
	import { formatImageRef, parseImage } from '$lib/utils/image';
	import {
		Alert,
		BodyLong,
		Button,
		ErrorMessage,
		Radio,
		RadioGroup
	} from '@nais/ds-svelte-community';
	import { tick } from 'svelte';
	import type { PageProps } from './$houdini';

	let { data }: PageProps = $props();

	const { SetImageVersionData } = $derived(data);
	const application = $derived($SetImageVersionData.data?.team?.environment?.application ?? null);

	const currentImage = $derived(application?.image ? formatImageRef(application.image) : null);

	const releases = $derived(
		[...(application?.history ?? [])].sort(
			(a, b) => b.deployedAt.getTime() - a.deployedAt.getTime()
		)
	);

	const form = $derived(page.form);

	let selected = $state('');

	let success = $state(false);
	let closeButtonEl: HTMLButtonElement | undefined = $state();

	function tagFor(image: string): string {
		const parsed = parseImage(image);
		return parsed.tag ?? parsed.digest ?? image;
	}

	const close = async () => {
		await goto(`/team/${page.params.team}/${page.params.env}/app/${page.params.app}`, {
			replaceState: isPossiblyInModal(),
			invalidateAll: true
		});
	};
</script>

{#if success}
	<div class="wrapper" role="status" aria-live="polite" aria-atomic="true">
		<Alert variant="success" size="small">
			Successfully set image version to <code>{tagFor(selected)}</code>. Restarting application to
			apply the change.
		</Alert>
		<Button variant="tertiary" size="small" onclick={close} bind:ref={closeButtonEl}>Close</Button>
	</div>
{:else}
	<form
		method="POST"
		action="/team/{page.params.team}/{page.params.env}/app/{page.params.app}/image"
		use:enhance={() => {
			return async ({ result }) => {
				if (result.type === 'redirect') {
					success = true;
					await tick();
					closeButtonEl?.focus();
				} else if (result.type === 'failure') {
					await applyAction(result);
				}
			};
		}}
	>
		<BodyLong>
			Roll <strong>{page.params.app}</strong> in <strong>{page.params.env}</strong> back to a previous
			image version.
		</BodyLong>

		<Alert variant="warning" size="small">
			This only changes the container image. Other changes made to the environment, such as
			environment variables, secrets or configuration, are not affected.
		</Alert>

		{#if releases.length === 0}
			<BodyLong>No releases were found for this application.</BodyLong>
		{:else}
			<RadioGroup legend="Releases" size="small" name="image" bind:value={selected}>
				{#each releases as release (release.image + release.deployedAt.toISOString())}
					{@const isCurrent = release.image === currentImage}
					<Radio value={release.image}>
						<span class="release-label">
							<code class="release-tag">{tagFor(release.image)}</code>
							{#if isCurrent}<span class="release-current">(current)</span>{/if}
							<span class="release-time">
								deployed <Time time={release.deployedAt} distance />
							</span>
						</span>
					</Radio>
				{/each}
			</RadioGroup>
		{/if}

		{#if form?.error}
			<ErrorMessage>{form.error}</ErrorMessage>
		{/if}

		<div class="button-row">
			<Button type="submit" size="small" disabled={!selected}>Set image version</Button>
			<Button variant="tertiary" size="small" type="button" onclick={close}>Cancel</Button>
		</div>
	</form>
{/if}

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-8);
		max-width: 500px;
		width: 100%;
		align-items: flex-start;
	}

	form {
		max-width: 600px;
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-16);
	}

	.release-label {
		display: inline-flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: var(--ax-space-8);
	}

	.release-tag {
		font-family: monospace;
	}

	.release-current {
		color: var(--ax-text-neutral);
	}

	.release-time {
		color: var(--ax-text-subtle);
		font-size: var(--ax-font-size-small);
	}

	.button-row {
		display: flex;
		gap: var(--ax-space-8);
		align-items: center;
	}
</style>
