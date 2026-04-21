<script lang="ts">
	import { goto } from '$app/navigation';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import Time from '$lib/ui/Time.svelte';
	import { getContextClient } from '$lib/urql/context';
	import { Alert, BodyLong, Button, Modal } from '@nais/ds-svelte-community';
	import { TrashIcon } from '@nais/ds-svelte-community/icons';
	import { ConfirmTeamDeletionMutation } from '../settings';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let { TeamDeleteKey, UserInfo } = $derived(data);

	let showConfirmDeleteTeam = $state(false);
	let deleteTeamLoading = $state(false);
	let deleteTeamErrors: { message: string }[] | null = $state(null);

	const client = getContextClient();
</script>

<GraphErrors errors={TeamDeleteKey.errors} />

{#if TeamDeleteKey.data}
	{@const key = TeamDeleteKey.data.team.deleteKey}
	{#if UserInfo.data?.me.__typename == 'User' && UserInfo.data.me.id == key.createdBy.id}
		<Alert variant="error">You can not confirm your own delete request.</Alert>
	{:else if Date.now() - +new Date(key.expires) > 0}
		<Alert variant="error">The delete key has expired.</Alert>
	{:else}
		<BodyLong style="padding-bottom: 1rem;">
			The deletion was initiated by <strong>{key.createdBy.name}</strong> and expires
			<strong><Time distance={true} time={key.expires}></Time></strong>. Deleting the team will
			permanently delete all managed resources and all resources within them. All applications,
			databases and jobs owned by the team will be irreversibly deleted. When you click delete team
			there is now way back.
		</BodyLong>

		<Button
			onclick={() => {
				showConfirmDeleteTeam = !showConfirmDeleteTeam;
			}}
			variant="danger"
			icon={TrashIcon}
		>
			Delete team
		</Button>

		<Modal bind:open={showConfirmDeleteTeam} header="Confirm team deletion">
			<BodyLong>
				Confirm that you intend to delete <strong>{key.team.slug}</strong> and all resources related to
				it.
			</BodyLong>

			{#if deleteTeamErrors}
				<GraphErrors errors={deleteTeamErrors} />
			{/if}

			{#snippet footer()}
				<Button
					type="submit"
					loading={deleteTeamLoading}
					onclick={async () => {
						deleteTeamLoading = true;
						deleteTeamErrors = null;
						const result = await client
							.mutation(ConfirmTeamDeletionMutation, {
								key: key.key,
								team: key.team.slug
							})
							.toPromise();
						deleteTeamLoading = false;
						if (result.error) {
							deleteTeamErrors = result.error.graphQLErrors?.length
								? result.error.graphQLErrors.map((e) => ({ message: e.message }))
								: [{ message: result.error.message }];
							return;
						}
						goto('/team/' + key.team.slug, { replaceState: true });
					}}>Confirm</Button
				>
				<Button
					variant="tertiary"
					disabled={deleteTeamLoading}
					type="reset"
					onclick={() => {
						showConfirmDeleteTeam = false;
					}}>Cancel</Button
				>
			{/snippet}
		</Modal>
	{/if}
{/if}
