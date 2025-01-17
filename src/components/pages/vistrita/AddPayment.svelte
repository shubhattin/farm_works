<script lang="ts">
  import { AiOutlineClose } from 'svelte-icons-pack/ai';
  import { VscAdd } from 'svelte-icons-pack/vsc';
  import { client_q } from '~/api/client';
  import { cl_join } from '~/tools/cl_join';
  import Icon from '~/tools/Icon.svelte';
  import { useQueryClient } from '@tanstack/svelte-query';
  import { onMount } from 'svelte';
  import ConfirmModal from '~/components/PopoverModals/ConfirmModal.svelte';
  import DateInput from '~/components/DatePicker/DateInput.svelte';

  const query_client = useQueryClient();

  let {
    customer_id,
    customer_uuid,
    bill_id,
    current_page_opened = $bindable(),
    remaning_amount
  }: {
    customer_id: number;
    customer_uuid: string;
    bill_id: number;
    current_page_opened: boolean;
    remaning_amount: number;
  } = $props();

  let amount = $state<number | null>(null);

  const submit_bill_payment_mut = client_q.records.submit_bill_payment.mutation({
    onSuccess() {
      current_page_opened = false;
      query_client.invalidateQueries({
        queryKey: [
          ['customer', 'get_customers_data'],
          { input: { customer_id, customer_uuid }, type: 'query' }
        ],
        exact: true
      });
      query_client.invalidateQueries({
        queryKey: [
          ['records', 'get_bill_payments'],
          {
            input: { bill_id, customer_id, customer_uuid },
            type: 'query'
          }
        ],
        exact: true
      });
      query_client.invalidateQueries({
        queryKey: [['customer', 'get_customers_list']],
        exact: false
      }); // wont refetch untill enabled (used)
    }
  });

  let date = $state(new Date());

  const submit_bill_payment_func = async () => {
    confirm_modal_opened = false;
    if (!amount || amount <= 0 || amount > remaning_amount) return;
    await $submit_bill_payment_mut.mutateAsync({
      customer_id,
      customer_uuid,
      bill_id,
      amount,
      date
    });
  };

  onMount(() => {
    amount_input_elmnt && amount_input_elmnt.focus();
  });

  let confirm_modal_opened = $state(false);
  let amount_input_elmnt = $state<HTMLInputElement | null>(null);
</script>

<div class="mb-2 flex space-x-4">
  <button
    class="btn rounded-lg bg-error-500 px-1.5 py-1 outline-none"
    onclick={() => (current_page_opened = false)}
  >
    <Icon src={AiOutlineClose} class="text-2xl text-white" />
  </button>
</div>
<div class="space-y-2">
  <DateInput
    bind:value={date}
    required={true}
    placeholder="दिनांक"
    format="dd-MM-yyyy HH:mm"
    timePrecision={'minute'}
  />
  <div>पेय राशि : <span class="font-bold">₹ {remaning_amount}</span></div>
  <label>
    <span class="label-text">राशि (₹)</span>
    <input
      type="number"
      bind:value={amount}
      bind:this={amount_input_elmnt}
      class={cl_join(
        'input w-32 rounded-lg',
        amount && amount > remaning_amount && 'preset-tonal-error'
      )}
    />
  </label>
  {#if amount}
    {#if amount <= remaning_amount}
      <div>
        शेष पेय राशि: <span
          class={cl_join(
            'font-bold',
            remaning_amount === amount && 'text-green-500 dark:text-green-400'
          )}>₹ {remaning_amount - amount}</span
        >
      </div>

      <button
        onclick={() => (confirm_modal_opened = true)}
        class="btn block gap-1 rounded-md bg-primary-500 px-2 py-1 pb-0 font-bold text-white dark:bg-primary-600"
        disabled={$submit_bill_payment_mut.isPending}
      >
        <Icon src={VscAdd} class="text-xl" />
        वित्तदन जोड़ें
      </button>
    {:else}
      <div class="text-error-600 dark:text-error-500">पेय राशि से अधिक भुगतान नही हो सकता !</div>
    {/if}
  {/if}
</div>

<ConfirmModal
  bind:popup_state={confirm_modal_opened}
  confirm_func={submit_bill_payment_func}
  description={`क्या आप निश्चित हैं कि ₹ ${amount} के वित्तदन राशि को जोड़ना चाहते हैं ?`}
/>
