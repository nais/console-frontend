<script lang="ts">
	import { page } from '$app/state';
	import { docURL, tenantURL } from '$lib/doc';
	import SearchButton from '$lib/domain/search/SearchButton.svelte';
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
		<InternalHeaderButton as="a" href="/utilization" class={{ active: isActive('/utilization') }}>
			Utilization
		</InternalHeaderButton>
		<InternalHeaderButton as="a" href="/cost" class={{ active: isActive('/cost') }}>
			Cost
		</InternalHeaderButton>
		<InternalHeaderButton
			as="a"
			href="/vulnerabilities"
			class={{ active: isActive('/vulnerabilities') }}
		>
			Vulnerabilities
		</InternalHeaderButton>
		<InternalHeaderButton as="a" href="/deployments" class={{ active: isActive('/deployments') }}>
			Deployments
		</InternalHeaderButton>
	</div>

	<!-- Mobile navigation menu -->
	<ActionMenu>
		{#snippet trigger(props)}
			<InternalHeaderButton class="mobile-nav-trigger" {...props}>
				<MenuHamburgerIcon title="Navigation" />
			</InternalHeaderButton>
		{/snippet}
		<ActionMenuGroup label="Navigation">
			{#each navItems as item (item.href)}
				<ActionMenuItem>
					<a
						href={item.href}
						class="action-menu-link"
						style:font-weight={isActive(item.href) ? 'bold' : 'normal'}
					>
						{item.label}
					</a>
				</ActionMenuItem>
			{/each}
		</ActionMenuGroup>
		<ActionMenuDivider />
		<ActionMenuGroup label="Tools">
			<ActionMenuItem icon={ChatElipsisIcon}>
				<button type="button" class="action-menu-button" onclick={() => (feedbackOpen = true)}>
					Feedback
				</button>
			</ActionMenuItem>
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

	.action-menu-link {
		color: var(--ax-text-neutral);
		text-decoration: none;
	}

	.action-menu-button {
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		color: var(--ax-text-neutral);
		font: inherit;
		text-align: left;
	}
</style>
