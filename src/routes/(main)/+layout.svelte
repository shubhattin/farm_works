<script lang="ts">
  import UserControls from '~/components/pages/main/user/UserControls.svelte';
  import { user_info } from '~/state/user.svelte';
  import type { Snippet } from 'svelte';
  import { useSession } from '~/lib/auth-client';
  import type { LayoutData } from '../$types';
  import { browser } from '$app/environment';

  let { children, data }: { children: Snippet; data: LayoutData } = $props();

  const session = useSession();
  let user_info_fetched = $state(false);

  $effect(() => {
    $user_info = user_info_fetched ? $session.data?.user : data.user_info;
  });

  $effect(() => {
    if (browser && $session.data?.user) {
      user_info_fetched = true;
    }
  });
</script>

{#if $user_info}
  <div class="flex justify-end">
    <UserControls />
  </div>
{/if}

{@render children?.()}
