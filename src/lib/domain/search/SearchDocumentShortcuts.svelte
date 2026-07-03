<script lang="ts">
	let { onkeydown }: { onkeydown: (event: KeyboardEvent) => void } = $props();
</script>

<svelte:document {onkeydown} />
