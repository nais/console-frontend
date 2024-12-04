<script lang="ts">
	import { page } from '$app/stores';
	import Feedback from '$lib/feedback/Feedback.svelte';
	import { replacer, type Data } from '$lib/replacer';
	import { Alert, Button } from '@nais/ds-svelte-community';
	import { ChevronRightIcon } from '@nais/ds-svelte-community/icons';
	import type { LayoutData } from './$houdini';

	export let data: LayoutData;
	$: ({ deletionInProgress, lastSuccessfulSync } = data);

	let feedbackOpen = false;

	// /team/[team]/(teamPages)/{KEY IN MAP}: name of crumb
	const simpleTeamPages: { [key: string]: string } = {
		applications: 'applications',
		jobs: 'jobs',
		deploy: 'deployments',
		cost: 'cost',
		utilization: 'utilization',
		members: 'members',
		repositories: 'repositories',
		settings: 'settings',
		'activity-log': 'activity log',
		secrets: 'secrets',
		postgres: 'postgres',
		buckets: 'buckets',
		redis: 'redis',
		opensearch: 'opensearch',
		kafka: 'kafka topics',
		bigquery: 'bigquery',
		unleash: 'unleash',
		vulnerabilities: 'vulnerabilities'
	};

	const simpleJobPages: { [key: string]: string } = {
		'': '', // overview
		status: 'status',
		deploys: 'deployments',
		cost: 'cost',
		logs: 'logs',
		manifest: 'manifest',
		delete: 'delete',
		image: 'image details'
	};
	const simpleAppPages: { [key: string]: string } = {
		'': '', // overview
		status: 'status',
		deploys: 'deployments',
		cost: 'cost',
		utilization: 'utilization',
		logs: 'logs',
		manifest: 'manifest',
		delete: 'delete',
		image: 'image details'
	};

	const pages: { [key: string]: (params: Data) => { name: string; path?: string }[] } = {
		'/team/[team]/(teamPages)/[env]/secret/[secret]': (params: Data) => {
			return [
				{
					name: 'secrets',
					path: replacer('/team/[team]/(teamPages)/secrets', params)
				},
				{
					name: params.env
				},
				{
					name: params.secret,
					path: replacer('/team/[team]/(teamPages)/[env]/secret/[secret]', params)
				}
			];
		},
		'/team/[team]/(teamPages)/[env]/postgres/[postgres]': (params: Data) => {
			return [
				{
					name: 'postgres',
					path: replacer('/team/[team]/(teamPages)/postgres', params)
				},
				{
					name: params.env
				},
				{
					name: params.postgres,
					path: replacer('/team/[team]/(teamPages)/[env]/postgres/[postgres]', params)
				}
			];
		},
		'/team/[team]/(teamPages)/[env]/bucket/[bucket]': (params: Data) => {
			return [
				{
					name: 'buckets',
					path: replacer('/team/[team]/(teamPages)/buckets', params)
				},
				{
					name: params.env
				},
				{
					name: params.bucket,
					path: replacer('/team/[team]/(teamPages)/[env]/bucket/[bucket]', params)
				}
			];
		},
		'/team/[team]/(teamPages)/[env]/redis/[redis]': (params: Data) => {
			return [
				{
					name: 'redis',
					path: replacer('/team/[team]/(teamPages)/redis', params)
				},
				{
					name: params.env
				},
				{
					name: params.redis,
					path: replacer('/team/[team]/(teamPages)/[env]/redis/[redis]', params)
				}
			];
		},
		'/team/[team]/(teamPages)/[env]/opensearch/[opensearch]': (params: Data) => {
			return [
				{
					name: 'opensearch',
					path: replacer('/team/[team]/(teamPages)/opensearch', params)
				},
				{
					name: params.env
				},
				{
					name: params.opensearch,
					path: replacer('/team/[team]/(teamPages)/[env]/opensearch/[opensearch]', params)
				}
			];
		},
		'/team/[team]/(teamPages)/[env]/kafka/[kafka]': (params: Data) => {
			return [
				{
					name: 'kafka topic',
					path: replacer('/team/[team]/(teamPages)/kafka', params)
				},
				{
					name: params.env
				},
				{
					name: params.kafka,
					path: replacer('/team/[team]/(teamPages)/[env]/kafka/[kafka]', params)
				}
			];
		},
		'/team/[team]/(teamPages)/[env]/bigquery/[bigquery]': (params: Data) => {
			return [
				{
					name: 'bigquery',
					path: replacer('/team/[team]/(teamPages)/bigquery', params)
				},
				{
					name: params.env
				},
				{
					name: params.bigquery,
					path: replacer('/team/[team]/(teamPages)/[env]/bigquery/[bigquery]', params)
				}
			];
		}
	};

	for (const key in simpleJobPages) {
		pages[`/team/[team]/[env]/job/[job]${key ? '/' + key : ''}`] = (params: Data) => {
			const ret = [
				{
					name: 'jobs',
					path: replacer('/team/[team]/jobs', params)
				},
				{
					name: params.env
				},
				{
					name: params.job,
					path: replacer('/team/[team]/[env]/job/[job]', params)
				},
				{
					name: simpleJobPages[key],
					path: replacer(`/team/[team]/[env]/job/[job]/${key}`, params)
				}
			];

			if (key === '') {
				ret.pop();
			}

			return ret;
		};
	}

	for (const key in simpleAppPages) {
		pages[`/team/[team]/[env]/app/[app]${key ? '/' + key : ''}`] = (params: Data) => {
			const ret = [
				{
					name: 'applications',
					path: replacer('/team/[team]/applications', params)
				},
				{
					name: params.env
				},

				{
					name: params.app,
					path: replacer('/team/[team]/[env]/app/[app]', params)
				},
				{
					name: simpleAppPages[key],
					path: replacer(`/team/[team]/[env]/app/[app]/${key}`, params)
				}
			];

			if (key === '') {
				ret.pop();
			}

			return ret;
		};
	}

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
				<ChevronRightIcon style="font-size: 1.5rem" />
				{#if path}
					<a href={path}>{name}</a>
				{:else}
					<span>{name}</span>
				{/if}
			{/each}
		</nav>
		<div>
			<Button
				variant="secondary"
				size="xsmall"
				on:click={() => {
					feedbackOpen = true;
				}}>Feedback</Button
			>
		</div>
	</div>
</div>

<div class="page">
	{#if deletionInProgress}
		<Alert variant="warning" style="margin-bottom: 1rem;"
			>The team and all of its resources is currently being deleted.</Alert
		>
	{/if}
	{#if !lastSuccessfulSync && !deletionInProgress}
		<Alert variant="success" style="margin-bottom: 1rem;"
			>The team and all of its resources is currently beeing created. Expected time to completion is
			about 15 minutes.</Alert
		>
	{/if}
	<slot />
</div>

{#if feedbackOpen}
	<Feedback bind:open={feedbackOpen} />
{/if}

<style>
	.page {
		margin-top: 1rem;
	}

	.breadcrumbs {
		background: var(--active-color);
		padding: 0.5rem 0;
		border-bottom: 1px solid var(--active-color-strong);
	}

	.breadcrumbs .page {
		display: flex;
		justify-content: space-between;
		margin: 0 auto;
	}

	span {
		color: var(--a-text-subtle);
	}

	a {
		color: var(--a-text-default);
		text-decoration: none;
		--ac-link-active-bg: var(--active-color-strong);
		--ac-link-active-border: var(--active-color-strong);
		--ac-link-active-text: var(--a-text-default);
	}

	a:hover {
		text-decoration: underline;
	}

	nav {
		display: flex;
		align-items: center;
	}
</style>
