<script lang="ts">
	import { AlertState, type ValueOf } from '$houdini';
	import { envTagVariant } from '$lib/envTagVariant';
	import { Alert, BodyLong, Button, Heading, Tag } from '@nais/ds-svelte-community';

	const {
		teamSlug,
		collapsible = true,
		alerts,
		alertsState
	}: {
		collapsible?: boolean;
		teamSlug: string;
		alerts: {
			id: string;
			name: string;
			state: ValueOf<typeof AlertState>;
			teamEnvironment: {
				environment: {
					name: string;
				};
			};
		}[];
		alertsState: ValueOf<typeof AlertState>;
	} = $props();

	let open = $state(false);
</script>

{#if alerts.length}
	<Alert variant={alertsState === AlertState.FIRING ? 'error' : 'warning'} size="small">
		<div class="content">
			<div style="display: flex; align-items: center; gap: var(--ax-space-8);">
				<Heading level="2" size="small"
					>{alerts.length} Alerts are {alertsState === AlertState.FIRING ? 'Firing' : 'Pending'} for
					{teamSlug}</Heading
				>
				{#if collapsible}
					<Button variant="tertiary" size="xsmall" onclick={() => (open = !open)}>
						{open ? 'Hide' : 'Show'} details
					</Button>
				{/if}
			</div>
			{#if open || !collapsible}
				<BodyLong
					>The following alerts are currently {alertsState === AlertState.FIRING
						? 'firing'
						: 'pending'} for the team <strong>{teamSlug}</strong>:</BodyLong
				>
				<ul>
					{#each alerts as alert (alert.id)}
						<li>
							{alert.name} - <Tag
								variant={envTagVariant(alert.teamEnvironment.environment.name)}
								size="small">{alert.teamEnvironment.environment.name}</Tag
							>
						</li>
					{/each}
				</ul>
			{/if}
			<BodyLong>See <a href="/team/{teamSlug}/alerts">Alerts</a> for more details.</BodyLong>
		</div>
	</Alert>
{/if}

<style>
	.content {
		display: grid;
		gap: var(--ax-space-12);
	}
	ul {
		list-style: none;
		margin: 0;
		padding: 0 0 1rem 0;
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-4);
	}
</style>
