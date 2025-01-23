<script lang="ts">
	import PersistenceIcon from '$lib/PersistenceIcon.svelte';

	interface Props {
		persistence: {
			type: string | null;
			name: string;
		};
		children?: import('svelte').Snippet;
	}

	let { persistence, children }: Props = $props();

	const persistenceTypeToName = (typ: string | null) => {
		switch (typ) {
			case 'BigQueryDataset':
				return 'BigQuery';
			case 'SqlInstance':
				return 'Postgres';
			case 'RedisInstance':
				return 'Redis';
			case 'ValkeyInstance':
				return 'Valkey';
			default:
				return typ;
		}
	};
</script>

<div class="persistence permanent">
	<div class="icon">
		<PersistenceIcon type={persistence.type || ''} size="2rem" />
	</div>
	<div class="name">
		<span>{persistenceTypeToName(persistence.type)}</span>
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
		flex-direction: row;
		border-bottom: 1px solid var(--a-border-subtle);
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
		min-width: 30%;
	}

	.content {
		margin: 0.5rem;
	}
</style>
