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
		utilization: { name: 'Utilization', icon: LineGraphStackedIcon },
		members: { name: 'Members', icon: PersonIcon },
		repositories: { name: 'Repositories', icon: BranchingIcon },
		settings: { name: 'Settings', icon: CogIcon },
		'activity-log': { name: 'Activity log', icon: ShieldLockIcon },
		secrets: { name: 'Secrets', icon: PadlockLockedIcon },
		postgres: { name: 'Postgres', icon: DatabaseIcon },
		buckets: { name: 'Buckets', icon: BucketIcon },
		redis: { name: 'Redis', icon: RedisIcon },
		valkey: { name: 'Valkey', icon: ValkeyIcon },
		opensearch: { name: 'OpenSearch', icon: OpenSearchIcon },
		kafka: { name: 'Kafka topics', icon: KafkaIcon },
		bigquery: { name: 'BigQuery', icon: BigQueryIcon },
		unleash: { name: 'Unleash', icon: UnleashIcon },
		vulnerabilities: { name: 'Vulnerabilities', icon: VirusIcon }
	};

	const simpleJobPages: { [key: string]: { name: string; icon?: Component } } = {
		'': { name: '' }, // overview
		status: { name: 'Status', icon: BellIcon },
		deploys: { name: 'Deployments', icon: RocketIcon },
		cost: { name: 'Cost', icon: WalletIcon },
		logs: { name: 'Logs', icon: Density3Icon },
		manifest: { name: 'Manifest', icon: FileTextIcon },
		delete: { name: 'Delete', icon: TrashIcon },
		image: { name: 'Image', icon: ImageIcon }
	};
	const simpleAppPages: { [key: string]: { name: string; icon?: Component } } = {
		'': { name: '' }, // overview
		status: { name: 'Status', icon: BellIcon },
		deploys: { name: 'Deployments', icon: RocketIcon },
		cost: { name: 'Cost', icon: WalletIcon },
		utilization: { name: 'Utilization', icon: LineGraphStackedIcon },
		logs: { name: 'Logs', icon: Density3Icon },
		manifest: { name: 'Manifest', icon: FileTextIcon },
		delete: { name: 'Delete', icon: TrashIcon },
		image: { name: 'Image', icon: ImageIcon }
	};

	const pages: {
		[key: string]: (
			params: Data
		) => { name: string; path: string; icon?: Component; showEnv?: boolean; isHeader?: boolean }[];
	} = {
		'/team/[team]/(teamPages)/[env]/secret/[secret]': (params: Data) => {
			return [
				{
					name: 'Secrets',
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
					name: 'Postgres',
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
					name: 'Buckets',
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
					name: 'Redis',
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
					name: 'Valkey',
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
					name: 'OpenSearch',
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
					name: 'Kafka topic',
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
					name: 'BigQuery',
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
					name: 'Jobs',
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
					name: 'Applications',
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

			{#each crumbs($page.route.id, $page.params) as item (item.path)}
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
