<script lang="ts">
	import { page } from '$app/stores';
	import Feedback from '$lib/feedback/Feedback.svelte';
	import BigQueryIcon from '$lib/icons/BigQueryIcon.svelte';
	import KafkaIcon from '$lib/icons/KafkaIcon.svelte';
	import OpenSearchIcon from '$lib/icons/OpenSearchIcon.svelte';
	import RedisIcon from '$lib/icons/RedisIcon.svelte';
	import UnleashIcon from '$lib/icons/UnleashIcon.svelte';
	import { replacer, type Data } from '$lib/replacer';
	import { Alert, BodyLong, Button } from '@nais/ds-svelte-community';
	import {
		BellIcon,
		BranchingIcon,
		BriefcaseClockIcon,
		BucketIcon,
		CogIcon,
		DatabaseIcon,
		Density3Icon,
		FileTextIcon,
		ImageIcon,
		LineGraphIcon,
		LineGraphStackedIcon,
		PackageIcon,
		PadlockLockedIcon,
		PersonGroupIcon,
		PersonIcon,
		RocketIcon,
		ShieldLockIcon,
		TrashIcon,
		VirusIcon,
		WalletIcon
	} from '@nais/ds-svelte-community/icons';
	import type { Component } from 'svelte';
	import type { LayoutData } from './$houdini';

	interface Props {
		data: LayoutData;
		children?: import('svelte').Snippet;
	}

	let { data, children }: Props = $props();
	let { deletionInProgress, lastSuccessfulSync, teamSlug } = $derived(data);

	let feedbackOpen = $state(false);

	// /team/[team]/(teamPages)/{KEY IN MAP}: name of crumb
	const simpleTeamPages: { [key: string]: { name: string; icon?: Component } } = {
		applications: { name: 'applications' },
		jobs: { name: 'jobs' },
		deploy: { name: 'deployments', icon: RocketIcon },
		cost: { name: 'cost', icon: WalletIcon },
		utilization: { name: 'utilization', icon: LineGraphStackedIcon },
		members: { name: 'members', icon: PersonIcon },
		repositories: { name: 'repositories', icon: BranchingIcon },
		settings: { name: 'settings', icon: CogIcon },
		'activity-log': { name: 'activity log', icon: ShieldLockIcon },
		secrets: { name: 'secrets' },
		postgres: { name: 'postgres' },
		buckets: { name: 'buckets' },
		redis: { name: 'redis' },
		opensearch: { name: 'opensearch' },
		kafka: { name: 'kafka topics' },
		bigquery: { name: 'bigquery' },
		unleash: { name: 'unleash', icon: UnleashIcon },
		vulnerabilities: { name: 'vulnerabilities', icon: VirusIcon }
	};

	const simpleJobPages: { [key: string]: { name: string; icon?: Component } } = {
		'': { name: '' }, // overview
		status: { name: 'status', icon: BellIcon },
		deploys: { name: 'deployments', icon: RocketIcon },
		cost: { name: 'cost', icon: WalletIcon },
		logs: { name: 'logs', icon: Density3Icon },
		manifest: { name: 'manifest', icon: FileTextIcon },
		delete: { name: 'delete', icon: TrashIcon },
		image: { name: 'image details', icon: ImageIcon }
	};
	const simpleAppPages: { [key: string]: { name: string; icon?: Component } } = {
		'': { name: '' }, // overview
		status: { name: 'status', icon: BellIcon },
		deploys: { name: 'deployments', icon: RocketIcon },
		cost: { name: 'cost', icon: WalletIcon },
		utilization: { name: 'utilization', icon: LineGraphIcon },
		logs: { name: 'logs', icon: Density3Icon },
		manifest: { name: 'manifest', icon: FileTextIcon },
		delete: { name: 'delete', icon: TrashIcon },
		image: { name: 'image details', icon: ImageIcon }
	};

	const pages: {
		[key: string]: (
			params: Data
		) => { name: string; path?: string; icon?: Component; showEnv?: boolean }[];
	} = {
		'/team/[team]/(teamPages)/[env]/secret/[secret]': (params: Data) => {
			return [
				{
					name: 'secrets',
					path: replacer('/team/[team]/(teamPages)/secrets', params)
				},
				{
					name: params.secret,
					path: replacer('/team/[team]/(teamPages)/[env]/secret/[secret]', params),
					icon: PadlockLockedIcon,
					showEnv: true
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
					name: params.postgres,
					path: replacer('/team/[team]/(teamPages)/[env]/postgres/[postgres]', params),
					icon: DatabaseIcon,
					showEnv: true
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
					name: params.bucket,
					path: replacer('/team/[team]/(teamPages)/[env]/bucket/[bucket]', params),
					icon: BucketIcon,
					showEnv: true
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
					name: params.redis,
					path: replacer('/team/[team]/(teamPages)/[env]/redis/[redis]', params),
					icon: RedisIcon,
					showEnv: true
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
					name: params.opensearch,
					path: replacer('/team/[team]/(teamPages)/[env]/opensearch/[opensearch]', params),
					icon: OpenSearchIcon,
					showEnv: true
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
					name: params.kafka,
					path: replacer('/team/[team]/(teamPages)/[env]/kafka/[kafka]', params),
					icon: KafkaIcon,
					showEnv: true
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
					name: params.bigquery,
					path: replacer('/team/[team]/(teamPages)/[env]/bigquery/[bigquery]', params),
					icon: BigQueryIcon,
					showEnv: true
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
					name: params.job,
					path: replacer('/team/[team]/[env]/job/[job]', params),
					icon: BriefcaseClockIcon,
					showEnv: true
				},
				{
					name: simpleJobPages[key].name,
					path: replacer(`/team/[team]/[env]/job/[job]/${key}`, params),
					icon: simpleJobPages[key].icon
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
					name: params.app,
					path: replacer('/team/[team]/[env]/app/[app]', params),
					icon: PackageIcon,
					showEnv: true
				},
				{
					name: simpleAppPages[key].name,
					path: replacer(`/team/[team]/[env]/app/[app]/${key}`, params),
					icon: simpleAppPages[key].icon
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
					name: simpleTeamPages[key].name,
					path: replacer(`/team/[team]/(teamPages)/${key}`, params),
					icon: simpleTeamPages[key].icon
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
			<a class="unstyled" href="/team/{teamSlug}"
				><div class="typeIcon">
					<PersonGroupIcon />
				</div>
				<div>
					{teamSlug}
				</div>
			</a>

			{#each crumbs($page.route.id, $page.params) as item}
				<BodyLong style="height: 28px; width: 28px; text-align: center; color: var(--a-gray-500);"
					>/</BodyLong
				>
				{#if item.path}
					<a class="unstyled" href={item.path}>
						{#if item.icon}
							<div class="typeIcon">
								<item.icon />
							</div>
						{/if}
						<div>
							{item.name}
							{#if item.showEnv}
								<div class="env">
									{$page.params.env}
								</div>
							{/if}
						</div>
					</a>
				{:else}
					<span>{item.name}</span>
				{/if}
			{/each}
		</nav>
		<div>
			<Button
				variant="secondary"
				size="small"
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
		width: 100%;
	}

	.env {
		font-size: 0.75rem;
		color: var(--a-text-subtle);
	}

	.typeIcon {
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.breadcrumbs {
		display: flex;
		background: var(--active-color);
		padding: 0.5rem 0;
		border-bottom: 1px solid var(--active-color-strong);
		align-items: center;
		height: 57px;
	}

	.breadcrumbs .page {
		display: flex;
		justify-content: space-between;
		margin: 0 auto;
		align-items: center;
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
