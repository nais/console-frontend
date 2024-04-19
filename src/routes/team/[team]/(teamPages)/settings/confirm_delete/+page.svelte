<script lang="ts">
	import {
		graphql,
		type ConfirmTeamDeletion$input,
		type ConfirmTeamDeletion$result,
		type QueryResult
	} from '$houdini';
	import Card from '$lib/Card.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import Time from '$lib/Time.svelte';
	import { Alert, BodyLong, Button, Modal } from '@nais/ds-svelte-community';
	import { TrashIcon } from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';

	export let data: PageData;

	$: ({ TeamDeleteKey, UserInfo } = data);

	let showConfirmDeleteTeam = false;
	let deleteTeamLoading = false;
	let deleteTeamResp: QueryResult<ConfirmTeamDeletion$result, ConfirmTeamDeletion$input> | null =
		null;

	const deleteTeam = graphql(`
		mutation ConfirmTeamDeletion($key: String!) {
			confirmTeamDeletion(key: $key)
		}
	`);
</script>

{#if $TeamDeleteKey.data}
	{@const key = $TeamDeleteKey.data.teamDeleteKey}
	<Card>
		<h3>Confirm team deletion</h3>
		{#if UserInfo.data?.me.__typename == 'User' && UserInfo.data.me.id == key.createdBy.id}
			<Alert variant="error">You can not confirm your own delete request.</Alert>
		{:else if Date.now() - +key.expires > 0}
			<Alert variant="error">The delete key has expired.</Alert>
		{:else}
			<BodyLong>
				The deletion was initiated by <strong>{key.createdBy.name}</strong> and expires
				<strong><Time distance={true} time={key.expires}></Time></strong>. Deleting the team will
				permanently delete all managed resources and all resources within them. All applications,
				databases and jobs owned by the team will be irreversibly deleted. When you click delete
				team there is now way back.
			</BodyLong>

			<Button
				on:click={() => {
					showConfirmDeleteTeam = !showConfirmDeleteTeam;
				}}
				variant="danger"
			>
				<svelte:fragment slot="icon-left"><TrashIcon /></svelte:fragment>
				Delete team</Button
			>

			<Modal bind:open={showConfirmDeleteTeam}>
				<h3 slot="header">Confirm team deletion</h3>

				<BodyLong>
					Please confirm that you intend to delete <strong
						>{$TeamDeleteKey.data.teamDeleteKey.team.slug}</strong
					> and all resources related to it.
				</BodyLong>

				{#if deleteTeamResp?.errors}
					<GraphErrors errors={deleteTeamResp.errors} />
				{/if}

				<svelte:fragment slot="footer">
					<Button
						type="submit"
						loading={deleteTeamLoading}
						on:click={async () => {
							deleteTeamLoading = true;
							deleteTeamResp = await deleteTeam.mutate({
								key: $TeamDeleteKey.data?.teamDeleteKey.key || ''
							});
							deleteTeamLoading = false;
							showConfirmDeleteTeam = !deleteTeamResp.data?.confirmTeamDeletion;
						}}>Confirm</Button
					>
					<Button
						variant="tertiary"
						disabled={deleteTeamLoading}
						type="reset"
						on:click={() => {
							showConfirmDeleteTeam = false;
						}}>Cancel</Button
					>
				</svelte:fragment>
			</Modal>
		{/if}
	</Card>
{:else}
	<GraphErrors errors={$TeamDeleteKey?.errors || []} />
{/if}
