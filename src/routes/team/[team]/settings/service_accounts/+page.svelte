<script lang="ts">
	import ServiceAccountListItem from '$lib/domain/list-items/ServiceAccountListItem.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import List from '$lib/ui/List.svelte';
	import PageModal, { pageModalClick } from '$lib/ui/PageModal.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { BodyLong, Button } from '@nais/ds-svelte-community';
	import { PlusIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';
	import CreatePage from './create/+page.svelte';

	let { data }: PageProps = $props();
	let { TeamServiceAccounts, viewerIsOwner, isAdmin, teamSlug } = $derived(data);

	const serviceAccounts = $derived($TeamServiceAccounts.data?.team.serviceAccounts);

	const after: string = $derived($TeamServiceAccounts.variables?.after ?? '');
	const before: string = $derived($TeamServiceAccounts.variables?.before ?? '');

	const changeQuery = (params: { after?: string; before?: string } = {}) => {
		changeParams({
			before: params.before ?? before,
			after: params.after ?? after
		});
	};

	const createUrl = $derived(`/team/${teamSlug}/settings/service_accounts/create`);
</script>

<GraphErrors errors={$TeamServiceAccounts.errors} />

<div>
	<BodyLong spacing>
		Service accounts are machine-users that can be used to interact with the Nais API, for example
		to query or manage the team's resources.
	</BodyLong>

	{#if serviceAccounts && serviceAccounts.edges.length > 0}
		<List title="Service accounts" count={serviceAccounts.pageInfo.totalCount}>
			{#snippet actions()}
				{#if viewerIsOwner || isAdmin}
					<Button
						size="small"
						variant="secondary"
						icon={PlusIcon}
						as="a"
						href={createUrl}
						onclick={pageModalClick}
					>
						Create service account
					</Button>
				{/if}
			{/snippet}
			{#each serviceAccounts.edges as { node: sa } (sa.id)}
				<ServiceAccountListItem
					serviceAccount={sa}
					href="/team/{teamSlug}/settings/service_accounts/{sa.id}"
				/>
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
		{#if viewerIsOwner || isAdmin}
			<Button
				size="small"
				variant="secondary"
				icon={PlusIcon}
				as="a"
				href={createUrl}
				onclick={pageModalClick}
			>
				Create service account
			</Button>
		{/if}
		<BodyLong><strong>No service accounts found.</strong></BodyLong>
	{/if}
</div>

{#if viewerIsOwner || isAdmin}
	<PageModal content={CreatePage} header="Create service account" />
{/if}
