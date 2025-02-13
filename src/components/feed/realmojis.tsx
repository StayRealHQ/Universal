import { createMemo, For, Show, type Component } from "solid-js";
import type { PostsOverview } from "~/api/requests/feeds/friends";
import me from "~/stores/me";

/**
 * RealMojis attributed to a given post.
 *
 * Shows as three realmojis, first two are actual realmojis
 * and the third one is a count of remaining realmojis.
 *
 * It's negatively spaced to show the realmojis in a row.
 */
const PostRealMojis: Component<{
  post: PostsOverview["posts"][number]
  shouldReverseZIndex?: boolean
  size: number
}> = (props) => {
  const sample = () => {
    const copy = [...props.post.realMojis];

    copy.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
    const mine = copy.findIndex(r => r.user?.id === me.get()?.id);

    if (mine !== -1) {
      const [myRealMoji] = copy.splice(mine, 1);
      copy.unshift(myRealMoji);
    }

    return copy.slice(0, 2);
  };

  const total = createMemo(() => {
    let amount = props.post.realMojis.length - 2;
    // just display +9 if total is more than 9
    if (amount > 9) return 9;

    return amount
  });

  return (
    <Show when={props.post.realMojis.length > 0}>
      <div class="flex -space-x-2" role="button" aria-label={`See the ${props.post.realMojis.length} RealMojis.`}>
        <For each={sample()}>
          {(realMojis, index) => (
            <img
              class="shrink-0 rounded-full border-2 border-black"
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
          <div class="shrink-0  rounded-full border-2 border-black bg-#1a1a1c text-white flex justify-center items-center" aria-hidden="true"
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
  )
};

export default PostRealMojis;
