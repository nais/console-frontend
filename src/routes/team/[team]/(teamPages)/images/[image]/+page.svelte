<script lang="ts">

	import { page } from '$app/stores';

	$: image = $page.params.image;

</script>

<h1>{image}</h1>