<script lang="ts">
	import LogExplorer from '../../src/lib/domain/logs/LogExplorer.svelte';
	import Theme from '../../src/lib/shadcn/ui/Theme.svelte';
</script>

<Theme theme="light">
	<main>
		<LogExplorer
			team="team"
			environment="dev-gcp"
			tenant="nav"
			workload="app"
			instances={[]}
			hasLoki
		/>
	</main>
</Theme>
