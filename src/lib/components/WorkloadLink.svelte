<script lang="ts">
	interface Props {
		workload: {
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

	let { workload }: Props = $props();
</script>

<a
	href="/team/{workload.team.slug}/{workload.environment.name}/{workload.__typename === 'Job'
		? 'job'
		: 'app'}/{workload.name}">{workload.name}</a
>
