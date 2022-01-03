<script context="module">
  export function load({ url}) {
		const pathname = url.pathname
    return {
      props: {
        pathname,
      },
    }
  }
</script>

<script>
  // let pathname
  // import Index from '../contents{pathnaem}/Index.md';
  // import { metadata } from `../contents${pathnaem}/Index.md`;
  import { onMount } from 'svelte';
    let Index
    let metadata
  onMount(async () => {
    Index = (await import('../contents/202201-start-blog-with-svelte/Index.md')).default
    console.log(Index)
    await import('../contents/202201-start-blog-with-svelte/Index.md')
    })

</script>

<!-- <svelte:head>

  {#await promise}
  <title>WIP</title>
  {:then result}
  <title>{result.metadata.title}</title>
  {:catch error}
  <title>faile to get metadata {error}</title>
  {/await}
</svelte:head> -->



<svelte:component this={Index}>
	<p>some slotted content</p>
</svelte:component>