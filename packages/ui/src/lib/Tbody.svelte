<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	export interface TbodyProps extends HTMLAttributes<HTMLTableSectionElement> {
		children: Snippet;
		[key: string]: unknown;
	}

	let { class: className = '', children, ...rest }: TbodyProps = $props();
</script>

<tbody class={['sh-tbody', className]} {...rest}>
	{@render children()}
</tbody>
