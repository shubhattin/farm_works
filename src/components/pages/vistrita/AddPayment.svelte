<script lang="ts">
  import { AiOutlineClose } from 'svelte-icons-pack/ai';
  import Icon from '~/tools/Icon.svelte';

  let {
    customer_id,
    customer_uuid,
    bill_id,
    current_page_opened = $bindable()
  }: {
    customer_id: number;
    customer_uuid: string;
    bill_id: number;
    current_page_opened: boolean;
  } = $props();
</script>

<div class="mb-2 flex space-x-4">
  <button
    class="btn rounded-lg bg-error-500 px-1.5 py-1 outline-none"
    onclick={() => (current_page_opened = false)}
  >
    <Icon src={AiOutlineClose} class="text-2xl text-white" />
  </button>
</div>
