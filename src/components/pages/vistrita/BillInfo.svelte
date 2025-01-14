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
</script>

<div class="mb-3 space-x-4">
  <button
    onclick={() => (bill_id = null)}
    class=" btn select-none rounded-lg bg-rose-600 p-1 text-white outline-none dark:bg-rose-500"
  >
    <Icon src={BiCollapseAlt} class="text-2xl" />
  </button>
  {#if !add_payment_opened}
    {#if $user_info && !bill_info.payment_complete && bill_info.remaining_amount > 0}
      <button
        onclick={() => (add_payment_opened = true)}
        class="btn gap-1 rounded-md bg-primary-600 p-1 pr-1.5 font-bold text-white dark:bg-primary-600"
      >
        <Icon src={BsPlusLg} class="text-2xl" />
        नया वित्तदन जोड़ें
      </button>
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
    {@const payments = $bill_payments_q.data}
    {#if payments.length === 0}
      <div class="mt-6 text-sm text-warning-700-300">इस बिल का अब तक कोई भुगतान नही है।</div>
    {:else}
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th></th>
              <th class="font-bold">समय</th>
              <th class="font-bold">राशि (₹)</th>
            </tr>
          </thead>
          <tbody class="hover:[&>tr]:preset-tonal-tertiary">
            {#each payments as payment (payment.id)}
              <tr>
                <td style="padding: 0; margin:0;padding-left: 0.35rem;" class=""
                  ><span class="text-gray-500 dark:text-zinc-400" style="font-size: 0.6rem;"
                    >{payment.id}</span
                  ></td
                >
                <td
                  >{payment.timestamp.toLocaleString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: '2-digit',
                    month: '2-digit',
                    year: '2-digit',
                    hour12: true,
                    timeZone: 'Asia/Kolkata'
                  })}</td
                >
                <td>{payment.amount}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  {/if}
{:else}
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
