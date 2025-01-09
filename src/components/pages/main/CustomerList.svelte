<script lang="ts">
  import { client_q } from '~/api/client';

  const customers_list = client_q.customer.get_customers_list.query();
</script>

<div class="table-wrap">
  <table class="table cursor-default">
    <thead>
      <tr>
        <th></th>
        <th style="font-weight:700;">ग्राहक नाम</th>
        <th style="font-weight:700;">कुल राशि</th>
        <th style="font-weight:700;">अंतिम राशि</th>
        <th style="font-weight:700;">शेष राशि</th>
      </tr>
    </thead>
    <tbody class="hover:[&>tr]:preset-tonal-primary">
      {#if $customers_list.isFetching || !$customers_list.isSuccess}
        {#each Array(20) as _, i}
          <tr>
            <td style="padding: 0; margin:0;">
              <span class="placeholder inline-block h-4 w-4 animate-pulse rounded-sm"></span>
            </td>
            <td>
              <span class="placeholder inline-block h-6 w-28 animate-pulse rounded-lg"></span>
            </td>
            <td>
              <span class="placeholder inline-block h-4 w-14 animate-pulse rounded-lg"></span>
            </td>
            <td>
              <span class="placeholder inline-block h-4 w-14 animate-pulse rounded-lg"></span>
            </td>
            <td>
              <span class="placeholder inline-block h-4 w-14 animate-pulse rounded-lg"></span>
            </td>
          </tr>
        {/each}
      {:else if $customers_list.isSuccess}
        {#each $customers_list.data as customer}
          <tr onclick={() => console.log(customer.customer_id)}>
            <td style="padding: 0; margin:0;padding-left: 0.35rem;">
              <span class="text-gray-500 dark:text-zinc-400" style="font-size: 0.6rem;"
                >{customer.customer_id}</span
              >
            </td>
            <td>
              {customer.customer_name}
            </td>
            <td>{customer.total_amount}</td>
            <td>{customer.total_paid}</td>
            <td>{customer.remainingAmount}</td>
          </tr>
        {/each}
      {/if}
    </tbody>
  </table>
</div>
