<script lang="ts">
  import Header from './components/Header.svelte';
  import Body from './components/Body.svelte';
</script>

<main>
  <div class="containar">
    <Header />
    <Body />
  </div>
</main>

<style>
  #containar {
    width: 100%;
    height: 100%;
  }
</style>
