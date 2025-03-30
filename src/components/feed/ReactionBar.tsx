import { createMemo, createSignal, For, Show, type Component } from "solid-js";
import toast from "solid-toast";
import { BeRealError } from "~/api/models/errors";
import { content_realmojis_delete, content_realmojis_put } from "~/api/requests/content/realmojis";
import { type PostsOverview } from "~/api/requests/feeds/friends";
import { FriendsOfFriendsPost } from "~/api/requests/feeds/friends-of-friends";
import me from "~/stores/me";

const ReactionBar: Component<{
  post: PostsOverview["posts"][number] | FriendsOfFriendsPost
  postUserId: string
  onReact: () => void
}> = (props) => {
  const realmojis = () => ("realmojis" in props.post
    ? props.post.realmojis.self ? [...props.post.realmojis.sample, props.post.realmojis.self] : props.post.realmojis.sample
    : props.post.realMojis
  );

  const [loading, setLoading] = createSignal(false);

  const currentReaction = createMemo(() => {
    const reaction = realmojis().find(r => r.user?.id === me.get()?.id);
    return reaction ?? null;
  });

  const react = async (emoji: string): Promise<void> => {
    try {
      setLoading(true);

      const reaction = currentReaction();
      if (reaction?.emoji === emoji) {
        await content_realmojis_delete(props.post.id, props.postUserId, reaction.id);
      }
      else {
        await content_realmojis_put(props.post.id, props.postUserId, emoji);
      }
    }
    catch (e) {
      if (e instanceof BeRealError) {
        toast.error(e.message);
      }
    }
    finally {
      setLoading(false);
      props.onReact();
    }
  };

  return (
    <div class="flex items-center justify-center gap-2.5 animate-duration-450"
      classList={{
        "animate-pulse": loading(),
      }}
    >
      <For each={me.get()?.realmojis ?? []} fallback={
        <p>You have no realmojis configured.</p>
      }>
        {(realmoji) => (
          <button type="button" class="relative" onClick={() => react(realmoji.emoji)}>
            <p class="absolute -bottom-1 -right-1 text-sm z-40"
              classList={{
                "opacity-70": currentReaction() !== null && currentReaction()?.emoji !== realmoji.emoji,
              }}
            >
              {realmoji.emoji}
            </p>

            <Show when={currentReaction() !== null && currentReaction()?.emoji !== realmoji.emoji}>
              <div class="z-35 inset-0 absolute bg-black/40 rounded-xl" />
            </Show>

            <img
              class="shrink-0 rounded-xl border border-white/25 shadow-2xl w-13 h-13 z-30"
              src={realmoji.media.url}
              classList={{
                "outline outline-1 outline-white": currentReaction()?.emoji === realmoji.emoji,
              }}
            />
          </button>
        )}
      </For>
    </div>
  )
};

export default ReactionBar;
