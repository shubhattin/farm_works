<script lang="ts">
  import { VscSave } from 'svelte-icons-pack/vsc';
  import ConfirmModal from '~/components/PopoverModals/ConfirmModal.svelte';
  import Icon from '~/tools/Icon.svelte';
  import { client_q } from '~/api/client';
  import { useQueryClient } from '@tanstack/svelte-query';
  import { lekhika_typing_tool, load_parivartak_lang_data } from '~/tools/converter';
  import LipiLekhikaSwitch from '~/components/LipiLekhikaSwitch.svelte';
  import { typing_tool_enabled } from '~/state/main.svelte';
  import { onMount } from 'svelte';

  const query_client = useQueryClient();

  let {
    customer_id,
    customer_uuid,
    name: current_name,
    address: current_address,
    phone_number: current_phone_number,
    modal_opened = $bindable()
  }: {
    customer_id: number;
    customer_uuid: string;
    name: string;
    address?: string | null;
    phone_number?: string | null;
    modal_opened: boolean;
  } = $props();

  onMount(() => {
    // loading for allowing hindi typing
    load_parivartak_lang_data('Hindi', './src', true);
  });

  let name = $state(current_name);
  let address = $state(current_address);
  let phone_number = $state<number | null>(
    (() => {
      try {
        return parseInt(current_phone_number!);
      } catch {
        return null;
      }
    })()
  );
  let confirm_modal_opened = $state(false);

  let edit_customer_info_mut = client_q.customer.edit_customer_info.mutation({
    onSuccess() {
      query_client.invalidateQueries({
        queryKey: [
          ['customer', 'get_customers_data'],
          { input: { customer_id, customer_uuid }, type: 'query' }
        ],
        exact: true
      });
      query_client.invalidateQueries({
        queryKey: [
          ['customer', 'get_customer_additional_data'],
          { input: { customer_id, customer_uuid }, type: 'query' }
        ],
        exact: true
      });
      modal_opened = false;
    }
  });

  const edit_info_func = async () => {
    confirm_modal_opened = false;
    if (!address) return;
    if (phone_number) {
      const ph_no = phone_number.toString();
      if (ph_no.length > 0 && ph_no.length !== 10) return;
      // ^ numbers only with length of 10 allowed
    }
    await $edit_customer_info_mut.mutateAsync({
      customer_id,
      customer_uuid,
      name,
      phone_number:
        !phone_number || phone_number.toString().length === 0 ? null : phone_number.toString(),
      address: address.length > 0 ? address : null
    });
  };
</script>

<div class="text-center text-lg font-bold text-amber-700 dark:text-warning-500">
  उपयोक्ता विज्ञप्ति का अद्यतन करें
</div>
<LipiLekhikaSwitch bind:status_on={$typing_tool_enabled} />
<div class="space-y-3">
  <label class="block">
    <span class="label-text font-semibold">नाम</span>
    <input
      type="text"
      oninput={async (e) => {
        if ($typing_tool_enabled)
          // @ts-ignore
          await lekhika_typing_tool(e.target, e.data, 'Hindi', true, (val) => {
            name = val;
          });
        else name = (e.target as any).value;
      }}
      class="input rounded-lg"
      bind:value={name}
      required
    />
  </label>
  <label class="block">
    <span class="label-text font-semibold">फ़ोन नंबर</span>
    <input type="number" class="input rounded-lg" bind:value={phone_number} />
  </label>
  <label class="block">
    <span class="label-text font-semibold">पता</span>
    <input
      type="text"
      oninput={async (e) => {
        if ($typing_tool_enabled)
          // @ts-ignore
          await lekhika_typing_tool(e.target, e.data, 'Hindi', true, (val) => {
            address = val;
          });
        else address = (e.target as any).value;
      }}
      class="input rounded-lg"
      bind:value={address}
    />
  </label>
  <button
    disabled={$edit_customer_info_mut.isPending}
    class="btn gap-2 rounded-lg bg-secondary-700 px-2 py-1 font-bold text-white dark:bg-secondary-700"
    onclick={() => (confirm_modal_opened = true)}
  >
    <Icon src={VscSave} class="text-xl" />
    संपादित करें
  </button>
</div>
<ConfirmModal
  title={`क्या आप पुष्टि करते हैं कि उपयोक्ता संख्या ${customer_id} के विवरण को अद्यतनित करना चाहते हैं ?`}
  bind:popup_state={confirm_modal_opened}
  confirm_func={() => {
    edit_info_func();
  }}
/>
