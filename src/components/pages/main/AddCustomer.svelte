<script lang="ts">
  import { lekhika_typing_tool } from '~/tools/converter';
  import { client_q } from '~/api/client';
  import Icon from '~/tools/Icon.svelte';
  import { VscAdd } from 'svelte-icons-pack/vsc';
  import { scale } from 'svelte/transition';
  import { TrOutlineArrowBackUp } from 'svelte-icons-pack/tr';
  import { TiArrowBackOutline } from 'svelte-icons-pack/ti';
  import LipiLekhikaSwitch from '~/components/LipiLekhikaSwitch.svelte';
  import ConfirmModal from '~/components/PopoverModals/ConfirmModal.svelte';
  import { useQueryClient } from '@tanstack/svelte-query';
  import { typing_tool_enabled } from '~/state/main';

  const query_client = useQueryClient();

  let { current_page_open = $bindable() }: { current_page_open: boolean } = $props();

  const register_customer_mut = client_q.customer.register_customer.mutation({
    onSuccess: () => {
      query_client.invalidateQueries({
        queryKey: [['customer', 'get_customers_list']],
        exact: false
      });
    }
  });

  const add_customer_func = async () => {
    confirm_modal_opened = false;
    if (phone_number) {
      const ph_no = phone_number.toString();
      if (ph_no.length > 0 && ph_no.length !== 10) return;
      // ^ numbers only with length of 10 allowed
    }
    await $register_customer_mut.mutateAsync({
      name,
      phone_number:
        !phone_number || phone_number.toString().length === 0 ? null : phone_number.toString(),
      address: address.length > 0 ? address : null
    });
  };

  let name = $state('');
  let phone_number = $state<number | null>(null);
  let address = $state('');

  let confirm_modal_opened = $state(false);
</script>

<ConfirmModal
  bind:popup_state={confirm_modal_opened}
  description={`क्या आप निस्चित हैं कि आप ${name} नामक ग्राहक को जोड़ना चाहते हैं ?`}
  confirm_func={add_customer_func}
></ConfirmModal>
{#if !$register_customer_mut.isSuccess}
  <div class="flex space-x-4">
    <button
      onclick={() => (current_page_open = false)}
      class="btn rounded-md bg-surface-500 px-2 py-1 text-white outline-none"
    >
      <Icon src={TiArrowBackOutline} class="text-2xl" />
    </button>
    <LipiLekhikaSwitch class="inline-flex" bind:status_on={$typing_tool_enabled} />
  </div>
  <form
    onsubmit={(e: Event) => {
      e.preventDefault();
      confirm_modal_opened = true;
    }}
    class="mt-5 space-y-2"
  >
    <label>
      <span class="label-text">नाम <span class="text-error-400">*</span></span>
      <input
        required
        autocapitalize="off"
        autocomplete="off"
        oninput={async (e) => {
          if ($typing_tool_enabled)
            // @ts-ignore
            await lekhika_typing_tool(e.target, e.data, 'Hindi', true, (val) => {
              name = val;
            });
          else name = (e.target as any).value;
        }}
        type="text"
        class="input rounded-md"
        bind:value={name}
        name="name"
        placeholder="नाम"
        minlength={3}
        maxlength={50}
      />
    </label>
    <label>
      <span class="label-text">फ़ोन नंबर</span>
      <input
        type="number"
        class="input rounded-md"
        bind:value={phone_number}
        name="phone_number"
        placeholder="फ़ोन नंबर"
      />
    </label>
    <label>
      <span class="label-text">पता</span>
      <input
        autocapitalize="off"
        autocomplete="off"
        type="text"
        class="input rounded-md"
        bind:value={address}
        name="address"
        placeholder="पता"
        oninput={async (e) => {
          if ($typing_tool_enabled)
            // @ts-ignore
            await lekhika_typing_tool(e.target, e.data, 'Hindi', true, (val) => {
              address = val;
            });
          else address = (e.target as any).value;
        }}
        minlength="5"
        maxlength="100"
      />
    </label>
    <button
      type="submit"
      disabled={$register_customer_mut.isPending}
      class="btn gap-1 rounded-md bg-primary-500 px-2 py-1 font-bold text-white dark:bg-primary-600"
    >
      <Icon src={VscAdd} class="text-xl" />
      ग्राहक जोड़ें
    </button>
  </form>
{:else}
  {@const data = $register_customer_mut.data}
  <div class="space-y-1" transition:scale>
    <div class="font-bold text-success-600 dark:text-success-400">
      {name} (#{data.id}) को सफलतापूर्वक प्रविष्टित किया गया है 🎉 ।
    </div>
  </div>
  <button
    onclick={() => {
      current_page_open = false;
    }}
    class="btn -mt-1 select-none gap-1 rounded-md bg-surface-500 px-2 py-1 pb-0 font-bold text-white outline-none"
  >
    <Icon src={TrOutlineArrowBackUp} class="-mt-1 text-xl " />
    मुख्य पृष्ठ
  </button>
{/if}
