<script lang="ts">
  import { Switch } from '@skeletonlabs/skeleton-svelte';
  import TypingAssistance from './TypingAssistance.svelte';
  import { cl_join } from '~/tools/cl_join';
  import { onMount } from 'svelte';

  let {
    status_on = $bindable(),
    class: className,
    hide_until_mounted = false
  }: { status_on: boolean; class?: string; hide_until_mounted?: boolean } = $props();

  let mounted = $state(false);

  onMount(() => {
    mounted = true;
  });
</script>

<div class={cl_join('flex space-x-2 sm:space-x-3 md:space-x-5', className)}>
  {#if !hide_until_mounted || mounted}
    <Switch
      name="hindi_typing_tool"
      stateFocused="outline-hidden select-none"
      checked={status_on}
      onCheckedChange={(e) => {
        status_on = e.checked;
      }}
    >
      <span class="text-sm">हिन्दी लेखन</span>
    </Switch>
  {:else}
    <div class="h-8 placeholder w-28 animate-pulse rounded-lg"></div>
  {/if}
  <TypingAssistance />
</div>
