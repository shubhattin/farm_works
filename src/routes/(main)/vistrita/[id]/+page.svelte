<script lang="ts">
  import CustomerInfo from '~/components/pages/vistrita/customer/CustomerInfo.svelte';
  import type { PageData } from './$types';
  import { scale, slide } from 'svelte/transition';

  let { data }: { data: PageData } = $props();
</script>

<div in:scale out:slide>
  <CustomerInfo customer_id={data.id} />
</div>
