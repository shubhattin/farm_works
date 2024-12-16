<script lang="ts">
  import { VscAdd } from 'svelte-icons-pack/vsc';
  import UserControls from './user/UserControls.svelte';
  import Icon from '~/tools/Icon.svelte';
  import AddCustomer from './AddCustomer.svelte';

  let add_new_customer_opened = $state(false);
</script>

<div class="flex justify-end">
  <UserControls />
</div>
{#if !add_new_customer_opened}
  <button
    onclick={() => (add_new_customer_opened = true)}
    class="btn gap-1 rounded-xl px-2 py-1 pb-0 font-bold preset-filled-primary-400-600"
  >
    <Icon src={VscAdd} class="text-2xl" />
    नया ग्राहक जोड़ें
  </button>
{:else}
  <AddCustomer />
{/if}
