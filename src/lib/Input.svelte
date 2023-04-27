<script>
	import Search from './icons/Search.svelte';
</script>

<form>
	<div class="wrapper">
		<div>
			<input />
			<button>
				<div class="iconBox">
					<Search width="1.5rem" height="1.5rem" />
				</div>
			</button>
		</div>
	</div>
</form>

<style>
	.wrapper {
		height: 64px;
	}
	.wrapper > div {
		display: inline-flex;
		border: 1px solid var(--a-border-default);
		border-radius: 0.25rem;
		margin: 8px 0 8px 0;
		width: 100%;
	}
	.iconBox {
		width: 64px;
		height: 48px;
		color: var(--a-text-on-inverted);
		display: flex;
		align-items: center;
		justify-content: center;
	}
	input {
		border: 0;
		border-radius: 0.25rem 0 0 0.25rem;
		padding: 0.5rem;
		flex-grow: 3;
	}
	button {
		background-color: var(--a-surface-action);
		position: relative;
		border: 0;
		margin: 0;
		padding: 0;
	}
</style>
