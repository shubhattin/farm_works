<script lang="ts">
  import { client_q, client } from '~/api/client';
  import { page } from '$app/state';
  import { TiArrowBackOutline } from 'svelte-icons-pack/ti';
  import Icon from '~/tools/Icon.svelte';
  import { user_info } from '~/state/user.svelte';
  import { LuRefreshCw } from 'svelte-icons-pack/lu';
  import { cl_join } from '~/tools/cl_join';

  let { customer_id }: { customer_id: number } = $props();

  type customer_data_type = Awaited<ReturnType<typeof client.customer.get_customers_data.query>>;

  let customer_info_q = client_q.customer.get_customers_data.query(
    { customer_id },
    {
      initialData: page.data.customer_data as customer_data_type
    }
  );
</script>

<div class="mb-4 space-x-6">
  {#if $user_info}
    <a
      class="btn gap-1 rounded-md bg-primary-600 p-1 pr-1.5 font-bold text-white outline-none"
      href="/"
    >
      <Icon src={TiArrowBackOutline} class="text-2xl" /> मुख्य पृष्ठ
    </a>
  {/if}
  <button
    disabled={$customer_info_q.isFetching}
    onclick={() => $customer_info_q.refetch()}
    class={cl_join(
      'btn select-none p-0 outline-none',
      $customer_info_q.isFetching && 'animate-spin'
    )}
  >
    <Icon src={LuRefreshCw} class="text-2xl" />
  </button>
</div>
{JSON.stringify($customer_info_q.data)}
