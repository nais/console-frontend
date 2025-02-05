<script lang="ts">
	import { BriefcaseClockIcon, PackageIcon } from '@nais/ds-svelte-community/icons';

	interface Props {
		workload: {
			readonly name: string;
			readonly __typename: string | null;
			readonly environment: {
				readonly name: string;
			};
			readonly team: {
				readonly slug: string;
			};
		};
		showIcon?: boolean;
		//iconSize?: string;
		size?: 'small' | 'medium' | 'large';
	}

	var iconSize: string;

	let { workload, showIcon, size = 'medium' }: Props = $props();
	if (size === 'small') {
		iconSize = '18px';
	} else if (size === 'medium') {
		iconSize = '24px';
	} else {
		iconSize = '32px';
	}
</script>

<a
	href="/team/{workload.team.slug}/{workload.environment.name}/{workload.__typename === 'Job'
		? 'job'
		: 'app'}/{workload.name}"
>
</a>
