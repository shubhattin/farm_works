<script lang="ts">
  import UserControls from '~/components/pages/main/user/UserControls.svelte';
  import { user_info } from '~/state/user.svelte';
  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();
</script>

{#if $user_info}
  <div class="flex justify-end">
    <UserControls />
  </div>
{/if}

{@render children?.()}
