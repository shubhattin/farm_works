<script lang="ts">
  import { Popover, Modal } from '@skeletonlabs/skeleton-svelte';
  import Icon from '~/tools/Icon.svelte';
  import { BiLogOut } from 'svelte-icons-pack/bi';
  import { deleteAuthCookies } from '~/tools/auth_tools';
  import { user_info } from '~/state/user.svelte';
  import { VscAccount } from 'svelte-icons-pack/vsc';
  import { AiOutlineUser } from 'svelte-icons-pack/ai';

  let user_info_popover_status = $state(false);
  let logout_modal_status = $state(false);
  const log_out = () => {
    deleteAuthCookies();
    logout_modal_status = false;
    $user_info = null;
  };
</script>

<Popover
  bind:open={user_info_popover_status}
  triggerBase="btn m-2 p-0 select-none outline-none"
  contentBase="card z-40 pt-1 px-1 shadow-2xl bg-surface-100-900 rounded-lg"
  positioning={{ placement: 'left-start' }}
>
  {#snippet trigger()}
    <Icon class="hover:text-gray-6200 text-3xl dark:hover:text-gray-400" src={VscAccount} />
  {/snippet}
  {#snippet content()}
    <div class="select-none space-y-2 p-1">
      <div class="text-center text-base font-bold">
        <Icon class="-mt-1 text-2xl" src={AiOutlineUser} />
        {$user_info!.name}
        <span class="ml-1 text-xs text-gray-500 dark:text-gray-400">#{$user_info!.id}</span>
      </div>
      <div class="select-none space-y-2 p-1">
        <Modal
          bind:open={logout_modal_status}
          contentBase="card z-50 space-y-2 rounded-lg px-3 py-2 shadow-xl bg-surface-100-900"
          backdropBackground="backdrop-blur-sm"
        >
          {#snippet trigger()}
            <span
              class="btn m-0 gap-1 rounded-md bg-error-600 pb-0 pl-1 pr-2 pt-0 font-bold text-white"
            >
              <Icon class="text-2xl" src={BiLogOut} />
              <span>निर्प्रवेश</span>
            </span>
          {/snippet}
          {#snippet content()}
            <div class="text-lg font-bold">निर्प्रवेश करना चाहते हैं ?</div>
            <div class="space-x-2">
              <button
                class="btn rounded-lg bg-surface-600 font-bold text-white dark:bg-surface-500"
                onclick={log_out}
              >
                पुष्टि करें
              </button>
              <button
                onclick={() => (logout_modal_status = false)}
                class="btn rounded-lg preset-outlined-surface-800-200"
              >
                निरस्त करें
              </button>
            </div>
          {/snippet}
        </Modal>
      </div>
    </div>
  {/snippet}
</Popover>
