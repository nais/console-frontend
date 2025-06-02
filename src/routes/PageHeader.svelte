<script lang="ts">
	import { page } from '$app/state';
	import SearchButton from '$lib/components/search/SearchButton.svelte';
	import { docURL, tenantURL } from '$lib/doc';
	import Feedback from '$lib/feedback/Feedback.svelte';
	import GrafanaIcon from '$lib/icons/GrafanaIcon.svelte';
	import { themeSwitch } from '$lib/stores/theme.svelte';
	import { Button, Spacer } from '@nais/ds-svelte-community';
	import {
		ActionMenu,
		ActionMenuCheckboxItem,
		ActionMenuDivider,
		ActionMenuGroup,
		ActionMenuItem,
		InternalHeader,
		InternalHeaderButton,
		InternalHeaderTitle,
		InternalHeaderUserButton
	} from '@nais/ds-svelte-community/experimental';
	import {
		BooksIcon,
		ChatElipsisIcon,
		CogIcon,
		ExternalLinkIcon,
		LeaveIcon,
		MenuGridIcon
	} from '@nais/ds-svelte-community/icons';
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
			<Logo height="32px" />
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
	<InternalHeaderButton as="a" href="/cost" class={{ active: page.url.pathname === '/cost' }}>
		Cost
	</InternalHeaderButton>
	<InternalHeaderButton
		as="a"
		href="/vulnerabilities"
		class={{ active: page.url.pathname === '/vulnerabilities' }}
	>
		Vulnerabilities
	</InternalHeaderButton>

	<Spacer />
	<div class="feedback-button-wrapper">
		<Button
			variant="primary-neutral"
			icon={ChatElipsisIcon}
			size="small"
			onclick={() => {
				feedbackOpen = true;
			}}
		>
			<span style="font-weight: 400">Feedback</span>
		</Button>
	</div>
	{#if feedbackOpen}
		<Feedback close={() => (feedbackOpen = false)} />
	{/if}
	<SearchButton />
	<ActionMenu>
		{#snippet trigger(props)}
			<InternalHeaderButton {...props}>
				<MenuGridIcon title="Applications" />
			</InternalHeaderButton>
		{/snippet}
		<ActionMenuGroup label="Nais resources">
			<ActionMenuItem icon={BooksIcon}>
				<a href={docURL()} class="action-menu-link" target="_blank" rel="noopener noreferrer">
					Docs <ExternalLinkIcon /></a
				>
			</ActionMenuItem>
			<ActionMenuItem icon={GrafanaIcon}>
				<a
					href={tenantURL('grafana')}
					class="action-menu-link"
					target="_blank"
					rel="noopener noreferrer"
				>
					Grafana <ExternalLinkIcon />
				</a>
			</ActionMenuItem>
		</ActionMenuGroup>
	</ActionMenu>
	<ActionMenu>
		{#snippet trigger(props)}
			<InternalHeaderUserButton name={user ? user.name : 'unauthorized'} {...props} />
		{/snippet}

		{#if user?.isAdmin}
			<ActionMenuItem>
				<a href="/admin" class="action-menu-link" style="text-decoration: none;"><CogIcon />Admin</a
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
	.feedback-button-wrapper {
		display: flex;
		place-items: center;
		padding: 0 1rem;
	}
	.action-menu-link {
		color: var(--ax-text-neutral);
		text-decoration: none;
	}
</style>
