<script lang="ts">
	import { LeaveIcon, MoonIcon, SunIcon } from '#lib/icons/index.js';
	import { themeSwitch } from '#lib/stores/theme.svelte.js';
	import {
		ActionMenu,
		ActionMenuDivider,
		ActionMenuItem,
		ActionMenuRadioGroup,
		ActionMenuRadioItem,
		Alert
	} from '#lib/shadcn/ui/index.js';
	import type { Snippet } from 'svelte';

	let {
		trigger
	}: {
		trigger: Snippet<[Record<string, unknown>]>;
	} = $props();

	let open = $state(false);
	let saving = $state(false);
	let saveError = $state('');

	async function changeTheme(next: 'light' | 'dark') {
		if (saving || next === themeSwitch.theme) return;
		saveError = '';
		saving = true;
		try {
			await themeSwitch.setTheme(next);
		} catch (error) {
			console.error('Unable to save color theme:', error);
			saveError = 'Color theme could not be saved. Please try again.';
			open = true;
		} finally {
			saving = false;
		}
	}
</script>

<ActionMenu bind:open {trigger}>
	<ActionMenuRadioGroup value={themeSwitch.theme} label="Color theme">
		<ActionMenuRadioItem value="light" disabled={saving} onselect={changeTheme}>
			<span class="setting-option"><SunIcon aria-hidden="true" /><span>Light</span></span>
		</ActionMenuRadioItem>
		<ActionMenuRadioItem value="dark" disabled={saving} onselect={changeTheme}>
			<span class="setting-option"><MoonIcon aria-hidden="true" /><span>Dark</span></span>
		</ActionMenuRadioItem>
	</ActionMenuRadioGroup>
	{#if saveError}
		<Alert variant="error" size="small">{saveError}</Alert>
	{/if}
	<ActionMenuDivider />
	<ActionMenuItem href="/oauth2/logout" icon={LeaveIcon} data-sveltekit-reload>
		Log out
	</ActionMenuItem>
</ActionMenu>

<style>
	.setting-option {
		display: inline-flex;
		align-items: center;
		gap: var(--nais-space-8);
	}
</style>
