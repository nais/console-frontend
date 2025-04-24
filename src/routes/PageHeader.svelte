<script lang="ts">
	import { page } from '$app/state';
	import SearchButton from '$lib/components/search/SearchButton.svelte';
	import { docURL } from '$lib/doc';
	import Feedback from '$lib/feedback/Feedback.svelte';
	import { themeSwitch } from '$lib/stores/theme.svelte';
	import { Button } from '@nais/ds-svelte-community';
	import {
		ActionMenu,
		ActionMenuCheckboxItem,
		ActionMenuDivider,
		ActionMenuItem,
		InternalHeader,
		InternalHeaderButton,
		InternalHeaderTitle,
		InternalHeaderUserButton
	} from '@nais/ds-svelte-community/experimental';
	import { CogIcon, LeaveIcon } from '@nais/ds-svelte-community/icons';
	import Logo from '../Logo.svelte';

	interface Props {
		user:
			| {
					readonly name: string;
					readonly isAdmin: boolean;
			  }
			| undefined;
	}

	let { user }: Props = $props();

	let feedbackOpen = $state(false);
</script>

<InternalHeader>
	<InternalHeaderTitle as="a" href="/">
		<div class="logo">
			<Logo height="1.8rem" />
			<span>Console</span>
		</div>
	</InternalHeaderTitle>
	<InternalHeaderButton
		as="a"
		href="/utilization"
		class={{ active: page.url.pathname === '/utilization' }}
	>
		Utilization
	</InternalHeaderButton>
	<InternalHeaderButton as="a" href={docURL()}>Docs</InternalHeaderButton>
	<Button variant="primary-neutral" size="small" onclick={() => (feedbackOpen = true)}>
		<span style="font-weight: 400">Feedback</span>
	</Button>
	{#if feedbackOpen}
		<Feedback bind:open={feedbackOpen} />
	{/if}
	<div class="aksel-stack__spacer aksel-stack__spacer"></div>

	<SearchButton />
	<ActionMenu>
		{#snippet trigger(props)}
			<InternalHeaderUserButton name={user ? user.name : 'unauthorized'} {...props} />
		{/snippet}

		{#if user?.isAdmin}
			<ActionMenuItem
				><a href="/admin" class="action-menu-link" style="text-decoration: none;"
					><CogIcon />Admin</a
				></ActionMenuItem
			>
			<ActionMenuDivider />
		{/if}
		<ActionMenuCheckboxItem
			checked={themeSwitch.theme == 'dark'}
			onchange={(checked) => {
				if (!checked) {
					themeSwitch.setTheme('light');
				} else {
					themeSwitch.setTheme('dark');
				}
			}}
		>
			Dark theme
		</ActionMenuCheckboxItem>
		<ActionMenuItem>
			<a href="/oauth2/logout" class="action-menu-link" style="text-decoration: none;">
				<LeaveIcon />
				Logout
			</a>
		</ActionMenuItem>
	</ActionMenu>
</InternalHeader>

<style>
	.logo {
		color: var(--ax-text-default, --a-text-on-inverted);
		text-decoration: none;
		display: flex;
		gap: 1rem;
		font-size: 1.5rem;
		font-weight: 700;
	}
</style>
