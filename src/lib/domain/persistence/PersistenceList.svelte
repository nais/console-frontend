<script lang="ts">
	import Icon from '$lib/ui/Icon.svelte';

	interface Props {
		persistence: {
			__typename: string | null;
			name: string;
		};
		children?: import('svelte').Snippet;
	}

	let { persistence, children }: Props = $props();

	const persistenceTypeToName = (type: string | null) => {
		switch (type) {
			case 'BigQueryDataset':
				return 'BigQuery';
			case 'SqlInstance':
				return 'Postgres';
			case 'Valkey':
				return 'Valkey';
			default:
				return type;
		}
	};
</script>

<div class="persistence">
	<div class="icon">
		<Icon icon={persistence.__typename} />
	</div>
	<div class="name">
		<span>{persistenceTypeToName(persistence.__typename)}</span>
		<strong>{persistence.name}</strong>
	</div>
	<div class="content">
		{@render children?.()}
	</div>
</div>

<style>
	.icon {
		font-size: 2rem;
		width: 2rem;
		height: 2rem;
	}

	.persistence {
		display: flex;
		width: 850px;
		flex-direction: row;
		border-bottom: 1px solid var(--ax-border-neutral-subtle);
		align-items: center;
		gap: 0.5rem;
		padding: 0.2rem;
	}

	.persistence:last-child {
		border-bottom: 0;
	}

	.name {
		display: flex;
		flex-direction: column;
		min-width: 15%;
	}

	.content {
		margin: 0.5rem;
		max-width: 80ch;
	}
</style>
