<script lang="ts">
  import HomePage from '~/components/pages/main/HomePage.svelte';
  import Login from '~/components/pages/main/user/Login.svelte';
  import { PUBLIC_APP_NAME } from '$env/static/public';
  import { useSession } from '~/lib/auth-client';

  const session = useSession();
  let user_info = $derived($session.data?.user);
</script>

<svelte:head>
  <title>{PUBLIC_APP_NAME ?? ''}</title>
</svelte:head>
{#if !user_info}
  <Login />
{:else}
  <HomePage />
{/if}
