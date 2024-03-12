<script lang="ts">
	import Card from '$lib/Card.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import Time from '$lib/Time.svelte';
	import { Alert, BodyLong, Button } from '@nais/ds-svelte-community';
	import { TrashIcon } from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';

	export let data: PageData;

	$: ({ TeamDeleteKey, UserInfo } = data);
</script>

{#if $TeamDeleteKey.data}
	{@const key = $TeamDeleteKey.data.teamDeleteKey}
	<Card>
		<h3>Confirm team deletion</h3>
		{#if UserInfo.data?.me.__typename == 'User' && UserInfo.data.me.id != key.createdBy.id}
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

			<Button variant="danger">
				<svelte:fragment slot="icon-left"><TrashIcon /></svelte:fragment>
				Delete team</Button
			>
		{/if}
	</Card>
{:else}
	<GraphErrors errors={$TeamDeleteKey?.errors || []} />
{/if}
