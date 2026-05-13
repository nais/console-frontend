<script lang="ts">
	import ServiceAccountListItem from '$lib/domain/list-items/ServiceAccountListItem.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import List from '$lib/ui/List.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { BodyLong, Button } from '@nais/ds-svelte-community';
	import { PlusIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { AdminServiceAccounts } = $derived(data);

	const serviceAccounts = $derived($AdminServiceAccounts.data?.serviceAccounts);

	const after: string = $derived($AdminServiceAccounts.variables?.after ?? '');
	const before: string = $derived($AdminServiceAccounts.variables?.before ?? '');

	const changeQuery = (params: { after?: string; before?: string } = {}) => {
		changeParams({
			before: params.before ?? before,
			after: params.after ?? after
		});
	};
</script>

<GraphErrors errors={$AdminServiceAccounts.errors} />

<div>
	<BodyLong spacing>
		Service accounts are machine-users that can be used to interact with the Nais API. Admin service
		accounts are tenant-wide and not tied to a specific team.
	</BodyLong>

	<div class="actions">
		<Button
			size="small"
			variant="secondary"
			icon={PlusIcon}
			as="a"
			href="/admin/service_accounts/create"
		>
			Create service account
		</Button>
	</div>

	{#if serviceAccounts && serviceAccounts.nodes.length > 0}
		<List
			title="{serviceAccounts.pageInfo.totalCount} service account{serviceAccounts.pageInfo
				.totalCount !== 1
				? 's'
				: ''}"
		>
			{#each serviceAccounts.nodes as sa (sa.id)}
				<ServiceAccountListItem serviceAccount={sa} href="/admin/service_accounts/{sa.id}" />
			{/each}
		</List>
		<Pagination
			page={serviceAccounts.pageInfo}
			loaders={{
				loadPreviousPage: () => {
					changeQuery({ before: serviceAccounts.pageInfo.startCursor ?? '', after: '' });
				},
				loadNextPage: () => {
					changeQuery({ after: serviceAccounts.pageInfo.endCursor ?? '', before: '' });
				}
			}}
		/>
	{:else if serviceAccounts}
		<BodyLong><strong>No service accounts found.</strong></BodyLong>
	{/if}
</div>

<style>
	.actions {
		margin-bottom: 1rem;
	}
</style>
