<script lang="ts">
	import UnknownIcon from '$lib/icons/UnknownIcon.svelte';
	import {
		ExclamationmarkTriangleFillIcon,
		XMarkOctagonFillIcon
	} from '@nais/ds-svelte-community/icons';

	interface Props {
		state: string;
		size: string;
	}

	let { state, size }: Props = $props();
</script>

{#if state === 'FAILING'}
	<XMarkOctagonFillIcon style="color: var(--a-icon-danger)" title="Application is failing" />
{:else if state === 'NOT_NAIS'}
	<ExclamationmarkTriangleFillIcon
		style="color: var(--a-icon-warning)"
		title="Application is not nais"
	/>
{:else if state === 'UNKNOWN'}
	<UnknownIcon
		{size}
		style="color: var(--a-icon-warning)"
		aria-label="Unknown application status"
		role="image"
	/>
{/if}
