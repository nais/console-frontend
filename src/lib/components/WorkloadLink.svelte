<script lang="ts">
	export let workload: {
		readonly name: string;
		readonly __typename: string | null;
	};

	export let team: string;
	export let env: string;
</script>

<a href="/team/{team}/{env}/{workload.__typename === 'Job' ? 'job' : 'app'}/{workload.name}"
	>{workload.name}</a
>
