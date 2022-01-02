<script lang="ts">
	import Header from '$lib/Header.svelte';
  import Body from "$lib/Body.svelte"
	import '../app.css';
</script>

<Header />

<main>
  <a href="http://localhost:3000/202201-start-blog-with-svelte">start blog with svelte</a>
	<slot />
</main>
<!-- <Body /> -->
<footer>
	<p>visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to learn SvelteKit</p>
</footer>

<style>
	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		max-width: 1024px;
		margin: 0 auto;
		box-sizing: border-box;
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 40px;
	}

	footer a {
		font-weight: bold;
	}

	@media (min-width: 480px) {
		footer {
			padding: 40px 0;
		}
	}
</style>
