<script lang="ts">
  import { type client, client_q } from '~/api/client';
  import { DateInput } from '~/components/DatePicker';
  import { cl_join } from '~/tools/cl_join';
  import ConfirmModal from '~/components/PopoverModals/ConfirmModal.svelte';
  import { useQueryClient } from '@tanstack/svelte-query';
  import Icon from '~/tools/Icon.svelte';
  import { VscSave } from 'svelte-icons-pack/vsc';

  let {
    customer_id,
    customer_uuid,
    payment_info,
    bill_id,
    modal_opened = $bindable()
  }: {
    customer_id: number;
    customer_uuid: string;
    bill_id: number;
    payment_info: Awaited<ReturnType<typeof client.records.get_bill_payments.query>>['payments'][0];
    modal_opened: boolean;
  } = $props();

  const query_client = useQueryClient();

  const edit_payment_mut = client_q.records.edit_payment.mutation({
    onSuccess() {
      // [["records","get_bill_payments"],{"input":{"bill_id":50,"customer_id":4,"customer_uuid":"c9c04dcb-02e6-41b8-ad7d-009601136525"},"type":"query"}]
      query_client.invalidateQueries({
        queryKey: [
          ['records', 'get_bill_payments'],
          { input: { bill_id, customer_id, customer_uuid }, type: 'query' }
        ],
        exact: true
      });
      modal_opened = false;
    }
  });

  const edit_bill_func = async () => {
    confirm_modal_opened = false;
    await $edit_payment_mut.mutateAsync({
      customer_id,
      customer_uuid,
      bill_id,
      payment_id: payment_info.id,
      date
    });
  };
  let date = $state(payment_info.date);
  let confirm_modal_opened = $state(false);
</script>

<div class="text-center text-lg font-bold text-amber-700 dark:text-warning-500">
  वित्तदन अद्यतित करें
</div>
<div class="space-y-5">
  <div class="text-sm">वित्तदन ID : <span class="font-semibold">{payment_info.id}</span></div>
  <div>राशि : <span class="font-bold">₹ {payment_info.amount}</span></div>
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
  <button
    disabled={$edit_payment_mut.isPending}
    class="btn gap-2 rounded-lg bg-secondary-700 px-2 py-1 font-bold text-white dark:bg-secondary-700"
    onclick={() => (confirm_modal_opened = true)}
  >
    <Icon src={VscSave} class="text-xl" />
    संपादित करें
  </button>
</div>

<ConfirmModal
  title={`क्या आप निश्चित हैं कि वित्तदन को संपादित करना चाहते हैं ?`}
  bind:popup_state={confirm_modal_opened}
  confirm_func={() => {
    edit_bill_func();
  }}
/>
