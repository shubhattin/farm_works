<script lang="ts">
  import Icon from '~/tools/Icon.svelte';
  import AddCustomer from './AddCustomer.svelte';
  import { AiOutlineUserAdd } from 'svelte-icons-pack/ai';
  import { scale, slide } from 'svelte/transition';
  import { load_parivartak_lang_data } from '~/tools/converter';
  import { onMount } from 'svelte';
  import { user_info } from '~/state/user.svelte';
  import CustomerList from './CustomerList.svelte';
  import LipiLekhikaSwitch from '~/components/LipiLekhikaSwitch.svelte';
  import { typing_tool_enabled } from '~/state/main.svelte';

  onMount(() => {
    setTimeout(() => {
      // loading for allowing hindi typing
      load_parivartak_lang_data('Hindi', './src', true);
    }, 1500);
  });

  let add_new_customer_opened = $state(false);
</script>

{#if add_new_customer_opened && user_info.value && user_info.value.user_type === 'admin'}
  <div in:scale out:slide>
    <AddCustomer bind:current_page_open={add_new_customer_opened} />
  </div>
{:else}
  <div class="flex justify-between">
    <LipiLekhikaSwitch bind:status_on={typing_tool_enabled.value} />
    {#if user_info.value && user_info.value.user_type === 'admin'}
      <button
        onclick={() => (add_new_customer_opened = true)}
        class="gap-1 rounded-xl bg-secondary-600 px-2 py-1 pb-0 text-sm font-bold text-white dark:bg-secondary-700"
      >
        <Icon src={AiOutlineUserAdd} class="-mt-1 text-xl" />
        नया ग्राहक जोड़ें
      </button>
    {/if}
  </div>
  <CustomerList lipi_lekhika_enabled={typing_tool_enabled.value} />
{/if}
