<script lang="ts">
  import HomePage from '~/components/pages/main/HomePage.svelte';
  import Login from '~/components/pages/main/user/Login.svelte';
  import { PUBLIC_APP_NAME } from '$env/static/public';
  import { user_info } from '~/state/user.svelte';
</script>

<svelte:head>
  <title>{PUBLIC_APP_NAME ?? ''}</title>
</svelte:head>
{#if !$user_info}
  <Login />
{:else if $user_info.is_approved}
  <HomePage />
{:else}
  <div class="text-warning-500 dark:text-warning-400 mt-6 text-lg">
    आपको अभी अनुमोदोत नहीं किया गया
  </div>
{/if}
