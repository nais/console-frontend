<script lang="ts">
	import { goto } from '$app/navigation';
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

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let { TeamDeleteKey, UserInfo } = $derived(data);

	let showConfirmDeleteTeam = $state(false);
	let deleteTeamLoading = $state(false);
	let deleteTeamResp: QueryResult<ConfirmTeamDeletion$result, ConfirmTeamDeletion$input> | null =
		$state(null);

	const deleteTeam = graphql(`
		mutation ConfirmTeamDeletion($key: String!, $team: Slug!) {
			confirmTeamDeletion(input: { key: $key, slug: $team }) {
				deletionStarted
			}
		}
	`);
</script>

{#if $TeamDeleteKey.data}
	{@const key = $TeamDeleteKey.data.team.deleteKey}
	<Card>
		<h3>Confirm team deletion</h3>
		{#if UserInfo.data?.me.__typename == 'User' && UserInfo.data.me.id == key.createdBy.id}
			<Alert variant="error">You can not confirm your own delete request.</Alert>
		{:else if Date.now() - +key.expires > 0}
			<Alert variant="error">The delete key has expired.</Alert>
		{:else}
			<BodyLong style="padding-bottom: 1rem;">
				The deletion was initiated by <strong>{key.createdBy.name}</strong> and expires
				<strong><Time distance={true} time={key.expires}></Time></strong>. Deleting the team will
				permanently delete all managed resources and all resources within them. All applications,
				databases and jobs owned by the team will be irreversibly deleted. When you click delete
				team there is now way back.
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

			<Modal bind:open={showConfirmDeleteTeam}>
				{#snippet header()}
					<h3>Confirm team deletion</h3>
				{/snippet}

				<BodyLong>
					Please confirm that you intend to delete <strong>{key.team.slug}</strong> and all resources
					related to it.
				</BodyLong>

				{#if deleteTeamResp?.errors}
					<GraphErrors errors={deleteTeamResp.errors} />
				{/if}

				{#snippet footer()}
					<Button
						type="submit"
						loading={deleteTeamLoading}
						onclick={async () => {
							deleteTeamLoading = true;
							deleteTeamResp = await deleteTeam.mutate({
								key: key.key,
								team: key.team.slug
							});
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
	</Card>
{:else}
	<GraphErrors errors={$TeamDeleteKey?.errors || []} />
{/if}
