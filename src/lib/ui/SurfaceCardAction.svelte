<script lang="ts">
	import { Button } from '@nais/ds-svelte-community';

	interface Props {
		href: string;
		label: string;
	}

	let { href, label }: Props = $props();
</script>

<div class="surface-card-action">
	<Button as="a" {href} variant="tertiary" size="small">{label}</Button>
</div>

<style>
	.surface-card-action {
		display: flex;
		justify-content: center;
	}
</style>
