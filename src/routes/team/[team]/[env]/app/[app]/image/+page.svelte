<script lang="ts">
	import { page } from '$app/state';
	import { setImageVersionForm } from '$lib/forms/workload';
	import Form from '$lib/ui/Form/Form.svelte';
	import { formatImageVersion, imageRefMatches, parseImage } from '$lib/utils/image';
	import { Alert, BodyLong, Button } from '@nais/ds-svelte-community';
	import { formatDistanceStrict } from 'date-fns';
	import type { PageProps } from './$houdini';

	let { data, form }: PageProps = $props();

	const { SetImageVersionData } = $derived(data);
	const application = $derived($SetImageVersionData.data?.team?.environment?.application ?? null);

	const releases = $derived(
		[...(application?.history ?? [])].sort(
			(a, b) => b.deployedAt.getTime() - a.deployedAt.getTime()
		)
	);

	function imageVersionLabelFor(image: string): string {
		try {
			return formatImageVersion(parseImage(image));
		} catch {
			return image;
		}
	}

	// Radio labels are plain text, so when each release was deployed has to be spelled out rather
	// than rendered with <Time>.
	const options = $derived(
		releases.map((release) => {
			const current = !!application?.image && imageRefMatches(release.image, application.image);
			const deployed = formatDistanceStrict(release.deployedAt, Date.now(), { addSuffix: true });
			return {
				value: release.image,
				label: `${imageVersionLabelFor(release.image)}${current ? ' (current)' : ''} — deployed ${deployed}`
			};
		})
	);

	const backHref = $derived(`/team/${page.params.team}/${page.params.env}/app/${page.params.app}`);
</script>

<div class="page">
	<BodyLong>
		Roll <strong>{page.params.app}</strong> in <strong>{page.params.env}</strong> back to a previous image
		version.
	</BodyLong>

	<Alert variant="warning" size="small">
		This only changes the container image. Other changes made to the environment, such as
		environment variables, secrets or configuration, are not affected.
	</Alert>

	{#if releases.length === 0}
		<BodyLong>No releases were found for this application.</BodyLong>
		<div>
			<Button as="a" size="small" variant="secondary" href={backHref}>Back to application</Button>
		</div>
	{:else}
		<Form
			fields={setImageVersionForm}
			{form}
			optionsOverrides={{ image: options }}
			button="Set image version"
		>
			{#snippet actions()}
				<Button as="a" size="small" variant="tertiary" href={backHref}>Cancel</Button>
			{/snippet}
		</Form>
	{/if}
</div>

<style>
	.page {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-16);
		max-width: 600px;
	}
</style>
