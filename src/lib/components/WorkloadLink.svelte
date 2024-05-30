<script lang="ts">
	import { WorkloadType, type WorkloadType$options } from '$houdini';
	import { Link } from '@nais/ds-svelte-community';

	export let workload: { type: WorkloadType$options; name: string };
	export let team: string;
	export let env: string;
</script>

<Link href="/team/{team}/{env}/{workload.type === WorkloadType.APP ? 'app' : 'job'}/{workload.name}"
	>{workload.name}</Link
>
