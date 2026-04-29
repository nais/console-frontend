<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { docURL, tenantURL } from '$lib/doc';
	import SearchButton from '$lib/domain/search/SearchButton.svelte';
	import Feedback from '$lib/feedback/Feedback.svelte';
	import GrafanaIcon from '$lib/icons/GrafanaIcon.svelte';
	import { themeSwitch } from '$lib/stores/theme.svelte';
	import HeaderActionMenuItem from '$lib/ui/HeaderActionMenuItem.svelte';
	import MobileSideDrawer from '$lib/ui/MobileSideDrawer.svelte';
	import { Button } from '@nais/ds-svelte-community';
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
	let mobileNavOpen = $state(false);

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

	afterNavigate(() => {
		mobileNavOpen = false;
	});
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

	<InternalHeaderButton
		class="mobile-nav-trigger"
		aria-label="Open navigation menu"
		aria-expanded={mobileNavOpen}
		aria-controls="mobile-navigation-drawer"
		onclick={() => {
			mobileNavOpen = true;
		}}
	>
		<MenuHamburgerIcon title="Navigation" />
	</InternalHeaderButton>
	<MobileSideDrawer bind:open={mobileNavOpen} id="mobile-navigation-drawer" title="Navigation">
		<nav class="mobile-drawer-nav" aria-label="Navigation">
			<div class="mobile-drawer-section">
				{#each navItems as item (item.href)}
					<a
						href={item.href}
						class:active={isActive(item.href)}
						class="mobile-drawer-link"
						aria-current={isActive(item.href) ? 'page' : undefined}
						onclick={() => {
							mobileNavOpen = false;
						}}
					>
						{item.label}
					</a>
				{/each}
			</div>
			<div class="mobile-drawer-section">
				<p class="mobile-drawer-section-label">Tools</p>
				<button
					type="button"
					class="mobile-drawer-link mobile-drawer-button"
					onclick={() => {
						mobileNavOpen = false;
						feedbackOpen = true;
					}}
				>
					Feedback
				</button>
			</div>
		</nav>
	</MobileSideDrawer>

	<div class="header-spacer" aria-hidden="true"></div>
	<div class="feedback-button-wrapper">
		<Button
			variant="tertiary-neutral"
			icon={ChatElipsisIcon}
			size="small"
			aria-label="Feedback"
			onclick={() => {
				feedbackOpen = true;
			}}
		>
			<span class="feedback-button-label">Feedback</span>
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

	.feedback-button-label {
		font-weight: 400;
	}

	/* Desktop navigation */
	.desktop-nav {
		display: flex;
		gap: 0;
	}

	.header-spacer {
		flex: 1 1 auto;
		min-width: 0;
	}

	/* Mobile nav trigger is hidden on desktop by default */
	:global(.mobile-nav-trigger) {
		display: none;
	}

	.mobile-drawer-nav {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-20);
	}

	.mobile-drawer-section {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-4);
	}

	.mobile-drawer-section-label {
		margin: 0;
		padding: 0 var(--ax-space-8);
		color: var(--ax-text-neutral-subtle);
		font-size: var(--ax-font-size-small);
		font-weight: var(--ax-font-weight-bold);
	}

	.mobile-drawer-link {
		display: flex;
		align-items: center;
		width: 100%;
		min-height: 44px;
		padding: var(--ax-space-8);
		border: none;
		border-radius: 4px;
		background: transparent;
		color: inherit;
		font: inherit;
		font-weight: var(--ax-font-weight-bold);
		text-align: left;
		text-decoration: none;
		transition: background-color 50ms;
		cursor: pointer;

		&:focus-visible,
		&:hover {
			background-color: color-mix(in oklab, var(--active-color) 60%, transparent);
			box-shadow: none;
			color: inherit;
		}

		&:active {
			background-color: var(--active-color-strong);
			box-shadow: none;
			color: inherit;
		}

		&.active {
			background-color: var(--active-color);
		}
	}

	.mobile-drawer-button {
		appearance: none;
	}

	@media (max-width: 960px) {
		.logo {
			gap: 0.75rem;
			font-size: 1.25rem;
		}

		.feedback-button-wrapper {
			padding: 0 var(--ax-space-8);
		}

		.feedback-button-label {
			display: none;
		}

		.desktop-nav :global(.aksel-internalheader__button) {
			padding-inline: var(--ax-space-8);
		}

		:global(.aksel-internalheader__user-button) {
			min-width: 0;
			max-width: 12rem;
			padding-inline: var(--ax-space-12);
			gap: var(--ax-space-8);
		}

		:global(.aksel-internalheader__user-button > div) {
			min-width: 0;
			overflow: hidden;
		}

		:global(.aksel-internalheader__user-button > div > *) {
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
	}

	/* Mobile responsive behavior */
	@media (max-width: 768px) {
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
