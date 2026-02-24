<script lang="ts">
	import { Heading } from '@nais/ds-svelte-community';

	interface Props {
		instance: {
			readonly name: string;
			readonly __typename: string | null;
			readonly teamEnvironment: {
				readonly environment: {
					readonly name: string;
				};
			};
			readonly team: {
				readonly slug: string;
			};
		};
	}

	let { instance }: Props = $props();

	const urlName = () => {
		switch (instance.__typename) {
			case 'BigQueryDataset':
				return 'bigquery';
			case 'Bucket':
				return 'bucket';
			case 'KafkaTopic':
				return 'kafka';
			case 'OpenSearch':
				return 'opensearch';
			case 'SqlInstance':
				return 'postgres';
			case 'Valkey':
				return 'valkey';
			default:
				throw new Error(`Unknown instance type ${instance.__typename}`);
		}
	};
</script>

<Heading size="small" as="h4">
	<a
		href="/team/{instance.team.slug}/{instance.teamEnvironment.environment
			.name}/{urlName()}/{instance.name}"
	>
		{instance.name}
	</a>
</Heading>

<style>
	a {
		color: inherit;
		text-decoration: none;

		&:hover {
			text-decoration: underline;
		}

		&:active,
		&:focus-visible {
			color: var(--ac-link-focus-text, var(--ax-text-neutral));
		}
	}
</style>
