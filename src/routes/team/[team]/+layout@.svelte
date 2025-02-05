<script lang="ts">
	import { page } from '$app/stores';
	import IconWithText from '$lib/components/IconWithText.svelte';
	import Feedback from '$lib/feedback/Feedback.svelte';
	import BigQueryIcon from '$lib/icons/BigQueryIcon.svelte';
	import KafkaIcon from '$lib/icons/KafkaIcon.svelte';
	import OpenSearchIcon from '$lib/icons/OpenSearchIcon.svelte';
	import RedisIcon from '$lib/icons/RedisIcon.svelte';
	import UnleashIcon from '$lib/icons/UnleashIcon.svelte';
	import ValkeyIcon from '$lib/icons/ValkeyIcon.svelte';
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
		applications: { name: 'Applications', icon: PackageIcon },
		jobs: { name: 'Jobs', icon: BriefcaseClockIcon },
		deploy: { name: 'Deployments', icon: RocketIcon },
		cost: { name: 'Cost', icon: WalletIcon },
		utilization: { name: 'utilization', icon: LineGraphStackedIcon },
		members: { name: 'members', icon: PersonIcon },
		repositories: { name: 'repositories', icon: BranchingIcon },
		settings: { name: 'settings', icon: CogIcon },
		'activity-log': { name: 'activity log', icon: ShieldLockIcon },
		secrets: { name: 'secrets', icon: PadlockLockedIcon },
		postgres: { name: 'postgres', icon: DatabaseIcon },
		buckets: { name: 'buckets', icon: BucketIcon },
		redis: { name: 'redis', icon: RedisIcon },
		valkey: { name: 'valkey', icon: ValkeyIcon },
		opensearch: { name: 'opensearch', icon: OpenSearchIcon },
		kafka: { name: 'kafka topics', icon: KafkaIcon },
		bigquery: { name: 'bigquery', icon: BigQueryIcon },
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
		utilization: { name: 'utilization', icon: LineGraphStackedIcon },
		logs: { name: 'logs', icon: Density3Icon },
		manifest: { name: 'manifest', icon: FileTextIcon },
		delete: { name: 'delete', icon: TrashIcon },
		image: { name: 'image details', icon: ImageIcon }
	};

	const pages: {
		[key: string]: (
			params: Data
		) => { name: string; path?: string; icon?: Component; showEnv?: boolean; isHeader?: boolean }[];
	} = {
		'/team/[team]/(teamPages)/[env]/secret/[secret]': (params: Data) => {
			return [
				{
					name: 'secrets',
					path: replacer('/team/[team]/(teamPages)/secrets', params),
					icon: PadlockLockedIcon
				},
				{
					name: params.secret,
					path: replacer('/team/[team]/(teamPages)/[env]/secret/[secret]', params),
					showEnv: true
				}
			];
		},
		'/team/[team]/(teamPages)/[env]/postgres/[postgres]': (params: Data) => {
			return [
				{
					name: 'postgres',
					path: replacer('/team/[team]/(teamPages)/postgres', params),
					icon: DatabaseIcon
				},
				{
					name: params.postgres,
					path: replacer('/team/[team]/(teamPages)/[env]/postgres/[postgres]', params),
					showEnv: true
				}
			];
		},
		'/team/[team]/(teamPages)/[env]/bucket/[bucket]': (params: Data) => {
			return [
				{
					name: 'buckets',
					path: replacer('/team/[team]/(teamPages)/buckets', params),
					icon: BucketIcon
				},
				{
					name: params.bucket,
					path: replacer('/team/[team]/(teamPages)/[env]/bucket/[bucket]', params),
					showEnv: true
				}
			];
		},
		'/team/[team]/(teamPages)/[env]/redis/[redis]': (params: Data) => {
			return [
				{
					name: 'redis',
					icon: RedisIcon,
					path: replacer('/team/[team]/(teamPages)/redis', params)
				},
				{
					name: params.redis,
					path: replacer('/team/[team]/(teamPages)/[env]/redis/[redis]', params),
					showEnv: true
				}
			];
		},
		'/team/[team]/(teamPages)/[env]/valkey/[valkey]': (params: Data) => {
			return [
				{
					name: 'valkey',
					path: replacer('/team/[team]/(teamPages)/valkey', params),
					icon: ValkeyIcon
				},
				{
					name: params.valkey,
					path: replacer('/team/[team]/(teamPages)/[env]/valkey/[valkey]', params),
					showEnv: true
				}
			];
		},
		'/team/[team]/(teamPages)/[env]/opensearch/[opensearch]': (params: Data) => {
			return [
				{
					name: 'opensearch',
					path: replacer('/team/[team]/(teamPages)/opensearch', params),
					icon: OpenSearchIcon
				},
				{
					name: params.opensearch,
					path: replacer('/team/[team]/(teamPages)/[env]/opensearch/[opensearch]', params),
					showEnv: true
				}
			];
		},
		'/team/[team]/(teamPages)/[env]/kafka/[kafka]': (params: Data) => {
			return [
				{
					name: 'kafka topic',
					path: replacer('/team/[team]/(teamPages)/kafka', params),
					icon: KafkaIcon
				},
				{
					name: params.kafka,
					path: replacer('/team/[team]/(teamPages)/[env]/kafka/[kafka]', params),
					showEnv: true
				}
			];
		},
		'/team/[team]/(teamPages)/[env]/bigquery/[bigquery]': (params: Data) => {
			return [
				{
					name: 'bigquery',
					path: replacer('/team/[team]/(teamPages)/bigquery', params),
					icon: BigQueryIcon
				},
				{
					name: params.bigquery,
					path: replacer('/team/[team]/(teamPages)/[env]/bigquery/[bigquery]', params),
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
					path: replacer('/team/[team]/jobs', params),
					icon: BriefcaseClockIcon
				},
				{
					name: params.job,
					path: replacer('/team/[team]/[env]/job/[job]', params),
					icon: BriefcaseClockIcon,
					showEnv: true,
					isHeader: true
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
					path: replacer('/team/[team]/applications', params),
					icon: PackageIcon
				},
				{
					name: params.app,
					path: replacer('/team/[team]/[env]/app/[app]', params),
					showEnv: true,
					isHeader: true,
					icon: PackageIcon
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

	function header(
		routeId: string | null,
		params: Data
	): {
		name: string;
		path?: string;
		icon?: Component;
		showEnv?: boolean;
		isHeader?: boolean;
	} | null {
		if (!routeId) {
			return null;
		}
		const found = pages[routeId];
		if (found) {
			const items = found(params);
			return items.find((item) => item.isHeader) || null;
		}
		return null;
	}
</script>

<div class="breadcrumbs">
	<div class="page">
		<nav>
			<a class="unstyled" href="/team/{teamSlug}">
				<IconWithText text={teamSlug} size="medium" icon={PersonGroupIcon} />
			</a>

			{#each crumbs($page.route.id, $page.params) as item}
				<BodyLong style="height: 28px; width: 28px; text-align: center; color: var(--a-gray-500);"
					>/</BodyLong
				>
				{#if item.path}
					<a class="unstyled" href={item.path}>
						{#if item.icon && !item.isHeader}
							<IconWithText text={item.name} size="medium" icon={item.icon} />
						{:else}
							<IconWithText text={item.name} size="medium" />
						{/if}
					</a>
				{:else}
					<span>{item.name}</span>
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
	{#if header($page.route.id, $page.params)?.isHeader}
		{@const item = header($page.route.id, $page.params)}
		<div class="header">
			{#if item?.icon}
				<div class="type-icon-header">
					<item.icon height={'48px'} width={'48px'} />
				</div>
			{/if}
			<div>
				<h2>{header($page.route.id, $page.params)?.name}</h2>
				{#if item?.showEnv}
					<div class="env-header">
						{$page.params.env}
					</div>
				{/if}
			</div>
		</div>
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

	.header {
		display: flex;
		align-items: center;
		margin-bottom: 1rem;
		gap: 1rem;
	}

	.env-header {
		color: var(--a-text-subtle);
		font-size: 1rem;
	}

	.type-icon-header {
		display: flex;
		flex-direction: row;
	}

	.breadcrumbs {
		display: flex;
		background: var(--active-color);
		padding: 0.5rem 0;
		border-bottom: 1px solid var(--active-color-strong);
		align-items: center;
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
