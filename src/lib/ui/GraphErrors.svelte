<script lang="ts">
	import { ShAlert, ShButton } from '#lib/shadcn/ui/index.js';

	type error = { message: string };

	interface Props {
		size?: 'small' | 'medium';
		errors?: error[] | null;
		dismissable?: boolean;
	}

	let { size = 'medium', errors = $bindable(), dismissable = false }: Props = $props();

	const pick = (errors: error[]) => {
		return new Set(errors.map((error) => error.message));
	};
</script>

{#if errors && errors.length > 0}
	<div class="graph-errors">
		<ShAlert variant="destructive" size={size === 'small' ? 'sm' : 'default'}>
			<div class="graph-error-content">
				<div>
					{#each pick(errors) as error (error)}
						<div>{error}</div>
					{/each}
				</div>
				{#if dismissable}
					<ShButton variant="ghost" size="sm" onclick={() => (errors = [])}>Dismiss</ShButton>
				{/if}
			</div>
		</ShAlert>
	</div>
{/if}

<style>
	.graph-errors {
		margin-bottom: 1rem;
	}

	.graph-error-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		flex-wrap: wrap;
	}
</style>
