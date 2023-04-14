<div class="tabs"><slot /></div>

<style>
	.tabs {
		display: flex;
		margin-bottom: 1rem;
		border-bottom: 1px solid var(--a-border-divider);
		line-height: 1.5rem;
	}
	.tab {
		text-decoration: none;
		color: var(--a-text-subtle);
		padding: 0.75rem 1rem;
		border-bottom: 3px solid transparent;
	}
	.tab:hover {
		border-bottom: 3px solid var(--a-border-subtle-hover);
	}
	.tab.active {
		color: var(--a-text-default);
		border-bottom: 3px solid var(--a-border-action);
	}
</style>
