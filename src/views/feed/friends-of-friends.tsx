import { type Component, createMemo, For, Show } from "solid-js";
import FeedFriendsOfFriendsOverview from "~/components/feed/friends-of-friends/overview";
import feed from "~/stores/feed";
import feedFof from "~/stores/feed-fof";

const FeedFriendsOfFriends: Component = () => {
  const shouldTurnOnVisibility = createMemo(() => {
    const posts = feed.get()?.userPosts?.posts;

    if (!posts || posts.length === 0)
      return true;

    if (posts[0].visibility[0] !== "friends-of-friends")
      return true;

    return false;
  });

  return (
    <Show
      when={!shouldTurnOnVisibility()}
      fallback={
        <p class="text-center text-white/50">
          You should have your first post of the moment with visibility set to friends of friends.
        </p>
      }
    >
      <Show
        when={feedFof.get()}
        fallback={
          <p class="text-center text-white/50">
            finding your friends of friends feed...
          </p>
        }
      >
        {(feedFof) => (
          <div class="flex flex-col gap-6">
            <Show when={feedFof()} fallback={
              <p class="text-center text-white/75 px-4 mt-12">
                No one have posted anything yet,<br/>come back later !
              </p>
            }>
              {friends => (
                <For
                  each={[...friends()].sort(
                    (a, b) =>
                      new Date(b.postedAt).getTime() -
                      new Date(a.postedAt).getTime()
                  )}
                >
                  {(post) => (
                    <FeedFriendsOfFriendsOverview post={post} />
                  )}
                </For>
              )}
            </Show>
          </div>
        )}
      </Show>
    </Show>
  )
}

export default FeedFriendsOfFriends;
