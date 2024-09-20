<script lang="ts">
	import { WorkloadType, type WorkloadType$options } from '$houdini';

	export let workload: { type: WorkloadType$options; name: string };
	export let team: string;
	export let env: string;
</script>

<a href="/team/{team}/{env}/{workload.type === WorkloadType.APP ? 'app' : 'job'}/{workload.name}"
	>{workload.name}</a
>
