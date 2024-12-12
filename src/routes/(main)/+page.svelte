<script lang="ts">
  import Login from '~/components/pages/main/user/Login.svelte';
  import UserControls from '~/components/pages/main/user/UserControls.svelte';
  import { user_info } from '~/state/user.svelte';
</script>

<svelte:head>
  <title>श्री बालाजी कृषि उद्योग</title>
</svelte:head>
{#if !$user_info}
  <Login />
{:else}
  <div class="flex justify-end">
    <UserControls />
  </div>
{/if}
