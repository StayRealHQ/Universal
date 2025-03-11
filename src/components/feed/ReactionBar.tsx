import { createMemo, createSignal, For, Show, type Component } from "solid-js";
import toast from "solid-toast";
import { content_realmojis_delete, content_realmojis_put } from "~/api/requests/content/realmojis";
import { type PostsOverview } from "~/api/requests/feeds/friends";
import me from "~/stores/me";

const ReactionBar: Component<{
  post: PostsOverview["posts"][number]
  postUserId: string
  onReact: () => void
}> = (props) => {
  const [loading, setLoading] = createSignal(false);

  const currentReaction = createMemo(() => {
    const reaction = props.post.realMojis.find(r => r.user?.id === me.get()?.id);
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
    catch {
      toast.error("Failed to react to the post.");
    }
    finally {
      setLoading(false);
      props.onReact();
    }
  };

  return (
    <div class="flex items-center justify-center gap-2 animate-duration-450"
      classList={{
        "animate-pulse": loading(),
      }}
    >
      <For each={me.get()?.realmojis ?? []} fallback={
        <p>You have no realmojis configured.</p>
      }>
        {(realmoji) => (
          <button type="button" class="relative" onClick={() => react(realmoji.emoji)}>
            <p class="absolute bottom-0 right-0 text-sm z-40"
              classList={{
                "opacity-70": currentReaction() !== null && currentReaction()?.emoji !== realmoji.emoji,
              }}
            >
              {realmoji.emoji}
            </p>

            <Show when={currentReaction() !== null && currentReaction()?.emoji !== realmoji.emoji}>
              <div class="z-35 inset-0 absolute bg-black/40 rounded-full" />
            </Show>

            <img
              class="shrink-0 rounded-full border-2 border-black w-13 h-13 bg-black z-30"
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
