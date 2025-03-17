<script lang="ts">
  import { type client, client_q } from '~/api/client';
  import { jotAI_list, kaTAI_dhAn_list, kaTAi_list } from '../type_names';
  import { DateInput } from '~/components/DatePicker';
  import { cl_join } from '~/tools/cl_join';
  import ConfirmModal from '~/components/PopoverModals/ConfirmModal.svelte';
  import { useQueryClient } from '@tanstack/svelte-query';
  import Icon from '~/tools/Icon.svelte';
  import { VscSave } from 'svelte-icons-pack/vsc';

  let {
    customer_id,
    customer_uuid,
    bill_info,
    modal_opened = $bindable()
  }: {
    customer_id: number;
    customer_uuid: string;
    bill_info: Awaited<ReturnType<typeof client.customer.get_customers_data.query>>['bills'][0];
    modal_opened: boolean;
  } = $props();

  const query_client = useQueryClient();

  let edit_bill_mut = client_q.records.edit_bill.mutation({
    onSuccess() {
      query_client.invalidateQueries({
        queryKey: [['customer', 'get_customers_data'], { input: { customer_id, customer_uuid } }]
      });
      modal_opened = false;
    }
  });

  let date = $state(bill_info.date);
  let rate = $state(bill_info.rate);
  let kaTAI_jotAI_kheta = $state(bill_info.jotAI_records?.kheta || bill_info.kaTAI_records?.kheta);
  let jotAI_chasa = $state(bill_info.jotAI_records?.chAsa);
  let trolley_number = $state(bill_info.trolley_records?.number);

  let total: number | null = $derived.by(() => {
    if (!rate) return null;
    const _rate = parseFloat(rate);
    let value: number | null = null;
    if (bill_info.kaTAI_records && kaTAI_jotAI_kheta) {
      const _kaTAI_jotAI_kheta = parseFloat(kaTAI_jotAI_kheta);
      value = _rate * _kaTAI_jotAI_kheta;
    } else if (bill_info.jotAI_records && kaTAI_jotAI_kheta) {
      const _kaTAI_jotAI_kheta = parseFloat(kaTAI_jotAI_kheta);
      if (jotAI_chasa) {
        const _jotAI_chasa = parseFloat(jotAI_chasa);
        value = _rate * _jotAI_chasa * _kaTAI_jotAI_kheta;
      } else value = _rate * _kaTAI_jotAI_kheta;
    } else if (bill_info.trolley_records && trolley_number) {
      value = _rate * trolley_number;
    }
    return value ? parseInt(value.toFixed()) : value;
  });
  const PAID_AMOUNT = bill_info.total - bill_info.remaining_amount;
  let remaining_amount = $derived(total ? total - PAID_AMOUNT : null);

  let confirm_modal_opened = $state(false);

  const edit_bill_func = async () => {
    confirm_modal_opened = false;
    await $edit_bill_mut.mutateAsync({
      customer_id,
      bill_id: bill_info.id,
      total: total!,
      rate: rate.toString(),
      date,
      kaTAI_jotAI_kheta: kaTAI_jotAI_kheta?.toString(),
      jotAI_chAsa: jotAI_chasa?.toString(),
      trolley_number: trolley_number!,
      type: bill_info.kaTAI_records ? 'kaTAI' : bill_info.jotAI_records ? 'jotAI' : 'trolley'
    });
  };
</script>

<div class="text-center text-lg font-bold text-amber-700 dark:text-warning-500">
  देयक अद्यतित करें
</div>
<form
  class="space-y-3"
  onsubmit={(e) => {
    e.preventDefault();
    confirm_modal_opened = true;
  }}
>
  <div class="text-sm">देयक ID : <span class="font-bold">{bill_info.id}</span></div>
  {#if bill_info.kaTAI_records || bill_info.jotAI_records}
    {#if bill_info.kaTAI_records}
      <div>
        कटाई प्रकार : <span class="font-semibold">{kaTAi_list[bill_info.kaTAI_records.type]}</span>
      </div>
      {#if bill_info.kaTAI_records.dhAna_type}
        <div>
          धान प्रकार : <span class="font-semibold"
            >{kaTAI_dhAn_list[bill_info.kaTAI_records.dhAna_type]}</span
          >
        </div>
      {/if}
    {:else if bill_info.jotAI_records}
      <div>
        जोताई प्रकार : <span class="font-semibold">{jotAI_list[bill_info.jotAI_records.type]}</span>
      </div>
      {#if bill_info.jotAI_records.chAsa}
        <label class="block">
          <span class="label-text font-semibold">चास</span>
          <input type="number" step="0.01" class="input rounded-lg" bind:value={jotAI_chasa} />
        </label>
      {/if}
    {/if}
    <label class="block">
      <span class="label-text font-semibold">खेत (बिस्सा)</span>
      <input type="number" step="0.01" class="input rounded-lg" bind:value={kaTAI_jotAI_kheta} />
    </label>
  {:else if bill_info.trolley_records}
    <label class="block">
      <span class="label-text font-semibold">संख्या</span>
      <input type="number" class="input rounded-lg" bind:value={trolley_number} />
    </label>
  {/if}
  <label class="block">
    <span class="label-text font-semibold">दर (₹)</span>
    <input type="number" step="0.01" class="input rounded-lg" bind:value={rate} />
  </label>
  <label class="block">
    <span class="label-text font-semibold">दिनांक</span>
    <div class="relative isolate">
      <DateInput
        bind:value={date}
        required={true}
        closeOnSelection={true}
        placeholder="दिनांक"
        format="dd-MM-yy HH:mm"
        timePrecision={'minute'}
      />
    </div>
  </label>
  {#if total}
    <div>
      कुल राशि : <span class="font-semibold">₹ {total}</span>
    </div>
    <div>
      शेष राशि : <span
        class={cl_join(
          'font-semibold',
          remaining_amount === 0 && 'text-green-600 dark:text-green-500'
        )}>₹ {remaining_amount!}</span
      >
    </div>
    {#if remaining_amount! < 0}
      <div class="text-sm text-wrap text-amber-800 dark:text-warning-400">
        ⚠️ क्यों कि शेष राशि शॊन्य से कम नहीं हो सकती इसिलिए एस देयक को पूर्ण मान लिया जाएगा और बची
        हुई अधिक राशि का भविश्ष मे आपको स्वयं ध्यान रखना होगा ।
      </div>
    {/if}
  {/if}
  <button
    disabled={$edit_bill_mut.isPending || !total}
    class="btn gap-2 rounded-lg bg-secondary-700 px-2 py-1 font-bold text-white dark:bg-secondary-700"
    type="submit"
  >
    <Icon src={VscSave} class="text-xl" />
    संपादित करें
  </button>
</form>

<ConfirmModal
  title={`क्या आप निश्चित हैं कि देयक को संपादित करना चाहते हैं ?`}
  bind:popup_state={confirm_modal_opened}
  confirm_func={() => {
    edit_bill_func();
  }}
/>
