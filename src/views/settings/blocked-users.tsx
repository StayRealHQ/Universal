import { createEffect, createSignal, For, type Component } from "solid-js";
import MdiChevronLeft from '~icons/mdi/chevron-left'
import { deleteModerationBlockUsers, getModerationBlockUsers, type GetModerationBlockUsers } from "~/api/requests/moderation/block-users";
import { onMount } from "solid-js";
import ProfilePicture from "~/components/profile-picture";
import { confirm } from "@tauri-apps/plugin-dialog";
import MdiClose from '~icons/mdi/close'

const BlockedUsersView: Component = () => {
  const [blocked, setBlocked] = createSignal<GetModerationBlockUsers["data"] | null>(null);
  const [loading, setLoading] = createSignal(false);

  const refetch = async (): Promise<void> => {
    const response = await getModerationBlockUsers();
    setBlocked(response.data);
  }

  const unblock = async (userId: string): Promise<void> => {
    setLoading(true);

    try {
      await deleteModerationBlockUsers(userId);
      await refetch();
    }
    finally {
      setLoading(false);
    }
  };

  onMount(() => refetch());
  createEffect(() => console.log(blocked()));

  return (
    <>
      <header class="pt-[env(safe-area-inset-top)]">
        <nav class="flex items-center justify-between px-4 h-[72px]">
          <a href="/settings" class="p-2.5 rounded-full ml-[-10px]" aria-label="Back to settings">
            <MdiChevronLeft class="text-2xl" />
          </a>
        </nav>
      </header>

      <section class="px-4">
        <h2 class="text-sm text-white/60 uppercase font-600 mb-4">
          Blocked Users ({blocked()?.length})
        </h2>

        <div class="flex flex-col gap-2">
          <For each={blocked()} fallback={
            <div class="text-center bg-[#1c1c1e] rounded-xl p-4">
              <p class="font-600 pb-2">Good on you</p>
              <p>You don't have any blocked profiles.</p>
            </div>
          }>
            {(entry) => (
              <div class="flex items-center gap-4 p-1.5">
                <div class="relative">
                  <ProfilePicture
                    fullName={entry.user.fullname}
                    username={entry.user.username}
                    media={null}
                    size={60}
                  />
                </div>

                <div class="flex flex-col w-full">
                  <p class="font-medium">{entry.user.fullname}</p>
                  <p class="text-sm text-white/60">{entry.user.username}</p>
                  <p class="text-xs text-white/50">Blocked on {new Date(entry.blockedAt).toLocaleDateString("en-US", { dateStyle: "long"})}</p>
                </div>

                <button type="button" class="ml-2 -mr-2 p-2 rounded-full flex-shrink-0"
                  disabled={loading()}
                  onClick={async () => {
                    const confirmation = await confirm(`Are you sure you want to unblock ${entry.user.username}?`, {
                      title: `Unblock ${entry.user.username}?`,
                      okLabel: "Unblock",
                      cancelLabel: "Cancel",
                      kind: "warning"
                    });

                    if (!confirmation) return;
                    await unblock(entry.user.id);
                  }}
                >
                  <MdiClose class="text-white/60" />
                </button>
              </div>
            )}
          </For>
        </div>
      </section>
    </>
  )
};

export default BlockedUsersView;
