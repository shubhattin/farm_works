<script lang="ts">
  import { Popover, Modal } from '@skeletonlabs/skeleton-svelte';
  import Icon from '~/tools/Icon.svelte';
  import { BiLogOut } from 'svelte-icons-pack/bi';
  import { user_info } from '~/state/user.svelte';
  import { VscAccount } from 'svelte-icons-pack/vsc';
  import { AiOutlineUser } from 'svelte-icons-pack/ai';
  import { signOut, authClient } from '~/lib/auth-client';
  import { LuRefreshCw } from 'svelte-icons-pack/lu';
  import { createMutation } from '@tanstack/svelte-query';
  import { cl_join } from '~/tools/cl_join';
  import ConfirmModal from '~/components/PopoverModals/ConfirmModal.svelte';

  let user_info_popover_status = $state(false);
  let logout_modal_status = $state(false);

  const log_out = () => {
    signOut();
    logout_modal_status = false;
  };

  const refresh_session_mut = createMutation({
    mutationFn: async () => {
      const session = await authClient.getSession({
        query: {
          disableCookieCache: true,
          disableRefresh: false
        }
      });
      console.log(session.data?.session);
    }
  });
</script>

<Popover
  open={user_info_popover_status}
  onOpenChange={(e) => (user_info_popover_status = e.open)}
  triggerBase="btn m-2 p-0 select-none outline-hidden"
  contentBase="card z-40 pt-1 px-1 shadow-2xl bg-surface-100-900 rounded-lg"
  positioning={{ placement: 'left-start' }}
>
  {#snippet trigger()}
    <Icon class="hover:text-gray-6200 text-3xl dark:hover:text-gray-400" src={VscAccount} />
  {/snippet}
  {#snippet content()}
    <div class="space-y-2 p-1 select-none">
      <div class="text-center text-base font-bold">
        <Icon class="-mt-1 text-2xl" src={AiOutlineUser} />
        {$user_info!.name}
      </div>
      <div class="space-y-2 p-1 select-none">
        <ConfirmModal
          title="निर्प्रवेश करना चाहते हैं ?"
          bind:popup_state={logout_modal_status}
          close_on_confirm={true}
          confirm_func={log_out}
        >
          <span
            class="btn gap-1 rounded-md bg-error-600 pt-1 pr-2 pb-0.5 pl-1 font-bold text-white"
          >
            <Icon class="text-2xl" src={BiLogOut} />
            <span>निर्प्रवेश</span>
          </span>
        </ConfirmModal>
      </div>
      <div>
        <button
          onclick={() => $refresh_session_mut.mutate()}
          disabled={$refresh_session_mut.isPending}
          class="btn gap-1 rounded-md bg-surface-600 px-1 pb-0 text-xs font-semibold"
        >
          <Icon
            src={LuRefreshCw}
            class={cl_join('text-sm', $refresh_session_mut.isPending && 'animate-spin')}
          />
          संप्रवेश सत्र नवीकरण
        </button>
      </div>
    </div>
  {/snippet}
</Popover>
