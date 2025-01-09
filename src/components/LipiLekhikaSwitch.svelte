<script lang="ts">
  import { Switch } from '@skeletonlabs/skeleton-svelte';
  import TypingAssistance from './TypingAssistance.svelte';
  import { cl_join } from '~/tools/cl_join';

  let { status_on = $bindable(), class: className }: { status_on: boolean; class?: string } =
    $props();
</script>

<div class={cl_join('flex space-x-5', className)}>
  <Switch name="hindi_typing_tool" stateFocused="outline-none select-none" bind:checked={status_on}>
    <span class="text-sm">हिन्दी लेखन</span>
  </Switch>
  <TypingAssistance />
</div>
