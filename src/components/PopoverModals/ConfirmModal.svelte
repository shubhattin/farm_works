<script lang="ts">
  import { Modal } from '@skeletonlabs/skeleton-svelte';
  import type { Snippet } from 'svelte';
  import { cl_join } from '~/tools/cl_join';

  let {
    children,
    popup_state = $bindable(),
    description,
    cancel_func,
    confirm_func,
    contentBase
  }: {
    children?: Snippet;
    confirm_func?: () => void;
    cancel_func?: () => void;
    description: string;
    popup_state: boolean;
    contentBase?: string;
  } = $props();
</script>

<Modal
  bind:open={popup_state}
  contentBase={cl_join(
    'card z-50 space-y-2 p-2 rounded-lg shadow-xl bg-surface-100-900',
    contentBase
  )}
  backdropBackground="backdrop-blur-xs"
>
  {#snippet trigger()}
    {@render children?.()}
  {/snippet}
  {#snippet content()}
    <div class="text-lg font-semibold">{description}</div>
    <div class="space-x-2">
      <button
        class="btn rounded-lg bg-primary-600 font-semibold text-white dark:bg-surface-500 dark:text-white"
        onclick={confirm_func}
      >
        पुष्टि करें
      </button>
      <button
        onclick={() => {
          popup_state = false;
          cancel_func && cancel_func();
        }}
        class="btn rounded-lg preset-outlined-surface-800-200 font-semibold"
      >
        रद्द करें
      </button>
    </div>
  {/snippet}
</Modal>
