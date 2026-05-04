<script lang="ts">
	import type { WorkloadActivityEntryFragment$data } from '$houdini';

	import { workloadTextComponent } from './textComponent';

	interface Props {
		data: WorkloadActivityEntryFragment$data;
	}

	let { data }: Props = $props();

	const TextComponent = $derived(workloadTextComponent(data.__typename));
</script>

<TextComponent {data} />
