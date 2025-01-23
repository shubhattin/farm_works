<script lang="ts">
  import { client_q, type client } from '~/api/client';
  import Icon from '~/tools/Icon.svelte';
  import { BsPlusLg } from 'svelte-icons-pack/bs';
  import { user_info } from '~/state/user.svelte';
  import { cl_join } from '~/tools/cl_join';
  import { LuRefreshCw } from 'svelte-icons-pack/lu';
  import { BiCollapseAlt } from 'svelte-icons-pack/bi';
  import AddPayment from './AddPayment.svelte';
  import { fade, slide } from 'svelte/transition';
  import { FiEdit2 } from 'svelte-icons-pack/fi';
  import { Modal } from '@skeletonlabs/skeleton-svelte';
  import EditPaymentInfo from './edits/EditPaymentInfo.svelte';
  import EditBillInfo from './edits/EditBillInfo.svelte';

  let {
    customer_id,
    customer_uuid,
    bill_id = $bindable(),
    bill_info
  }: {
    customer_id: number;
    customer_uuid: string;
    bill_id: number | null;
    bill_info: Awaited<ReturnType<typeof client.customer.get_customers_data.query>>['bills'][0];
  } = $props();

  let add_payment_opened = $state(false);

  let bill_payments_q = client_q.records.get_bill_payments.query({
    customer_id,
    customer_uuid,
    bill_id: bill_id!
  });

  let edit_modal_opened = $state(false);
  let selected_payment_id = $state<number | null>(null);
  let payment_edit_modal_opened = $state(false);

  $effect(() => {
    if (!payment_edit_modal_opened) selected_payment_id = null;
  });
</script>

<div class="mb-3 space-x-2 sm:space-x-4">
  <button
    onclick={() => (bill_id = null)}
    class=" btn select-none rounded-lg bg-rose-600 p-1 text-white outline-none dark:bg-rose-500"
  >
    <Icon src={BiCollapseAlt} class="text-2xl" />
  </button>
  {#if !add_payment_opened}
    {#if user_info.value && user_info.value.user_type === 'admin' && !bill_info.payment_complete && bill_info.remaining_amount > 0}
      <button
        onclick={() => (add_payment_opened = true)}
        class="btn gap-1 rounded-md bg-primary-600 p-1 pr-1.5 font-bold text-white dark:bg-primary-600"
      >
        <Icon src={BsPlusLg} class="text-2xl" />
        नया वित्तदन जोड़ें
      </button>
    {/if}
    {#if user_info.value && user_info.value.user_type === 'admin' && !bill_info.payment_complete && bill_info.remaining_amount > 0}
      <Modal
        contentBase="card z-40 space-y-2 rounded-lg px-3 py-2 shadow-xl bg-surface-100-900"
        triggerBase="btn p-0 m-0 outline-none select-none"
        backdropBackground="backdrop-blur-md"
        bind:open={edit_modal_opened}
      >
        {#snippet trigger()}
          <Icon src={FiEdit2} class="text-xl" />
        {/snippet}
        {#snippet content()}
          <EditBillInfo
            {customer_id}
            {customer_uuid}
            {bill_info}
            bind:modal_opened={edit_modal_opened}
          />
        {/snippet}
      </Modal>
    {/if}
    <button
      disabled={$bill_payments_q.isFetched && $bill_payments_q.isFetching}
      onclick={() => $bill_payments_q.refetch()}
      class={cl_join(
        'btn select-none p-0 outline-none',
        $bill_payments_q.isFetched && $bill_payments_q.isFetching && 'animate-spin'
      )}
    >
      <Icon src={LuRefreshCw} class="text-xl" />
    </button>
  {/if}
</div>

{#if !add_payment_opened}
  {#if $bill_payments_q.isFetching || !$bill_payments_q.isSuccess}
    <div class="placeholder h-72 w-full rounded-md"></div>
  {:else if $bill_payments_q.isSuccess}
    {@const payments = $bill_payments_q.data.payments}
    {#if user_info.value && user_info.value.user_type === 'admin' && user_info.value.super_admin}
      <div class="py-1 text-sm text-gray-500 dark:text-slate-400">
        योजक उपयोक्ता :
        {#if $bill_payments_q.data.added_by_user!.id === user_info.value.id}
          <span class="font-semibold">स्वयं</span>
        {:else}
          {$bill_payments_q.data.added_by_user!.name}
          <span class="text-xs">(#{$bill_payments_q.data.added_by_user!.id})</span>
        {/if}
      </div>
    {/if}
    {#if payments.length === 0}
      <div class="mt-2 text-sm text-warning-700-300">इस बिल का अब तक कोई भुगतान नही है।</div>
    {:else}
      {@const is_super_admin =
        user_info.value && user_info.value.user_type === 'admin' && user_info.value.super_admin}
      <div class="table-wrap select-none">
        <table class="table">
          <thead>
            <tr>
              <th></th>
              <th class="font-bold">समय</th>
              {#if is_super_admin}
                <th class="font-bold">योजक उपयोक्ता</th>
              {/if}
              <th class="font-bold">राशि (₹)</th>
            </tr>
          </thead>
          <tbody class="hover:[&>tr]:preset-tonal-tertiary">
            {#each payments as payment, payment_i (payment.id)}
              <tr>
                <td style="padding: 0; margin:0;padding-left: 0.35rem;" class=""
                  ><span class="text-gray-500 dark:text-zinc-400" style="font-size: 0.6rem;"
                    >{payment.id}</span
                  ></td
                >
                <td>
                  <!-- svelte-ignore a11y_no_static_element_interactions -->
                  <span
                    ondblclick={() => {
                      if (user_info.value && user_info.value.user_type === 'admin') {
                        selected_payment_id = payment_i;
                        payment_edit_modal_opened = true;
                      }
                    }}
                    >{payment.date.toLocaleString('en-IN', {
                      // hour: '2-digit',
                      // minute: '2-digit',
                      // hour12: true,
                      day: '2-digit',
                      month: '2-digit',
                      year: '2-digit',
                      timeZone: 'Asia/Kolkata'
                    })}</span
                  ></td
                >
                {#if is_super_admin}
                  {@const added_by_user = payment.added_by_user!}
                  {#if added_by_user.id === user_info.value!.id}
                    <td class="text-sm">स्वयं</td>
                  {:else}
                    <td class="text-sm text-slate-500 dark:text-zinc-400"
                      >{added_by_user.name.split(' ')[0]}
                      <span class="text-xs">(#{added_by_user.id})</span></td
                    >
                  {/if}
                {/if}
                <td>{payment.amount}</td>
              </tr>
            {/each}
          </tbody>
          <tfoot>
            <tr>
              <td></td>
              <td colspan={is_super_admin ? 2 : 1} class="text-right font-semibold"
                >कुल वित्तदित राशि</td
              >
              <td class="text-left font-semibold"
                >₹ {payments.reduce((sum, val) => sum + val.amount, 0)}</td
              >
            </tr>
          </tfoot>
        </table>
      </div>
    {/if}
  {/if}
{:else if user_info.value}
  <div in:fade out:slide>
    <AddPayment
      {customer_id}
      {customer_uuid}
      bill_id={bill_id!}
      remaning_amount={bill_info.remaining_amount}
      bind:current_page_opened={add_payment_opened}
    />
  </div>
{/if}
{#if user_info.value && user_info.value.user_type === 'admin' && selected_payment_id !== null && payment_edit_modal_opened}
  <Modal
    contentBase="card z-40 space-y-2 rounded-lg px-3 py-2 shadow-xl bg-surface-100-900"
    triggerBase="btn p-0 m-0 outline-none select-none"
    backdropBackground="backdrop-blur-md"
    bind:open={payment_edit_modal_opened}
  >
    {#snippet content()}
      <EditPaymentInfo
        {customer_id}
        {customer_uuid}
        bill_id={bill_id!}
        payment_info={$bill_payments_q.data!.payments[selected_payment_id!]}
        bind:modal_opened={payment_edit_modal_opened}
      />
    {/snippet}
  </Modal>
{/if}
