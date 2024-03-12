<script lang="ts">
	import { page } from '$app/stores';
	import { replacer, type Data } from '$lib/replacer';
	import { ChevronRightIcon } from '@nais/ds-svelte-community/icons';

	// /team/[team]/(teamPages)/{KEY IN MAP}: name of crumb
	const simpleTeamPages: { [key: string]: string } = {
		applications: 'apps',
		jobs: 'jobs',
		secrets: 'secrets',
		deploy: 'deploys',
		cost: 'cost',
		utilization: 'utilization',
		vulnerabilities: 'vulnerabilities',
		members: 'members',
		repositories: 'repositories',
		settings: 'settings'
	};

	const pages: { [key: string]: (params: Data) => { name: string; path: string }[] } = {
		'/team/[team]/(teamPages)/settings/audit_logs': (params: Data) => {
			return [
				{
					name: 'settings',
					path: replacer('/team/[team]/(teamPages)/settings', params)
				},
				{
					name: 'audit logs',
					path: replacer('/team/[team]/(teamPages)/settings/audit_logs', params)
				}
			];
		}
	};

	for (const key in simpleTeamPages) {
		pages[`/team/[team]/(teamPages)/${key}`] = (params: Data) => {
			return [
				{
					name: simpleTeamPages[key],
					path: replacer(`/team/[team]/(teamPages)/${key}`, params)
				}
			];
		};
	}

	function crumbs(routeId: string | null, params: Data) {
		if (!routeId) {
			return [];
		}
		const found = pages[routeId];
		if (found) {
			return found(params);
		}
		return [];
	}
</script>

<div class="breadcrumbs">
	<div class="page">
		<nav>
			<a href="/team/{$page.params.team}">{$page.params.team}</a>

			{#each crumbs($page.route.id, $page.params) as { name, path }}
				<ChevronRightIcon style="font-size: 1.5rem" /> <a href={path}>{name}</a>
			{/each}
		</nav>
	</div>
</div>

<div class="page">
	<slot />
</div>

<style>
	.page {
		margin-top: 1rem;
	}

	.breadcrumbs {
		background: var(--active-color);
		padding: 0.5rem 0;
		border-bottom: 1px solid var(--active-color-strong);
	}

	a {
		color: var(--a-text-default);
		text-decoration: none;
	}

	a:hover {
		text-decoration: underline;
	}

	.breadcrumbs .page {
		margin: 0 auto;
	}

	nav {
		display: flex;
		align-items: center;
	}
</style>
