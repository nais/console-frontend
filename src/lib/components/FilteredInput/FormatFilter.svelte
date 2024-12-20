<script lang="ts">
	interface Props {
		key: string;
		value: string;
	}

	let { key, value }: Props = $props();
</script>

<span class="filter"
	><span class="filter-key">{key}</span>:<span class="filter-value">{value} </span></span
>

<style>
	.filter {
		display: inline-flex;
	}

	.filter-value {
		color: var(--a-text-action);
	}
</style>
