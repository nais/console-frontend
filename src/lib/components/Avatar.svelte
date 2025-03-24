<script lang="ts">
	const { name }: { name: string } = $props();
</script>

<div class="avatar">
	{name.split(' ').at(0)?.at(0)}{name.split(' ').at(-1)?.at(0)}
</div>

<style>
	.avatar {
		background-color: var(--a-surface-neutral);
		color: var(--a-text-on-neutral);
		height: 40px;
		width: 40px;
		border-radius: 40px;
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>
