import {createMemo, For, Show, type Component, createSignal} from "solid-js";
import type {PostsOverview} from "~/api/requests/feeds/friends";
import {FriendsOfFriendsPost} from "~/api/requests/feeds/friends-of-friends";
import me from "~/stores/me";
import {open} from "@tauri-apps/plugin-shell";
import Drawer from "@corvu/drawer";

/**
 * RealMojis attributed to a given post.
 *
 * Shows as three realmojis, first two are actual realmojis
 * and the third one is a count of remaining realmojis.
 *
 * It's negatively spaced to show the realmojis in a row.
 */
const PostRealMojis: Component<{
  post: PostsOverview["posts"][number] | FriendsOfFriendsPost
  shouldReverseZIndex?: boolean
  size: number
}> = (props) => {
  const realmojis = () => ("realmojis" in props.post
      ? props.post.realmojis.self ? [...props.post.realmojis.sample, props.post.realmojis.self] : props.post.realmojis.sample
      : props.post.realMojis
  );

  const sample = () => {
    const copy = [...realmojis()];

    copy.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
    const mine = copy.findIndex(r => r.user?.id === me.get()?.id);

    if (mine !== -1) {
      const [myRealMoji] = copy.splice(mine, 1);
      copy.unshift(myRealMoji);
    }

    return copy.slice(0, 2);
  };

  const total = createMemo(() => {
    let amount = realmojis().length - 2;
    // just display +9 if total is more than 9
    if (amount > 9) return 9;

    return amount
  });

  const [isRealmojiDrawerOpen, setRealmojiDrawerOpen] = createSignal(false);

  return (
    <>
      <Drawer
        trapFocus={false}
        onOutsideFocus={e => e.preventDefault()}
        open={isRealmojiDrawerOpen()}
        onOpenChange={setRealmojiDrawerOpen}
        breakPoints={[0.75]}
      >
        {(drawer) => (
          <Drawer.Portal>
            <Drawer.Overlay
              class="fixed inset-0 z-50 corvu-transitioning:transition-colors corvu-transitioning:duration-500 corvu-transitioning:ease-[cubic-bezier(0.32,0.72,0,1)]"
              style={{
                'background-color': `rgb(0 0 0 / ${
                  0.5 * drawer.openPercentage
                })`,
              }}
            />
            <Drawer.Content
              class="orvu-transitioning:transition-transform corvu-transitioning:duration-500 corvu-transitioning:ease-[cubic-bezier(0.32,0.72,0,1)] fixed inset-x-0 bottom-0 z-50 flex h-full max-h-140 flex-col rounded-t-xl bg-[#141414] pt-3 px-4 after:absolute after:inset-x-0 after:top-[calc(100%-1px)] after:h-1/2 after:bg-inherit md:select-none">
              <div class="h-1 w-10 self-center rounded-full bg-white/40"/>
              <div class={"max-h-140 overflow-y-scroll"}>
                <For each={realmojis()}>
                  {(realMojis) => (
                    <div class={"mt-4 w-full flex flex-row items-center gap-2.5 animate-duration-450"}>
                      <img
                        class="rounded-full h-16 w-16 shrink-0 border-2 border-white/25 cursor-pointer"
                        src={realMojis.media.url}
                        alt={realMojis.emoji}
                        onClick={() => {
                          void open(realMojis.media.url);
                        }}
                      />
                      <div class={"w-full flex flex-row items-center justify-between"}>
                        <a
                          class="font-600 w-fit cursor-pointer"
                          href={`/user/${realMojis.user?.id}`}
                        >
                          {realMojis.user?.username}
                        </a>
                        <span class="ml-auto text-xs font-300 bg-white/40 px-4 py-2 rounded-lg">{realMojis.emoji}</span>
                      </div>
                    </div>
                  )}
                </For>
              </div>
            </Drawer.Content>
          </Drawer.Portal>
        )}
      </Drawer>
      <Show when={realmojis().length > 0}>
        <div class="flex -space-x-2" role="button" aria-label={`See the ${realmojis().length} RealMojis.`}
             onClick={() => setRealmojiDrawerOpen(true)}>
          <For each={sample()}>
            {(realMojis, index) => (

              <img
                class="shrink-0 rounded-full border-2 border-white/25"
                src={realMojis.media.url}
                aria-hidden="true"
                style={{
                  "z-index": `${props.shouldReverseZIndex ? 2 - index() : index()}`,
                  height: `${props.size}rem`,
                  width: `${props.size}rem`
                }}
              />
            )}
          </For>
          <Show when={total() > 0}>
            <div
              class="shrink-0 rounded-full border-2 border-white/25 bg-#1a1a1c text-white flex justify-center items-center"
              aria-hidden="true"
              style={{
                "z-index": `${props.shouldReverseZIndex ? 0 : 2}`,
                height: `${props.size}rem`,
                width: `${props.size}rem`
              }}
            >
              <p class="text-xs font-300">
                {total()}+
              </p>
            </div>
          </Show>
        </div>
      </Show>
    </>
  )
};

export default PostRealMojis;
