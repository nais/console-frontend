<script lang="ts">
	import BigQueryIcon from '$lib/icons/BigQueryIcon.svelte';
	import KafkaIcon from '$lib/icons/KafkaIcon.svelte';
	import OpenSearchIcon from '$lib/icons/OpenSearchIcon.svelte';
	import UnleashIcon from '$lib/icons/UnleashIcon.svelte';
	import ValkeyIcon from '$lib/icons/ValkeyIcon.svelte';
	import {
		BellIcon,
		BranchingIcon,
		BriefcaseClockIcon,
		BucketIcon,
		CogIcon,
		DatabaseIcon,
		Density3Icon,
		FileTextIcon,
		HouseIcon,
		ImageIcon,
		LineGraphStackedIcon,
		LinkIcon,
		PackageIcon,
		PadlockLockedIcon,
		PersonGroupIcon,
		QuestionmarkIcon,
		RocketIcon,
		ShieldLockIcon,
		TrashIcon,
		VirusIcon,
		WalletIcon
	} from '@nais/ds-svelte-community/icons';

	const { icon } = $props();

	const getComponent = (icon: string) => {
		switch (icon.toLocaleLowerCase()) {
			case 'team overview':
				return HouseIcon;
			case 'app overview':
			case 'applications':
				return PackageIcon;
			case 'job overview':
			case 'jobs':
				return BriefcaseClockIcon;
			case 'secrets':
				return PadlockLockedIcon;
			case 'sqlinstance':
			case 'postgres':
				return DatabaseIcon;
			case 'buckets':
			case 'bucket':
				return BucketIcon;
			case 'valkey':
				return ValkeyIcon;
			case 'opensearch':
				return OpenSearchIcon;
			case 'kafka':
			case 'kafka topics':
				return KafkaIcon;
			case 'bigquery':
			case 'bigquerydataset':
				return BigQueryIcon;
			case 'unleash':
				return UnleashIcon;
			case 'deployments':
				return RocketIcon;
			case 'cost':
				return WalletIcon;
			case 'utilization':
				return LineGraphStackedIcon;
			case 'vulnerabilities':
			case 'vulnerability report':
				return VirusIcon;
			case 'members':
				return PersonGroupIcon;
			case 'repositories':
				return BranchingIcon;
			case 'settings':
				return CogIcon;
			case 'activity log':
				return ShieldLockIcon;
			case 'status':
				return BellIcon;
			case 'image':
				return ImageIcon;
			case 'logs':
				return Density3Icon;
			case 'manifest':
				return FileTextIcon;
			case 'delete':
				return TrashIcon;
			case 'ingresses':
				return LinkIcon;
			default:
				return QuestionmarkIcon;
		}
	};

	const Component = getComponent(icon);
</script>

<Component />
