<script lang="ts">
  import { type client, client_q } from '~/api/client';
  import { jotAI_list, kaTAI_dhAn_list, kaTAi_list } from '../type_names';
  import { DateInput } from '~/components/DatePicker';

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

  let date = $state(bill_info.date);
  let rate = $state(bill_info.rate);
  let kheta = $state(bill_info.jotAI_records?.kheta || bill_info.kaTAI_records?.kheta);
  let chasa = $state(bill_info.jotAI_records?.chAsa);
  let number = $state(bill_info.trolley_records?.number);
</script>

<div class="text-center text-lg font-bold text-amber-700 dark:text-warning-500">
  देयक अद्यतित करें
</div>
<div class="space-y-3">
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
        <label>
          <span class="label-text font-semibold">चास</span>
          <input type="number" class="input rounded-lg" bind:value={chasa} />
        </label>
      {/if}
    {/if}
    <label class="block">
      <span class="label-text font-semibold">खेत (बिस्सा)</span>
      <input type="number" class="input rounded-lg" bind:value={kheta} />
    </label>
  {:else if bill_info.trolley_records}
    <label class="block">
      <span class="label-text font-semibold">संख्या</span>
      <input type="number" class="input rounded-lg" bind:value={number} />
    </label>
  {/if}
  <label class="block">
    <span class="label-text font-semibold">दर (₹)</span>
    <input type="number" class="input rounded-lg" bind:value={rate} />
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
</div>
