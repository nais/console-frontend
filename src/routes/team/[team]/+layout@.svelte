<script lang="ts">
	import { page } from '$app/stores';
	import Feedback from '$lib/feedback/Feedback.svelte';
	import BigQuery from '$lib/icons/BigQuery.svelte';
	import Kafka from '$lib/icons/Kafka.svelte';
	import Redis from '$lib/icons/Redis.svelte';
	import Unleash from '$lib/icons/Unleash.svelte';
	import { replacer, type Data } from '$lib/replacer';
	import { Alert, BodyLong, Button } from '@nais/ds-svelte-community';
	import {
		ArrowCirclepathIcon,
		ArrowsSquarepathIcon,
		BucketIcon,
		DatabaseIcon,
		MagnifyingGlassIcon,
		PackageIcon,
		PadlockLockedIcon,
		WalletIcon
	} from '@nais/ds-svelte-community/icons';
	import type { LayoutData } from './$houdini';

	interface Props {
		data: LayoutData;
		children?: import('svelte').Snippet;
	}

	let { data, children }: Props = $props();
	let { deletionInProgress, lastSuccessfulSync, teamSlug } = $derived(data);

	let feedbackOpen = $state(false);

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
			<a href="/team/{teamSlug}" class="unstyled">{teamSlug}</a>

			{#each crumbs($page.route.id, $page.params) as { name, path }}
				<BodyLong style="height: 28px; width: 28px; text-align: center; color: var(--a-gray-500);"
					>/</BodyLong
				>
				{#if path}
					{#if path.match(/app\/[a-zA-Z0-9-]+/)}
						<a class="unstyled" href={path}><PackageIcon /> {name}</a>
					{:else if path.match(/job\/[a-zA-Z0-9-]+/)}
						<a class="unstyled" href={path}><ArrowCirclepathIcon /> {name}</a>
					{:else if path.match(/(secret)\/[a-zA-Z0-9-]+/)}
						<a class="unstyled" href={path}><PadlockLockedIcon /> {name}</a>
					{:else if path.match(/(postgres)\/[a-zA-Z0-9-]+/)}
						<a class="unstyled" href={path}><DatabaseIcon /> {name}</a>
					{:else if path.match(/(bucket)\/[a-zA-Z0-9-]+/)}
						<a class="unstyled" href={path}><BucketIcon /> {name}</a>
					{:else if path.match(/(redis)\/[a-zA-Z0-9-]+/)}
						<a class="unstyled" href={path}><Redis /> {name}</a>
					{:else if path.match(/(opensearch)\/[a-zA-Z0-9-]+/)}
						<a class="unstyled" href={path}><MagnifyingGlassIcon /> {name}</a>
					{:else if path.match(/(kafka)\/[a-zA-Z0-9-]+/)}
						<a class="unstyled" href={path}><Kafka /> {name}</a>
					{:else if path.match(/(bigquery)\/[a-zA-Z0-9-]+/)}
						<a class="unstyled" href={path}><BigQuery /> {name}</a>
					{:else if path.match(/(unleash)/)}
						<a class="unstyled" href={path}><Unleash /> {name}</a>
					{:else if path.match(/(deploy)/)}
						<a class="unstyled" href={path}><ArrowsSquarepathIcon /> {name}</a>
					{:else if path.match(/(cost)/)}
						<a class="unstyled" href={path}><WalletIcon /> {name}</a>
					{:else}
						<a class="unstyled" href={path}>{name}</a>
					{/if}
				{:else}
					<span>{name}</span>
				{/if}
			{/each}
		</nav>
		<div>
			<Button
				variant="secondary"
				size="xsmall"
				onclick={() => {
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
		<Alert variant="success" style="margin-bottom: 1rem;" contentMaxWidth={false}
			>The team and all of its resources is currently beeing created. Expected time to completion is
			about 15 minutes.</Alert
		>
	{/if}
	{@render children?.()}
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

	.unstyled {
		text-decoration: none;
		color: inherit;
		display: flex;
		gap: 0.2rem;
		align-items: center;
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
