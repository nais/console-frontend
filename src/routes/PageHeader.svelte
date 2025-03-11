<script lang="ts">
	import { page } from '$app/state';
	import SearchButton from '$lib/components/search/SearchButton.svelte';
	import { docURL } from '$lib/doc';
	import Feedback from '$lib/feedback/Feedback.svelte';
	import { Button } from '@nais/ds-svelte-community';
	import {
		ActionMenu,
		ActionMenuDivider,
		ActionMenuItem
	} from '@nais/ds-svelte-community/experimental.js';
	import { ChevronDownIcon, LeaveIcon } from '@nais/ds-svelte-community/icons';
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

<div class="header">
	<div class="header-content">
		<div class="header-left">
			<a href="/" class="logo">
				<Logo height="1.8rem" />
				<span>Console</span>
			</a>
			<nav>
				<a href="/utilization" class:active={page.url.pathname === '/utilization'}>Utilization</a>
				<a href={docURL()}>Docs</a>
			</nav>
			<Button variant="primary-neutral" size="small" onclick={() => (feedbackOpen = true)}
				><span style="font-weight: 400">Feedback</span></Button
			>
			{#if feedbackOpen}
				<Feedback bind:open={feedbackOpen} />
			{/if}
		</div>
		<div class="right">
			<SearchButton />
			<ActionMenu>
				{#snippet trigger(props)}
					<button class="user-menu-button" {...props}>
						{user ? user.name : 'unauthorized'}
						<ChevronDownIcon />
					</button>
				{/snippet}
				{#if user?.isAdmin}
					<a href="/admin" class="unstyled action-menu-link">
						<ActionMenuItem>🕴️Admin</ActionMenuItem>
					</a>
					<ActionMenuDivider />
				{/if}
				<a href="/oauth2/logout" class="unstyled action-menu-link">
					<ActionMenuItem>
						<LeaveIcon />
						Logout
					</ActionMenuItem>
				</a>
			</ActionMenu>
		</div>
	</div>
</div>

<style>
	.action-menu-link {
		text-decoration: none;
		display: grid;
	}

	.user-menu-button {
		background: none;
		border: none;
		padding: 1rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: var(--a-spacing-1);

		&:hover {
			background-color: var(--a-surface-inverted-hover);
		}
	}
	.right {
		display: flex;
		gap: var(--a-spacing-4);
		align-items: center;
	}

	.header-left {
		display: flex;
		gap: var(--a-spacing-8);
		align-items: center;
	}

	.header {
		background: var(--a-surface-inverted);
		color: var(--a-text-on-inverted);
		display: flex;
		padding-inline: 2rem;
		min-width: 1000px;
		position: relative;
	}

	.header-content {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		margin: auto;
		width: 100%;
		min-width: 1000px;
		max-width: 1432px;
		align-items: center;
	}
	.logo {
		color: var(--a-text-on-inverted);
		text-decoration: none;
		display: flex;
		gap: 1rem;
		font-size: 1.5rem;
		font-weight: bold;
	}
	nav {
		display: flex;
		gap: var(--a-spacing-1);
	}
	nav > a {
		text-decoration: none;
		color: var(--a-text-on-inverted);
		background-color: var(--a-surface-inverted);
		display: flex;
		align-items: center;
		padding: 1rem;

		&.active,
		&:hover {
			background-color: var(--a-surface-inverted-hover);
		}
	}
</style>
