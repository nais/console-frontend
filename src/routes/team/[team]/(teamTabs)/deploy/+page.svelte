<script lang="ts">
	import Card from '$lib/Card.svelte';
	import Time from '$lib/Time.svelte';
	import { deployments } from '$lib/mock/deployments';
	import { Body, Button, DataCell, Header, HeaderCell, Row, Table, Tag } from '@nais/ds-svelte';
	import { Branching } from '@nais/ds-svelte/icons';
	import Status from './Status.svelte';
	import hr from 'date-fns/locale/hr';
	const deploymentType = (kind: string) => {
		if (kind === 'Application') {
			return 'App:';
		} else if (kind === 'Job') {
			return 'Job:';
		} else {
			return 'Unknown:';
		}
	};
</script>

<Card>
	<Table zebraStripes={true}>
		<Header>
			<HeaderCell>Resource(s)</HeaderCell>
			<HeaderCell>Created</HeaderCell>
			<HeaderCell>Environment</HeaderCell>
			<HeaderCell>Status</HeaderCell>
			<HeaderCell>Link</HeaderCell>
		</Header>
		<Body>
			{#each deployments as deployment}
				{#each deployment.resources as resource}
					<Row>
						<DataCell>
							{deploymentType(resource.kind)}
							<a
								href="/team/{deployment.deployment.team}/{deployment.deployment
									.cluster}/{resource.name}"
							>
								{resource.name}
							</a>
						</DataCell>
						<DataCell>
							<Time time={new Date(deployment.deployment.created)} distance={true} />
						</DataCell>
						<DataCell>{deployment.deployment.cluster}</DataCell>
						<DataCell><Status status={deployment.statuses[0].status} /></DataCell>
						<DataCell>
							{#if deployment.deployment.githubRepository}
								<Button
									size="xsmall"
									variant="secondary"
									href="https://github.com/{deployment.deployment.githubRepository}"
									as="a"
								>
									<svelte:fragment slot="icon-left"><Branching /></svelte:fragment>Repo</Button
								>
							{/if}
						</DataCell>
					</Row>
				{/each}
			{/each}
		</Body>
	</Table>
</Card>
