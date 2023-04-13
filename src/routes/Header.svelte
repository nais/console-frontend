<script lang="ts">
	import Logo from '../Logo.svelte';
</script>

<div class="header">
	<div class="header-content">
		<div class="logo">
			<Logo height="2rem" />
			Console
		</div>
		<div>user</div>
	</div>
</div>

<style>
	.header {
		background: var(--a-surface-inverted);
		color: var(--a-text-on-inverted);
		height: 3rem;
		display: flex;
		align-items: center;
		padding: 0 2rem;
		margin-bottom: 2rem;
	}
	.header-content {
		margin: 0 auto;
		width: 100%;
		max-width: 1400px;
		display: flex;
		align-items: center;
		flex-direction: row;
		justify-content: space-between;
	}
	.logo {
		display: flex;
		align-items: center;
		gap: 1rem;
		font-size: 1.5rem;
		font-weight: bold;
	}
</style>
