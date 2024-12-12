<script lang="ts">
  import Login from '~/components/pages/main/user/Login.svelte';
  import UserControls from '~/components/pages/main/user/UserControls.svelte';
  import { user_info } from '~/state/user.svelte';
</script>

{#if !$user_info}
  <Login />
{:else}
  <div class="flex justify-end">
    <UserControls />
  </div>
{/if}
