<script lang="ts">
  import UserControls from './user/UserControls.svelte';
  import Icon from '~/tools/Icon.svelte';
  import AddCustomer from './AddCustomer.svelte';
  import { AiOutlineUserAdd } from 'svelte-icons-pack/ai';
  import { slide } from 'svelte/transition';
  import { load_parivartak_lang_data } from '~/tools/converter';
  import { onMount } from 'svelte';
  import { user_info } from '~/state/user.svelte';
  import CustomerList from './CustomerList.svelte';
  import LipiLekhikaSwitch from '~/components/LipiLekhikaSwitch.svelte';

  onMount(() => {
    setTimeout(() => {
      // loading for allowing hindi typing
      load_parivartak_lang_data('Hindi', './src', true);
    }, 1500);
  });

  let add_new_customer_opened = $state(false);
  let lipi_lekhika_search_switch = $state(true);
</script>

<div class="flex justify-end">
  <UserControls />
</div>
{#if add_new_customer_opened && $user_info?.user_type === 'admin'}
  <div transition:slide>
    <AddCustomer bind:current_page_open={add_new_customer_opened} />
  </div>
{:else}
  <div class="flex justify-between">
    <LipiLekhikaSwitch status_on={lipi_lekhika_search_switch} />
    <button
      onclick={() => (add_new_customer_opened = true)}
      class="gap-1 rounded-xl bg-secondary-600 px-2 py-1 pb-0 text-sm font-bold text-white dark:bg-secondary-700"
    >
      <Icon src={AiOutlineUserAdd} class="-mt-1 text-xl" />
      नया ग्राहक जोड़ें
    </button>
  </div>
  <CustomerList lipi_lekhika_enabled={lipi_lekhika_search_switch} />
{/if}
