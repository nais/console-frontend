<script lang="ts">
	import UnknownIcon from '$lib/icons/UnknownIcon.svelte';
	import {
		ExclamationmarkTriangleFillIcon,
		XMarkOctagonFillIcon
	} from '@nais/ds-svelte-community/icons';

	export let state: string;
	export let size: string;
</script>

{#if state === 'FAILING'}
	<XMarkOctagonFillIcon style="color: var(--a-icon-danger)" title="Application is failing" />
{:else if state === 'NOTNAIS'}
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
