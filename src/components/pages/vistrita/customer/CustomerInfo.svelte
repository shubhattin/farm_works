<script lang="ts">
  import { client_q } from '~/api/client';

  let { customer_id }: { customer_id: number } = $props();

  let customer_info_q = client_q.customer.get_customers_data.query({ customer_id });
</script>

{JSON.stringify($customer_info_q.data)}
