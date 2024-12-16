<script lang="ts">
  import { onMount } from 'svelte';
  import { load_parivartak_lang_data, lekhika_typing_tool } from '~/tools/converter';
  import { Switch } from '@skeletonlabs/skeleton-svelte';
  import { client_q } from '~/api/client';
  import Icon from '~/tools/Icon.svelte';
  import { VscAdd } from 'svelte-icons-pack/vsc';

  onMount(async () => {
    // loading for allowing hindi typing
    await load_parivartak_lang_data('Hindi', './src', true);
  });

  let hindi_typing_tool_enabled = $state(true);

  const register_customer_mut = client_q.customer.register_customer.mutation();

  const handle_submit = async (e: Event) => {
    e.preventDefault();
    await $register_customer_mut.mutateAsync({
      name,
      phone_number: phone_number.length > 0 ? phone_number : null,
      address: address.length > 0 ? address : null
    });
  };

  let name = $state('');
  let phone_number = $state('');
  let address = $state('');
</script>

{#if !$register_customer_mut.isSuccess}
  <div>
    <Switch
      name="hindi_typing_tool"
      controlBase="select-none outline-none"
      bind:checked={hindi_typing_tool_enabled}>हिन्दी लेखन</Switch
    >
  </div>
  <form onsubmit={handle_submit} class="mt-5 space-y-2">
    <label>
      <span class="label-text">नाम <span class="text-error-400">*</span></span>
      <input
        required
        oninput={async (e) => {
          if (hindi_typing_tool_enabled)
            // @ts-ignore
            await lekhika_typing_tool(e.target, e.data, 'Hindi', true, (val) => {
              name = val;
            });
          else name = (e.target as any).value;
        }}
        type="text"
        class="input rounded-md"
        bind:value={name}
        name="name"
        placeholder="नाम"
        minlength={3}
        maxlength={50}
      />
    </label>
    <label>
      <span class="label-text">फ़ोन नंबर</span>
      <input
        type="text"
        class="input rounded-md"
        bind:value={phone_number}
        name="phone_number"
        placeholder="फ़ोन नंबर"
        minlength="10"
        maxlength="13"
      />
    </label>
    <label>
      <span class="label-text">पता</span>
      <input
        type="text"
        class="input rounded-md"
        bind:value={address}
        name="address"
        placeholder="पता"
        oninput={async (e) => {
          if (hindi_typing_tool_enabled)
            // @ts-ignore
            await lekhika_typing_tool(e.target, e.data, 'Hindi', true, (val) => {
              address = val;
            });
          else address = (e.target as any).value;
        }}
        minlength="5"
        maxlength="100"
      />
    </label>
    <button
      type="submit"
      disabled={$register_customer_mut.isPending}
      class="btn gap-1 rounded-md bg-primary-500 px-2 py-1 font-bold text-white dark:bg-primary-600"
    >
      <Icon src={VscAdd} class="text-xl" />
      जोड़ें
    </button>
  </form>
{:else}
  {@const data = $register_customer_mut.data}
  <div class="font-bold">
    {name} (#{data.id}) को सफलतापूर्वक प्रविष्टित किया गया है 🎉 ।
  </div>
{/if}
