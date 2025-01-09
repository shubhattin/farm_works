<script lang="ts">
  import { Switch } from '@skeletonlabs/skeleton-svelte';
  import TypingAssistance from './TypingAssistance.svelte';

  let { status_on = $bindable() }: { status_on: boolean } = $props();
</script>

<div class="flex space-x-5">
  <Switch name="hindi_typing_tool" stateFocused="outline-none select-none" bind:checked={status_on}>
    <span class="text-sm">हिन्दी लेखन</span>
  </Switch>
  <TypingAssistance />
</div>
