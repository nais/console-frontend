<script lang="ts">
	import BigQueryIcon from '$lib/icons/BigQueryIcon.svelte';
	import KafkaIcon from '$lib/icons/KafkaIcon.svelte';
	import OpenSearchIcon from '$lib/icons/OpenSearchIcon.svelte';
	import RedisIcon from '$lib/icons/RedisIcon.svelte';
	import UnleashIcon from '$lib/icons/UnleashIcon.svelte';
	import ValkeyIcon from '$lib/icons/ValkeyIcon.svelte';
	import { Detail } from '@nais/ds-svelte-community';
	import {
		BellFillIcon,
		BellIcon,
		BranchingIcon,
		BriefcaseClockFillIcon,
		BriefcaseClockIcon,
		BucketFillIcon,
		BucketIcon,
		CircleFillIcon,
		CogFillIcon,
		CogIcon,
		DatabaseFillIcon,
		DatabaseIcon,
		Density3Icon,
		FileTextFillIcon,
		FileTextIcon,
		HouseFillIcon,
		HouseIcon,
		ImageFillIcon,
		ImageIcon,
		LineGraphStackedIcon,
		PackageFillIcon,
		PackageIcon,
		PadlockLockedFillIcon,
		PadlockLockedIcon,
		PersonGroupFillIcon,
		PersonGroupIcon,
		QuestionmarkIcon,
		RocketFillIcon,
		RocketIcon,
		ShieldLockFillIcon,
		ShieldLockIcon,
		TrashFillIcon,
		TrashIcon,
		VirusFillIcon,
		VirusIcon,
		WalletFillIcon,
		WalletIcon
	} from '@nais/ds-svelte-community/icons';
	import IconLabel from './IconLabel.svelte';

	const {
		items
	}: {
		items: {
			label: string;
			href: string;
			active?: boolean;
			count?: number;
			badge?: boolean;
		}[][];
	} = $props();

	const iconComponent = (label: string, active: boolean) => {
		switch (label) {
			case 'Overview':
				return active ? HouseFillIcon : HouseIcon;
			case 'Applications':
				return active ? PackageFillIcon : PackageIcon;
			case 'Jobs':
				return active ? BriefcaseClockFillIcon : BriefcaseClockIcon;
			case 'Secrets':
				return active ? PadlockLockedFillIcon : PadlockLockedIcon;
			case 'Postgres':
				return active ? DatabaseFillIcon : DatabaseIcon;
			case 'Buckets':
				return active ? BucketFillIcon : BucketIcon;
			case 'Redis':
				return RedisIcon;
			case 'Valkey':
				return ValkeyIcon;
			case 'OpenSearch':
				return OpenSearchIcon;
			case 'Kafka topics':
				return KafkaIcon;
			case 'BigQuery':
				return BigQueryIcon;
			case 'Unleash':
				return UnleashIcon;
			case 'Deployments':
				return active ? RocketFillIcon : RocketIcon;
			case 'Cost':
				return active ? WalletFillIcon : WalletIcon;
			case 'Utilization':
				return active ? LineGraphStackedIcon : LineGraphStackedIcon;
			case 'Vulnerabilities':
				return active ? VirusFillIcon : VirusIcon;
			case 'Members':
				return active ? PersonGroupFillIcon : PersonGroupIcon;
			case 'Repositories':
				return BranchingIcon;
			case 'Settings':
				return active ? CogFillIcon : CogIcon;
			case 'Activity log':
				return active ? ShieldLockFillIcon : ShieldLockIcon;
			case 'Status':
				return active ? BellFillIcon : BellIcon;
			case 'Image':
				return active ? ImageFillIcon : ImageIcon;
			case 'Logs':
				return Density3Icon;
			case 'Manifest':
				return active ? FileTextFillIcon : FileTextIcon;
			case 'Delete':
				return active ? TrashFillIcon : TrashIcon;

			default:
				return QuestionmarkIcon;
		}
	};
</script>

<div class="menu">
	{#each items as group (group)}
		<div class="list">
			{#each group as { label: text, href, active, count, badge } (href)}
				<a {href} class:active>
					<IconLabel>
						{#snippet label()}
							<span class="label">
								{text}
								{#if badge}
									<CircleFillIcon class="badge" />
								{/if}
							</span>
						{/snippet}
						{#snippet icon()}
							{@const Comp = iconComponent(text, false)}
							<span class="icon"><Comp /></span>
						{/snippet}
					</IconLabel>
					{#if count}
						<Detail>{count}</Detail>
					{/if}
				</a>
			{/each}
		</div>
	{/each}
</div>

<style>
	.menu {
		display: flex;
		flex-direction: column;
		gap: var(--a-spacing-5);

		.list {
			display: flex;
			flex-direction: column;
			gap: var(--a-spacing-05);
		}

		a {
			display: grid;
			grid-template-columns: 1fr auto;
			border-radius: 4px;
			padding: var(--a-spacing-1);
			text-decoration: none;
			color: inherit;
			transition: background-color 50ms;

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

			.label {
				:global(.badge) {
					color: var(--a-red-300);
					font-size: 0.5rem;
					position: relative;
					top: -8px;
					right: 2px;
				}
			}
			&:not(.active) .icon {
				color: var(--a-text-subtle);
			}

			.icon {
				display: contents;
			}
		}
	}
</style>
