<script lang="ts">
  import { Combobox } from '@skeletonlabs/skeleton-svelte';
  import { createMutation, createQuery, useQueryClient } from '@tanstack/svelte-query';
  import { fade, slide } from 'svelte/transition';
  import { client } from '~/api/client';
  import ConfirmModal from '~/components/PopoverModals/ConfirmModal.svelte';
  import { authClient } from '~/lib/auth-client';

  const query_client = useQueryClient();

  let { modal_open = $bindable() }: { modal_open: boolean } = $props();

  const users_list = createQuery({
    queryKey: ['users_list'],
    queryFn: async () => {
      const data = await client.users.get_users_list.query();
      return data;
    }
  });

  let selected_user = $state<string[]>([]);

  let is_approved = $state(false);
  let role = $state('');
  let super_admin = $state(false);

  $effect(() => {
    if (selected_user.length > 0 && !$users_list.isFetching && $users_list.isSuccess) {
      const data = $users_list.data.find((user) => user.id === selected_user[0])!;
      is_approved = data?.is_approved ?? false;
      role = data.role ?? 'user';
      super_admin = data?.super_admin ?? false;
    }
  });

  $effect(() => {
    // maintaining state integrity
    if (!is_approved) {
      role = 'user';
      super_admin = false;
    }
    if (role !== 'admin') {
      super_admin = false;
    }
  });

  const update_user_info_mut = createMutation({
    mutationFn: async () => {
      await authClient.user_info.update_user_info({
        userId: selected_user[0],
        is_approved,
        role: role as 'admin' | 'user',
        super_admin
      });
    },
    onSuccess() {
      modal_open = false;
      query_client.invalidateQueries({
        queryKey: ['users_list'],
        exact: true
      });
    }
  });

  let update_modal_status = $state(false);
</script>

<div class="text-center text-lg font-bold">उपयोक्ताप्रबंधकम्</div>
{#if $users_list.isFetching}
  <div class="h-8 placeholder w-64 animate-pulse"></div>
{:else if $users_list.isSuccess}
  <div transition:fade>
    <Combobox
      data={$users_list.data.map((user) => ({
        value: user.id,
        label: user.name
      }))}
      value={selected_user}
      onValueChange={(e) => (selected_user = e.value)}
      label="उपयोक्ता चुनें"
      placeholder="चुनें..."
    >
      {#snippet item(item)}
        <div class="flex w-full justify-between space-x-2">
          <span class="text-sm">{item.label}</span>
        </div>
      {/snippet}
    </Combobox>
  </div>
  {#if selected_user.length > 0}
    <div class="mt-4 space-y-3" transition:slide>
      <label class="item-center flex space-x-2">
        <input type="checkbox" class="inline-block checkbox" bind:checked={is_approved} />
        <span class="inline-block font-semibold">is_approved</span>
      </label>
      <label class="block">
        <span class="label-text font-semibold">role</span>
        <select bind:value={role} class="select w-30" disabled={!is_approved}>
          <option value="admin">admin</option>
          <option value="user">user</option>
        </select>
      </label>
      <label class="item-center flex space-x-2">
        <input
          type="checkbox"
          class="checkbox"
          bind:checked={super_admin}
          disabled={!is_approved || role !== 'admin'}
        />
        <span class="inline-block font-semibold">super_admin</span>
      </label>
      <ConfirmModal
        bind:popup_state={update_modal_status}
        title="अद्यतितुं निश्चितो भवान् ?"
        close_on_confirm={true}
        confirm_func={() => {
          $update_user_info_mut.mutate();
        }}
      ></ConfirmModal>
      <button
        ondblclick={() => (update_modal_status = true)}
        disabled={$update_user_info_mut.isPending}
        class="btn bg-primary-700 px-1.5 py-0 pt-1 font-bold text-white">अद्यतनङ्कुरु</button
      >
    </div>
  {/if}
{/if}
