<script lang="ts">
	import { DropdownMenu } from 'bits-ui';
</script>

<DropdownMenu.Separator class="sh-action-menu-divider" />

<style>
	:global(.sh-action-menu-divider) {
		margin: var(--ax-space-4) calc(-1 * var(--ax-space-4));
		border: none;
		border-top: var(--sh-border-width) solid var(--border);
	}
</style>
