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
  let pathname
  // import Index from '../contents{pathnaem}/Index.md';
  // import { metadata } from `../contents${pathnaem}/Index.md`;
  export const load = async() => {
    let Index = await import(`../contents${pathname}/Index.md`)
    let metadata = await import(`../contents${pathname}/Index.md`)
    return {
      Index: Index,
      metadata: metadata
    }
  }
  let promise = load()


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

<article>
  {#await promise}
  <h1>WIP</h1>
  {:then result}
  <!-- <h1>{result.metadata.title}</h1> -->
  {result.Index}
  {:catch error}
  <h1>faile to get title</h1>
  {/await}
  <!-- here will be contents -->

</article>