<script lang="ts">
  import UserControls from './user/UserControls.svelte';
  import Icon from '~/tools/Icon.svelte';
  import AddCustomer from './AddCustomer.svelte';
  import { AiOutlineUserAdd } from 'svelte-icons-pack/ai';
  import { slide } from 'svelte/transition';
  import { VscAdd } from 'svelte-icons-pack/vsc';
  import { load_parivartak_lang_data } from '~/tools/converter';
  import { onMount } from 'svelte';
  import AddRecord from './AddRecord.svelte';

  onMount(() => {
    setTimeout(() => {
      // loading for allowing hindi typing
      load_parivartak_lang_data('Hindi', './src', true);
    }, 1500);
  });

  let add_new_customer_opened = $state(false);
  let add_new_record_opened = $state(false);
</script>

<div class="flex justify-end">
  <UserControls />
</div>
{#if add_new_customer_opened}
  <div transition:slide>
    <AddCustomer />
  </div>
{:else if add_new_record_opened}
  <div transition:slide>
    <AddRecord />
  </div>
{:else}
  <div class="flex justify-between">
    <button
      onclick={() => (add_new_record_opened = true)}
      class="btn gap-1 bg-primary-500 px-3 py-2 pb-1 text-white dark:bg-primary-600"
    >
      <Icon src={VscAdd} class="text-2xl" />
      नव अंकन करें
    </button>
    <button
      onclick={() => (add_new_customer_opened = true)}
      class="gap-1 rounded-xl bg-secondary-600 px-2 py-1 pb-0 text-sm font-bold text-white dark:bg-secondary-700"
    >
      <Icon src={AiOutlineUserAdd} class="-mt-1 text-xl" />
      नया ग्राहक जोड़ें
    </button>
  </div>
{/if}
