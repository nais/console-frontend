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
	let { TeamServiceAccounts, viewerIsMember, teamSlug } = $derived(data);

	const serviceAccounts = $derived($TeamServiceAccounts.data?.team.serviceAccounts);

	const after: string = $derived($TeamServiceAccounts.variables?.after ?? '');
	const before: string = $derived($TeamServiceAccounts.variables?.before ?? '');

	const changeQuery = (params: { after?: string; before?: string } = {}) => {
		changeParams({
			before: params.before ?? before,
			after: params.after ?? after
		});
	};
</script>

<GraphErrors errors={$TeamServiceAccounts.errors} />

<div>
	<BodyLong spacing>
		Service accounts are machine-users that can be used to interact with the Nais API, for example
		to query or manage the team's resources.
	</BodyLong>

	{#if viewerIsMember}
		<div class="actions">
			<Button
				size="small"
				variant="secondary"
				icon={PlusIcon}
				as="a"
				href="/team/{teamSlug}/settings/service_accounts/create"
			>
				Create service account
			</Button>
		</div>
	{/if}

	{#if serviceAccounts && serviceAccounts.nodes.length > 0}
		<List
			title="{serviceAccounts.pageInfo.totalCount} service account{serviceAccounts.pageInfo
				.totalCount !== 1
				? 's'
				: ''}"
		>
			{#each serviceAccounts.nodes as sa (sa.id)}
				<ServiceAccountListItem serviceAccount={sa} {teamSlug} />
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
