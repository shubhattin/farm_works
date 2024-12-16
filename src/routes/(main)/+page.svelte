<script lang="ts">
  import HomePage from '~/components/pages/main/HomePage.svelte';
  import Login from '~/components/pages/main/user/Login.svelte';
  import { user_info } from '~/state/user.svelte';
</script>

<svelte:head>
  <title>श्री बालाजी कृषि उद्योग</title>
</svelte:head>
{#if !$user_info}
  <Login />
{:else}
  <HomePage />
{/if}
