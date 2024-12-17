<script lang="ts">
  import { Switch } from '@skeletonlabs/skeleton-svelte';
  import TypingAssistance from './TypingAssistance.svelte';

  let { status_on = $bindable() }: { status_on: boolean } = $props();
</script>

<div class="flex space-x-5">
  <Switch
    name="hindi_typing_tool"
    stateFocused="outline-none select-none"
    labelBase="text-sm"
    bind:checked={status_on}
  >
    हिन्दी लेखन
  </Switch>
  <TypingAssistance />
</div>
