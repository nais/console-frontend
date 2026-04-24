<script lang="ts">
	import { page } from '$app/state';
	import { docURL, tenantURL } from '$lib/doc';
	import SearchButton from '$lib/domain/search/SearchButton.svelte';
	import Feedback from '$lib/feedback/Feedback.svelte';
	import GrafanaIcon from '$lib/icons/GrafanaIcon.svelte';
	import { themeSwitch } from '$lib/stores/theme.svelte';
	import HeaderActionMenuItem from '$lib/ui/HeaderActionMenuItem.svelte';
	import { Button, Spacer } from '@nais/ds-svelte-community';
	import {
		ActionMenu,
		ActionMenuCheckboxItem,
		ActionMenuDivider,
		ActionMenuGroup,
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
		MenuGridIcon,
		MenuHamburgerIcon
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

	const navItems = [
		{ href: '/utilization', label: 'Utilization' },
		{ href: '/cost', label: 'Cost' },
		{ href: '/vulnerabilities', label: 'Vulnerabilities' },
		{ href: '/deployments', label: 'Deployments' }
	];

	function isActive(pathname: string) {
		return page.url.pathname === pathname || page.url.pathname.startsWith(pathname + '/');
	}

	function closeMenu(event: Event) {
		const popover = (event.currentTarget as HTMLElement | null)?.closest('[popover]') as
			| (HTMLElement & { hidePopover?: () => void })
			| null;

		popover?.hidePopover?.();
	}
</script>

<InternalHeader>
	<InternalHeaderTitle as="a" href="/">
		<div class="logo">
			<Logo height="32px" />
			<span>Console</span>
		</div>
	</InternalHeaderTitle>
	<!-- Desktop navigation (hidden on mobile) -->
	<div class="desktop-nav">
		{#each navItems as item (item.href)}
			<InternalHeaderButton as="a" href={item.href} class={{ active: isActive(item.href) }}>
				{item.label}
			</InternalHeaderButton>
		{/each}
	</div>

	<!-- Mobile navigation menu -->
	<ActionMenu>
		{#snippet trigger(props)}
			<InternalHeaderButton class="mobile-nav-trigger" aria-label="Open navigation menu" {...props}>
				<MenuHamburgerIcon title="Navigation" />
			</InternalHeaderButton>
		{/snippet}
		<ActionMenuGroup label="Navigation">
			{#each navItems as item (item.href)}
				<HeaderActionMenuItem
					href={item.href}
					active={isActive(item.href)}
					ariaCurrent={isActive(item.href) ? 'page' : undefined}
					onSelect={closeMenu}
				>
					{item.label}
				</HeaderActionMenuItem>
			{/each}
		</ActionMenuGroup>
		<ActionMenuDivider />
		<ActionMenuGroup label="Tools">
			<HeaderActionMenuItem
				icon={ChatElipsisIcon}
				onSelect={(event) => {
					closeMenu(event);
					feedbackOpen = true;
				}}
			>
				Feedback
			</HeaderActionMenuItem>
		</ActionMenuGroup>
	</ActionMenu>

	<Spacer />
	<div class="feedback-button-wrapper">
		<Button
			variant="tertiary-neutral"
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
			<HeaderActionMenuItem
				href={docURL()}
				target="_blank"
				rel="noopener noreferrer"
				icon={BooksIcon}
				onSelect={closeMenu}
			>
				Docs <ExternalLinkIcon />
			</HeaderActionMenuItem>
			<HeaderActionMenuItem
				href={tenantURL('grafana')}
				target="_blank"
				rel="noopener noreferrer"
				icon={GrafanaIcon}
				onSelect={closeMenu}
			>
				Grafana <ExternalLinkIcon />
			</HeaderActionMenuItem>
		</ActionMenuGroup>
	</ActionMenu>
	<ActionMenu>
		{#snippet trigger(props)}
			<InternalHeaderUserButton name={user ? user.name : 'unauthorized'} {...props} />
		{/snippet}

		{#if user?.isAdmin}
			<HeaderActionMenuItem href="/admin" icon={CogIcon} onSelect={closeMenu}>
				Admin
			</HeaderActionMenuItem>
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
		<HeaderActionMenuItem
			href="/oauth2/logout"
			icon={LeaveIcon}
			onSelect={closeMenu}
			data-sveltekit-reload
		>
			Logout
		</HeaderActionMenuItem>
	</ActionMenu>
</InternalHeader>

<style>
	.logo {
		color: var(--ax-text-neutral);
		text-decoration: none;
		display: flex;
		gap: 1rem;
		font-size: 1.5rem;
		font-weight: 700;
		align-items: center;
	}

	.feedback-button-wrapper {
		display: flex;
		align-items: center;
		padding: 0 1rem;
	}

	/* Desktop navigation */
	.desktop-nav {
		display: flex;
		gap: 0;
	}

	/* Mobile nav trigger is hidden on desktop by default */
	:global(.mobile-nav-trigger) {
		display: none;
	}

	/* Mobile responsive behavior */
	@media (max-width: 767px) {
		.logo {
			gap: 0.5rem;
			font-size: 1rem;
		}

		.logo span {
			display: none;
		}

		/* Hide desktop nav on mobile */
		.desktop-nav {
			display: none;
		}

		.feedback-button-wrapper {
			display: none;
		}

		/* Show mobile nav trigger on mobile */
		:global(.mobile-nav-trigger) {
			display: inline-flex;
		}
	}

	/* Landscape on mobile phones: keep mobile nav despite wider viewport */
	@media (max-height: 500px) {
		.logo {
			gap: 0.5rem;
			font-size: 1rem;
		}

		.logo span {
			display: none;
		}

		.desktop-nav {
			display: none;
		}

		.feedback-button-wrapper {
			display: none;
		}

		:global(.mobile-nav-trigger) {
			display: inline-flex;
		}
	}
</style>
