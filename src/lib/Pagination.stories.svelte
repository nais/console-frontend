<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Pagination from './Pagination.svelte';

	const { Story } = defineMeta({
		title: 'Lib/Pagination',
		component: Pagination,
		tags: ['autodocs']
	});
</script>

<script lang="ts">
	let currentPage1 = $state(1);
	let currentPage2 = $state(1);

	const createPageInfo = (current: number, pageSize: number, totalCount: number) => ({
		hasNextPage: current * pageSize < totalCount,
		hasPreviousPage: current > 1,
		pageStart: (current - 1) * pageSize + 1,
		pageEnd: Math.min(current * pageSize, totalCount),
		totalCount
	});
</script>

<Story name="First page" asChild>
	<Pagination
		page={{
			hasNextPage: true,
			hasPreviousPage: false,
			pageStart: 1,
			pageEnd: 20,
			totalCount: 150
		}}
		loaders={{
			loadNextPage: () => console.log('Next page'),
			loadPreviousPage: () => console.log('Previous page')
		}}
	/>
</Story>

<Story name="Middle page" asChild>
	<Pagination
		page={{
			hasNextPage: true,
			hasPreviousPage: true,
			pageStart: 21,
			pageEnd: 40,
			totalCount: 150
		}}
		loaders={{
			loadNextPage: () => console.log('Next page'),
			loadPreviousPage: () => console.log('Previous page')
		}}
	/>
</Story>

<Story name="Last page" asChild>
	<Pagination
		page={{
			hasNextPage: false,
			hasPreviousPage: true,
			pageStart: 141,
			pageEnd: 150,
			totalCount: 150
		}}
		loaders={{
			loadNextPage: () => console.log('Next page'),
			loadPreviousPage: () => console.log('Previous page')
		}}
	/>
</Story>

<Story name="Single item page" asChild>
	<Pagination
		page={{
			hasNextPage: true,
			hasPreviousPage: true,
			pageStart: 42,
			pageEnd: 42,
			totalCount: 100
		}}
		loaders={{
			loadNextPage: () => console.log('Next page'),
			loadPreviousPage: () => console.log('Previous page')
		}}
	/>
</Story>

<Story name="Loading state" asChild>
	<Pagination
		page={{
			hasNextPage: true,
			hasPreviousPage: true,
			pageStart: 21,
			pageEnd: 40,
			totalCount: 150
		}}
		loaders={{
			loadNextPage: () => console.log('Next page'),
			loadPreviousPage: () => console.log('Previous page')
		}}
		fetching={true}
	/>
</Story>

<Story name="No pagination needed" asChild>
	<div>
		<p style="margin-bottom: 1rem;">
			When there's no next or previous page, pagination doesn't render:
		</p>
		<Pagination
			page={{
				hasNextPage: false,
				hasPreviousPage: false,
				pageStart: 1,
				pageEnd: 15,
				totalCount: 15
			}}
			loaders={{
				loadNextPage: () => console.log('Next page'),
				loadPreviousPage: () => console.log('Previous page')
			}}
		/>
		<p style="margin-top: 1rem;">Above this line (nothing should appear)</p>
	</div>
</Story>

<Story name="Interactive example" asChild>
	{@const pageSize = 20}
	{@const totalCount = 150}
	<div>
		<p style="margin-bottom: 1rem;">Click the buttons to navigate:</p>
		<Pagination
			page={createPageInfo(currentPage1, pageSize, totalCount)}
			loaders={{
				loadNextPage: () => (currentPage1 += 1),
				loadPreviousPage: () => (currentPage1 -= 1)
			}}
		/>
		<p style="margin-top: 1rem; color: var(--ax-text-subtle);">
			Current page: {currentPage1} of {Math.ceil(totalCount / pageSize)}
		</p>
	</div>
</Story>

<Story name="In context with list" asChild>
	{@const pageSize = 10}
	{@const totalCount = 47}
	<div style="max-width: 600px;">
		<h3 style="margin-bottom: 1rem;">Deployments</h3>
		<div style="border: 1px solid var(--ax-border-neutral); border-radius: 8px; overflow: hidden;">
			{#each Array.from({ length: pageSize }, (_, i) => i) as i (i)}
				<div
					style="padding: 1rem; border-bottom: 1px solid var(--ax-border-subtle); background: var(--ax-bg-default);"
				>
					Deployment #{(currentPage2 - 1) * pageSize + i + 1}
				</div>
			{/each}
			<Pagination
				page={createPageInfo(currentPage2, pageSize, totalCount)}
				loaders={{
					loadNextPage: () => (currentPage2 += 1),
					loadPreviousPage: () => (currentPage2 -= 1)
				}}
			/>
		</div>
	</div>
</Story>
