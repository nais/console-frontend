<script lang="ts">
	import { Heading, Link } from '@nais/ds-svelte-community';

	interface Props {
		instance: {
			readonly name: string;
			readonly __typename: string | null;
			readonly environment: {
				readonly name: string;
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
			case 'RedisInstance':
				return 'redis';
			case 'SqlInstance':
				return 'postgres';
			case 'ValkeyInstance':
				return 'valkey';
			default:
				throw new Error(`Unknown instance type ${instance.__typename}`);
		}
	};
</script>

<Heading size="small" level="4">
	<Link href="/team/{instance.team.slug}/{instance.environment.name}/{urlName()}/{instance.name}">
		{instance.name}
	</Link>
</Heading>
